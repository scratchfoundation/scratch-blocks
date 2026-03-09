/**
 * Visual Blocks Editor
 *
 * Copyright 2017 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @file Data Flyout components including variable and list blocks.
 * @author marisaleung@google.com (Marisa Leung)
 */
import * as Blockly from 'blockly/core'
import { LIST_VARIABLE_TYPE, SCALAR_VARIABLE_TYPE } from './constants'
import { createVariable } from './variables'

/**
 * Construct the blocks required by the flyout for the variable category.
 * @param workspace The workspace containing variables.
 * @returns Array of XML block elements.
 */
export function getVariablesCategory(workspace: Blockly.WorkspaceSvg): Element[] {
  const scalarVariables = workspace.getVariablesOfType(SCALAR_VARIABLE_TYPE)
  scalarVariables.sort(Blockly.Variables.compareByName)
  const xmlList: Element[] = []

  addCreateButton(xmlList, workspace, 'VARIABLE')

  scalarVariables.forEach((variable) => addDataVariable(xmlList, variable))

  if (scalarVariables.length > 0) {
    xmlList[xmlList.length - 1].setAttribute('gap', '24')
    const firstVariable = scalarVariables[0]

    addSetVariableTo(xmlList, firstVariable)
    addChangeVariableBy(xmlList, firstVariable)
    addShowVariable(xmlList, firstVariable)
    addHideVariable(xmlList, firstVariable)
  }

  // Now add list variables to the flyout
  addCreateButton(xmlList, workspace, 'LIST')
  const listVariables = workspace.getVariablesOfType(LIST_VARIABLE_TYPE)
  listVariables.sort(Blockly.Variables.compareByName)
  listVariables.forEach((variable) => addDataList(xmlList, variable))

  if (listVariables.length > 0) {
    xmlList[xmlList.length - 1].setAttribute('gap', '24')
    const firstVariable = listVariables[0]

    addAddToList(xmlList, firstVariable)
    addSep(xmlList)
    addDeleteOfList(xmlList, firstVariable)
    addDeleteAllOfList(xmlList, firstVariable)
    addInsertAtList(xmlList, firstVariable)
    addReplaceItemOfList(xmlList, firstVariable)
    addSep(xmlList)
    addItemOfList(xmlList, firstVariable)
    addItemNumberOfList(xmlList, firstVariable)
    addLengthOfList(xmlList, firstVariable)
    addListContainsItem(xmlList, firstVariable)
    addSep(xmlList)
    addShowList(xmlList, firstVariable)
    addHideList(xmlList, firstVariable)
  }

  return xmlList
}

/**
 * Construct and add a data_variable block to xmlList.
 * @param xmlList Array of XML block elements.
 * @param variable Variable to select in the field.
 */
function addDataVariable(xmlList: Element[], variable: Blockly.IVariableModel<Blockly.IVariableState>) {
  // <block id="variableId" type="data_variable">
  //    <field name="VARIABLE">variablename</field>
  // </block>
  addBlock(xmlList, variable, 'data_variable', 'VARIABLE')
  // In the flyout, this ID must match variable ID for monitor syncing reasons
  xmlList[xmlList.length - 1].setAttribute('id', variable.getId())
}

/**
 * Construct and add a data_setvariableto block to xmlList.
 * @param xmlList Array of XML block elements.
 * @param variable Variable to select in the field.
 */
function addSetVariableTo(xmlList: Element[], variable: Blockly.IVariableModel<Blockly.IVariableState>) {
  // <block type="data_setvariableto" gap="20">
  //   <value name="VARIABLE">
  //    <shadow type="data_variablemenu"></shadow>
  //   </value>
  //   <value name="VALUE">
  //     <shadow type="text">
  //       <field name="TEXT">0</field>
  //     </shadow>
  //   </value>
  // </block>
  addBlock(xmlList, variable, 'data_setvariableto', 'VARIABLE', ['VALUE', 'text', '0'])
}

/**
 * Construct and add a data_changevariableby block to xmlList.
 * @param xmlList Array of XML block elements.
 * @param variable Variable to select in the field.
 */
function addChangeVariableBy(xmlList: Element[], variable: Blockly.IVariableModel<Blockly.IVariableState>) {
  // <block type="data_changevariableby">
  //   <value name="VARIABLE">
  //    <shadow type="data_variablemenu"></shadow>
  //   </value>
  //   <value name="VALUE">
  //     <shadow type="math_number">
  //       <field name="NUM">1</field>
  //     </shadow>
  //   </value>
  // </block>
  addBlock(xmlList, variable, 'data_changevariableby', 'VARIABLE', ['VALUE', 'math_number', '1'])
}

