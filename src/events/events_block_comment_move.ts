/**
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'
import type { ScratchCommentBubble } from '../scratch_comment_bubble'
import { BlockCommentBase, BlockCommentBaseJson } from './events_block_comment_base'

class BlockCommentMove extends BlockCommentBase {
  oldCoordinate_!: Blockly.utils.Coordinate
  newCoordinate_!: Blockly.utils.Coordinate

  constructor(
    opt_blockComment?: ScratchCommentBubble,
    oldCoordinate?: Blockly.utils.Coordinate,
    newCoordinate?: Blockly.utils.Coordinate,
  ) {
    super(opt_blockComment)
    this.type = 'block_comment_move'
    if (oldCoordinate !== undefined) this.oldCoordinate_ = oldCoordinate
    if (newCoordinate !== undefined) this.newCoordinate_ = newCoordinate
  }

  toJson(): BlockCommentMoveJson {
    return {
      ...super.toJson(),
      newCoordinate: this.newCoordinate_,
      oldCoordinate: this.oldCoordinate_,
    }
  }

  static fromJson(json: BlockCommentMoveJson, workspace: Blockly.Workspace, event?: any): BlockCommentMove {
    const newEvent = super.fromJson(json, workspace, event ?? new BlockCommentMove()) as BlockCommentMove
    newEvent.newCoordinate_ = new Blockly.utils.Coordinate(json.newCoordinate.x, json.newCoordinate.y)
    newEvent.oldCoordinate_ = new Blockly.utils.Coordinate(json.oldCoordinate.x, json.oldCoordinate.y)

    return newEvent
  }

  run(forward: boolean) {
    const workspace = this.getEventWorkspace_()
    const block = workspace?.getBlockById(this.blockId)
    const comment = block?.getIcon(Blockly.icons.IconType.COMMENT)
    comment?.setBubbleLocation(forward ? this.newCoordinate_ : this.oldCoordinate_)
  }
}

interface BlockCommentMoveJson extends BlockCommentBaseJson {
  newCoordinate: {
    x: number
    y: number
  }
  oldCoordinate: {
    x: number
    y: number
  }
}

Blockly.registry.register(Blockly.registry.Type.EVENT, 'block_comment_move', BlockCommentMove)
