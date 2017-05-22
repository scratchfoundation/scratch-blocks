/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
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
 * @fileoverview Utility functions for handling variables.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * @name Blockly.Variables
 * @namespace
 **/
goog.provide('Blockly.Variables');

goog.require('Blockly.Blocks');
goog.require('Blockly.constants');
goog.require('Blockly.Workspace');
goog.require('goog.string');


/**
 * Constant to separate variable names from procedures and generated functions
 * when running generators.
 * @deprecated Use Blockly.VARIABLE_CATEGORY_NAME
 */
Blockly.Variables.NAME_TYPE = Blockly.VARIABLE_CATEGORY_NAME;

/**
 * Find all user-created variables that are in use in the workspace.
 * For use by generators.
 * @param {!Blockly.Block|!Blockly.Workspace} root Root block or workspace.
 * @return {!Array.<string>} Array of variable names.
 */
Blockly.Variables.allUsedVariables = function(root) {
  var blocks;
  if (root instanceof Blockly.Block) {
    // Root is Block.
    blocks = root.getDescendants();
  } else if (root instanceof Blockly.Workspace ||
      root instanceof Blockly.WorkspaceSvg) {
    // Root is Workspace.
    blocks = root.getAllBlocks();
  } else {
    throw 'Not Block or Workspace: ' + root;
  }

  var ignorableName = Blockly.Variables.noVariableText();

  var variableHash = Object.create(null);
  // Iterate through every block and add each variable to the hash.
  for (var x = 0; x < blocks.length; x++) {
    var blockVariables = blocks[x].getVars();
    if (blockVariables) {
      for (var y = 0; y < blockVariables.length; y++) {
        var varName = blockVariables[y];
        // Variable name may be null if the block is only half-built.
        if (varName && varName.toLowerCase() != ignorableName) {
          variableHash[varName.toLowerCase()] = varName;
        }
      }
    }
  }
  // Flatten the hash into a list.
  var variableList = [];
  for (var name in variableHash) {
    variableList.push(variableHash[name]);
  }
  return variableList;
};

/**
 * Find all variables that the user has created through the workspace or
 * toolbox.  For use by generators.
 * @param {!Blockly.Workspace} root The workspace to inspect.
 * @return {!Array.<Blockly.VariableModel>} Array of variable models.
 */
Blockly.Variables.allVariables = function(root) {
  if (root instanceof Blockly.Block) {
    // Root is Block.
    console.warn('Deprecated call to Blockly.Variables.allVariables ' +
                 'with a block instead of a workspace.  You may want ' +
                 'Blockly.Variables.allUsedVariables');
    return {};
  }
  return root.getAllVariables();
};

/**
 * Construct the blocks required by the flyout for the variable category.
 * @param {!Blockly.Workspace} workspace The workspace contianing variables.
 * @return {!Array.<!Element>} Array of XML block elements.
 */
