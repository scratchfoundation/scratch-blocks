/**
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'

export class BlockDragOutside extends Blockly.Events.BlockBase {
  isOutside!: boolean

  constructor(block?: Blockly.Block, isOutside?: boolean) {
    super(block)
    this.type = 'dragOutside'
    if (isOutside !== undefined) this.isOutside = isOutside
    this.recordUndo = false
  }

  toJson(): BlockDragOutsideJson {
    return {
      ...super.toJson(),
      isOutside: this.isOutside,
    }
  }

  static fromJson(json: BlockDragOutsideJson, workspace: Blockly.Workspace, event?: any): BlockDragOutside {
    const newEvent = super.fromJson(json, workspace, event ?? new BlockDragOutside()) as BlockDragOutside
    newEvent.isOutside = json.isOutside

    return newEvent
  }
}

interface BlockDragOutsideJson extends Blockly.Events.BlockBaseJson {
  isOutside: boolean
}
