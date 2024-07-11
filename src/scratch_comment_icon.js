/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from "blockly/core";
import { ScratchCommentBubble } from "./scratch_comment_bubble.js";

/**
 * Custom comment icon that draws no icon indicator, used for block comments.
 * @implements {IHasBubble}
 * @implements {ISerializable}
 */
class ScratchCommentIcon extends Blockly.icons.Icon {
  constructor(sourceBlock) {
    super(sourceBlock);
    this.sourceBlock = sourceBlock;
    this.commentBubble = new ScratchCommentBubble(this.sourceBlock);
    Blockly.Events.fire(
      new (Blockly.Events.get("block_comment_create"))(this.commentBubble)
    );
    this.onTextChangedListener = this.onTextChanged.bind(this);
    this.onSizeChangedListener = this.onSizeChanged.bind(this);
    this.onCollapseListener = this.onCollapsed.bind(this);
    this.commentBubble.addTextChangeListener(this.onTextChangedListener);
    this.commentBubble.addSizeChangeListener(this.onSizeChangedListener);
    this.commentBubble.addOnCollapseListener(this.onCollapseListener);
  }

  getType() {
    return Blockly.icons.IconType.COMMENT;
  }

  initView(pointerDownListener) {
    // Scratch comments have no indicator icon on the block.
    return;
  }

  getSize() {
    // Awful hack to cancel out the default padding added to icons.
    return new Blockly.utils.Size(-8, 0);
  }

  getAnchorPoint() {
    const blockRect = this.sourceBlock.getBoundingRectangleWithoutChildren();
    const y = blockRect.top + this.offsetInBlock.y;
    const x = this.sourceBlock.workspace.RTL ? blockRect.left : blockRect.right;
    return new Blockly.utils.Coordinate(x, y);
  }

  onLocationChange(blockOrigin) {
    if (!this.sourceBlock || !this.commentBubble) return;

    if (this.sourceBlock.isInsertionMarker()) {
      this.commentBubble.dispose();
      return;
    }

    super.onLocationChange(blockOrigin);
    const oldBubbleLocation = this.commentBubble.getRelativeToSurfaceXY();
    this.commentBubble.setAnchorLocation(this.getAnchorPoint());
    const newBubbleLocation = this.commentBubble.getRelativeToSurfaceXY();
    Blockly.Events.fire(
      new (Blockly.Events.get("block_comment_move"))(
        this.commentBubble,
        oldBubbleLocation,
        newBubbleLocation
      )
    );
  }

  setText(text) {
    this.commentBubble?.setText(text);
  }

  getText() {
    return this.commentBubble?.getText() ?? "";
  }

  onTextChanged(oldText, newText) {
    Blockly.Events.fire(
      new (Blockly.Events.get(Blockly.Events.BLOCK_CHANGE))(
        this.sourceBlock,
        "comment",
        null,
        oldText,
        newText
      )
    );
    Blockly.Events.fire(
      new (Blockly.Events.get("block_comment_change"))(
        this.commentBubble,
        oldText,
        newText
      )
    );
  }

  onCollapsed(collapsed) {
    Blockly.Events.fire(
      new (Blockly.Events.get("block_comment_collapse"))(
        this.commentBubble,
        collapsed
      )
    );
  }

  onSizeChanged(oldSize, newSize) {
    Blockly.Events.fire(
      new (Blockly.Events.get("block_comment_resize"))(
        this.commentBubble,
        oldSize,
        newSize
      )
    );
  }

  setBubbleSize(size) {
    this.commentBubble?.setSize(size);
  }

  getBubbleSize() {
    return this.commentBubble?.getSize() ?? new Blockly.utils.Size(0, 0);
  }

  setBubbleLocation(newLocation) {
    const oldLocation = this.getBubbleLocation();
    this.commentBubble?.moveTo(newLocation);
    Blockly.Events.fire(
      new (Blockly.Events.get("block_comment_move"))(
        this.commentBubble,
        oldLocation,
        newLocation
      )
    );
  }

  getBubbleLocation() {
    return this.commentBubble?.getRelativeToSurfaceXY();
  }

  saveState() {
    if (!this.commentBubble) return null;

    const size = this.getBubbleSize();
    const bubbleLocation = this.commentBubble.getRelativeToSurfaceXY();
    const delta = Blockly.utils.Coordinate.difference(
      bubbleLocation,
      this.workspaceLocation
    );
    return {
      text: this.getText(),
      height: size.height,
      width: size.width,
      x: delta.x,
      y: delta.y,
      collapsed: this.commentBubble.isCollapsed(),
    };
  }

  loadState(state) {
    this.setText(state["text"]);
    this.setBubbleSize(new Blockly.utils.Size(state["width"], state["height"]));
    const delta = new Blockly.utils.Coordinate(state["x"], state["y"]);
    const newBubbleLocation = Blockly.utils.Coordinate.sum(
      this.workspaceLocation,
      delta
    );
    this.commentBubble.moveTo(newBubbleLocation);
    this.commentBubble.setCollapsed(state["collapsed"]);
  }

  bubbleIsVisible() {
    return true;
  }

  async setBubbleVisible(visible) {
    this.commentBubble.setCollapsed(!visible);
  }

  dispose() {
    this.commentBubble?.dispose();
    this.commentBubble = null;
    this.sourceBlock = null;
    super.dispose();
  }
}

Blockly.registry.register(
  Blockly.registry.Type.ICON,
  Blockly.icons.IconType.COMMENT.toString(),
  ScratchCommentIcon,
  true
);