/**
 * Construct and add a data_showVariable block to xmlList.
 * @param xmlList Array of XML block elements.
 * @param variable Variable to select in the field.
 */
function addShowVariable(xmlList: Element[], variable: Blockly.IVariableModel<Blockly.IVariableState>) {
  // <block type="data_showvariable">
  //   <value name="VARIABLE">
  //     <shadow type="data_variablemenu"></shadow>
  //   </value>
  // </block>
  addBlock(xmlList, variable, 'data_showvariable', 'VARIABLE')
}

/**
 * Construct and add a data_hideVariable block to xmlList.
 * @param xmlList Array of XML block elements.
 * @param variable Variable to select in the field.
 */
function addHideVariable(xmlList: Element[], variable: Blockly.IVariableModel<Blockly.IVariableState>) {
  // <block type="data_hidevariable">
  //   <value name="VARIABLE">
  //     <shadow type="data_variablemenu"></shadow>
  //   </value>
  // </block>
  addBlock(xmlList, variable, 'data_hidevariable', 'VARIABLE')
}

/**
 * Construct and add a data_listcontents block to xmlList.
 * @param xmlList Array of XML block elements.
 * @param variable Variable to select in the field.
 */
function addDataList(xmlList: Element[], variable: Blockly.IVariableModel<Blockly.IVariableState>) {
  // <block id="variableId" type="data_listcontents">
  //    <field name="LIST">variablename</field>
  // </block>
  addBlock(xmlList, variable, 'data_listcontents', 'LIST')
  // In the flyout, this ID must match variable ID for monitor syncing reasons
  xmlList[xmlList.length - 1].setAttribute('id', variable.getId())
}

/**
 * Construct and add a data_addtolist block to xmlList.
 * @param xmlList Array of XML block elements.
 * @param variable Variable to select in the field.
 */
function addAddToList(xmlList: Element[], variable: Blockly.IVariableModel<Blockly.IVariableState>) {
  // <block type="data_addtolist">
  //   <field name="LIST" variabletype="list" id="">variablename</field>
  //   <value name="ITEM">
  //     <shadow type="text">
  //       <field name="TEXT">thing</field>
  //     </shadow>
  //   </value>
  // </block>
  addBlock(xmlList, variable, 'data_addtolist', 'LIST', ['ITEM', 'text', Blockly.Msg.DEFAULT_LIST_ITEM])
}

/**
 * Construct and add a data_deleteoflist block to xmlList.
 * @param xmlList Array of XML block elements.
 * @param variable Variable to select in the field.
 */
function addDeleteOfList(xmlList: Element[], variable: Blockly.IVariableModel<Blockly.IVariableState>) {
  // <block type="data_deleteoflist">
  //   <field name="LIST" variabletype="list" id="">variablename</field>
  //   <value name="INDEX">
  //     <shadow type="math_integer">
  //       <field name="NUM">1</field>
  //     </shadow>
  //   </value>
  // </block>
  addBlock(xmlList, variable, 'data_deleteoflist', 'LIST', ['INDEX', 'math_integer', '1'])
}

/**
 * Construct and add a data_deleteoflist block to xmlList.
 * @param xmlList Array of XML block elements.
 * @param variable Variable to select in the field.
 */
function addDeleteAllOfList(xmlList: Element[], variable: Blockly.IVariableModel<Blockly.IVariableState>) {
  // <block type="data_deletealloflist">
  //   <field name="LIST" variabletype="list" id="">variablename</field>
  // </block>
  addBlock(xmlList, variable, 'data_deletealloflist', 'LIST')
}

/**
 * Construct and add a data_insertatlist block to xmlList.
 * @param xmlList Array of XML block elements.
 * @param variable Variable to select in the field.
 */
function addInsertAtList(xmlList: Element[], variable: Blockly.IVariableModel<Blockly.IVariableState>) {
  // <block type="data_insertatlist">
  //   <field name="LIST" variabletype="list" id="">variablename</field>
  //   <value name="INDEX">
  //     <shadow type="math_integer">
  //       <field name="NUM">1</field>
  //     </shadow>
  //   </value>
  //   <value name="ITEM">
  //     <shadow type="text">
  //       <field name="TEXT">thing</field>
  //     </shadow>
  //   </value>
  // </block>
  addBlock(
    xmlList,
    variable,
    'data_insertatlist',
    'LIST',
    ['INDEX', 'math_integer', '1'],
    ['ITEM', 'text', Blockly.Msg.DEFAULT_LIST_ITEM],
  )
}

/**
 * Construct and add a data_replaceitemoflist block to xmlList.
 * @param xmlList Array of XML block elements.
 * @param variable Variable to select in the field.
 */
