/**
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'

/**
 * Custom connection checker to restrict which blocks can be connected.
 */
class ScratchConnectionChecker extends Blockly.ConnectionChecker {
  /**
   * Returns whether or not the two connections should be allowed to connect.
   * @param a One of the connections to check.
   * @param b The other connection to check.
   * @param distance The maximum allowable distance between connections.
   * @returns True if the connections should be allowed to connect.
   */
  doDragChecks(a: Blockly.RenderedConnection, b: Blockly.RenderedConnection, distance: number): boolean {
    // This check prevents dragging a block into the slot occupied by the
    // procedure caller example block in a procedure definition block.
    if (b.getSourceBlock().type === 'procedures_definition' && b.getParentInput()?.name === 'custom_block') {
      return false
    }

    return super.doDragChecks(a, b, distance)
  }
}

Blockly.registry.register(
  Blockly.registry.Type.CONNECTION_CHECKER,
  Blockly.registry.DEFAULT,
  ScratchConnectionChecker,
  true,
)
