/**
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'

/**
 * Displays an indicator of where a block being dragged will be connected.
 */
class ScratchInsertionMarkerPreviewer extends Blockly.InsertionMarkerPreviewer {
  /**
   * Transforms the given block into a JSON representation used to construct an
   * insertion marker.
   * @param block The block to serialize and use as an insertion marker.
   * @returns A JSON-formatted string corresponding to a serialized
   *     representation of the given block suitable for use as an insertion
   *     marker.
   */
  protected override serializeBlockToInsertionMarker(block: Blockly.BlockSvg) {
    const blockJson = Blockly.serialization.blocks.save(block, {
      addCoordinates: false,
      addInputBlocks: true,
      addNextBlocks: false,
      doFullSerialization: false,
    })

    if (!blockJson) {
      throw new Error(`Failed to serialize source block. ${block.toDevString()}`)
    }

    return blockJson
  }
}

Blockly.registry.register(
  Blockly.registry.Type.CONNECTION_PREVIEWER,
  Blockly.registry.DEFAULT,
  ScratchInsertionMarkerPreviewer,
  true,
)
