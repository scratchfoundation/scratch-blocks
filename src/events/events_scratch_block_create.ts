/**
 * Copyright 2026 Raspberry Pi Foundation
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'

/**
 * Custom block creation event that restores the serialized block XML field
 * which was removed from the core implementation in Blockly v13. Scratch
 * depends on that field for interop with the VM.
 */
export class ScratchBlockCreate extends Blockly.Events.BlockCreate {
  /** The XML representation of the created block(s). */
  xml?: Element | DocumentFragment

  /** @param opt_block The created block.  Undefined for a blank event. */
  constructor(opt_block?: Blockly.Block) {
    super(opt_block)
    if (!opt_block) {
      return // Blank event to be populated by fromJson.
    }

    this.xml = Blockly.Xml.blockToDomWithXY(opt_block)
  }

  override toJson(): ScratchBlockCreateJson {
    if (!this.xml) {
      throw new Error('The block XML is undefined. Either pass a block to the constructor, or call fromJson')
    }

    const json = super.toJson() as ScratchBlockCreateJson
    json.xml = Blockly.Xml.domToText(this.xml)
    return json
  }

  static fromJson(json: ScratchBlockCreateJson, workspace: Blockly.Workspace, event?: unknown): ScratchBlockCreate {
    const newEvent = super.fromJson(json, workspace, event) as ScratchBlockCreate
    newEvent.xml = Blockly.utils.xml.textToDom(json.xml)
    return newEvent
  }
}

export interface ScratchBlockCreateJson extends Blockly.Events.BlockCreateJson {
  xml: string
}

Blockly.registry.register(Blockly.registry.Type.EVENT, Blockly.Events.BLOCK_CREATE, ScratchBlockCreate, true)
