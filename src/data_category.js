/**
 * @license
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
 * @fileoverview Data Flyout components including variable and list blocks.
 * @author marisaleung@google.com (Marisa Leung)
 */
"use strict";

/**
 * @name Blockly.DataCategory
 * @namespace
 **/
import * as Blockly from "blockly/core";
import { createVariable } from "./variables.js";
import { LIST_VARIABLE_TYPE, SCALAR_VARIABLE_TYPE } from "./constants.js";

/**
 * Construct the blocks required by the flyout for the variable category.
 * @param {!Blockly.Workspace} workspace The workspace containing variables.
 * @return {!Array.<!Element>} Array of XML block elements.
 */
export function getVariablesCategory(workspace) {
  var variableModelList = workspace.getVariablesOfType(SCALAR_VARIABLE_TYPE);
  variableModelList.sort(Blockly.Variables.compareByName);
  var xmlList = [];

  addCreateButton(xmlList, workspace, "VARIABLE");

  for (var i = 0; i < variableModelList.length; i++) {
    addDataVariable(xmlList, variableModelList[i]);
  }

  if (variableModelList.length > 0) {
    xmlList[xmlList.length - 1].setAttribute("gap", 24);
    var firstVariable = variableModelList[0];

    addSetVariableTo(xmlList, firstVariable);
    addChangeVariableBy(xmlList, firstVariable);
    addShowVariable(xmlList, firstVariable);
    addHideVariable(xmlList, firstVariable);
  }

  // Now add list variables to the flyout
  addCreateButton(xmlList, workspace, "LIST");
  variableModelList = workspace.getVariablesOfType(LIST_VARIABLE_TYPE);
  variableModelList.sort(Blockly.Variables.compareByName);
  for (var i = 0; i < variableModelList.length; i++) {
    addDataList(xmlList, variableModelList[i]);
  }

  if (variableModelList.length > 0) {
    xmlList[xmlList.length - 1].setAttribute("gap", 24);
    var firstVariable = variableModelList[0];

    addAddToList(xmlList, firstVariable);
    addSep(xmlList);
    addDeleteOfList(xmlList, firstVariable);
    addDeleteAllOfList(xmlList, firstVariable);
    addInsertAtList(xmlList, firstVariable);
    addReplaceItemOfList(xmlList, firstVariable);
    addSep(xmlList);
    addItemOfList(xmlList, firstVariable);
    addItemNumberOfList(xmlList, firstVariable);
    addLengthOfList(xmlList, firstVariable);
    addListContainsItem(xmlList, firstVariable);
    addSep(xmlList);
    addShowList(xmlList, firstVariable);
    addHideList(xmlList, firstVariable);
  }

  return xmlList;
}

