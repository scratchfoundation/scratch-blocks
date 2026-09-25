/**
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { RecyclableBlockFlyoutInflater as BlocklyRecyclableBlockFlyoutInflater } from '@blockly/continuous-toolbox'
import * as Blockly from 'blockly/core'
import { CheckboxBubble } from './checkbox_bubble'
import { UniqueIdBlockDragStrategy } from './unique_id_block_drag_strategy'

/**
 * A block inflater that caches and reuses blocks to improve performance.
 */
export class RecyclableBlockFlyoutInflater extends BlocklyRecyclableBlockFlyoutInflater {
  /**
   * Creates a block on the flyout workspace from the given block definition.
   * @param state A JSON representation of a block to load.
   * @param flyout The flyout on which the block will be inflated.
   * @returns The newly created block.
   */
  load(state: object, flyout: Blockly.IFlyout): Blockly.FlyoutItem {
    const flyoutItem = super.load(state, flyout)
    const block = flyoutItem.getElement()
    const flyoutWorkspace = flyout.getWorkspace()
    if (block instanceof Blockly.BlockSvg && 'checkboxInFlyout' in block && block.checkboxInFlyout === true) {
      block.moveBy(
        (flyoutWorkspace.RTL ? -1 : 1) * (CheckboxBubble.CHECKBOX_SIZE + CheckboxBubble.CHECKBOX_MARGIN),
        0,
      )
    }

    return flyoutItem
  }

  override createBlock(
    blockDefinition: Blockly.utils.toolbox.BlockInfo,
    workspace: Blockly.WorkspaceSvg,
  ): Blockly.BlockSvg {
    const block = super.createBlock(blockDefinition, workspace)
    block.setDragStrategy(new UniqueIdBlockDragStrategy(block))
    return block
  }

  /**
   * Add listeners to a block that has been added to the flyout.
   * @param block The block to add listeners for.
   */
  protected override addBlockListeners(block: Blockly.BlockSvg) {
    const blockListeners = []

    blockListeners.push(
      Blockly.browserEvents.conditionalBind(block.getSvgRoot(), 'pointerdown', block, (e: PointerEvent) => {
        const gesture = this.flyout?.targetWorkspace?.getGesture(e)
        if (gesture && this.flyout) {
          gesture.setStartBlock(block)
          gesture.handleFlyoutStart(e, this.flyout)
        }
      }),
    )

    this.listeners.set(block.id, blockListeners)
  }
}

/**
 * Registers the recyclable block flyout inflater, replacing the standard
 * block flyout inflater.
 */
export function registerRecyclableBlockFlyoutInflater() {
  Blockly.registry.unregister(Blockly.registry.Type.FLYOUT_INFLATER, 'block')
  Blockly.registry.register(Blockly.registry.Type.FLYOUT_INFLATER, 'block', RecyclableBlockFlyoutInflater)
}
