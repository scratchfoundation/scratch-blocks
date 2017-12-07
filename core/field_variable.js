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
 * @fileoverview Variable input field.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.FieldVariable');

goog.require('Blockly.FieldDropdown');
goog.require('Blockly.Msg');
goog.require('Blockly.VariableModel');
goog.require('Blockly.Variables');
goog.require('goog.asserts');
goog.require('goog.string');


/**
 * Class for a variable's dropdown field.
 * @param {?string} varname The default name for the variable.  If null,
 *     a unique variable name will be generated.
 * @param {Function=} opt_validator A function that is executed when a new
 *     option is selected.  Its sole argument is the new option value.
 * @param {Array.<string>} opt_variableTypes A list of the types of variables to
 *     include in the dropdown.
 * @extends {Blockly.FieldDropdown}
 * @constructor
 */
Blockly.FieldVariable = function(varname, opt_validator, opt_variableTypes) {
  Blockly.FieldVariable.superClass_.constructor.call(this,
      Blockly.FieldVariable.dropdownCreate, opt_validator);
  this.setValue(varname || '');
  this.addArgType('variable');
  this.variableTypes = opt_variableTypes;
};
goog.inherits(Blockly.FieldVariable, Blockly.FieldDropdown);

/**
 * Install this dropdown on a block.
 */
Blockly.FieldVariable.prototype.init = function() {
  if (this.fieldGroup_) {
    // Dropdown has already been initialized once.
    return;
  }
  Blockly.FieldVariable.superClass_.init.call(this);

  // TODO (1010): Change from init/initModel to initView/initModel
  this.initModel();
};

Blockly.FieldVariable.prototype.initModel = function() {
  if (!this.getValue()) {
    // Variables without names get uniquely named for this workspace.
    var workspace =
        this.sourceBlock_.isInFlyout ?
            this.sourceBlock_.workspace.targetWorkspace :
            this.sourceBlock_.workspace;
    this.setValue(Blockly.Variables.generateUniqueName(workspace));
  }
  // If the selected variable doesn't exist yet, create it.
  // For instance, some blocks in the toolbox have variable dropdowns filled
  // in by default.
  if (!this.sourceBlock_.isInFlyout) {
    // Check if there was exactly one element specified in the
    // variableTypes list. This is the list that specifies which types of
    // variables to include in the dropdown.
    // If there is exactly one element specified, make the variable
    // being created this specified type. Else, default behavior is to create
    // a scalar variable
    if (this.getVariableTypes_().length == 1) {
      this.sourceBlock_.workspace.createVariable(this.getValue(),
        this.getVariableTypes_()[0]);
    } else {
      this.sourceBlock_.workspace.createVariable(this.getValue());
    }
  }
};

/**
 * Attach this field to a block.
 * @param {!Blockly.Block} block The block containing this field.
 */
Blockly.FieldVariable.prototype.setSourceBlock = function(block) {
  goog.asserts.assert(!block.isShadow(),
      'Variable fields are not allowed to exist on shadow blocks.');
  Blockly.FieldVariable.superClass_.setSourceBlock.call(this, block);
};

/**
 * Get the variable's name (use a variableDB to convert into a real name).
 * Unline a regular dropdown, variables are literal and have no neutral value.
 * @return {string} Current text.
 */
Blockly.FieldVariable.prototype.getValue = function() {
  return this.getText();
};

/**
 * Set the variable name.
 * @param {string} value New text.
 */
Blockly.FieldVariable.prototype.setValue = function(value) {
  var newValue = value;
  var newText = value;

  if (this.sourceBlock_) {
    var variable = this.sourceBlock_.workspace.getVariableById(value);
    if (variable) {
      newText = variable.name;
    }
    // TODO(marisaleung): Remove name lookup after converting all Field Variable
    //     instances to use id instead of name.
    else if (variable = this.sourceBlock_.workspace.getVariable(value)) {
      newValue = variable.getId();
    }
    if (Blockly.Events.isEnabled()) {
      Blockly.Events.fire(new Blockly.Events.BlockChange(
          this.sourceBlock_, 'field', this.name, this.value_, newValue));
    }
  }
  this.value_ = newValue;
  this.setText(newText);
};

/**
 * Return a list of variable types to include in the dropdown.
 * @return {!Array.<string>} Array of variable types.
 * @throws {Error} if variableTypes is an empty array.
 * @private
 */
