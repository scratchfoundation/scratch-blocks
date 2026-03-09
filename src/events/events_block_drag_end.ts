/**
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'

export class BlockDragEnd extends Blockly.Events.BlockBase {
  isOutside!: boolean
  xml!: Element | DocumentFragment

  constructor(block?: Blockly.Block, isOutside?: boolean) {
    super(block)
    this.type = 'endDrag'
    if (isOutside !== undefined) this.isOutside = isOutside
    this.recordUndo = false
    if (block) this.xml = Blockly.Xml.blockToDom(block, true)
  }

  toJson(): BlockDragEndJson {
    return {
      ...super.toJson(),
      isOutside: this.isOutside,
      xml: Blockly.utils.xml.domToText(this.xml),
    }
  }

  static fromJson(json: BlockDragEndJson, workspace: Blockly.Workspace, event?: any): BlockDragEnd {
    const newEvent = super.fromJson(json, workspace, event ?? new BlockDragEnd()) as BlockDragEnd
    newEvent.isOutside = json.isOutside
    newEvent.xml = Blockly.utils.xml.textToDom(json.xml)

    return newEvent
  }
}

interface BlockDragEndJson extends Blockly.Events.BlockBaseJson {
  isOutside: boolean
  xml: string
}
