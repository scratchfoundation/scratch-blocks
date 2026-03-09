/**
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'

/**
 * A checkbox shown next to reporter blocks in the flyout.
 */
export class CheckboxBubble implements Blockly.IBubble, Blockly.IRenderedElement {
  /**
   * Size of a checkbox next to a variable reporter.
   */
  static readonly CHECKBOX_SIZE = 25

  /**
   * Amount of touchable padding around reporter checkboxes.
   */
  static readonly CHECKBOX_TOUCH_PADDING = 12

  /**
   * SVG path data for checkmark in checkbox.
   */
  static readonly CHECKMARK_PATH =
    'M' +
    CheckboxBubble.CHECKBOX_SIZE / 4 +
    ' ' +
    CheckboxBubble.CHECKBOX_SIZE / 2 +
    'L' +
    (5 * CheckboxBubble.CHECKBOX_SIZE) / 12 +
    ' ' +
    (2 * CheckboxBubble.CHECKBOX_SIZE) / 3 +
    'L' +
    (3 * CheckboxBubble.CHECKBOX_SIZE) / 4 +
    ' ' +
    CheckboxBubble.CHECKBOX_SIZE / 3

  /**
   * Size of the checkbox corner radius.
   */
  static readonly CHECKBOX_CORNER_RADIUS = 5

  /**
   * The margin around a checkbox.
   */
  static readonly CHECKBOX_MARGIN = 12

  /**
   * Total additional width of a row that contains a checkbox.
   */
  static readonly CHECKBOX_SPACE_X = CheckboxBubble.CHECKBOX_SIZE + 2 * CheckboxBubble.CHECKBOX_MARGIN

  /**
   * Root SVG element for this bubble.
   */
  svgRoot: SVGGElement

  /**
   * Identifier for click handler, to allow unregistering during disposal.
   */
  clickListener: Blockly.browserEvents.Data

  /**
   * Whether or not this bubble is displayed as checked. Note that the source of
   * truth is the Scratch VM.
   */
  checked = false

  /**
   * The location of this bubble in workspace coordinates.
   */
  location = new Blockly.utils.Coordinate(0, 0)

  /**
   * Creates a new flyout checkbox bubble.
   * @param sourceBlock The block this bubble should be associated with.
   */
  constructor(private sourceBlock: Blockly.BlockSvg) {
    this.svgRoot = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.G,
      {},
      this.sourceBlock.workspace.getBubbleCanvas(),
    )

    const touchMargin = CheckboxBubble.CHECKBOX_TOUCH_PADDING
    const checkboxGroup = Blockly.utils.dom.createSvgElement(
      'g',
      {
        fill: 'transparent',
      },
      null,
    )
    Blockly.utils.dom.createSvgElement(
      'rect',
      {
        class: 'blocklyFlyoutCheckbox',
        height: CheckboxBubble.CHECKBOX_SIZE,
        width: CheckboxBubble.CHECKBOX_SIZE,
        rx: CheckboxBubble.CHECKBOX_CORNER_RADIUS,
        ry: CheckboxBubble.CHECKBOX_CORNER_RADIUS,
      },
      checkboxGroup,
    )
    Blockly.utils.dom.createSvgElement(
      'path',
      {
        class: 'blocklyFlyoutCheckboxPath',
        d: CheckboxBubble.CHECKMARK_PATH,
      },
      checkboxGroup,
    )
    Blockly.utils.dom.createSvgElement(
      'rect',
      {
        class: 'blocklyTouchTargetBackground',
        x: -touchMargin + 'px',
        y: -touchMargin + 'px',
        height: CheckboxBubble.CHECKBOX_SIZE + 2 * touchMargin,
        width: CheckboxBubble.CHECKBOX_SIZE + 2 * touchMargin,
      },
      checkboxGroup,
    )
    this.setChecked(this.isChecked(this.sourceBlock.id))

    this.svgRoot.prepend(checkboxGroup)