function addReplaceItemOfList(xmlList: Element[], variable: Blockly.IVariableModel<Blockly.IVariableState>) {
  // <block type="data_replaceitemoflist">
  //   <field name="LIST" variabletype="list" id="">variablename</field>
  //   <value name="INDEX">
  //     <shadow type="math_integer">
  //       <field name="NUM">1</field>
  //     </shadow>
  //   </value>
  //   <value name="ITEM">
  //     <shadow type="text">
  //       <field name="TEXT">thing</field>
  //     </shadow>
  //   </value>
  // </block>
  addBlock(
    xmlList,
    variable,
    'data_replaceitemoflist',
    'LIST',
    ['INDEX', 'math_integer', '1'],
    ['ITEM', 'text', Blockly.Msg.DEFAULT_LIST_ITEM],
  )
}

/**
 * Construct and add a data_itemoflist block to xmlList.
 * @param xmlList Array of XML block elements.
 * @param variable Variable to select in the field.
 */
function addItemOfList(xmlList: Element[], variable: Blockly.IVariableModel<Blockly.IVariableState>) {
  // <block type="data_itemoflist">
  //   <field name="LIST" variabletype="list" id="">variablename</field>
  //   <value name="INDEX">
  //     <shadow type="math_integer">
  //       <field name="NUM">1</field>
  //     </shadow>
  //   </value>
  // </block>
  addBlock(xmlList, variable, 'data_itemoflist', 'LIST', ['INDEX', 'math_integer', '1'])
}

/**
 * Construct and add a data_itemnumoflist block to xmlList.
 * @param xmlList Array of XML block elements.
 * @param variable Variable to select in the field.
 */
function addItemNumberOfList(xmlList: Element[], variable: Blockly.IVariableModel<Blockly.IVariableState>) {
  // <block type="data_itemnumoflist">
  //   <value name="ITEM">
  //     <shadow type="text">
  //       <field name="TEXT">thing</field>
  //     </shadow>
  //   </value>
  //   <field name="LIST" variabletype="list" id="">variablename</field>
  // </block>
  addBlock(xmlList, variable, 'data_itemnumoflist', 'LIST', ['ITEM', 'text', Blockly.Msg.DEFAULT_LIST_ITEM])
}

/**
 * Construct and add a data_lengthoflist block to xmlList.
 * @param xmlList Array of XML block elements.
 * @param variable Variable to select in the field.
 */
function addLengthOfList(xmlList: Element[], variable: Blockly.IVariableModel<Blockly.IVariableState>) {
  // <block type="data_lengthoflist">
  //   <field name="LIST" variabletype="list" id="">variablename</field>
  // </block>
  addBlock(xmlList, variable, 'data_lengthoflist', 'LIST')
}

/**
 * Construct and add a data_listcontainsitem block to xmlList.
 * @param xmlList Array of XML block elements.
 * @param variable Variable to select in the field.
 */
function addListContainsItem(xmlList: Element[], variable: Blockly.IVariableModel<Blockly.IVariableState>) {
  // <block type="data_listcontainsitem">
  //   <field name="LIST" variabletype="list" id="">variablename</field>
  //   <value name="ITEM">
  //     <shadow type="text">
  //       <field name="TEXT">thing</field>
  //     </shadow>
  //   </value>
  // </block>
  addBlock(xmlList, variable, 'data_listcontainsitem', 'LIST', ['ITEM', 'text', Blockly.Msg.DEFAULT_LIST_ITEM])
}

/**
 * Construct and add a data_showlist block to xmlList.
 * @param xmlList Array of XML block elements.
 * @param variable Variable to select in the field.
 */
function addShowList(xmlList: Element[], variable: Blockly.IVariableModel<Blockly.IVariableState>) {
  // <block type="data_showlist">
  //   <field name="LIST" variabletype="list" id="">variablename</field>
  // </block>
  addBlock(xmlList, variable, 'data_showlist', 'LIST')
}

/**
 * Construct and add a data_hidelist block to xmlList.
 * @param xmlList Array of XML block elements.
 * @param variable Variable to select in the field.
 */
function addHideList(xmlList: Element[], variable: Blockly.IVariableModel<Blockly.IVariableState>) {
  // <block type="data_hidelist">
  //   <field name="LIST" variabletype="list" id="">variablename</field>
  // </block>
  addBlock(xmlList, variable, 'data_hidelist', 'LIST')
}

/**
 * Construct a create variable button and push it to the xmlList.
 * @param xmlList Array of XML block elements.
 * @param workspace Workspace to register callback to.
 * @param type Type of variable this is for. For example, 'LIST' or
 *     'VARIABLE'.
 */
