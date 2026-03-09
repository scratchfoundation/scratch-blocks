/**
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'
import type { ScratchCommentBubble } from '../scratch_comment_bubble'
import { BlockCommentBase, BlockCommentBaseJson } from './events_block_comment_base'

class BlockCommentResize extends BlockCommentBase {
  oldSize!: Blockly.utils.Size
  newSize!: Blockly.utils.Size

  constructor(opt_blockComment?: ScratchCommentBubble, oldSize?: Blockly.utils.Size, newSize?: Blockly.utils.Size) {
    super(opt_blockComment)
    this.type = 'block_comment_resize'
    if (oldSize !== undefined) this.oldSize = oldSize
    if (newSize !== undefined) this.newSize = newSize
  }

  toJson(): BlockCommentResizeJson {
    return {
      ...super.toJson(),
      newSize: {
        width: this.newSize.width,
        height: this.newSize.height,
      },
      oldSize: {
        width: this.oldSize.width,
        height: this.oldSize.height,
      },
    }
  }

  static fromJson(json: BlockCommentResizeJson, workspace: Blockly.Workspace, event?: any): BlockCommentResize {
    const newEvent = super.fromJson(json, workspace, event ?? new BlockCommentResize()) as BlockCommentResize
    newEvent.newSize = new Blockly.utils.Size(json.newSize.width, json.newSize.height)
    newEvent.oldSize = new Blockly.utils.Size(json.oldSize.width, json.oldSize.height)

    return newEvent
  }

  run(forward: boolean) {
    const workspace = this.getEventWorkspace_()
    const block = workspace?.getBlockById(this.blockId)
    const comment = block?.getIcon(Blockly.icons.IconType.COMMENT)
    comment?.setBubbleSize(forward ? this.newSize : this.oldSize)
  }
}

interface BlockCommentResizeJson extends BlockCommentBaseJson {
  newSize: {
    width: number
    height: number
  }
  oldSize: {
    width: number
    height: number
  }
}

Blockly.registry.register(Blockly.registry.Type.EVENT, 'block_comment_resize', BlockCommentResize)
