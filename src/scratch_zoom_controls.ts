/**
 * Copyright 2026 Scratch Foundation
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'

/**
 * Scratch-specific zoom controls that use separate SVG files for each button
 * instead of Blockly's default sprite sheet approach. SVG files are loaded
 * from `workspace.options.pathToMedia`, which varies by color mode (e.g.
 * default vs. high-contrast), enabling per-mode icon designs.
 */
export class ScratchZoomControls implements Blockly.IPositionable {
  id = 'zoomControls'

  private boundEvents: Blockly.browserEvents.Data[] = []

  private svgGroup: SVGGElement | null = null
  private zoomInGroup: SVGGElement | null = null
  private zoomOutGroup: SVGGElement | null = null
  private zoomResetGroup: SVGGElement | null = null

  /** Rendered width and height of each button, in SVG units. */
  private readonly SIZE = 36

  /** Gap between zoom in and zoom out buttons. */
  private readonly SMALL_SPACING = 4

  /** Gap between zoom in/out group and zoom reset button. */
  private readonly LARGE_SPACING = 12

  /** Distance from the workspace edge, vertical axis. */
  private readonly MARGIN_VERTICAL = 20

  /** Distance from the workspace edge, horizontal axis. */
  private readonly MARGIN_HORIZONTAL = 20

  private left = 0
  private top = 0
  private initialized = false

  constructor(private readonly workspace: Blockly.WorkspaceSvg) {}

  /**
   * Creates the zoom controls DOM.
   * @returns The root SVG group element.
   */
  createDom(): SVGGElement {
    this.svgGroup = Blockly.utils.dom.createSvgElement(Blockly.utils.Svg.G, {})

    const media = this.workspace.options.pathToMedia

    this.zoomOutGroup = this.createButtonGroup('blocklyZoomOut', `${media}zoom-out.svg`)
    this.svgGroup.appendChild(this.zoomOutGroup)
    this.boundEvents.push(
      Blockly.browserEvents.conditionalBind(this.zoomOutGroup, 'pointerdown', null, this.zoom.bind(this, -1)),
    )

    this.zoomInGroup = this.createButtonGroup('blocklyZoomIn', `${media}zoom-in.svg`)
    this.svgGroup.appendChild(this.zoomInGroup)
    this.boundEvents.push(
      Blockly.browserEvents.conditionalBind(this.zoomInGroup, 'pointerdown', null, this.zoom.bind(this, 1)),
    )

    if (this.workspace.isMovable()) {
      // Only add zoom reset if the workspace is movable — if it isn't,
      // zooming to center could push blocks off the visible edges.
      this.zoomResetGroup = this.createButtonGroup('blocklyZoomReset', `${media}zoom-reset.svg`)
      this.svgGroup.appendChild(this.zoomResetGroup)
      this.boundEvents.push(
        Blockly.browserEvents.conditionalBind(this.zoomResetGroup, 'pointerdown', null, this.resetZoom.bind(this)),
      )
    }

    return this.svgGroup
  }

  /**
   * Creates an SVG group containing one zoom button image.
   * @param extraClass Additional CSS class to add alongside `blocklyZoom`.
   * @param imageHref URL of the SVG icon to display.
   * @returns The button group element.
   */
  private createButtonGroup(extraClass: string, imageHref: string): SVGGElement {
    const group = Blockly.utils.dom.createSvgElement(Blockly.utils.Svg.G, {
      class: `blocklyZoom ${extraClass}`,
    })

    const image = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.IMAGE,
      {
        width: this.SIZE,
        height: this.SIZE,
      },
      group,
    )
    image.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href', imageHref)

