/**
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'
import type { ScratchCommentBubble } from '../scratch_comment_bubble'
import { BlockCommentBase, BlockCommentBaseJson } from './events_block_comment_base'

class BlockCommentCollapse extends BlockCommentBase {
  newCollapsed!: boolean

  constructor(opt_blockComment?: ScratchCommentBubble, collapsed?: boolean) {
    super(opt_blockComment)
    this.type = 'block_comment_collapse'
    if (collapsed !== undefined) this.newCollapsed = collapsed
  }

  toJson(): BlockCommentCollapseJson {
    return {
      ...super.toJson(),
      collapsed: this.newCollapsed,
    }
  }

  static fromJson(json: BlockCommentCollapseJson, workspace: Blockly.Workspace, event?: any): BlockCommentCollapse {
    const newEvent = super.fromJson(json, workspace, event ?? new BlockCommentCollapse()) as BlockCommentCollapse
    newEvent.newCollapsed = json.collapsed

    return newEvent
  }

  run(forward: boolean) {
    const workspace = this.getEventWorkspace_()
    const block = workspace.getBlockById(this.blockId)
    if (!block) {
      console.warn('BlockCommentCollapse.run: block not found', this.blockId, this.workspaceId)
      return
    }
    const comment = block.getIcon(Blockly.icons.IconType.COMMENT)
    if (!comment) {
      console.warn('BlockCommentCollapse.run: comment icon not found', block.id)
      return
    }
    comment.setBubbleVisible(forward ? !this.newCollapsed : this.newCollapsed)
  }
}

interface BlockCommentCollapseJson extends BlockCommentBaseJson {
  collapsed: boolean
}

Blockly.registry.register(Blockly.registry.Type.EVENT, 'block_comment_collapse', BlockCommentCollapse)
