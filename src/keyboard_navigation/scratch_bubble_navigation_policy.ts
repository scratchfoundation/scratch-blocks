/**
 * Copyright 2026 Raspberry Pi Foundation
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'
import { navigateBlock } from './scratch_block_navigation_policy'

/**
 * Set of rules controlling keyboard navigation to and from a bubble.
 */
export class ScratchBubbleNavigationPolicy extends Blockly.BubbleNavigationPolicy {
  /**
   * Returns the next peer node of the given bubble.
   * @param current The bubble to find the following element of.
   * @returns The next item on the bubble's parent block.
   */
  override getNextSibling(current: Blockly.bubbles.Bubble): Blockly.IFocusableNode | null {
    return navigateBlock(this.getSourceBlock(current), current, 1)
  }

  /**
   * Returns the previous peer node of the given bubble.
   * @param current The bubble to find the preceding element of.
   * @returns The previous navigable item on the bubble's icon's parent block.
   */
  override getPreviousSibling(current: Blockly.bubbles.Bubble): Blockly.IFocusableNode | null {
    return navigateBlock(this.getSourceBlock(current), current, -1)
  }

  /**
   * Returns the source block of the given bubble.
   * @param current The bubble to source the parent block of.
   * @returns The source block of the given bubble.
   */
  private getSourceBlock(current: Blockly.bubbles.Bubble) {
    const owner = current.getOwner()
    if (owner instanceof Blockly.icons.Icon) {
      const block = owner.getSourceBlock()
      if (block instanceof Blockly.BlockSvg) return block
    }

    throw new Error(`Could not retrieve source block for bubble ${current.id}`)
  }
}
