/**
 * @license
 * Copyright 2026 Raspberry Pi Foundation
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'
import { ScratchCommentBubble } from '../scratch_comment_bubble'
import { BlockCommentNavigationPolicy } from './block_comment_navigation_policy'
import { CheckboxBubbleNavigationPolicy } from './checkbox_bubble_navigation_policy'
import { ScratchBlockCommentBarButtonNavigationPolicy } from './scratch_block_comment_bar_button_navigation_policy'
import { ScratchBlockNavigationPolicy } from './scratch_block_navigation_policy'
import { ScratchBubbleNavigationPolicy } from './scratch_bubble_navigation_policy'
import { ScratchConnectionNavigationPolicy } from './scratch_connection_navigation_policy'
import { ScratchFieldNavigationPolicy } from './scratch_field_navigation_policy'
import { ScratchIconNavigationPolicy } from './scratch_icon_navigation_policy'

/**
 * Class that resolves where keyboard navigation should go.
 */
export class ScratchNavigator extends Blockly.Navigator {
  protected override rules = [
    new ScratchBlockNavigationPolicy(),
    new ScratchFieldNavigationPolicy(),
    new ScratchConnectionNavigationPolicy(),
    new Blockly.WorkspaceNavigationPolicy(),
    new ScratchIconNavigationPolicy(),
    new Blockly.WorkspaceCommentNavigationPolicy(),
    new ScratchBubbleNavigationPolicy(),
    new Blockly.CommentEditorNavigationPolicy(),
    new BlockCommentNavigationPolicy(),
    new CheckboxBubbleNavigationPolicy(),
    new ScratchBlockCommentBarButtonNavigationPolicy(),
    new Blockly.CommentBarButtonNavigationPolicy(),
  ]

  /**
   * Returns the block that owns the given IFocusableNode, if any.
   */
  override getSourceBlockFromNode(node: Blockly.IFocusableNode) {
    if (node instanceof Blockly.comments.CommentBarButton) {
      const commentView = node.getCommentView()
      if (commentView instanceof ScratchCommentBubble) {
        return commentView.getSourceBlock()
      }
    }
    return super.getSourceBlockFromNode(node)
  }
}
