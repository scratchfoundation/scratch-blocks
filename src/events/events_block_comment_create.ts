/**
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'
import type { ScratchCommentBubble } from '../scratch_comment_bubble'
import { BlockCommentBase, BlockCommentBaseJson } from './events_block_comment_base'

class BlockCommentCreate extends BlockCommentBase {
  json!: {
    x: number
    y: number
    width: number
    height: number
  }

  constructor(opt_blockComment?: ScratchCommentBubble) {
    super(opt_blockComment)
    this.type = 'block_comment_create'
    // opt_blockComment is absent when this class is instantiated by fromJson.
    // In that case fromJson sets this.json directly, so return early here.
    if (!opt_blockComment) return
    const size = opt_blockComment.getSize()
    const location = opt_blockComment.getRelativeToSurfaceXY()
    this.json = {
      x: location.x,
      y: location.y,
      width: size.width,
      height: size.height,
    }
    // Disable undo because Blockly already tracks comment creation for
    // undo purposes; this event exists solely to keep the Scratch VM apprised
    // of the state of things.
    this.recordUndo = false
  }

  toJson(): BlockCommentCreateJson {
    return {
      ...super.toJson(),
      ...this.json,
    }
  }

  static fromJson(json: BlockCommentCreateJson, workspace: Blockly.Workspace, event?: any): BlockCommentCreate {
    const newEvent = super.fromJson(json, workspace, event ?? new BlockCommentCreate()) as BlockCommentCreate
    newEvent.json = {
      x: json.x,
      y: json.y,
      width: json.width,
      height: json.height,
    }

    return newEvent
  }
}

interface BlockCommentCreateJson extends BlockCommentBaseJson {
  x: number
  y: number
  width: number
  height: number
}

Blockly.registry.register(Blockly.registry.Type.EVENT, 'block_comment_create', BlockCommentCreate)
