/**
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'
import type { ScratchCommentBubble } from '../scratch_comment_bubble'

export class BlockCommentBase extends Blockly.Events.Abstract {
  isBlank = true
  commentId!: string
  blockId!: string
  workspaceId!: string

  constructor(opt_blockComment?: ScratchCommentBubble) {
    super()
    this.isBlank = !opt_blockComment

    if (!opt_blockComment) return

    this.commentId = opt_blockComment.getId()
    const sourceBlock = opt_blockComment.getSourceBlock()
    if (sourceBlock) {
      this.blockId = sourceBlock.id
      this.workspaceId = sourceBlock.workspace.id
    }
  }

  toJson(): BlockCommentBaseJson {
    return {
      ...super.toJson(),
      commentId: this.commentId,
      blockId: this.blockId,
    }
  }

  static fromJson(json: BlockCommentBaseJson, workspace: Blockly.Workspace, event?: any): BlockCommentBase {
    const newEvent = super.fromJson(json, workspace, event ?? new BlockCommentBase()) as BlockCommentBase
    newEvent.commentId = json.commentId
    newEvent.blockId = json.blockId
    return newEvent
  }
}

export interface BlockCommentBaseJson extends Blockly.Events.AbstractEventJson {
  commentId: string
  blockId: string
}
