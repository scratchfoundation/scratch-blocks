/**
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'
import type { ScratchCommentBubble } from '../scratch_comment_bubble'
import { BlockCommentBase, BlockCommentBaseJson } from './events_block_comment_base'

class BlockCommentChange extends BlockCommentBase {
  oldContents_!: string
  newContents_!: string

  constructor(opt_blockComment?: ScratchCommentBubble, oldContents?: string, newContents?: string) {
    super(opt_blockComment)
    this.type = 'block_comment_change'
    if (oldContents !== undefined) this.oldContents_ = oldContents
    if (newContents !== undefined) this.newContents_ = newContents
    // Disable undo because Blockly already tracks changes to comment text for
    // undo purposes; this event exists solely to keep the Scratch VM apprised
    // of the state of things.
    this.recordUndo = false
  }

  toJson(): BlockCommentChangeJson {
    return {
      ...super.toJson(),
      newContents: this.newContents_,
      oldContents: this.oldContents_,
    }
  }

  static fromJson(json: BlockCommentChangeJson, workspace: Blockly.Workspace, event?: any): BlockCommentChange {
    const newEvent = super.fromJson(json, workspace, event ?? new BlockCommentChange()) as BlockCommentChange
    newEvent.newContents_ = json.newContents
    newEvent.oldContents_ = json.oldContents

    return newEvent
  }
}

interface BlockCommentChangeJson extends BlockCommentBaseJson {
  newContents: string
  oldContents: string
}

Blockly.registry.register(Blockly.registry.Type.EVENT, 'block_comment_change', BlockCommentChange)