/**
 * Construct and add a data_variable block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
function addDataVariable(xmlList, variable) {
  // <block id="variableId" type="data_variable">
  //    <field name="VARIABLE">variablename</field>
  // </block>
  addBlock(xmlList, variable, "data_variable", "VARIABLE");
  // In the flyout, this ID must match variable ID for monitor syncing reasons
  xmlList[xmlList.length - 1].setAttribute("id", variable.getId());
}

/**
 * Construct and add a data_setvariableto block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
function addSetVariableTo(xmlList, variable) {
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
  addBlock(xmlList, variable, "data_setvariableto", "VARIABLE", [
    "VALUE",
    "text",
    0,
  ]);
}

/**
 * Construct and add a data_changevariableby block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
function addChangeVariableBy(xmlList, variable) {
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
  addBlock(xmlList, variable, "data_changevariableby", "VARIABLE", [
    "VALUE",
    "math_number",
    1,
  ]);
}

/**
 * Construct and add a data_showVariable block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
function addShowVariable(xmlList, variable) {
  // <block type="data_showvariable">
  //   <value name="VARIABLE">
  //     <shadow type="data_variablemenu"></shadow>
  //   </value>
  // </block>
  addBlock(xmlList, variable, "data_showvariable", "VARIABLE");
}

/**
 * Construct and add a data_hideVariable block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
function addHideVariable(xmlList, variable) {
  // <block type="data_hidevariable">
  //   <value name="VARIABLE">
  //     <shadow type="data_variablemenu"></shadow>
  //   </value>
  // </block>
  addBlock(xmlList, variable, "data_hidevariable", "VARIABLE");
}

/**
 * Construct and add a data_listcontents block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
function addDataList(xmlList, variable) {
  // <block id="variableId" type="data_listcontents">
  //    <field name="LIST">variablename</field>
  // </block>
  addBlock(xmlList, variable, "data_listcontents", "LIST");
  // In the flyout, this ID must match variable ID for monitor syncing reasons
  xmlList[xmlList.length - 1].setAttribute("id", variable.getId());
}

/**
 * Construct and add a data_addtolist block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
function addAddToList(xmlList, variable) {
  // <block type="data_addtolist">
  //   <field name="LIST" variabletype="list" id="">variablename</field>
  //   <value name="ITEM">
  //     <shadow type="text">
  //       <field name="TEXT">thing</field>
  //     </shadow>
  //   </value>
  // </block>
  addBlock(xmlList, variable, "data_addtolist", "LIST", [
    "ITEM",
    "text",
    Blockly.Msg.DEFAULT_LIST_ITEM,
  ]);
}

/**
 * Construct and add a data_deleteoflist block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
function addDeleteOfList(xmlList, variable) {
  // <block type="data_deleteoflist">
  //   <field name="LIST" variabletype="list" id="">variablename</field>
  //   <value name="INDEX">
  //     <shadow type="math_integer">
  //       <field name="NUM">1</field>
  //     </shadow>
  //   </value>
  // </block>
  addBlock(xmlList, variable, "data_deleteoflist", "LIST", [
    "INDEX",
    "math_integer",
    1,
  ]);
}

/**
 * Construct and add a data_deleteoflist block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
function addDeleteAllOfList(xmlList, variable) {
  // <block type="data_deletealloflist">
  //   <field name="LIST" variabletype="list" id="">variablename</field>
  // </block>
  addBlock(xmlList, variable, "data_deletealloflist", "LIST");
}

/**
 * Construct and add a data_insertatlist block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
function addInsertAtList(xmlList, variable) {
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
    "data_insertatlist",
    "LIST",
    ["INDEX", "math_integer", 1],
    ["ITEM", "text", Blockly.Msg.DEFAULT_LIST_ITEM]
  );
}

/**
 * Construct and add a data_replaceitemoflist block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
function addReplaceItemOfList(xmlList, variable) {
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
    "data_replaceitemoflist",
    "LIST",
    ["INDEX", "math_integer", 1],
    ["ITEM", "text", Blockly.Msg.DEFAULT_LIST_ITEM]
  );
}

/**
 * Construct and add a data_itemoflist block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
function addItemOfList(xmlList, variable) {
  // <block type="data_itemoflist">
  //   <field name="LIST" variabletype="list" id="">variablename</field>
  //   <value name="INDEX">
  //     <shadow type="math_integer">
  //       <field name="NUM">1</field>
  //     </shadow>
  //   </value>
  // </block>
  addBlock(xmlList, variable, "data_itemoflist", "LIST", [
    "INDEX",
    "math_integer",
    1,
  ]);
}

/** Construct and add a data_itemnumoflist block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
function addItemNumberOfList(xmlList, variable) {
  // <block type="data_itemnumoflist">
  //   <value name="ITEM">
  //     <shadow type="text">
  //       <field name="TEXT">thing</field>
  //     </shadow>
  //   </value>
  //   <field name="LIST" variabletype="list" id="">variablename</field>
  // </block>
  addBlock(xmlList, variable, "data_itemnumoflist", "LIST", [
    "ITEM",
    "text",
    Blockly.Msg.DEFAULT_LIST_ITEM,
  ]);
}

/**
 * Construct and add a data_lengthoflist block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
function addLengthOfList(xmlList, variable) {
  // <block type="data_lengthoflist">
  //   <field name="LIST" variabletype="list" id="">variablename</field>
  // </block>
  addBlock(xmlList, variable, "data_lengthoflist", "LIST");
}

/**
 * Construct and add a data_listcontainsitem block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
function addListContainsItem(xmlList, variable) {
  // <block type="data_listcontainsitem">
  //   <field name="LIST" variabletype="list" id="">variablename</field>
  //   <value name="ITEM">
  //     <shadow type="text">
  //       <field name="TEXT">thing</field>
  //     </shadow>
  //   </value>
  // </block>
  addBlock(xmlList, variable, "data_listcontainsitem", "LIST", [
    "ITEM",
    "text",
    Blockly.Msg.DEFAULT_LIST_ITEM,
  ]);
}

/**
 * Construct and add a data_showlist block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
function addShowList(xmlList, variable) {
  // <block type="data_showlist">
  //   <field name="LIST" variabletype="list" id="">variablename</field>
  // </block>
  addBlock(xmlList, variable, "data_showlist", "LIST");
}

/**
 * Construct and add a data_hidelist block to xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 */
