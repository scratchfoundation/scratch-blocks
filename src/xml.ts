/**
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'
import { ScratchVariableModel } from './scratch_variable_model'

/**
 * Clears the workspace and loads the given serialized state.
 * @param xml XML representation of a Blockly workspace.
 * @param workspace The workspace to load the serialized data onto.
 * @returns An array of variable IDs created during loading.
 */
export function clearWorkspaceAndLoadFromXml(xml: Element, workspace: Blockly.WorkspaceSvg): string[] {
  workspace.setResizesEnabled(false)
  Blockly.Events.setGroup(true)
  workspace.clear()

  // Manually load variables to include the cloud and local properties that core
  // Blockly is unaware of.
  for (const variable of xml.querySelectorAll('variables variable')) {
    const id = variable.getAttribute('id')
    if (!id) continue
    const type = variable.getAttribute('type') ?? ''
    const name = variable.textContent ?? ''
    const isLocal = variable.getAttribute('islocal') === 'true'
    const isCloud = variable.getAttribute('iscloud') === 'true'

    const variableModel = new ScratchVariableModel(workspace, name, type, id, isLocal, isCloud)
    Blockly.Events.fire(new (Blockly.Events.get(Blockly.Events.VAR_CREATE))(variableModel))
    workspace.getVariableMap().addVariable(variableModel)
  }

  // Remove the `variables` element from the XML to prevent Blockly from
  // throwing or stomping on the variables we created.
  xml.querySelector('variables')?.remove()

  // Defer to core for the rest of the deserialization.
  const blockIds = Blockly.Xml.domToWorkspace(xml, workspace)

  workspace.setResizesEnabled(true)
  return blockIds
}
