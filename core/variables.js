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
goog.require('Blockly.VariableModel');
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
    var blockVariables = blocks[x].getVarModels();
    if (blockVariables) {
      for (var y = 0; y < blockVariables.length; y++) {
        var variable = blockVariables[y];
        // Variable ID may be null if the block is only half-built.
        if (variable.getId() && variable.name.toLowerCase() != ignorableName) {
          variableHash[variable.name.toLowerCase()] = variable.name;
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
 * Find all developer variables used by blocks in the workspace.
 * Developer variables are never shown to the user, but are declared as global
 * variables in the generated code.
 * To declare developer variables, define the getDeveloperVariables function on
 * your block and return a list of variable names.
 * For use by generators.
 * @param {!Blockly.Workspace} workspace The workspace to search.
 * @return {!Array.<string>} A list of non-duplicated variable names.
 * @package
 */
Blockly.Variables.allDeveloperVariables = function(workspace) {
  var blocks = workspace.getAllBlocks();
  var hash = {};
  for (var i = 0; i < blocks.length; i++) {
    var block = blocks[i];
    if (block.getDeveloperVars) {
      var devVars = block.getDeveloperVars();
      for (var j = 0; j < devVars.length; j++) {
        hash[devVars[j]] = devVars[j];
      }
    }
  }

  // Flatten the hash into a list.
  var list = [];
  for (var name in hash) {
    list.push(hash[name]);
  }
  return list;
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
 * Remove any possiblity of conflict/duplication between a real and potential variable.
 * When creating a new variable, checks whether the desired name and type already exists
 * as a real or potential variable.
 * If 'checkReal' is true, checks whether a real variable with the given
 * name and type already exists.
 * Checks whether a potential variable (using the given 'potentialVarWs') exists.
 * If a potential var exists and a real var also exists, discards the potential var
 * and returns the real var.
 * If a potential var exists and a real var does not exist (or 'checkReal'
 * was false), creates the potential var as a real var,
 * discards the potential var, and returns the newly created real var.
 * If a potential var does not exist, returns null.
 *
 * @param {string} varName The name of the variable to check for.
 * @param {string} varType The type of the variable to check for.
 * @param {!Blockly.Workspace} potentialVarWs The workspace containing the
 *     potential variable map we want to check against.
 * @param {boolean} checkReal Whether or not to check if a variable of the given
 *     name and type exists as a real variable.
 * @return {?Blockly.VariableModel} The matching variable, if one already existed
 *     in the real workspace; the newly transformed variable, if one already
 *     existed as a potential variable. Null, if no matching variable, real or
 *     potential, was found.
 */
Blockly.Variables.realizePotentialVar = function(varName, varType, potentialVarWs,
    checkReal) {
  var potentialVarMap = potentialVarWs.getPotentialVariableMap();
  var realWs = potentialVarWs.targetWorkspace;
  if (!potentialVarMap) {
    console.warn('Called Blockly.Variables.realizePotentialVar with incorrect ' +
        'workspace. The provided workspace does not have a potential variable map.');
    return;
  }
  // First check if a variable with the same name and type already exists as a
  // real variable.
  var realVar;
  if (checkReal) {
    realVar = Blockly.Variables.getVariable(realWs, null, varName, varType);
  }

  // Check if variable with same name and type exists as a potential var
  var potentialVar = potentialVarMap.getVariable(varName, varType);
  if (!potentialVar) {
    return null;
  }

  // The potential var exists, so save its id and delete it from the potential
  // variable map.
  var id = potentialVar.getId();
  potentialVarMap.deleteVariable(potentialVar);

  // Depending on whether a real var already exists or not, either return the
  // existing real var or turn the potential var into a new one using its id.
  if (realVar) {
    return realVar;
  }
  return realWs.createVariable(varName, varType, id);
};

/**
 * Create a new variable on the given workspace.
 * @param {!Blockly.Workspace} workspace The workspace on which to create the
 *     variable.
 * @param {function(?string=)=} opt_callback A callback. It will
 *     be passed the id of the variable to be created, or null if change is to be
 *     aborted (cancel button), or undefined if an existing variable was chosen.
 * @param {string} opt_type Optional type of variable, like 'string' or 'list'.
 */
Blockly.Variables.createVariable = function(workspace, opt_callback, opt_type) {
  // Decide on a modal message based on the opt_type. If opt_type was not
  // provided, default to the original message for scalar variables.
  var newMsg = '';
  var modalTitle = '';
  if (opt_type === Blockly.LIST_VARIABLE_TYPE) {
    newMsg = Blockly.Msg.NEW_LIST_TITLE;
    modalTitle = Blockly.Msg.LIST_MODAL_TITLE;
  } else if (opt_type === Blockly.BROADCAST_MESSAGE_VARIABLE_TYPE) {
    newMsg = Blockly.Msg.NEW_BROADCAST_MESSAGE_TITLE;
    modalTitle = Blockly.Msg.BROADCAST_MODAL_TITLE;
  } else {
    newMsg = Blockly.Msg.NEW_VARIABLE_TITLE;
    modalTitle = Blockly.Msg.VARIABLE_MODAL_TITLE;
  }
  // This function needs to be named so it can be called recursively.
  var promptAndCheckWithAlert = function(defaultName) {
    Blockly.Variables.promptName(newMsg, defaultName,
      function(text) {
        if (text) {
          if (workspace.getVariable(text, opt_type)) {
            Blockly.alert(Blockly.Msg.VARIABLE_ALREADY_EXISTS.replace('%1',
                text.toLowerCase()),
                function() {
                  promptAndCheckWithAlert(text);  // Recurse
                });
          }
          else if (!Blockly.Procedures.isNameUsed(text, workspace)) {
            Blockly.alert(Blockly.Msg.PROCEDURE_ALREADY_EXISTS.replace('%1',
                text.toLowerCase()),
                function() {
                  promptAndCheckWithAlert(text);  // Recurse
                });
          }
          else {
            var potentialVarMap = workspace.getPotentialVariableMap();
            var variable;
            // This check ensures that if a new variable is being created from a
            // workspace that already has a variable of the same name and type as
            // a potential variable, that potential variable gets turned into a
            // real variable and thus there aren't duplicate options in the field_variable
            // dropdown.
            if (potentialVarMap && opt_type) {
              variable = Blockly.Variables.realizePotentialVar(text, opt_type, workspace, false);
            }
            if (!variable) {
              variable = workspace.createVariable(text, opt_type);
            }

            var flyout = workspace.isFlyout ? workspace : workspace.getFlyout();
            var variableBlockId = variable.getId();
            if (flyout.setCheckboxState) {
              flyout.setCheckboxState(variableBlockId, true);
            }

            if (opt_callback) {
              opt_callback(variableBlockId);
            }
          }
        } else {
          // User canceled prompt without a value.
          if (opt_callback) {
            opt_callback(null);
          }
        }
      }, opt_type, modalTitle);
  };
  promptAndCheckWithAlert('');
};

/**
 * Rename a variable with the given workspace, variableType, and oldName.
 * @param {!Blockly.Workspace} workspace The workspace on which to rename the
 *     variable.
 * @param {Blockly.VariableModel} variable Variable to rename.
 * @param {function(?string=)=} opt_callback A callback. It will
 *     be passed an acceptable new variable name, or null if change is to be
 *     aborted (cancel button), or undefined if an existing variable was chosen.
 */
Blockly.Variables.renameVariable = function(workspace, variable,
  opt_callback) {
  // (karishma) TODO (#1244) Modal message should change depending on what type
  // of variable is getting renamed.
  // This function needs to be named so it can be called recursively.
  var promptAndCheckWithAlert = function(defaultName) {
    var promptText =
        Blockly.Msg.RENAME_VARIABLE_TITLE.replace('%1', variable.name);
    Blockly.Variables.promptName(promptText, defaultName,
        function(newName) {
          if (newName) {
            workspace.renameVariableById(variable.getId(), newName);
            if (opt_callback) {
              opt_callback(newName);
            }
          } else {
            // User canceled prompt without a value.
            if (opt_callback) {
              opt_callback(null);
            }
          }
        }, null);
  };
  promptAndCheckWithAlert('');
};

/**
 * Prompt the user for a new variable name.
 * @param {string} promptText The string of the prompt.
 * @param {string} defaultText The default value to show in the prompt's field.
 * @param {function(?string)} callback A callback. It will be passed the new
 *     variable name, or null if the user picked something illegal.
 * @param {string} opt_type Optional type of variable, like 'string' or 'list'.
 * @param {string} opt_modal_title Optional title for the prompt.
 */
Blockly.Variables.promptName = function(promptText, defaultText, callback, opt_type,
  opt_modal_title) {
  var modalTitle = opt_modal_title ? opt_modal_title : Blockly.Msg.VARIABLE_MODAL_TITLE;
  Blockly.prompt(promptText, defaultText, function(newVar) {
    // Merge runs of whitespace.  Strip leading and trailing whitespace.
    // Beyond this, all names are legal.
    if (newVar) {
      newVar = Blockly.Variables.validateName_(newVar, opt_type);
    }
    callback(newVar);
  }, modalTitle);
};

/**
 * Validate the variable name provided by the user.
 * @param {string} name The user-provided name of the variable.
 * @param {string} opt_type Optional type of variable, like 'string' or 'list'.
 * @return {string} The validated and possibly transformed name of the variable.
 */
Blockly.Variables.validateName_ = function(name, opt_type) {
  if (!opt_type || opt_type != Blockly.BROADCAST_MESSAGE_VARIABLE_TYPE) {
    name = name.replace(/[\s\xa0]+/g, ' ').replace(/^ | $/g, '');
    if (name == Blockly.Msg.RENAME_VARIABLE ||
        name == Blockly.Msg.NEW_VARIABLE) {
      // Ok, not ALL names are legal...
      name = null;
    }
  }
  return name;
};

/**
 * Generate XML string for variable field.
 * @param {!Blockly.VariableModel} variableModel The variable model to generate
 *     an XML string from.
 * @param {?string} opt_name The optional name of the field, such as "VARIABLE"
 *     or "LIST". Defaults to "VARIABLE".
 * @return {string} The generated XML.
 * @private
 */
Blockly.Variables.generateVariableFieldXml_ = function(variableModel, opt_name) {
  // The variable name may be user input, so it may contain characters that need
  // to be escaped to create valid XML.
  var typeString = variableModel.type;
  if (typeString == '') {
    typeString = '\'\'';
  }
  var fieldName = opt_name || 'VARIABLE';
  var text = '<field name="' + fieldName + '" id="' + variableModel.getId() +
    '" variabletype="' + goog.string.htmlEscape(typeString) +
    '">' + goog.string.htmlEscape(variableModel.name) + '</field>';
  return text;
};

/**
 * Helper function to look up or create a variable on the given workspace.
 * If no variable exists, creates and returns it.
 * @param {!Blockly.Workspace} workspace The workspace to search for the
 *     variable.  It may be a flyout workspace or main workspace.
 * @param {string} id The ID to use to look up or create the variable, or null.
 * @param {string=} opt_name The string to use to look up or create the
 *     variable.
 * @param {string=} opt_type The type to use to look up or create the variable.
 * @return {!Blockly.VariableModel} The variable corresponding to the given ID
 *     or name + type combination.
 * @package
 */
Blockly.Variables.getOrCreateVariablePackage = function(workspace, id, opt_name,
    opt_type) {
  var variable = Blockly.Variables.getVariable(workspace, id, opt_name,
      opt_type);
  if (!variable) {
    variable = Blockly.Variables.createVariable_(workspace, id, opt_name,
        opt_type);
  }
  return variable;
};

/**
 * Look up  a variable on the given workspace.
 * Always looks in the main workspace before looking in the flyout workspace.
 * Always prefers lookup by ID to lookup by name + type.
 * @param {!Blockly.Workspace} workspace The workspace to search for the
 *     variable.  It may be a flyout workspace or main workspace.
 * @param {string} id The ID to use to look up the variable, or null.
 * @param {string=} opt_name The string to use to look up the variable.  Only
 *     used if lookup by ID fails.
 * @param {string=} opt_type The type to use to look up the variable.  Only used
 *     if lookup by ID fails.
 * @return {?Blockly.VariableModel} The variable corresponding to the given ID
 *     or name + type combination, or null if not found.
 * @package
 */
Blockly.Variables.getVariable = function(workspace, id, opt_name, opt_type) {
  var potentialVariableMap = workspace.getPotentialVariableMap();
  // Try to just get the variable, by ID if possible.
  if (id) {
    // Look in the real variable map before checking the potential variable map.
    var variable = workspace.getVariableById(id);
    if (!variable && potentialVariableMap) {
      variable = potentialVariableMap.getVariableById(id);
    }
  } else if (opt_name) {
    if (opt_type == undefined) {
      throw new Error('Tried to look up a variable by name without a type');
    }
    // Otherwise look up by name and type.
    var variable = workspace.getVariable(opt_name, opt_type);
    if (!variable && potentialVariableMap) {
      variable = potentialVariableMap.getVariable(opt_name, opt_type);
    }
  }
  return variable;
};

/**
 * Helper function to create a variable on the given workspace.
 * @param {!Blockly.Workspace} workspace The workspace in which to create the
 * variable.  It may be a flyout workspace or main workspace.
 * @param {string} id The ID to use to create the variable, or null.
 * @param {string=} opt_name The string to use to create the variable.
 * @param {string=} opt_type The type to use to create the variable.
 * @return {!Blockly.VariableModel} The variable corresponding to the given ID
 *     or name + type combination.
 * @private
 */
Blockly.Variables.createVariable_ = function(workspace, id, opt_name,
    opt_type) {
  var potentialVariableMap = workspace.getPotentialVariableMap();
  // Variables without names get uniquely named for this workspace.
  if (!opt_name) {
    var ws = workspace.isFlyout ? workspace.targetWorkspace : workspace;
    opt_name = Blockly.Variables.generateUniqueName(ws);
  }

  // Create a potential variable if in the flyout.
  if (potentialVariableMap) {
    var variable = potentialVariableMap.createVariable(opt_name, opt_type, id);
  } else {  // In the main workspace, create a real variable.
    var variable = workspace.createVariable(opt_name, opt_type, id);
  }
  return variable;
};

/**
 * Helper function to get the list of variables that have been added to the
 * workspace after adding a new block, using the given list of variables that
 * were in the workspace before the new block was added.
 * @param {!Blockly.Workspace} workspace The workspace to inspect.
 * @param {!Array.<!Blockly.VariableModel>} originalVariables The array of
 *     variables that existed in the workspace before adding the new block.
 * @return {!Array.<!Blockly.VariableModel>} The new array of variables that were
 *     freshly added to the workspace after creating the new block, or [] if no
 *     new variables were added to the workspace.
 * @package
 */
Blockly.Variables.getAddedVariables = function(workspace, originalVariables) {
  var allCurrentVariables = workspace.getAllVariables();
  var addedVariables = [];
  if (originalVariables.length != allCurrentVariables.length) {
    for (var i = 0; i < allCurrentVariables.length; i++) {
      var variable = allCurrentVariables[i];
      // For any variable that is present in allCurrentVariables but not
      // present in originalVariables, add the variable to addedVariables.
      if (!originalVariables.includes(variable)) {
        addedVariables.push(variable);
      }
    }
  }
  return addedVariables;
};