function addHideList(xmlList, variable) {
  // <block type="data_hidelist">
  //   <field name="LIST" variabletype="list" id="">variablename</field>
  // </block>
  addBlock(xmlList, variable, "data_hidelist", "LIST");
}

/**
 * Construct a create variable button and push it to the xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {Blockly.Workspace} workspace Workspace to register callback to.
 * @param {string} type Type of variable this is for. For example, 'LIST' or
 *     'VARIABLE'.
 */
function addCreateButton(xmlList, workspace, type) {
  var button = document.createElement("button");
  // Set default msg, callbackKey, and callback values for type 'VARIABLE'
  var msg = Blockly.Msg.NEW_VARIABLE;
  var callbackKey = "CREATE_VARIABLE";
  var callback = function (button) {
    createVariable(button.getTargetWorkspace(), null, SCALAR_VARIABLE_TYPE);
  };

  if (type === "LIST") {
    msg = Blockly.Msg.NEW_LIST;
    callbackKey = "CREATE_LIST";
    callback = function (button) {
      createVariable(button.getTargetWorkspace(), null, LIST_VARIABLE_TYPE);
    };
  }
  button.setAttribute("text", msg);
  button.setAttribute("callbackKey", callbackKey);
  workspace.registerButtonCallback(callbackKey, callback);
  xmlList.push(button);
}

/**
 * Construct a variable block with the given variable, blockType, and optional
 *     value tags. Add the variable block to the given xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 * @param {?Blockly.VariableModel} variable Variable to select in the field.
 * @param {string} blockType Type of block. For example, 'data_hidelist' or
 *     data_showlist'.
 * @param {string} fieldName Name of field in block. For example: 'VARIABLE' or
 *     'LIST'.
 * @param {?Array.<string>} opt_value Optional array containing the value name
 *     and shadow type of value tags.
 * @param {?Array.<string>} opt_secondValue Optional array containing the value
 *     name and shadow type of a second pair of value tags.
 */
function addBlock(
  xmlList,
  variable,
  blockType,
  fieldName,
  opt_value,
  opt_secondValue
) {
  if (Blockly.Blocks[blockType]) {
    var firstValueField;
    var secondValueField;
    if (opt_value) {
      firstValueField = createValue(opt_value[0], opt_value[1], opt_value[2]);
    }
    if (opt_secondValue) {
      secondValueField = createValue(
        opt_secondValue[0],
        opt_secondValue[1],
        opt_secondValue[2]
      );
    }

    var gap = 8;
    var blockText =
      "<xml>" +
      '<block type="' +
      blockType +
      '" gap="' +
      gap +
      '">' +
      generateVariableFieldXml(variable, fieldName) +
      firstValueField +
      secondValueField +
      "</block>" +
      "</xml>";
    var block = Blockly.utils.xml.textToDom(blockText).firstChild;
    xmlList.push(block);
  }
}

function generateVariableFieldXml(variableModel, opt_name) {
  const field = document.createElement("field");
  field.setAttribute("name", opt_name || "VARIABLE");
  field.setAttribute("id", variableModel.getId());
  field.setAttribute("variabletype", variableModel.getType());
  field.textContent = variableModel.getName();
  return field.outerHTML;
}

/**
 * Create the text representation of a value dom element with a shadow of the
 *     indicated type inside.
 * @param {string} valueName Name of the value tags.
 * @param {string} type The type of the shadow tags.
 * @param {string|number} value The default shadow value.
 * @return {string} The generated dom element in text.
 */
function createValue(valueName, type, value) {
  var fieldName;
  switch (valueName) {
    case "ITEM":
      fieldName = "TEXT";
      break;
    case "INDEX":
      fieldName = "NUM";
      break;
    case "VALUE":
      if (type === "math_number") {
        fieldName = "NUM";
      } else {
        fieldName = "TEXT";
      }
      break;
  }
  var valueField =
    '<value name="' +
    valueName +
    '">' +
    '<shadow type="' +
    type +
    '">' +
    '<field name="' +
    fieldName +
    '">' +
    value +
    "</field>" +
    "</shadow>" +
    "</value>";
  return valueField;
}

/**
 * Construct a block separator. Add the separator to the given xmlList.
 * @param {!Array.<!Element>} xmlList Array of XML block elements.
 */
function addSep(xmlList) {
  var gap = 36;
  var sepText = "<xml>" + '<sep gap="' + gap + '"/>' + "</xml>";
  var sep = Blockly.utils.xml.textToDom(sepText).firstChild;
  xmlList.push(sep);
}
