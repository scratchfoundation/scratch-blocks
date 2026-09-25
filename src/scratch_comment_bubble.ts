/**
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'

/**
 * A Scratch-style comment bubble for block comments.
 */
export class ScratchCommentBubble
  extends Blockly.comments.CommentView
  implements Blockly.IBubble, Blockly.ISelectable, Blockly.IDeletable
{
  id: string
  private sourceBlock: Blockly.BlockSvg | null
  private anchor?: Blockly.utils.Coordinate
  private anchorChain?: SVGLineElement
  private dragStartLocation?: Blockly.utils.Coordinate

  constructor(sourceBlock: Blockly.BlockSvg) {
    const commentId = `${sourceBlock.id}_comment`
    super(sourceBlock.workspace, commentId)
    this.sourceBlock = sourceBlock
    this.disposing = false
    this.id = commentId
    this.setPlaceholderText(Blockly.Msg.WORKSPACE_COMMENT_DEFAULT_TEXT)
    this.getSvgRoot().setAttribute('style', `--colour-commentBorder: ${sourceBlock.getColourTertiary()};`)
    this.getSvgRoot().setAttribute('id', this.id)

    this.getEditorFocusableNode().setParent(sourceBlock)

    Blockly.browserEvents.conditionalBind(this.getSvgRoot(), 'pointerdown', this, this.startGesture.bind(this))
    // Don't zoom with mousewheel; let it scroll instead.
    Blockly.browserEvents.conditionalBind(this.getSvgRoot(), 'wheel', this, (e: WheelEvent) => {
      e.stopPropagation()
    })

    for (const button of this.getCommentBarButtons()) {
      this.sourceBlock.workspace
        .getComponentManager()
        .addComponent({ component: button, capabilities: [Blockly.ComponentManager.Capability.FOCUSABLE], weight: 0 })
    }

    this.sourceBlock.workspace.getComponentManager().addComponent({
      component: this.getEditorFocusableNode(),
      capabilities: [Blockly.ComponentManager.Capability.FOCUSABLE],
      weight: 0,
    })
  }

  setDeleteStyle(_enable: boolean) {}
  showContextMenu() {}
  setDragging(_start: boolean) {}
  select() {}
  unselect() {}

  isMovable() {
    return true
  }

  moveDuringDrag(newLocation: Blockly.utils.Coordinate) {
    this.moveTo(newLocation)
  }

  moveTo(xOrCoordinate: number, y: number): void
  moveTo(xOrCoordinate: Blockly.utils.Coordinate): void
  moveTo(xOrCoordinate: Blockly.utils.Coordinate | number, y?: number) {
    let destination: Blockly.utils.Coordinate
    if (xOrCoordinate instanceof Blockly.utils.Coordinate) {
      destination = xOrCoordinate
    } else {
      if (y === undefined) {
        throw new Error('ScratchCommentBubble.moveTo: missing y coordinate')
      }
      destination = new Blockly.utils.Coordinate(xOrCoordinate, y)
    }
    super.moveTo(destination)
    this.redrawAnchorChain()
  }

  startGesture(e: PointerEvent) {
    const gesture = this.workspace.getGesture(e)
    if (gesture) {
      // ScratchCommentBubble implements IBubble structurally but TypeScript
      // cannot verify it because IBubble.drag has a different signature here.
      gesture.handleBubbleStart(e, this)
      Blockly.common.setSelected(this)
    }
  }

  startDrag(_event?: PointerEvent | KeyboardEvent) {
    this.dragStartLocation = this.getRelativeToSurfaceXY()
    this.workspace.setResizesEnabled(false)
    this.workspace.getLayerManager()?.moveToDragLayer(this)
    Blockly.utils.dom.addClass(this.getSvgRoot(), 'blocklyDragging')
    return this
  }

  drag(newLocation: Blockly.utils.Coordinate, _event?: PointerEvent) {
    this.moveTo(newLocation)
  }

  endDrag() {
    this.workspace.getLayerManager()?.moveOffDragLayer(this, Blockly.layers.BUBBLE)
    this.workspace.setResizesEnabled(false)
    Blockly.utils.dom.removeClass(this.getSvgRoot(), 'blocklyDragging')
    Blockly.Events.fire(
      new (Blockly.Events.get('block_comment_move'))(this, this.dragStartLocation, this.getRelativeToSurfaceXY()),
    )
  }

  revertDrag() {
    if (!this.dragStartLocation) {
      throw new Error('ScratchCommentBubble.revertDrag: missing drag start location')
    }
    this.moveTo(this.dragStartLocation)
  }

  setAnchorLocation(newAnchor: Blockly.utils.Coordinate) {
    const oldAnchor = this.anchor
    const alreadyAnchored = oldAnchor !== undefined
    this.anchor = newAnchor
    if (!alreadyAnchored) {
      this.dropAnchor()
    } else {
      const oldLocation = this.getRelativeToSurfaceXY()
      const delta = Blockly.utils.Coordinate.difference(this.anchor, oldAnchor)
      const newLocation = Blockly.utils.Coordinate.sum(oldLocation, delta)
      this.moveTo(newLocation)
    }
  }

  dropAnchor() {
    if (!this.anchor || !this.sourceBlock) {
      throw new Error('ScratchCommentBubble.dropAnchor: missing anchor or source block')
    }
    const verticalOffset = 16
    this.moveTo(this.anchor.x + 40 * (this.workspace.RTL ? -1 : 1), this.anchor.y - verticalOffset)
    const location = this.getRelativeToSurfaceXY()
    this.anchorChain = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.LINE,
      {
        x1: this.anchor.x - location.x,
        y1: this.anchor.y - location.y,
        x2: (this.getSize().width / 2) * (this.workspace.RTL ? -1 : 1),
        y2: verticalOffset,
        style: `stroke: ${this.sourceBlock.getColourTertiary()}; stroke-width: 1`,
      },
      this.getSvgRoot(),
    )
    this.getSvgRoot().insertBefore(this.anchorChain, this.getSvgRoot().firstChild)
  }

  redrawAnchorChain() {
    if (!this.anchorChain || !this.anchor) return

    const location = this.getRelativeToSurfaceXY()
    this.anchorChain.setAttribute('x1', `${this.anchor.x - location.x}`)
    this.anchorChain.setAttribute('y1', `${this.anchor.y - location.y}`)
  }

  getId() {
    return this.id
  }

  getSourceBlock() {
    return this.sourceBlock
  }

  dispose() {
    this.disposing = true
    for (const button of this.getCommentBarButtons()) {
      this.sourceBlock?.workspace.getComponentManager().removeComponent(button.id)
    }
    this.sourceBlock?.workspace.getComponentManager().removeComponent(this.getEditorFocusableNode().id)
    Blockly.utils.dom.removeNode(this.anchorChain ?? null)
    if (this.sourceBlock) {
      Blockly.Events.fire(new (Blockly.Events.get('block_comment_delete'))(this, this.sourceBlock))
      const block = this.sourceBlock
      this.sourceBlock = null
      if (!block.isDeadOrDying()) {
        block.setCommentText(null)
      }
    }
    super.dispose()
  }

  getFocusableElement() {
    return this.getSvgRoot()
  }

  getFocusableTree() {
    return this.workspace
  }

  onNodeFocus() {
    this.bringToFront()
  }

  onNodeBlur() {}

  canBeFocused() {
    return true
  }

  getBoundingRectangle() {
    const origin = this.getRelativeToSurfaceXY()
    const size = this.getSize()
    return new Blockly.utils.Rect(origin.y, origin.y + size.height, origin.x, origin.x + size.width)
  }

  moveBy(deltaX: number, deltaY: number) {
    const origin = this.getRelativeToSurfaceXY()
    this.moveTo(origin.x + deltaX, origin.y + deltaY)
  }

  /**
   * Handles the user acting on this comment via keyboard navigation.
   * Expands the comment and focuses its editor.
   */
  performAction() {
    this.setCollapsed(false)
    Blockly.getFocusManager().focusNode(this.getEditorFocusableNode())
  }

  /**
   * Indicates that this comment is deletable.
   * @returns True.
   */
  isDeletable() {
    return true
  }
}