    return group
  }

  /** Registers this component with the workspace's ComponentManager. */
  init() {
    this.workspace.getComponentManager().addComponent({
      component: this,
      weight: 2,
      capabilities: [Blockly.ComponentManager.Capability.POSITIONABLE],
    })
    this.initialized = true
  }

  /** Removes this component from the DOM and ComponentManager. */
  dispose() {
    this.workspace.getComponentManager().removeComponent('zoomControls')
    if (this.svgGroup) {
      Blockly.utils.dom.removeNode(this.svgGroup)
    }
    for (const event of this.boundEvents) {
      Blockly.browserEvents.unbind(event)
    }
    this.boundEvents.length = 0
  }

  /**
   * Returns the bounding rectangle of the zoom controls in pixels relative to
   * the Blockly injection div.
   * @returns The bounding rectangle, or null if not yet positioned.
   */
  getBoundingRectangle(): Blockly.utils.Rect | null {
    let height = this.SMALL_SPACING + 2 * this.SIZE
    if (this.zoomResetGroup) {
      height += this.LARGE_SPACING + this.SIZE
    }
    return new Blockly.utils.Rect(this.top, this.top + height, this.left, this.left + this.SIZE)
  }

  /**
   * Positions the zoom controls in the corner opposite the toolbox, bumping
   * down (or up) to avoid overlapping other positioned UI elements.
   * @param metrics The current workspace UI metrics.
   * @param savedPositions Bounding rectangles of already-placed UI elements to avoid overlapping.
   */
  position(metrics: Blockly.MetricsManager.UiMetrics, savedPositions: Blockly.utils.Rect[]) {
    if (!this.initialized) return

    const cornerPosition = Blockly.uiPosition.getCornerOppositeToolbox(this.workspace, metrics)

    let height = this.SMALL_SPACING + 2 * this.SIZE
    if (this.zoomResetGroup) {
      height += this.LARGE_SPACING + this.SIZE
    }

    const startRect = Blockly.uiPosition.getStartPositionRect(
      cornerPosition,
      new Blockly.utils.Size(this.SIZE, height),
      this.MARGIN_HORIZONTAL,
      this.MARGIN_VERTICAL,
      metrics,
      this.workspace,
    )

    const verticalPosition = cornerPosition.vertical
    const bumpDirection =
      verticalPosition === Blockly.uiPosition.verticalPosition.TOP
        ? Blockly.uiPosition.bumpDirection.DOWN
        : Blockly.uiPosition.bumpDirection.UP

    const positionRect = Blockly.uiPosition.bumpPositionRect(
      startRect,
      this.MARGIN_VERTICAL,
      bumpDirection,
      savedPositions,
    )

    // Zoom in and zoom out are always adjacent (small gap); reset has extra visual separation (large gap).
    // The layout mirrors between corners so the button nearest the corner stays anchored there.
    if (verticalPosition === Blockly.uiPosition.verticalPosition.TOP) {
      // Top corner: reset nearest the corner (top), zoom out, zoom in furthest.
      if (this.zoomResetGroup) {
        this.zoomResetGroup.setAttribute('transform', 'translate(0, 0)')
        const zoomOutY = this.LARGE_SPACING + this.SIZE
        this.zoomOutGroup?.setAttribute('transform', `translate(0, ${zoomOutY})`)
        const zoomInY = zoomOutY + this.SMALL_SPACING + this.SIZE
        this.zoomInGroup?.setAttribute('transform', `translate(0, ${zoomInY})`)
      } else {
        this.zoomOutGroup?.setAttribute('transform', 'translate(0, 0)')
        const zoomInY = this.SMALL_SPACING + this.SIZE
        this.zoomInGroup?.setAttribute('transform', `translate(0, ${zoomInY})`)
      }
    } else {
      // Bottom corner (default): zoom in furthest from corner (top), zoom out,
      // reset nearest the corner (bottom).
      this.zoomInGroup?.setAttribute('transform', 'translate(0, 0)')
      const zoomOutY = this.SMALL_SPACING + this.SIZE
      this.zoomOutGroup?.setAttribute('transform', `translate(0, ${zoomOutY})`)
      if (this.zoomResetGroup) {
        const zoomResetY = zoomOutY + this.LARGE_SPACING + this.SIZE
        this.zoomResetGroup.setAttribute('transform', `translate(0, ${zoomResetY})`)
      }
    }

    this.top = positionRect.top
    this.left = positionRect.left
    this.svgGroup?.setAttribute('transform', `translate(${this.left}, ${this.top})`)
  }

  /**
   * Handles zoom in / zoom out button clicks.
   * @param amount Positive to zoom in, negative to zoom out.
   * @param e The pointer event.
   */
  private zoom(amount: number, e: PointerEvent) {
    this.workspace.markFocused()
    this.workspace.zoomCenter(amount)
    this.fireZoomEvent()
    Blockly.Touch.clearTouchIdentifier()
    e.stopPropagation()
    e.preventDefault()
  }

  /**
   * Handles zoom reset button clicks. Animates back to the starting scale and
   * re-centers the workspace.
   * @param e The pointer event.
   */
  private resetZoom(e: PointerEvent) {
    this.workspace.markFocused()

    // Compute the zoom amount needed to get from currentScale back to
    // startScale using the workspace's configured speed:
    //   targetScale = currentScale * speed^amount
    //   amount = log_speed(targetScale / currentScale)
    const targetScale = this.workspace.options.zoomOptions.startScale
    const currentScale = this.workspace.scale
    const speed = this.workspace.options.zoomOptions.scaleSpeed
    const amount = Math.log(targetScale / currentScale) / Math.log(speed)

    this.workspace.beginCanvasTransition()
    this.workspace.zoomCenter(amount)
    this.workspace.scrollCenter()
    setTimeout(this.workspace.endCanvasTransition.bind(this.workspace), 500)

    this.fireZoomEvent()
    Blockly.Touch.clearTouchIdentifier()
    e.stopPropagation()
    e.preventDefault()
  }

  /** Fires a zoom controls click event for external listeners. */
  private fireZoomEvent() {
    const event = new (Blockly.Events.get(Blockly.Events.CLICK))(null, this.workspace.id, 'zoom_controls')
    Blockly.Events.fire(event)
  }
}
