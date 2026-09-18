/**
 * Copyright 2026 Raspberry Pi Foundation
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'
import { ScratchCommentBubble } from '../scratch_comment_bubble'
import { navigateBlock } from './scratch_block_navigation_policy'

/**
 * Set of rules controlling keyboard navigation to and from a CommentBarButton.
 */
export class ScratchBlockCommentBarButtonNavigationPolicy extends Blockly.CommentBarButtonNavigationPolicy {
  /**
   * Returns the parent of the given CommentBarButton.
   * @param current The CommentBarButton to return the parent of.
   * @returns The parent comment of the given CommentBarButton.
   */
  getParent(current: Blockly.comments.CommentBarButton): Blockly.IFocusableNode | null {
    return this.getSourceBlock(current)
  }

  /**
   * Returns the next peer node of the given CommentBarButton.
   * @param current The CommentBarButton to find the following element of.
   * @returns The next element, if any.
   */
  getNextSibling(current: Blockly.comments.CommentBarButton): Blockly.IFocusableNode | null {
    return navigateBlock(this.getSourceBlock(current), current, 1)
  }

  /**
   * Returns the previous peer node of the given CommentBarButton.
   * @param current The CommentBarButton to find the preceding element of.
   * @returns The CommentBarButton's previous element, if any.
   */
  getPreviousSibling(current: Blockly.comments.CommentBarButton): Blockly.IFocusableNode | null {
    return navigateBlock(this.getSourceBlock(current), current, -1)
  }

  /**
   * Returns the row ID of the given CommentBarButton.
   * @param current The CommentBarButton to retrieve the row ID of.
   * @returns The row ID of the given CommentBarButton.
   */
  getRowId(current: Blockly.comments.CommentBarButton) {
    return this.getSourceBlock(current).getRowId()
  }

  /**
   * Returns whether the given object can be navigated from by this policy.
   * @param current The object to check if this policy applies to.
   * @returns True if the object is an CommentBarButton.
   */
  isApplicable(current: unknown): current is Blockly.comments.CommentBarButton {
    return (
      current instanceof Blockly.comments.CommentBarButton && current.getCommentView() instanceof ScratchCommentBubble
    )
  }

  /**
   * Returns the source block of the given comment bar button.
   * @param current The CommentBarButton to source the parent block of.
   * @returns The source block of the given CommentBarButton.
   */
  private getSourceBlock(current: Blockly.comments.CommentBarButton) {
    const commentView = current.getCommentView()
    if (commentView instanceof ScratchCommentBubble) {
      const sourceBlock = commentView.getSourceBlock()
      if (sourceBlock) return sourceBlock
    }

    throw new Error(`Could not retrieve source block for comment bar button ${current.id}`)
  }
}