Blockly.FieldVariable.prototype.getVariableTypes_ = function() {
  var variableTypes = this.variableTypes;
  if (variableTypes === null) {
    // If variableTypes is null, return all variable types.
    if (this.sourceBlock_) {
      var workspace = this.sourceBlock_.workspace;
      return workspace.getVariableTypes();
    }
  }
  variableTypes = variableTypes || [''];
  if (variableTypes.length == 0) {
    // Throw an error if variableTypes is an empty list.
    var name = this.getText();
    throw new Error('\'variableTypes\' of field variable ' +
      name + ' was an empty list');
  }
  return variableTypes;
};

/**
 * Return a sorted list of variable names for variable dropdown menus.
 * Include a special option at the end for creating a new variable name.
 * @return {!Array.<string>} Array of variable names.
 * @this {Blockly.FieldVariable}
 */
Blockly.FieldVariable.dropdownCreate = function() {
  var variableModelList = [];
  var name = this.getText();
  // Don't create a new variable if there is nothing selected.
  var createSelectedVariable = name ? true : false;
  var workspace = null;
  if (this.sourceBlock_) {
    workspace = this.sourceBlock_.workspace;
  }
  var isBroadcastType = false;
  if (workspace) {
    var variableTypes = this.getVariableTypes_();
    var variableModelList = [];
    // Get a copy of the list, so that adding rename and new variable options
    // doesn't modify the workspace's list.
    for (var i = 0; i < variableTypes.length; i++) {
      var variableType = variableTypes[i];
      if (variableType == Blockly.BROADCAST_MESSAGE_VARIABLE_TYPE){
        isBroadcastType = true;
      }
      var variables = workspace.getVariablesOfType(variableType);
      variableModelList = variableModelList.concat(variables);
    }
    for (var i = 0; i < variableModelList.length; i++){
      if (createSelectedVariable && variableModelList[i].name == name) {
        createSelectedVariable = false;
        break;
      }
    }
  }
  // Ensure that the currently selected variable is an option.
  // TODO (#1270): Remove isBroadcastType check here when flyout variables fixed.
  if (createSelectedVariable && workspace && !isBroadcastType) {
    var newVar = workspace.createVariable(name);
    variableModelList.push(newVar);
  }
  variableModelList.sort(Blockly.VariableModel.compareByName);
  var options = [];
  for (var i = 0; i < variableModelList.length; i++) {
    // Set the uuid as the internal representation of the variable.
    options[i] = [variableModelList[i].name, variableModelList[i].getId()];
  }
  if (isBroadcastType) {
    // TODO (#1270): Re-enable create broadcast message dropdown in flyout when fixed.
    if (!workspace.isFlyout) {
      options.push([Blockly.Msg.NEW_BROADCAST_MESSAGE, Blockly.NEW_BROADCAST_MESSAGE_ID]);
    }
  } else {
    options.push([Blockly.Msg.RENAME_VARIABLE, Blockly.RENAME_VARIABLE_ID]);
    if (Blockly.Msg.DELETE_VARIABLE) {
      options.push([Blockly.Msg.DELETE_VARIABLE.replace('%1', name),
          Blockly.DELETE_VARIABLE_ID]);
    }
  }
  return options;
};

/**
 * Handle the selection of an item in the variable dropdown menu.
 * Special case the 'Rename variable...' and 'Delete variable...' options.
 * In the rename case, prompt the user for a new name.
 * @param {!goog.ui.Menu} menu The Menu component clicked.
 * @param {!goog.ui.MenuItem} menuItem The MenuItem selected within menu.
 */
Blockly.FieldVariable.prototype.onItemSelected = function(menu, menuItem) {
  var id = menuItem.getValue();
  // TODO(marisaleung): change setValue() to take in an id as the parameter.
  // Then remove itemText.
  var itemText;
  if (this.sourceBlock_ && this.sourceBlock_.workspace) {
    var workspace = this.sourceBlock_.workspace;
    var variable = workspace.getVariableById(id);
    // If the item selected is a variable, set itemText to the variable name.
    if (variable) {
      itemText = variable.name;
    }
    else if (id == Blockly.RENAME_VARIABLE_ID) {
      // Rename variable.
      var currentName = this.getText();
      variable = workspace.getVariable(currentName);
      Blockly.Variables.renameVariable(workspace, variable);
      return;
    } else if (id == Blockly.DELETE_VARIABLE_ID) {
      // Delete variable.
      workspace.deleteVariable(this.getText());
      return;
    } else if (id == Blockly.NEW_BROADCAST_MESSAGE_ID) {
      var thisField = this;
      var setName = function(newName) {
        thisField.setValue(newName);
      };
      Blockly.Variables.createVariable(workspace, setName, Blockly.BROADCAST_MESSAGE_VARIABLE_TYPE);
      return;
    }

    // Call any validation function, and allow it to override.
    itemText = this.callValidator(itemText);
  }
  if (itemText !== null) {
    this.setValue(itemText);
  }
};
