/**
 * @license
 * Copyright 2026 Raspberry Pi Foundation
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'
import { navigateBlock } from './scratch_block_navigation_policy'

/**
 * Set of rules controlling keyboard navigation to and from a field.
 */
export class ScratchFieldNavigationPolicy extends Blockly.FieldNavigationPolicy {
  /**
   * Returns the next peer node of the given field.
   *
   * @param current The field to find the following element of.
   * @returns The next item on the field's parent block.
   */
  override getNextSibling(current: Blockly.Field<any>): Blockly.IFocusableNode | null {
    return navigateBlock(current.getSourceBlock() as Blockly.BlockSvg, current, 1)
  }

  /**
   * Returns the previous peer node of the given field.
   *
   * @param current The field to find the preceding element of.
   * @returns The previous item on the field's parent block.
   */
  override getPreviousSibling(current: Blockly.Field<any>): Blockly.IFocusableNode | null {
    return navigateBlock(current.getSourceBlock() as Blockly.BlockSvg, current, -1)
  }
}
