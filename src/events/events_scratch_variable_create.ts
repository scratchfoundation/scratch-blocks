/**
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'
import { ScratchVariableModel } from '../scratch_variable_model'

class ScratchVariableCreate extends Blockly.Events.VarCreate {
  isLocal!: boolean
  isCloud!: boolean

  constructor(variable?: ScratchVariableModel) {
    super(variable)
    if (!variable) return

    this.isLocal = variable.isLocal
    this.isCloud = variable.isCloud
  }

  toJson(): ScratchVariableCreateJson {
    return {
      ...super.toJson(),
      isLocal: this.isLocal,
      isCloud: this.isCloud,
    }
  }

  static fromJson(json: ScratchVariableCreateJson, workspace: Blockly.Workspace, event?: any): ScratchVariableCreate {
    const newEvent = super.fromJson(json, workspace, event ?? new ScratchVariableCreate()) as ScratchVariableCreate
    newEvent.isLocal = json.isLocal
    newEvent.isCloud = json.isCloud
    return newEvent
  }

  run(forward: boolean) {
    const workspace = this.getEventWorkspace_()
    const variableMap = workspace.getVariableMap()
    if (forward) {
      if (this.varName == null || this.varType == null || this.varId == null) {
        console.error('ScratchVariableCreate.run: missing variable data for create', {
          varName: this.varName,
          varType: this.varType,
          varId: this.varId,
        })
        return
      }
      const variable = new ScratchVariableModel(
        workspace,
        this.varName,
        this.varType,
        this.varId,
        this.isLocal,
        this.isCloud,
      )
      variableMap.addVariable(variable)
      Blockly.Events.fire(new (Blockly.Events.get(Blockly.Events.VAR_CREATE))(variable))
    } else {
      if (this.varId == null) {
        console.error('ScratchVariableCreate.run: missing varId for delete', this)
        return
      }
      const variable = variableMap.getVariableById(this.varId)
      if (variable) {
        variableMap.deleteVariable(variable)
      }
    }
  }
}

interface ScratchVariableCreateJson extends Blockly.Events.VarCreateJson {
  isCloud: boolean
  isLocal: boolean
}

Blockly.registry.register(Blockly.registry.Type.EVENT, Blockly.Events.VAR_CREATE, ScratchVariableCreate, true)
