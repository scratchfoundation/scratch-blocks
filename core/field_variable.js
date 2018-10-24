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
  // The FieldDropdown constructor would call setValue, which might create a
  // spurious variable.  Just do the relevant parts of the constructor.
  this.menuGenerator_ = Blockly.FieldVariable.dropdownCreate;
  this.size_ = new goog.math.Size(Blockly.BlockSvg.FIELD_WIDTH,
      Blockly.BlockSvg.FIELD_HEIGHT);
  this.setValidator(opt_validator);
  // TODO (blockly #1499): Add opt_default_type to match default value.
  // If not set, ''.
  this.defaultVariableName = (varname || '');
  var hasSingleVarType = opt_variableTypes && (opt_variableTypes.length == 1);
  this.defaultType_ = hasSingleVarType ? opt_variableTypes[0] : '';
  this.variableTypes = opt_variableTypes;
  this.addArgType('variable');

  this.value_ = null;
};
goog.inherits(Blockly.FieldVariable, Blockly.FieldDropdown);

/**
 * Construct a FieldVariable from a JSON arg object,
 * dereferencing any string table references.
 * @param {!Object} options A JSON object with options (variable,
 *                          variableTypes, and defaultType).
 * @returns {!Blockly.FieldVariable} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldVariable.fromJson = function(options) {
  var varname = Blockly.utils.replaceMessageReferences(options['variable']);
  var variableTypes = options['variableTypes'];
  return new Blockly.FieldVariable(varname, null, variableTypes);
};

/**
 * Initialize everything needed to render this field.  This includes making sure
 * that the field's value is valid.
 * @public
 */
Blockly.FieldVariable.prototype.init = function() {
  if (this.fieldGroup_) {
    // Dropdown has already been initialized once.
    return;
  }
  Blockly.FieldVariable.superClass_.init.call(this);

  // TODO (blockly #1010): Change from init/initModel to initView/initModel
  this.initModel();
};

/**
 * Initialize the model for this field if it has not already been initialized.
 * If the value has not been set to a variable by the first render, we make up a
 * variable rather than let the value be invalid.
 * @package
 */
Blockly.FieldVariable.prototype.initModel = function() {
  if (this.variable_) {
    return; // Initialization already happened.
  }
  this.workspace_ = this.sourceBlock_.workspace;
  // Initialize this field if it's in a broadcast block in the flyout
  var variable = this.initFlyoutBroadcast_(this.workspace_);
  if (!variable) {
    var variable = Blockly.Variables.getOrCreateVariablePackage(
        this.workspace_, null, this.defaultVariableName, this.defaultType_);
  }
  // Don't fire a change event for this setValue.  It would have null as the
  // old value, which is not valid.
  Blockly.Events.disable();
  try {
    this.setValue(variable.getId());
  } finally {
    Blockly.Events.enable();
  }
};

/**
 * Initialize broadcast blocks in the flyout.
 * Implicit deletion of broadcast messages from the scratch vm may cause
 * broadcast blocks in the flyout to change which variable they display as the
 * selected option when the workspace is refreshed.
 * Re-sort the broadcast messages by name, and set the field value to the id
 * of the variable that comes first in sorted order.
 * @param {!Blockly.Workspace} workspace The flyout workspace containing the
 * broadcast block.
 * @return {string} The variable of type 'broadcast_msg' that comes
 * first in sorted order.
 */
Blockly.FieldVariable.prototype.initFlyoutBroadcast_ = function(workspace) {
  // Using shorter name for this constant
  var broadcastMsgType = Blockly.BROADCAST_MESSAGE_VARIABLE_TYPE;
  var broadcastVars = workspace.getVariablesOfType(broadcastMsgType);
  if(workspace.isFlyout && this.defaultType_ == broadcastMsgType &&
      broadcastVars.length != 0) {
    broadcastVars.sort(Blockly.VariableModel.compareByName);
    return broadcastVars[0];
  }
};

/**
 * Dispose of this field.
 * @public
 */
