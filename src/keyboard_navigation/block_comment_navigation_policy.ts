/**
 * @license
 * Copyright 2026 Raspberry Pi Foundation
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'
import { ScratchCommentBubble } from '../scratch_comment_bubble'
import { navigateBlock } from './scratch_block_navigation_policy'

/**
 * Set of rules controlling keyboard navigation from a block comment bubble.
 */
export class BlockCommentNavigationPolicy implements Blockly.INavigationPolicy<ScratchCommentBubble> {
  /**
   * Returns the first child of the given block comment bubble.
   *
   * @param _current The block comment bubble to return the first child of.
   * @returns The first top bar button on the comment.
   */
  getFirstChild(current: ScratchCommentBubble): Blockly.IFocusableNode | null {
    return current.getCommentBarButtons()[0]
  }

  /**
   * Returns the parent of the given block comment bubble.
   *
   * @param current The block comment bubble to return the parent of.
   * @returns The parent block of the given block comment bubble.
   */
  getParent(current: ScratchCommentBubble): Blockly.IFocusableNode | null {
    return current.getSourceBlock()
  }

  /**
   * Returns the next peer node of the given block comment bubble.
   *
   * @param current The block comment bubble to find the following element of.
   * @returns The next navigable item on the block comment bubble's parent
   *     block.
   */
  getNextSibling(current: ScratchCommentBubble): Blockly.IFocusableNode | null {
    const sourceBlock = current.getSourceBlock()
    if (!sourceBlock) return null
    return navigateBlock(sourceBlock, current, 1)
  }

  /**
   * Returns the previous peer node of the given block comment bubble.
   *
   * @param current The block comment bubble to find the preceding element of.
   * @returns The previous navigable item on the block comment bubble's parent
   *     block.
   */
  getPreviousSibling(current: ScratchCommentBubble): Blockly.IFocusableNode | null {
    const sourceBlock = current.getSourceBlock()
    if (!sourceBlock) return null
    return navigateBlock(sourceBlock, current, -1)
  }

  /**
   * Returns the row ID of the given block comment bubble.
   *
   * @param current The block comment bubble to retrieve the row ID of.
   * @returns The row ID of the given block comment bubble.
   */
  getRowId(current: ScratchCommentBubble) {
    return current.getSourceBlock()?.getRowId() ?? ''
  }

  /**
   * Returns whether or not the given block comment bubble can be navigated to.
   *
   * @param current The instance to check for navigability.
   * @returns True.
   */
  isNavigable(current: ScratchCommentBubble): boolean {
    return true
  }

  /**
   * Returns whether the given object can be navigated from by this policy.
   *
   * @param current The object to check if this policy applies to.
   * @returns True if the object is a block comment bubble.
   */
  isApplicable(current: any): current is ScratchCommentBubble {
    return current instanceof ScratchCommentBubble
  }
}