Blockly.Variables.flyoutCategory = function(workspace) {
  var variableNameList = [];
  var variableModelList = workspace.getVariablesOfType('');
  for (var i = 0; i < variableModelList.length; i++) {
    variableNameList.push(variableModelList[i].name);
  }
  variableNameList.sort(goog.string.caseInsensitiveCompare);

  var xmlList = [];
  var button = goog.dom.createDom('button');
  button.setAttribute('text', Blockly.Msg.NEW_VARIABLE);
  button.setAttribute('callbackKey', 'CREATE_VARIABLE');

  workspace.registerButtonCallback('CREATE_VARIABLE', function(button) {
    Blockly.Variables.createVariable(button.getTargetWorkspace());
  });

  xmlList.push(button);

  for (var i = 0; i < variableNameList.length; i++) {
    if (Blockly.Blocks['data_variable']) {
      // <block type="data_variable">
      //    <field name="VARIABLE">variablename</field>
      // </block>
      var block = goog.dom.createDom('block');
      block.setAttribute('type', 'data_variable');
      block.setAttribute('gap', 8);

      var field = goog.dom.createDom('field', null, variableNameList[i]);
      field.setAttribute('name', 'VARIABLE');
      block.appendChild(field);

      xmlList.push(block);
    }
  }

  if (xmlList.length > 1) { // The button is always there.
    xmlList[xmlList.length - 1].setAttribute('gap', 24);

    if (Blockly.Blocks['data_setvariableto']) {
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
      var block = goog.dom.createDom('block');
      block.setAttribute('type', 'data_setvariableto');
      block.setAttribute('gap', 8);
      block.appendChild(Blockly.Variables.createVariableDom_(variableNameList[0]));
      block.appendChild(Blockly.Variables.createTextDom_());
      xmlList.push(block);
    }
    if (Blockly.Blocks['data_changevariableby']) {
      // <block type="data_changevariableby">
      //   <value name="VARIABLE">
      //    <shadow type="data_variablemenu"></shadow>
      //   </value>
      //   <value name="VALUE">
      //     <shadow type="math_number">
      //       <field name="NUM">0</field>
      //     </shadow>
      //   </value>
      // </block>
      var block = goog.dom.createDom('block');
      block.setAttribute('type', 'data_changevariableby');
      block.setAttribute('gap', 8);
      block.appendChild(Blockly.Variables.createVariableDom_(variableNameList[0]));
      block.appendChild(Blockly.Variables.createMathNumberDom_());
      xmlList.push(block);
    }
    if (Blockly.Blocks['data_showvariable']) {
      // <block type="data_showvariable">
      //   <value name="VARIABLE">
      //     <shadow type="data_variablemenu"></shadow>
      //   </value>
      // </block>
      var block = goog.dom.createDom('block');
      block.setAttribute('type', 'data_showvariable');
      block.setAttribute('gap', 8);
      block.appendChild(Blockly.Variables.createVariableDom_(variableNameList[0]));
      xmlList.push(block);
    }
    if (Blockly.Blocks['data_hidevariable']) {
      // <block type="data_showvariable">
      //   <value name="VARIABLE">
      //     <shadow type="data_variablemenu"></shadow>
      //   </value>
      // </block>
      var block = goog.dom.createDom('block');
      block.setAttribute('type', 'data_hidevariable');
      block.appendChild(Blockly.Variables.createVariableDom_(variableNameList[0]));
      xmlList.push(block);
    }
  }
  return xmlList;
};

/**
 * Create a dom element for a value tag with the given name attribute.
 * @param {string} name The value to use for the name attribute.
 * @return {!Element} An XML element: <value name="name"></value>
 */
Blockly.Variables.createValueDom_ = function(name) {
  var value = goog.dom.createDom('value');
  value.setAttribute('name', name);
  return value;
};

/**
 * Create a dom element for a shadow tag with the given tupe attribute.
 * @param {string} type The value to use for the type attribute.
 * @param {string} value The value to have inside the tag.
 * @return {!Element} An XML element: <shadow type="type">value</shadow>
 */
Blockly.Variables.createShadowDom_ = function(type) {
  var shadow = goog.dom.createDom('shadow');
  shadow.setAttribute('type', type);
  return shadow;
};

/**
 * Create a dom element for value tag with a shadow variable inside.
 * @param {string} name The name of the variable to select.
 * @return {!Element} An XML element.
 */
Blockly.Variables.createVariableDom_ = function(name) {
  //   <value name="VARIABLE">
  //     <shadow type="data_variablemenu">
  //       <field name="VARIABLE">variablename
  //       </field>
  //     </shadow>
  //   </value>
  var value = Blockly.Variables.createValueDom_('VARIABLE');
  var shadow = Blockly.Variables.createShadowDom_('data_variablemenu');
  var field = goog.dom.createDom('field', null, name);
  field.setAttribute('name', 'VARIABLE');
  shadow.appendChild(field);
  value.appendChild(shadow);
  return value;
};

/**
 * Create a dom element for value tag with a shadow text inside.
 * @return {!Element} An XML element.
 */
Blockly.Variables.createTextDom_ = function() {
  //   <value name="VALUE">
  //     <shadow type="text">
  //       <field name="TEXT">0</field>
  //     </shadow>
  //   </value>
  var value = Blockly.Variables.createValueDom_('VALUE');
  var shadow = Blockly.Variables.createShadowDom_('text');
  var field = goog.dom.createDom('field', null, '0');
  field.setAttribute('name', 'TEXT');
  shadow.appendChild(field);
  value.appendChild(shadow);
  return value;
};

/**
 * Create a dom element for value tag with a shadow number inside.
 * @return {!Element} An XML element.
 */
