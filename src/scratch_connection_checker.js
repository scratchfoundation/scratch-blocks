/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from "blockly/core";

class ScratchConnectionChecker extends Blockly.ConnectionChecker {
  // This check prevents dragging a block into the slot occupied by the
  // procedure caller example block in a procedure definition block.
  doDragChecks(a, b, distance) {
    if (
      b.getSourceBlock().type === "procedures_definition" &&
      b.getParentInput()?.name === "custom_block"
    ) {
      return false;
    }

    return super.doDragChecks(a, b, distance);
  }
}

Blockly.registry.register(
  Blockly.registry.Type.CONNECTION_CHECKER,
  Blockly.registry.DEFAULT,
  ScratchConnectionChecker,
  true
);
