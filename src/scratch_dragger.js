/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from "blockly/core";
import { BlockDragOutside } from "./events/events_block_drag_outside.js";
import { BlockDragEnd } from "./events/events_block_drag_end.js";

const BOUNDLESS_CLASS = "boundless";

class ScratchDragger extends Blockly.dragging.Dragger {
  constructor(draggable, workspace) {
    super(draggable, workspace);
    this.draggedOutOfBounds = false;
    this.originatedFromFlyout = false;
  }

  setDraggable(draggable) {
    this.draggable = draggable;
  }

  onDragStart(event) {
    super.onDragStart(event);
    if (this.draggable instanceof Blockly.BlockSvg) {
      this.workspace.addClass(BOUNDLESS_CLASS);
      const absoluteMetrics = this.workspace
        .getMetricsManager()
        .getAbsoluteMetrics();
      const viewMetrics = this.workspace.getMetricsManager().getViewMetrics();
      if (
        this.workspace.RTL
          ? event.clientX >
            this.workspace.getParentSvg().getBoundingClientRect().left +
              viewMetrics.width
          : event.clientX < absoluteMetrics.left
      ) {
        this.originatedFromFlyout = true;
      }
    }
  }

  onDrag(event, totalDelta) {
    super.onDrag(event, totalDelta);
    this.updateOutOfBoundsState(event);
  }

  updateOutOfBoundsState(event) {
    if (this.draggable instanceof Blockly.BlockSvg) {
      const outOfBounds = !this.isInsideWorkspace(event);
      if (outOfBounds !== this.draggedOutOfBounds) {
        const event = new BlockDragOutside(
          this.getDragRoot(this.draggable),
          outOfBounds
        );
        Blockly.Events.fire(event);
        this.draggedOutOfBounds = outOfBounds;
      }
    }
  }

  onDragEnd(event) {
    if (
      this.draggable instanceof Blockly.BlockSvg &&
      this.draggable.type === "procedures_definition" &&
      this.wouldDeleteDraggable(event, this.draggable.getRootBlock())
    ) {
      const procCode = this.draggable
        .getInputTargetBlock("custom_block")
        .getProcCode();
      const hasCaller = this.workspace
        .getBlocksByType("procedures_call")
        .some((b) => b.getProcCode() === procCode);
      if (hasCaller) {
        Blockly.dialog.alert(Blockly.Msg.PROCEDURE_USED);
        this.draggable.revertDrag();
        this.draggable.endDrag();
        return;
      }
    }

    super.onDragEnd(event);

    this.updateOutOfBoundsState(event);
    if (this.draggable instanceof Blockly.BlockSvg) {
      const event = new BlockDragEnd(
        this.getDragRoot(this.draggable),
        this.draggedOutOfBounds
      );
      Blockly.Events.fire(event);
      // If this block was dragged out of the flyout and dropped outside of
      // the workspace (e.g. on a different sprite), the block that was created
      // on the workspace in order to depict the block mid-drag needs to be
      // deleted.
      if (this.originatedFromFlyout && this.draggedOutOfBounds) {
        Blockly.renderManagement.finishQueuedRenders().then(() => {
          this.getDragRoot(this.draggable).dispose();
        });
      }
    }
    this.workspace.removeClass(BOUNDLESS_CLASS);
  }

  shouldReturnToStart(event, rootDraggable) {
    // If a block is dragged out of the workspace to be e.g. dropped on another
    // sprite, it should remain in the same place on the workspace where it was,
    // rather than being moved to an invisible part of the workspace.
    return (
      this.draggedOutOfBounds || super.shouldReturnToStart(event, rootDraggable)
    );
  }

  getDragRoot(block) {
    // We can't just use getRootBlock() here because, when blocks are detached
    // from a stack via dragging, getRootBlock() still returns the root of that
    // stack.
    if (block.isShadow()) {
      return block.getParent();
    }

    return block;
  }

  isInsideWorkspace(event) {
    const bounds = this.workspace.getParentSvg().getBoundingClientRect();
    const workspaceRect = new Blockly.utils.Rect(
      bounds.top,
      bounds.bottom,
      bounds.left,
      bounds.right
    );
    return workspaceRect.contains(event.clientX, event.clientY);
  }
}

Blockly.registry.register(
  Blockly.registry.Type.BLOCK_DRAGGER,
  Blockly.registry.DEFAULT,
  ScratchDragger,
  true
);
