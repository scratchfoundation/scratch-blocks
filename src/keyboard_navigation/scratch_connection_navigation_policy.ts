/**
 * Copyright 2026 Raspberry Pi Foundation
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'
import { navigateBlock } from './scratch_block_navigation_policy'

/**
 * Set of rules controlling keyboard navigation to and from a connection.
 */
export class ScratchConnectionNavigationPolicy extends Blockly.ConnectionNavigationPolicy {
  /**
   * Returns the next peer node of the given connection.
   * @param current The connection to find the following element of.
   * @returns The next item on the connection's parent block.
   */
  override getNextSibling(current: Blockly.RenderedConnection): Blockly.IFocusableNode | null {
    if (current.getParentInput()) {
      return navigateBlock(current.getSourceBlock(), current, 1)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison -- `Connection.type` is just typed as `number`.
    } else if (current.type === Blockly.ConnectionType.NEXT_STATEMENT && !current.targetConnection) {
      const surroundParent = current.getSourceBlock().getSurroundParent()
      if (surroundParent) {
        return navigateBlock(surroundParent, current, 1)
      }
    }

    return super.getNextSibling(current)
  }

  /**
   * Returns the previous peer node of the given connection.
   * @param current The connection to find the preceding element of.
   * @returns The previous item on the connection's parent block.
   */
  override getPreviousSibling(current: Blockly.RenderedConnection): Blockly.IFocusableNode | null {
    if (current.getParentInput()) {
      return navigateBlock(current.getSourceBlock(), current, -1)
    }

    return super.getPreviousSibling(current)
  }
}
