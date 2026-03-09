/**
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'
import { ScratchCommentBubble } from './scratch_comment_bubble'

interface CommentState {
  text: string
  height: number
  width: number
  x: number
  y: number
  collapsed: boolean
}

/**
 * Custom comment icon that draws no icon indicator, used for block comments.
 */
export class ScratchCommentIcon extends Blockly.icons.Icon implements Blockly.ISerializable, Blockly.IHasBubble {
  private commentBubble: ScratchCommentBubble
  private onTextChangedListener: (oldText: string, newText: string) => void
  private onSizeChangedListener: (oldSize: Blockly.utils.Size, newSize: Blockly.utils.Size) => void
  private onCollapseListener: (collapsed: boolean) => void

  constructor(protected sourceBlock: Blockly.BlockSvg) {
    super(sourceBlock)
    this.commentBubble = new ScratchCommentBubble(this.sourceBlock)
    this.fireCreateEvent()
    this.onTextChangedListener = this.onTextChanged.bind(this)
    this.onSizeChangedListener = this.onSizeChanged.bind(this)
    this.onCollapseListener = this.onCollapsed.bind(this)
    this.commentBubble.addTextChangeListener(this.onTextChangedListener)
    this.commentBubble.addSizeChangeListener(this.onSizeChangedListener)
    this.commentBubble.addOnCollapseListener(this.onCollapseListener)
  }

  getType(): Blockly.icons.IconType<ScratchCommentIcon> {
    return Blockly.icons.IconType.COMMENT
  }

  initView(pointerDownListener: (e: PointerEvent) => void) {
    // Scratch comments have no indicator icon on the block.
    return
  }

  getSize(): Blockly.utils.Size {
    // Awful hack to cancel out the default padding added to icons.
    return new Blockly.utils.Size(-8, 0)
  }

  getAnchorPoint(): Blockly.utils.Coordinate {
    const blockRect = this.sourceBlock.getBoundingRectangleWithoutChildren()
    const y = blockRect.top + this.offsetInBlock.y
    const x = this.sourceBlock.workspace.RTL ? blockRect.left : blockRect.right
    return new Blockly.utils.Coordinate(x, y)
  }

  onLocationChange(blockOrigin: Blockly.utils.Coordinate) {
    if (!this.sourceBlock || !this.commentBubble) return

    if (this.sourceBlock.isInsertionMarker()) {
      this.commentBubble.dispose()
      return
    }

    super.onLocationChange(blockOrigin)
    const oldBubbleLocation = this.commentBubble.getRelativeToSurfaceXY()
    this.commentBubble.setAnchorLocation(this.getAnchorPoint())
    const newBubbleLocation = this.commentBubble.getRelativeToSurfaceXY()
    Blockly.Events.fire(
      new (Blockly.Events.get('block_comment_move'))(this.commentBubble, oldBubbleLocation, newBubbleLocation),
    )
  }

  setText(text: string) {
    this.commentBubble?.setText(text)
  }

  getText(): string {
    return this.commentBubble?.getText() ?? ''
  }

  onTextChanged(oldText: string, newText: string) {
    Blockly.Events.fire(
      new (Blockly.Events.get(Blockly.Events.BLOCK_CHANGE))(this.sourceBlock, 'comment', null, oldText, newText),
    )
    Blockly.Events.fire(new (Blockly.Events.get('block_comment_change'))(this.commentBubble, oldText, newText))
  }

  onCollapsed(collapsed: boolean) {
    Blockly.Events.fire(new (Blockly.Events.get('block_comment_collapse'))(this.commentBubble, collapsed))
  }

  onSizeChanged(oldSize: Blockly.utils.Size, newSize: Blockly.utils.Size) {
    Blockly.Events.fire(new (Blockly.Events.get('block_comment_resize'))(this.commentBubble, oldSize, newSize))
  }

  setBubbleSize(size: Blockly.utils.Size) {
    this.commentBubble?.setSize(size)
  }

  getBubbleSize(): Blockly.utils.Size {
    return this.commentBubble?.getSize() ?? new Blockly.utils.Size(0, 0)
  }

  setBubbleLocation(newLocation: Blockly.utils.Coordinate) {
    const oldLocation = this.getBubbleLocation()
    this.commentBubble?.moveTo(newLocation)
    Blockly.Events.fire(new (Blockly.Events.get('block_comment_move'))(this.commentBubble, oldLocation, newLocation))
  }

  getBubbleLocation(): Blockly.utils.Coordinate {
    return this.commentBubble?.getRelativeToSurfaceXY()
  }

  saveState(): CommentState | null {
    if (!this.commentBubble) return null

    const size = this.getBubbleSize()
    const bubbleLocation = this.commentBubble.getRelativeToSurfaceXY()
    const delta = Blockly.utils.Coordinate.difference(bubbleLocation, this.workspaceLocation)
    return {
      text: this.getText(),
      height: size.height,
      width: size.width,
      x: delta.x,
      y: delta.y,
      collapsed: this.commentBubble.isCollapsed(),
    }
  }

  loadState(state: CommentState) {
    Blockly.Events.setGroup(true)
    this.setText(state.text)
    this.setBubbleSize(new Blockly.utils.Size(state.width, state.height))
    const delta = new Blockly.utils.Coordinate(state.x, state.y)
    const newBubbleLocation = Blockly.utils.Coordinate.sum(this.workspaceLocation, delta)
    this.commentBubble.moveTo(newBubbleLocation)
    this.commentBubble.setCollapsed(state.collapsed)
    Blockly.Events.setGroup(false)
  }

  bubbleIsVisible(): boolean {
    return true
  }

  async setBubbleVisible(visible: boolean) {
    this.commentBubble.setCollapsed(!visible)
  }

  getBubble(): ScratchCommentBubble | null {
    return this.commentBubble
  }

  dispose() {
    this.commentBubble.dispose()
    super.dispose()
  }

  canBeFocused() {
    return false
  }

  /**
   * Fires a block comment create event corresponding to this icon's comment.
   */
  fireCreateEvent() {
    Blockly.Events.fire(new (Blockly.Events.get('block_comment_create'))(this.commentBubble))
  }
}

Blockly.registry.register(
  Blockly.registry.Type.ICON,
  Blockly.icons.IconType.COMMENT.toString(),
  ScratchCommentIcon,
  true,
)