function addCreateButton(xmlList: Element[], workspace: Blockly.WorkspaceSvg, type: string) {
  const button = document.createElement('button')
  // Set default msg, callbackKey, and callback values for type 'VARIABLE'
  let msg = Blockly.Msg.NEW_VARIABLE
  let callbackKey = 'CREATE_VARIABLE'
  let callback = function (button: Blockly.FlyoutButton) {
    createVariable(button.getTargetWorkspace(), undefined, SCALAR_VARIABLE_TYPE)
  }

  if (type === 'LIST') {
    msg = Blockly.Msg.NEW_LIST
    callbackKey = 'CREATE_LIST'
    callback = function (button: Blockly.FlyoutButton) {
      createVariable(button.getTargetWorkspace(), undefined, LIST_VARIABLE_TYPE)
    }
  }
  button.setAttribute('text', msg)
  button.setAttribute('callbackKey', callbackKey)
  workspace.registerButtonCallback(callbackKey, (b) => {
    // Run the callback after a delay to avoid it getting captured by the React
    // modal in scratch-gui and being registered as a click on the scrim that
    // dismisses the dialog.
    requestAnimationFrame(() => {
      setTimeout(() => {
        callback(b)
      })
    })
  })
  xmlList.push(button)
}

/**
 * Construct a variable block with the given variable, blockType, and optional
 *     value tags. Add the variable block to the given xmlList.
 * @param xmlList Array of XML block elements.
 * @param variable Variable to select in the field.
 * @param blockType Type of block. For example, 'data_hidelist' or
 *     'data_showlist'.
 * @param fieldName Name of field in block. For example: 'VARIABLE' or 'LIST'.
 * @param opt_value Optional array containing the value name and shadow type of
 *     value tags.
 * @param opt_secondValue Optional array containing the value name and shadow
 *     type of a second pair of value tags.
 */
function addBlock(
  xmlList: Element[],
  variable: Blockly.IVariableModel<Blockly.IVariableState>,
  blockType: string,
  fieldName: string,
  opt_value?: string[],
  opt_secondValue?: string[],
) {
  if (Blockly.Blocks[blockType]) {
    let firstValueField
    let secondValueField
    if (opt_value) {
      firstValueField = createValue(opt_value[0], opt_value[1], opt_value[2])
    }
    if (opt_secondValue) {
      secondValueField = createValue(opt_secondValue[0], opt_secondValue[1], opt_secondValue[2])
    }

    const gap = 8
    const blockText = `
      <xml>
        <block type="${blockType}" gap="${gap}">
          ${generateVariableFieldXml(variable, fieldName)}
          ${firstValueField}
          ${secondValueField}
        </block>
      </xml>`
    const block = Blockly.utils.xml.textToDom(blockText).firstElementChild!
    xmlList.push(block)
  }
}

/**
 * Creates XML representing a variable field.
 * @param variableModel The variable to represent in the field.
 * @param opt_name A custom name for the field, if desired.
 * @returns XML representation of a variable field.
 */
function generateVariableFieldXml(
  variableModel: Blockly.IVariableModel<Blockly.IVariableState>,
  opt_name?: string,
): string {
  const field = document.createElement('field')
  field.setAttribute('name', opt_name || 'VARIABLE')
  field.setAttribute('id', variableModel.getId())
  field.setAttribute('variabletype', variableModel.getType())
  field.textContent = variableModel.getName()
  return field.outerHTML
}

/**
 * Create the text representation of a value dom element with a shadow of the
 *     indicated type inside.
 * @param valueName Name of the value tags.
 * @param type The type of the shadow tags.
 * @param value The default shadow value.
 * @returns The generated dom element in text.
 */
function createValue(valueName: string, type: string, value: string): string {
  let fieldName
  switch (valueName) {
    case 'ITEM':
      fieldName = 'TEXT'
      break
    case 'INDEX':
      fieldName = 'NUM'
      break
    case 'VALUE':
      if (type === 'math_number') {
        fieldName = 'NUM'
      } else {
        fieldName = 'TEXT'
      }
      break
  }
  const valueField = `
    <value name="${valueName}">
      <shadow type="${type}">
        <field name="${fieldName}">${value}</field>
      </shadow>
    </value>`
  return valueField
}

/**
 * Construct a block separator. Add the separator to the given xmlList.
 * @param xmlList Array of XML block elements.
 */
function addSep(xmlList: Element[]) {
  const sepText = `<xml><sep gap="36"/></xml>`
  const sep = Blockly.utils.xml.textToDom(sepText).firstElementChild!
  xmlList.push(sep)
}
