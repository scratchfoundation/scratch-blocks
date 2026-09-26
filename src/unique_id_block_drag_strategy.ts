/**
 * Copyright 2026 Raspberry Pi Foundation
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'
import { stripIds } from './scratch_blocks_utils'

export class UniqueIdBlockDragStrategy extends Blockly.dragging.BlockDragStrategy {
  protected override getTargetBlock() {
    if (this.block.isInFlyout && this.block.workspace.targetWorkspace) {
      const rootBlock = this.block.getRootBlock()

      // Blockly's default implementation preserves IDs, which is valid because
      // the flyout and main workspace are separate workspaces. However,
      // Scratch's VM keys blocks by ID, so IDs must be globally unique.
      // This drag strategy explicitly serializes blocks without their IDs to
      // avoid duplicates.
      const json = Blockly.serialization.blocks.save(rootBlock, { saveIds: false })
      if (json) {
        const newBlock = Blockly.serialization.blocks.appendInternal(
          stripIds(json),
          this.block.workspace.targetWorkspace,
          {
            recordUndo: true,
          },
        ) as Blockly.BlockSvg
        Blockly.Events.setRecordUndo(false)
        newBlock.render()
        this.positionNewBlock(this.block, newBlock)
        Blockly.Events.setRecordUndo(true)

        return newBlock
      }
    }

    return this.block
  }
}
