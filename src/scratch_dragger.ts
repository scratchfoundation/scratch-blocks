/**
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'
import { BlockDragEnd } from './events/events_block_drag_end'
import { BlockDragOutside } from './events/events_block_drag_outside'
import { isProcedureBlock, getCallers } from './procedures'

/**
 * CSS class that allows the workspace to overflow its bounds when set.
 */
const BOUNDLESS_CLASS = 'boundless'

/**
 * Class responsible for managing dragging items on the workspace.
 */
export class ScratchDragger extends Blockly.dragging.Dragger {
  /**
   * Whether or not the current drag location is outside of the main workspace.
   */
  draggedOutOfBounds = false

  /**
   * Whether or not the current drag started from the flyout.
   */
  originatedFromFlyout = false

  /**
   * Sets the current item being dragged.
   * @param draggable The item being dragged.
   */
  setDraggable(draggable: Blockly.IDraggable) {
    this.draggable = draggable
  }

  /**
   * Handles the start of a drag operation.
   * @param event The event that triggered the drag.
   */
  onDragStart(event: PointerEvent) {
    super.onDragStart(event)
    if (this.draggable instanceof Blockly.BlockSvg) {
      this.workspace.addClass(BOUNDLESS_CLASS)
      const absoluteMetrics = this.workspace.getMetricsManager().getAbsoluteMetrics()
      const viewMetrics = this.workspace.getMetricsManager().getViewMetrics()
      if (
        this.workspace.RTL
          ? event.clientX > this.workspace.getParentSvg().getBoundingClientRect().left + viewMetrics.width
          : event.clientX < absoluteMetrics.left
      ) {
        this.originatedFromFlyout = true
      }
    }
  }

  /**
   * Handles motion during an ongoing drag operation.
   * @param event The event that triggered this call.
   * @param totalDelta The change in pointer position since the last invocation.
   */
  onDrag(event: PointerEvent, totalDelta: Blockly.utils.Coordinate) {
    super.onDrag(event, totalDelta)
    this.updateOutOfBoundsState(event)
  }

  /**
   * Records whether or not the current drag is out of the workspace's bounds.
   * @param event The event that triggered this call.
   */
  updateOutOfBoundsState(event: PointerEvent) {
    if (this.draggable instanceof Blockly.BlockSvg) {
      const outOfBounds = !this.isInsideWorkspace(event)
      if (outOfBounds !== this.draggedOutOfBounds) {
        const event = new BlockDragOutside(this.getDragRoot(this.draggable) as Blockly.BlockSvg, outOfBounds)
        Blockly.Events.fire(event)
        this.draggedOutOfBounds = outOfBounds
      }
    }
  }

  /**
   * Handles the end of a drag.
   * @param event The event that ended the drag.
   */
  onDragEnd(event: PointerEvent) {
    if (
      this.draggable instanceof Blockly.BlockSvg &&
      this.draggable.type === 'procedures_definition' &&
      this.wouldDeleteDraggable(event, this.draggable.getRootBlock())
    ) {
      const prototype = this.draggable.getInput('custom_block')!.connection!.targetBlock()
      const hasCaller =
        prototype instanceof Blockly.BlockSvg &&
        isProcedureBlock(prototype) &&
        getCallers(prototype.getProcCode(), this.draggable.workspace, this.draggable.getRootBlock(), false).length > 0

      if (hasCaller) {
        Blockly.dialog.alert(Blockly.Msg.PROCEDURE_USED)
        this.draggable.revertDrag()
        this.draggable.endDrag()
        return
      }
    }

    super.onDragEnd(event)

    this.updateOutOfBoundsState(event)
    if (this.draggable instanceof Blockly.BlockSvg) {
      const event = new BlockDragEnd(this.getDragRoot(this.draggable) as Blockly.BlockSvg, this.draggedOutOfBounds)
      Blockly.Events.fire(event)
      // If this block was dragged out of the flyout and dropped outside of
      // the workspace (e.g. on a different sprite), the block that was created
      // on the workspace in order to depict the block mid-drag needs to be
      // deleted.
      if (this.originatedFromFlyout && this.draggedOutOfBounds) {
        Blockly.renderManagement.finishQueuedRenders().then(() => {
          const rootBlock = this.getDragRoot(this.draggable)
          if (rootBlock instanceof Blockly.BlockSvg) {
            rootBlock.dispose()
          }
        })
      }
    }
    this.workspace.removeClass(BOUNDLESS_CLASS)
  }

  /**
   * Returns whether or not the dragged item should return to its starting
   * position.
   * @param event The drag event that triggered this check.
   * @param rootDraggable The topmost item being dragged.
   * @returns True if the draggable should return to its starting position.
   */
  shouldReturnToStart(event: PointerEvent, rootDraggable: Blockly.IDraggable) {
    // If a block is dragged out of the workspace to be e.g. dropped on another
    // sprite, it should remain in the same place on the workspace where it was,
    // rather than being moved to an invisible part of the workspace.
    return this.draggedOutOfBounds || super.shouldReturnToStart(event, rootDraggable)
  }

  /**
   * Returns the root element being dragged. For shadow blocks, this is the
   * parent block.
   * @param draggable The element being dragged directly.
   * @returns The element being dragged, or its parent.
   */
  getDragRoot(draggable: Blockly.IDraggable) {
    // We can't just use getRootBlock() here because, when blocks are detached
    // from a stack via dragging, getRootBlock() still returns the root of that
    // stack.
    if (draggable instanceof Blockly.BlockSvg && draggable.isShadow()) {
      return draggable.getParent()
    }

    return draggable
  }

  /**
   * Returns whether or not the given event occurred within the bounds of the
   * workspace.
   * @param event The event to check.
   * @returns True if the event occurred inside the workspace.
   */
  isInsideWorkspace(event: PointerEvent) {
    const bounds = this.workspace.getParentSvg().getBoundingClientRect()
    const workspaceRect = new Blockly.utils.Rect(bounds.top, bounds.bottom, bounds.left, bounds.right)
    return workspaceRect.contains(event.clientX, event.clientY)
  }
}

Blockly.registry.register(Blockly.registry.Type.BLOCK_DRAGGER, Blockly.registry.DEFAULT, ScratchDragger, true)
