/**
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'

/**
 * Class that represents a variable with extra fields for Scratch.
 */
export class ScratchVariableModel extends Blockly.VariableModel {
  constructor(
    workspace: Blockly.Workspace,
    name: string,
    type?: string,
    id?: string,
    public isLocal = false,
    public isCloud = false,
  ) {
    super(workspace, name, type, id)
  }
}

Blockly.registry.register(Blockly.registry.Type.VARIABLE_MODEL, Blockly.registry.DEFAULT, ScratchVariableModel, true)
