/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from "blockly/core";

class ScratchVariableCreate extends Blockly.Events.VarCreate {
  constructor(variable) {
    super(variable);
    if (!variable) return;

    this.isLocal = variable.isLocal;
    this.isCloud = variable.isCloud;
  }

  toJson() {
    const json = super.toJson();
    json["isLocal"] = this.isLocal;
    json["isCloud"] = this.isCloud;
    return json;
  }

  static fromJson(json, workspace, event) {
    const newEvent = super.fromJson(json, workspace, event);
    newEvent.isLocal = json["isLocal"];
    newEvent.isCloud = json["isCloud"];
    return newEvent;
  }

  run(forward) {
    const workspace = this.getEventWorkspace_();
    const variableMap = workspace.getVariableMap();
    if (forward) {
      const VariableModel = Blockly.registry.getObject(
        Blockly.registry.Type.VARIABLE_MODEL,
        Blockly.registry.DEFAULT,
        true
      );
      const variable = new VariableModel(
        workspace,
        this.varName,
        this.varType,
        this.varId,
        this.isLocal,
        this.isCloud
      );
      variableMap.addVariable(variable);
      Blockly.Events.fire(
        new (Blockly.Events.get(Blockly.Events.VAR_CREATE))(variable)
      );
    } else {
      const variable = variableMap.getVariableById(this.varId);
      if (variable) {
        variableMap.deleteVariable(variable);
      }
    }
  }
}

Blockly.registry.register(
  Blockly.registry.Type.EVENT,
  Blockly.Events.VAR_CREATE,
  ScratchVariableCreate,
  true
);
