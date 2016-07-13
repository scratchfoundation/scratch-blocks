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

goog.provide('Blockly.Variables');

goog.require('Blockly.Blocks');
goog.require('Blockly.Workspace');
goog.require('goog.string');


/**
 * Category to separate variable names from procedures and generated functions.
 */
Blockly.Variables.NAME_TYPE = 'VARIABLE';

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
  var variableHash = Object.create(null);
  // Iterate through every block and add each variable to the hash.
  for (var x = 0; x < blocks.length; x++) {
    var blockVariables = blocks[x].getVars();
    if (blockVariables) {
      for (var y = 0; y < blockVariables.length; y++) {
        var varName = blockVariables[y];
        // Variable name may be null if the block is only half-built.
        if (varName) {
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
 * @return {!Array.<string>} Array of variable names.
 */
Blockly.Variables.allVariables = function(root) {
  if (root instanceof Blockly.Block) {
    // Root is Block.
    console.warn('Deprecated call to Blockly.Variables.allVariables ' +
                 'with a block instead of a workspace.  You may want ' +
                 'Blockly.Variables.allUsedVariables');
  }
  return root.variableList;
};

/**
 * Find all instances of the specified variable and rename them.
 * @param {string} oldName Variable to rename.
 * @param {string} newName New variable name.
 * @param {!Blockly.Workspace} workspace Workspace rename variables in.
 */
Blockly.Variables.renameVariable = function(oldName, newName, workspace) {
  Blockly.Events.setGroup(true);
  var blocks = workspace.getAllBlocks();
  // Iterate through every block.
  for (var i = 0; i < blocks.length; i++) {
    blocks[i].renameVar(oldName, newName);
  }
  Blockly.Events.setGroup(false);

  workspace.renameVariable(oldName, newName);
};

/**
 * Construct the blocks required by the flyout for the variable category.
 * @param {!Blockly.Workspace} workspace The workspace contianing variables.
 * @return {!Array.<!Element>} Array of XML block elements.
 */
Blockly.Variables.flyoutCategory = function(workspace) {
  var variableList = workspace.variableList;
  variableList.sort(goog.string.caseInsensitiveCompare);

  var xmlList = [];
  var button = goog.dom.createDom('button');
  button.setAttribute('text', 'Create variable');
  xmlList.push(button);


  for (var i = 0; i < variableList.length; i++) {
    if (Blockly.Blocks['data_variable']) {
      // <block type="data_variable">
      //   <value name="VARIABLE">
      //     <shadow type="data_variablemenu"></shadow>
      //   </value>
      // </block>
      var block = goog.dom.createDom('block');
      block.setAttribute('type', 'data_variable');
      block.setAttribute('gap', 8);
      block.appendChild(Blockly.Variables.createVariableDom_());
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
      //     <shadow type="math_number">
      //       <field name="NUM">0</field>
      //     </shadow>
      //   </value>
      // </block>
      var block = goog.dom.createDom('block');
      block.setAttribute('type', 'data_setvariableto');
      block.setAttribute('gap', 8);
      block.appendChild(Blockly.Variables.createVariableDom_());
      block.appendChild(Blockly.Variables.createMathNumberDom_());
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
      block.appendChild(Blockly.Variables.createVariableDom_());
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
      block.appendChild(Blockly.Variables.createVariableDom_());
      xmlList.push(block);
    }
    if (Blockly.Blocks['data_hidevariable']) {
      // <block type="data_showvariable">
      //   <value name="VARIABLE">
      //     <shadow type="data_variablemenu"></shadow>
      //   </value>
      // </block>
      var block = goog.dom.createDom('block');
      block.setAttribute('type', 'data_showvariable');
      block.appendChild(Blockly.Variables.createVariableDom_());
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
 * @return {!Element} An XML element: <shadow type="type"></shadow>
 */
Blockly.Variables.createShadowDom_ = function(type) {
  var shadow = goog.dom.createDom('shadow');
  shadow.setAttribute('type', type);
  return shadow;
};

/**
 * Create a dom element for value tag with a shadow variable inside.
 * @return {!Element} An XML element.
 */
Blockly.Variables.createVariableDom_ = function() {
  //   <value name="VARIABLE">
  //     <shadow type="data_variablemenu"></shadow>
  //   </value>
  var value = Blockly.Variables.createValueDom_('VARIABLE');
  value.appendChild(Blockly.Variables.createShadowDom_('data_variablemenu'));
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
  var field = goog.dom.createDom('field', null, '0');
  field.setAttribute('name', 'NUM');
  shadow.appendChild(field);
  value.appendChild(shadow);
  return value;
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
  var variableList = workspace.variableList;
  var newName = '';
  if (variableList.length) {
    var nameSuffix = 1;
    var letters = 'ijkmnopqrstuvwxyzabcdefgh';  // No 'l'.
    var letterIndex = 0;
    var potName = letters.charAt(letterIndex);
    while (!newName) {
      var inUse = false;
      for (var i = 0; i < variableList.length; i++) {
        if (variableList[i].toLowerCase() == potName) {
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
 * Find all the uses of a named variable.
 * @param {string} name Name of variable.
 * @param {!Blockly.Workspace} workspace The workspace to find uses in.
 * @return {!Array.<!Blockly.Block>} Array of block usages.
 */
Blockly.Variables.getUses = function(name, workspace) {
  var uses = [];
  var blocks = workspace.getAllBlocks();
  // Iterate through every block and check the name.
  for (var i = 0; i < blocks.length; i++) {
    var blockVariables = blocks[i].getVars();
    if (blockVariables) {
      for (var j = 0; j < blockVariables.length; j++) {
        var varName = blockVariables[j];
        // Variable name may be null if the block is only half-built.
        if (varName && Blockly.Names.equals(varName, name)) {
          uses.push(blocks[i]);
        }
      }
    }
  }
  return uses;
};

/**
 * When a variable is deleted, find and dispose of all uses of it.
 * @param {string} name Name of deleted variable.
 * @param {!Blockly.Workspace} workspace The workspace to delete uses from.
 */
Blockly.Variables.disposeUses = function(name, workspace) {
  var uses = Blockly.Variables.getUses(name, workspace);
  Blockly.Events.setGroup(true);
  for (var i = 0; i < uses.length; i++) {
    uses[i].dispose(true, false);
  }
  Blockly.Events.setGroup(false);
};

/**
 * Delete a variables and all of its uses from the given workspace.
 * @param {string} name Name of variable to delete.
 * @param {!Blockly.Workspace} workspace The workspace to delete uses from.
 */
Blockly.Variables.delete = function(name, workspace) {
  var variableIndex = workspace.variableList.indexOf(name);
  if (variableIndex != -1) {
    workspace.variableList.splice(variableIndex, 1);
  }

  Blockly.Variables.disposeUses(name, workspace);
};

/**
 * Create a new variable on the given workspace.
 * @param {!Blockly.Workspace} workspace The workspace on which to create the
 *     variable.
 * @return {null|undefined|string} An acceptable new variable name, or null if
 *     change is to be aborted (cancel button), or undefined if an existing
 *     variable was chosen.
 */
Blockly.Variables.createVariable = function(workspace) {
  var text = Blockly.Variables.promptName(Blockly.Msg.NEW_VARIABLE_TITLE, '');
  // Since variables are case-insensitive, ensure that if the new variable
  // matches with an existing variable, the new case prevails throughout.
  if (text) {
    workspace.createVariable(text);
    return text;
  }
  return null;
};

/**
 * Prompt the user for a new variable name.
 * @param {string} promptText The string of the prompt.
 * @param {string} defaultText The default value to show in the prompt's field.
 * @return {?string} The new variable name, or null if the user picked
 *     something illegal.
 */
Blockly.Variables.promptName = function(promptText, defaultText) {
  var newVar = window.prompt(promptText, defaultText);
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
  return newVar;
};
