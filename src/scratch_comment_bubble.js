/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from "blockly/core";

/**
 * A Scratch-style comment bubble for block comments.
 * @implements {IBubble}
 * @implements {ISelectable}
 */
export class ScratchCommentBubble extends Blockly.comments.CommentView {
  constructor(sourceBlock) {
    super(sourceBlock.workspace);
    this.sourceBlock = sourceBlock;
    this.disposing = false;
    this.id = Blockly.utils.idGenerator.genUid();
    this.getSvgRoot().setAttribute(
      "style",
      `--colour-commentBorder: ${sourceBlock.getColourTertiary()};`
    );

    Blockly.browserEvents.conditionalBind(
      this.getSvgRoot(),
      "pointerdown",
      this,
      this.startGesture
    );
    // Don't zoom with mousewheel; let it scroll instead.
    Blockly.browserEvents.conditionalBind(
      this.getSvgRoot(),
      "wheel",
      this,
      (e) => {
        e.stopPropagation();
      }
    );
  }

  setDeleteStyle(enable) {}
  showContextMenu() {}
  setDragging(start) {}
  select() {}
  unselect() {}

  isMovable() {
    return true;
  }

  moveDuringDrag(newLocation) {
    this.moveTo(newLocation);
  }

  moveTo(xOrCoordinate, y) {
    const destination =
      xOrCoordinate instanceof Blockly.utils.Coordinate
        ? xOrCoordinate
        : new Blockly.utils.Coordinate(xOrCoordinate, y);
    super.moveTo(destination);
    this.redrawAnchorChain();
  }

  startGesture(e) {
    const gesture = this.workspace.getGesture(e);
    if (gesture) {
      gesture.handleCommentStart(e, this);
      Blockly.common.setSelected(this);
    }
  }

  startDrag(event) {
    this.dragStartLocation = this.getRelativeToSurfaceXY();
    this.workspace.setResizesEnabled(false);
    this.workspace.getLayerManager()?.moveToDragLayer(this);
    Blockly.utils.dom.addClass(this.getSvgRoot(), "blocklyDragging");
  }

  drag(newLocation, event) {
    this.moveTo(newLocation);
  }

  endDrag() {
    this.workspace
      .getLayerManager()
      ?.moveOffDragLayer(this, Blockly.layers.BUBBLE);
    this.workspace.setResizesEnabled(false);
    Blockly.utils.dom.removeClass(this.getSvgRoot(), "blocklyDragging");
    Blockly.Events.fire(
      new (Blockly.Events.get("block_comment_move"))(
        this,
        this.dragStartLocation,
        this.getRelativeToSurfaceXY()
      )
    );
  }

  revertDrag() {
    this.moveTo(this.dragStartLocation);
  }

  setAnchorLocation(newAnchor) {
    const oldAnchor = this.anchor;
    const alreadyAnchored = !!this.anchor;
    this.anchor = newAnchor;
    if (!alreadyAnchored) {
      this.dropAnchor();
    } else {
      const oldLocation = this.getRelativeToSurfaceXY();
      const delta = Blockly.utils.Coordinate.difference(this.anchor, oldAnchor);
      const newLocation = Blockly.utils.Coordinate.sum(oldLocation, delta);
      this.moveTo(newLocation);
    }
  }

  dropAnchor() {
    this.moveTo(this.anchor.x + 40, this.anchor.y - 16);
    const location = this.getRelativeToSurfaceXY();
    this.anchorChain = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.LINE,
      {
        x1: this.anchor.x - location.x,
        y1: this.anchor.y - location.y,
        x2: this.getSize().width / 2,
        y2: 16,
        style: `stroke: ${this.sourceBlock.getColourTertiary()}; stroke-width: 1`,
      },
      this.getSvgRoot()
    );
    this.getSvgRoot().insertBefore(
      this.anchorChain,
      this.getSvgRoot().firstChild
    );
  }

  redrawAnchorChain() {
    if (!this.anchorChain) return;

    const location = this.getRelativeToSurfaceXY();
    this.anchorChain.setAttribute("x1", this.anchor.x - location.x);
    this.anchorChain.setAttribute("y1", this.anchor.y - location.y);
  }

  getId() {
    return this.id;
  }

  getSourceBlock() {
    return this.sourceBlock;
  }

  dispose() {
    this.disposing = true;
    Blockly.utils.dom.removeNode(this.anchorChain);
    if (this.sourceBlock) {
      Blockly.Events.fire(
        new (Blockly.Events.get("block_comment_delete"))(this, this.sourceBlock)
      );
      const block = this.sourceBlock;
      this.sourceBlock = null;
      if (!block.isDeadOrDying()) {
        block.setCommentText(null);
      }
    }
    super.dispose();
  }
}
