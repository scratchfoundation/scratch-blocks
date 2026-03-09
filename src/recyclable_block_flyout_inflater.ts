/**
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { RecyclableBlockFlyoutInflater as BlocklyRecyclableBlockFlyoutInflater } from '@blockly/continuous-toolbox'
import * as Blockly from 'blockly/core'
import { CheckboxBubble } from './checkbox_bubble'

/**
 * A block inflater that caches and reuses blocks to improve performance.
 */
export class RecyclableBlockFlyoutInflater extends BlocklyRecyclableBlockFlyoutInflater {
  /**
   * Creates a block on the flyout workspace from the given block definition.
   * @param state A JSON representation of a block to load.
   * @param flyoutWorkspace The workspace on which the block will be inflated.
   * @returns The newly created block.
   */
  load(state: Blockly.utils.toolbox.BlockInfo, flyoutWorkspace: Blockly.WorkspaceSvg): Blockly.FlyoutItem {
    const flyoutItem = super.load(state, flyoutWorkspace)
    const block = flyoutItem.getElement()
    if ('checkboxInFlyout' in block && block.checkboxInFlyout) {
      block.moveBy(
        (flyoutWorkspace.RTL ? -1 : 1) * (CheckboxBubble.CHECKBOX_SIZE + CheckboxBubble.CHECKBOX_MARGIN),
        0,
      )
    }

    return flyoutItem
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