Blockly.Variables.createMathNumberDom_ = function() {
  //   <value name="VALUE">
  //     <shadow type="math_number">
  //       <field name="NUM">0</field>
  //     </shadow>
  //   </value>
  var value = Blockly.Variables.createValueDom_('VALUE');
  var shadow = Blockly.Variables.createShadowDom_('math_number');
  var field = goog.dom.createDom('field', null, '1');
  field.setAttribute('name', 'NUM');
  shadow.appendChild(field);
  value.appendChild(shadow);
  return value;
};

/**
 * Return the text that should be used in a field_variable or
 * field_variable_getter when no variable exists.
 * TODO: #572
 * @return {string} The text to display.
 */
Blockly.Variables.noVariableText = function() {
  return "No variable selected";
};

/**
* Return a new variable name that is not yet being used. This will try to
* generate single letter variable names in the range 'i' to 'z' to start with.
* If no unique name is located it will try 'i' to 'z', 'a' to 'h',
* then 'i2' to 'z2' etc.  Skip 'l'.
 * @param {!Blockly.Workspace} workspace The workspace to be unique in.
* @return {string} New variable name.
*/
Blockly.Variables.generateUniqueName = function(workspace) {
  var variableList = workspace.getAllVariables();
  var newName = '';
  if (variableList.length) {
    var nameSuffix = 1;
    var letters = 'ijkmnopqrstuvwxyzabcdefgh';  // No 'l'.
    var letterIndex = 0;
    var potName = letters.charAt(letterIndex);
    while (!newName) {
      var inUse = false;
      for (var i = 0; i < variableList.length; i++) {
        if (variableList[i].name.toLowerCase() == potName) {
          // This potential name is already used.
          inUse = true;
          break;
        }
      }
      if (inUse) {
        // Try the next potential name.
        letterIndex++;
        if (letterIndex == letters.length) {
          // Reached the end of the character sequence so back to 'i'.
          // a new suffix.
          letterIndex = 0;
          nameSuffix++;
        }
        potName = letters.charAt(letterIndex);
        if (nameSuffix > 1) {
          potName += nameSuffix;
        }
      } else {
        // We can use the current potential name.
        newName = potName;
      }
    }
  } else {
    newName = 'i';
  }
  return newName;
};

/**
 * Create a new variable on the given workspace.
 * @param {!Blockly.Workspace} workspace The workspace on which to create the
 *     variable.
 * @param {function(?string=)=} opt_callback A callback. It will
 *     be passed an acceptable new variable name, or null if change is to be
 *     aborted (cancel button), or undefined if an existing variable was chosen.
 */
Blockly.Variables.createVariable = function(workspace, opt_callback) {
  var promptAndCheckWithAlert = function(defaultName) {
    Blockly.Variables.promptName(Blockly.Msg.NEW_VARIABLE_TITLE, defaultName,
      function(text) {
        if (text) {
          if (workspace.getVariable(text)) {
            Blockly.alert(Blockly.Msg.VARIABLE_ALREADY_EXISTS.replace('%1',
                text.toLowerCase()),
                function() {
                  promptAndCheckWithAlert(text);  // Recurse
                });
          }
          else if (!Blockly.Procedures.isLegalName_(text, workspace)) {
            Blockly.alert(Blockly.Msg.PROCEDURE_ALREADY_EXISTS.replace('%1',
                text.toLowerCase()),
                function() {
                  promptAndCheckWithAlert(text);  // Recurse
                });
          }
          else {
            workspace.createVariable(text);
            if (opt_callback) {
              opt_callback(text);
            }
          }
        } else {
          // User canceled prompt without a value.
          if (opt_callback) {
            opt_callback(null);
          }
        }
      });
  };
  promptAndCheckWithAlert('');
};

/**
 * Prompt the user for a new variable name.
 * @param {string} promptText The string of the prompt.
 * @param {string} defaultText The default value to show in the prompt's field.
 * @param {function(?string)} callback A callback. It will be passed the new
 *     variable name, or null if the user picked something illegal.
 */
Blockly.Variables.promptName = function(promptText, defaultText, callback) {
  Blockly.prompt(promptText, defaultText, function(newVar) {
    // Merge runs of whitespace.  Strip leading and trailing whitespace.
    // Beyond this, all names are legal.
    if (newVar) {
      newVar = newVar.replace(/[\s\xa0]+/g, ' ').replace(/^ | $/g, '');
      if (newVar == Blockly.Msg.RENAME_VARIABLE ||
          newVar == Blockly.Msg.NEW_VARIABLE) {
        // Ok, not ALL names are legal...
        newVar = null;
      }
    }
    callback(newVar);
  });
};
