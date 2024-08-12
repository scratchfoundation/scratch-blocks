/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from "blockly/core";

class ScratchVariableMap extends Blockly.VariableMap {
  getVariable(name, type) {
    // Variable names in Blockly are case-insensitive, but case sensitive in
    // Scratch. Override the implementation to only return a variable whose name
    // is identical to the one requested.
    const variables = this.getVariablesOfType(type ?? "");
    if (!variables.length) return null;
    return variables.find((v) => v.getName() === name) ?? null;
  }
}

Blockly.registry.register(
  Blockly.registry.Type.VARIABLE_MAP,
  Blockly.registry.DEFAULT,
  ScratchVariableMap,
  true
);