Blockly.FieldVariable.dispose = function() {
  Blockly.FieldVariable.superClass_.dispose.call(this);
  this.workspace_ = null;
  this.variableMap_ = null;
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
 * Get the variable's ID.
 * @return {string} Current variable's ID.
 */
Blockly.FieldVariable.prototype.getValue = function() {
  return this.variable_ ? this.variable_.getId() : null;
};

/**
 * Get the text from this field, which is the selected variable's name.
 * @return {string} The selected variable's name, or the empty string if no
 *     variable is selected.
 */
Blockly.FieldVariable.prototype.getText = function() {
  return this.variable_ ? this.variable_.name : '';
};

/**
 * Get the variable model for the selected variable.
 * Not guaranteed to be in the variable map on the workspace (e.g. if accessed
 * after the variable has been deleted).
 * @return {?Blockly.VariableModel} the selected variable, or null if none was
 *     selected.
 * @package
 */
Blockly.FieldVariable.prototype.getVariable = function() {
  return this.variable_;
};

/**
 * Set the variable ID.
 * @param {string} id New variable ID, which must reference an existing
 *     variable.
 */
Blockly.FieldVariable.prototype.setValue = function(id) {
  var workspace = this.sourceBlock_.workspace;
  var variable = Blockly.Variables.getVariable(workspace, id);

  if (!variable) {
    throw new Error('Variable id doesn\'t point to a real variable!  ID was ' +
        id);
  }
  // Type checks!
  var type = variable.type;
  if (!this.typeIsAllowed_(type)) {
    throw new Error('Variable type doesn\'t match this field!  Type was ' +
        type);
  }
  if (this.sourceBlock_ && Blockly.Events.isEnabled()) {
    var oldValue = this.variable_ ? this.variable_.getId() : null;
    Blockly.Events.fire(new Blockly.Events.BlockChange(
        this.sourceBlock_, 'field', this.name, oldValue, id));
  }
  this.variable_ = variable;
  this.value_ = id;
  this.setText(variable.name);
};

/**
 * Check whether the given variable type is allowed on this field.
 * @param {string} type The type to check.
 * @return {boolean} True if the type is in the list of allowed types.
 * @private
 */
Blockly.FieldVariable.prototype.typeIsAllowed_ = function(type) {
  var typeList = this.getVariableTypes_();
  if (!typeList) {
    return true; // If it's null, all types are valid.
  }
  for (var i = 0; i < typeList.length; i++) {
    if (type == typeList[i]) {
      return true;
    }
  }
  return false;
};

/**
 * Return a list of variable types to include in the dropdown.
 * @return {!Array.<string>} Array of variable types.
 * @throws {Error} if variableTypes is an empty array.
 * @private
 */
Blockly.FieldVariable.prototype.getVariableTypes_ = function() {
  // TODO (#1513): Try to avoid calling this every time the field is edited.
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
  if (!this.variable_) {
    throw new Error('Tried to call dropdownCreate on a variable field with no' +
        ' variable selected.');
  }
  var variableModelList = [];
  var name = this.getText();
  var workspace = null;
  if (this.sourceBlock_) {
    workspace = this.sourceBlock_.workspace;
  }
  if (workspace) {
    var variableTypes = this.getVariableTypes_();
    var variableModelList = [];
    // Get a copy of the list, so that adding rename and new variable options
    // doesn't modify the workspace's list.
    for (var i = 0; i < variableTypes.length; i++) {
      var variableType = variableTypes[i];
      var variables = workspace.getVariablesOfType(variableType);
      variableModelList = variableModelList.concat(variables);

      var potentialVarMap = workspace.getPotentialVariableMap();
      if (potentialVarMap) {
        var potentialVars = potentialVarMap.getVariablesOfType(variableType);
        variableModelList = variableModelList.concat(potentialVars);
      }
    }
  }
  variableModelList.sort(Blockly.VariableModel.compareByName);

  var options = [];
  for (var i = 0; i < variableModelList.length; i++) {
    // Set the uuid as the internal representation of the variable.
    options[i] = [variableModelList[i].name, variableModelList[i].getId()];
  }
  if (this.defaultType_ == Blockly.BROADCAST_MESSAGE_VARIABLE_TYPE) {
    options.unshift(
        [Blockly.Msg.NEW_BROADCAST_MESSAGE, Blockly.NEW_BROADCAST_MESSAGE_ID]);
  } else {
    // Scalar variables and lists have the same backing action, but the option
    // text is different.
    if (this.defaultType_ == Blockly.LIST_VARIABLE_TYPE) {
      var renameText = Blockly.Msg.RENAME_LIST;
      var deleteText = Blockly.Msg.DELETE_LIST;
    } else {
      var renameText = Blockly.Msg.RENAME_VARIABLE;
      var deleteText = Blockly.Msg.DELETE_VARIABLE;
    }
    options.push([renameText, Blockly.RENAME_VARIABLE_ID]);
    if (deleteText) {
      options.push(
          [
            deleteText.replace('%1', name),
            Blockly.DELETE_VARIABLE_ID
          ]);
    }
  }

  return options;
};

/**
 * Handle the selection of an item in the variable dropdown menu.
 * Special case the 'Rename variable...', 'Delete variable...',
 * and 'New message...' options.
 * In the rename case, prompt the user for a new name.
 * @param {!goog.ui.Menu} menu The Menu component clicked.
 * @param {!goog.ui.MenuItem} menuItem The MenuItem selected within menu.
 */
Blockly.FieldVariable.prototype.onItemSelected = function(menu, menuItem) {
  var id = menuItem.getValue();
  if (this.sourceBlock_ && this.sourceBlock_.workspace) {
    var workspace = this.sourceBlock_.workspace;
    if (id == Blockly.RENAME_VARIABLE_ID) {
      // Rename variable.
      Blockly.Variables.renameVariable(workspace, this.variable_);
      return;
    } else if (id == Blockly.DELETE_VARIABLE_ID) {
      // Delete variable.
      workspace.deleteVariableById(this.variable_.getId());
      return;
    } else if (id == Blockly.NEW_BROADCAST_MESSAGE_ID) {
      var thisField = this;
      var updateField = function(varId) {
        if (varId) {
          thisField.setValue(varId);
        }
      };
      Blockly.Variables.createVariable(workspace, updateField,
          Blockly.BROADCAST_MESSAGE_VARIABLE_TYPE);
      return;
    }

    // TODO (blockly #1529): Call any validation function, and allow it to override.
  }
  this.setValue(id);
};

/**
 * Overrides referencesVariables(), indicating this field refers to a variable.
 * @return {boolean} True.
 * @package
 * @override
 */
Blockly.FieldVariable.prototype.referencesVariables = function() {
  return true;
};

Blockly.Field.register('field_variable', Blockly.FieldVariable);
