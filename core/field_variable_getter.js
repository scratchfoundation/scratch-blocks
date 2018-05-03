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
 * @fileoverview Variable getter field.  Appears as a label but has a variable
 *     picker in the right-click menu.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.FieldVariableGetter');

goog.require('Blockly.Field');


/**
 * Class for a variable getter field.
 * @param {string} text The initial content of the field.
 * @param {string} name Optional CSS class for the field's text.
 * @param {string} opt_varType The type of variable this field is associated with.
 * @extends {Blockly.FieldLabel}
 * @constructor
 *
 */
Blockly.FieldVariableGetter = function(text, name, opt_varType) {
  this.size_ = new goog.math.Size(Blockly.BlockSvg.FIELD_WIDTH,
      Blockly.BlockSvg.FIELD_HEIGHT);
  this.text_ = text;

  /**
   * Maximum characters of text to display before adding an ellipsis.
   * Same for strings and numbers.
   * @type {number}
   */
  this.maxDisplayLength = Blockly.BlockSvg.MAX_DISPLAY_LENGTH;

  this.name_ = name;
  this.variableType_ = opt_varType ? opt_varType : '';
};
goog.inherits(Blockly.FieldVariableGetter, Blockly.Field);

/**
 * Construct a FieldVariableGetter from a JSON arg object,
 * dereferencing any string table references.
 * @param {!Object} options A JSON object with options (variable,
 *                          variableTypes, and defaultType).
 * @returns {!Blockly.FieldVariableGetter} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldVariableGetter.fromJson = function(options) {
  var varname = Blockly.utils.replaceMessageReferences(options['text']);
  return new Blockly.FieldVariableGetter(varname, options['name'],
      options['class'], options['variableType']);
};

/**
 * Editable fields usually show some sort of UI for the user to change them.
 * This field should be serialized, but only edited programmatically.
 * @type {boolean}
 * @public
 */
Blockly.FieldVariableGetter.prototype.EDITABLE = false;

/**
 * Serializable fields are saved by the XML renderer, non-serializable fields
 * are not.  This field should be serialized, but only edited programmatically.
 * @type {boolean}
 * @public
 */
Blockly.FieldVariableGetter.prototype.SERIALIZABLE = true;

/**
 * Install this field on a block.
 */
Blockly.FieldVariableGetter.prototype.init = function() {
  if (this.fieldGroup_) {
    // Field has already been initialized once.
    return;
  }
  Blockly.FieldVariableGetter.superClass_.init.call(this);
  if (this.variable_) {
    return; // Initialization already happened.
  }
  this.workspace_ = this.sourceBlock_.workspace;
  var variable = Blockly.Variables.getOrCreateVariablePackage(
      this.workspace_, null, this.text_, this.variableType_);
  this.setValue(variable.getId());
};

/**
 * Get the variable's ID.
 * @return {string} Current variable's ID.
 */
Blockly.FieldVariableGetter.prototype.getValue = function() {
  return this.variable_ ? this.variable_.getId() : '';
};

/**
 * Get the text from this field.
 * @return {string} Current text.
 */
Blockly.FieldVariableGetter.prototype.getText = function() {
  return this.variable_ ? this.variable_.name : '';
};

/**
 * Get the variable model for the variable associated with this field.
 * Not guaranteed to be in the variable map on the workspace (e.g. if accessed
 * after the variable has been deleted).
 * @return {?Blockly.VariableModel} the selected variable, or null if none was
 *     selected.
 * @package
 */
Blockly.FieldVariableGetter.prototype.getVariable = function() {
  return this.variable_;
};

Blockly.FieldVariableGetter.prototype.setValue = function(id) {
  // What do I do when id is null?  That happens when undoing a change event
  // for the first time the value was set.
  var workspace = this.sourceBlock_.workspace;
  var variable = Blockly.Variables.getVariable(workspace, id);

  if (!variable) {
    throw new Error('Variable id doesn\'t point to a real variable!  ID was ' +
        id);
  }

  if (this.sourceBlock_ && Blockly.Events.isEnabled()) {
    var oldValue = this.variable_ ? this.variable_.getId() : null;
    Blockly.Events.fire(new Blockly.Events.BlockChange(
        this.sourceBlock_, 'field', this.name, oldValue, variable.getId()));
  }
  this.variable_ = variable;
  this.value_ = id;
  this.setText(variable.name);
};

/**
 * This field is editable, but only through the right-click menu.
 * @private
 */
Blockly.FieldVariableGetter.prototype.showEditor_ = function() {
  // nop.
};

/**
 * Add or remove the UI indicating if this field is editable or not.
 * This field is editable, but only through the right-click menu.
 * Suppress default editable behaviour.
 */
Blockly.FieldVariableGetter.prototype.updateEditable = function() {
  // nop.
};

/**
 * Whether this field references any Blockly variables.  If true it may need to
 * be handled differently during serialization and deserialization.  Subclasses
 * may override this.
 * @return {boolean} True if this field has any variable references.
 * @package
 */
Blockly.FieldVariableGetter.prototype.referencesVariables = function() {
  return true;
};

Blockly.Field.register('field_variable_getter', Blockly.FieldVariableGetter);