    this.clickListener = Blockly.browserEvents.bind(this.svgRoot, 'pointerdown', null, (event: PointerEvent) => {
      this.setChecked(!this.checked)
      event.stopPropagation()
      event.preventDefault()
    })
    this.updateLocation()
  }

  /**
   * Sets whether or not this bubble should be displayed in the checked state.
   * @param checked True if this bubble should be checked.
   */
  setChecked(checked: boolean) {
    if (checked === this.checked) return

    this.checked = checked
    if (this.checked) {
      Blockly.utils.dom.addClass(this.svgRoot, 'checked')
    } else {
      Blockly.utils.dom.removeClass(this.svgRoot, 'checked')
    }

    Blockly.Events.fire(
      new Blockly.Events.BlockChange(this.sourceBlock, 'checkbox', null, !this.checked, this.checked),
    )
  }

  /**
   * Returns whether or not the specified block has its checkbox checked.
   *
   * This method is patched by scratch-gui to query the VM state.
   * @param blockId The ID of the block in question.
   * @returns True if the block's checkbox should be checked.
   */
  isChecked(blockId: string): boolean {
    return false
  }

  /**
   * Returns whether this bubble is movable by the user.
   * @returns Always returns false.
   */
  isMovable(): boolean {
    return false
  }

  /**
   * Returns the root SVG element for this bubble.
   * @returns The root SVG element.
   */
  getSvgRoot(): SVGGElement {
    return this.svgRoot
  }

  /**
   * Recalculates this bubble's location, keeping it adjacent to its block.
   */
  updateLocation() {
    const bounds = this.sourceBlock.getBoundingRectangle()
    const x = this.sourceBlock.workspace.RTL
      ? bounds.right + CheckboxBubble.CHECKBOX_MARGIN
      : bounds.left - CheckboxBubble.CHECKBOX_MARGIN - CheckboxBubble.CHECKBOX_SIZE
    const y = bounds.top + (bounds.getHeight() - CheckboxBubble.CHECKBOX_SIZE) / 2
    this.moveTo(x, y)
  }

  /**
   * Moves this bubble to the specified location.
   * @param x The location on the X axis to move to.
   * @param y The location on the Y axis to move to.
   */
  moveTo(x: number, y: number) {
    this.location.x = x
    this.location.y = y
    this.svgRoot.setAttribute('transform', `translate(${x}, ${y})`)
  }

  /**
   * Returns this bubble's location in workspace coordinates.
   * @returns The bubble's location.
   */
  getRelativeToSurfaceXY(): Blockly.utils.Coordinate {
    return this.location
  }

  /**
   * Disposes of this checkbox bubble.
   */
  dispose() {
    Blockly.utils.dom.removeNode(this.svgRoot)
    Blockly.browserEvents.unbind(this.clickListener)
  }

  /**
   * See IFocusableNode.getFocusableElement.
   * @returns The SVG root element of this bubble.
   */
  getFocusableElement(): HTMLElement | SVGElement {
    return this.svgRoot
  }

  /**
   * See IFocusableNode.getFocusableTree.
   * @returns The workspace containing this bubble's source block.
   */
  getFocusableTree(): Blockly.IFocusableTree {
    return this.sourceBlock.workspace
  }

  /** See IFocusableNode.onNodeFocus. */
  onNodeFocus(): void {}

  /** See IFocusableNode.onNodeBlur. */
  onNodeBlur(): void {}

  /**
   * See IFocusableNode.canBeFocused.
   * @returns Always true; this bubble can always receive focus.
   */
  canBeFocused(): boolean {
    return true
  }

  // These methods are required by the interfaces, but intentionally have no
  // implementation, largely because this bubble's location is fixed relative
  // to its block and is not draggable by the user.
  showContextMenu() {}

  setDragging(dragging: boolean) {}

  startDrag(event: PointerEvent) {}

  drag(newLocation: Blockly.utils.Coordinate, event: PointerEvent) {}

  moveDuringDrag(newLocation: Blockly.utils.Coordinate) {}

  endDrag() {}

  revertDrag() {}

  setDeleteStyle(enable: boolean) {}
}
