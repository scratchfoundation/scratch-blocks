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
   * Handles the start of a drag operation.
   * @param event The event that triggered the drag.
   * @returns The object being dragged.
   */
  override onDragStart(event?: PointerEvent | KeyboardEvent) {
    if (this.draggable instanceof Blockly.BlockSvg) {
      this.originatedFromFlyout = this.draggable.workspace.isFlyout
      this.draggable.workspace.addClass(BOUNDLESS_CLASS)
    }
    return super.onDragStart(event)
  }

  /**
   * Handles motion during an ongoing drag operation.
   * @param event The event that triggered this call.
   * @param totalDelta The change in pointer position since the last invocation.
   */
  override onDrag(event: PointerEvent, totalDelta: Blockly.utils.Coordinate) {
    // Update out-of-bounds state BEFORE the base onDrag so that
    // wouldDeleteDraggable (called by super.onDrag to set the delete
    // cursor) sees the current draggedOutOfBounds value.
    this.updateOutOfBoundsState(this.getCoordinate(event))
    super.onDrag(event, totalDelta)
  }

  /**
   * Records whether or not the current drag is out of the workspace's bounds.
   * @param coordinate The current location of the dragged item.
   */
  updateOutOfBoundsState(coordinate: Blockly.utils.Coordinate) {
    if (this.draggable instanceof Blockly.BlockSvg) {
      const outOfBounds = !this.isInsideWorkspace(coordinate)
      if (outOfBounds !== this.draggedOutOfBounds) {
        const event = new BlockDragOutside(this.draggable, outOfBounds)
        Blockly.Events.fire(event)
        this.draggedOutOfBounds = outOfBounds
      }
    }
  }

  /**
   * Handles the end of a drag.
   * @param e The event that ended the drag.
   */
  override onDragEnd(e?: PointerEvent | KeyboardEvent) {
    const coordinate = this.getCoordinate(e)
    // Update out-of-bounds state BEFORE any wouldDeleteDraggable checks
    // so the override sees the position from the pointerup event, not
    // the last pointermove (which could be stale if the user moved fast).
    this.updateOutOfBoundsState(coordinate)

    if (
      this.draggable instanceof Blockly.BlockSvg &&
      this.draggable.type === 'procedures_definition' &&
      this.wouldDeleteDraggable(coordinate, this.draggable)
    ) {
      const prototype = this.draggable.getInput('custom_block')?.connection?.targetBlock()
      const hasCaller =
        prototype instanceof Blockly.BlockSvg &&
        isProcedureBlock(prototype) &&
        getCallers(prototype.getProcCode(), this.draggable.workspace, this.draggable, false).length > 0

      if (hasCaller) {
        Blockly.dialog.alert(Blockly.Msg.PROCEDURE_USED)
        this.draggable.revertDrag()
        this.draggable.endDrag(e, Blockly.DragDisposition.REVERT)
        return
      }
    }

    super.onDragEnd(e)
    if (this.draggable instanceof Blockly.BlockSvg) {
      const event = new BlockDragEnd(this.draggable, this.draggedOutOfBounds)
      Blockly.Events.fire(event)
      // If this block was dragged out of the flyout and dropped outside of
      // the workspace (e.g. on a different sprite), the block that was created
      // on the workspace in order to depict the block mid-drag needs to be
      // deleted.
      if (this.originatedFromFlyout && this.draggedOutOfBounds) {
        void Blockly.renderManagement.finishQueuedRenders().then(() => {
          if (this.draggable instanceof Blockly.BlockSvg) {
            this.draggable.dispose()
          }
        })
      }
    }
    this.draggable.workspace.removeClass(BOUNDLESS_CLASS)
  }

  /**
   * Returns whether or not the dragged item would be deleted if dropped at
   * the current location. When a block is dragged outside the workspace
   * bounds (e.g. onto the backpack or a different sprite), the GUI handles
   * the drop — the flyout should not delete the block even if the pointer
   * happens to overlap the flyout's bounding rect.
   * @param coordinate The currnet location of the dragged item.
   * @param rootDraggable The topmost item being dragged.
   * @returns True if the draggable would be deleted.
   */
  override wouldDeleteDraggable(
    coordinate: Blockly.utils.Coordinate,
    rootDraggable: Blockly.IDraggable & Blockly.IDeletable,
  ) {
    if (this.draggedOutOfBounds) return false
    return super.wouldDeleteDraggable(coordinate, rootDraggable)
  }

  /**
   * Returns whether or not the dragged item should return to its starting
   * position.
   * @param coordinate The current location of the dragged item.
   * @param rootDraggable The topmost item being dragged.
   * @returns True if the draggable should return to its starting position.
   */
  override shouldReturnToStart(coordinate: Blockly.utils.Coordinate, rootDraggable: Blockly.IDraggable) {
    // If a block is dragged out of the workspace to be e.g. dropped on another
    // sprite, it should remain in the same place on the workspace where it was,
    // rather than being moved to an invisible part of the workspace.
    return this.draggedOutOfBounds || super.shouldReturnToStart(coordinate, rootDraggable)
  }

  /**
   * Returns whether or not the given event occurred within the bounds of the
   * workspace.
   * @param coordinate The current location of the dragged item.
   * @returns True if the event occurred inside the workspace.
   */
  isInsideWorkspace(coordinate: Blockly.utils.Coordinate) {
    const bounds = this.draggable.workspace.getParentSvg().getBoundingClientRect()
    const workspaceRect = new Blockly.utils.Rect(bounds.top, bounds.bottom, bounds.left, bounds.right)
    return workspaceRect.contains(coordinate.x, coordinate.y)
  }

  protected getCoordinate(e?: PointerEvent | KeyboardEvent) {
    let coordinate: Blockly.utils.Coordinate
    if (e instanceof PointerEvent) {
      coordinate = new Blockly.utils.Coordinate(e.clientX, e.clientY)
    } else {
      const screenCoordinate = Blockly.utils.svgMath.wsToScreenCoordinates(
        this.draggable.workspace,
        this.draggable.getRelativeToSurfaceXY(),
      )
      const scroll = new Blockly.utils.Coordinate(window.scrollX, window.scrollY)

      coordinate = Blockly.utils.Coordinate.difference(screenCoordinate, scroll)
    }

    return coordinate
  }
}

Blockly.registry.register(Blockly.registry.Type.BLOCK_DRAGGER, Blockly.registry.DEFAULT, ScratchDragger, true)
