/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from "blockly/core";

class ScratchVariableModel extends Blockly.VariableModel {
  constructor(workspace, name, type, id, isLocal, isCloud) {
    super(workspace, name, type, id);
    // isLocal and isCloud may not be passed when creating broadcast message
    // variables, which conveniently are neither local nor cloud.
    this.isLocal = !!isLocal;
    this.isCloud = !!isCloud;
  }
}

Blockly.registry.register(
  Blockly.registry.Type.VARIABLE_MODEL,
  Blockly.registry.DEFAULT,
  ScratchVariableModel,
  true
);
