/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Massachusetts Institute of Technology
 * All rights reserved.
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
 * @fileoverview Text input field with floating "remove" button.
 * @author pkaplan@media.mit.edu (Paul Kaplan)
 */
'use strict';

goog.provide('Blockly.FieldTextInputRemovable');

goog.require('Blockly.BlockSvg.render');
goog.require('Blockly.Colours');
goog.require('Blockly.FieldTextInput');
goog.require('Blockly.Msg');
goog.require('Blockly.utils');
goog.require('goog.dom');
goog.require('goog.dom.TagName');

/**
 * Class for an editable text field displaying a deletion icon when selected.
 * @param {string} text The initial content of the field.
 * @param {Function=} opt_validator An optional function that is called
 *     to validate any constraints on what the user entered.  Takes the new
 *     text as an argument and returns either the accepted text, a replacement
 *     text, or null to abort the change.
 * @param {RegExp=} opt_restrictor An optional regular expression to restrict
 *     typed text to. Text that doesn't match the restrictor will never show
 *     in the text field.
 * @extends {Blockly.FieldTextInput}
 * @constructor
 */
Blockly.FieldTextInputRemovable = function(text, opt_validator, opt_restrictor) {
  Blockly.FieldTextInputRemovable.superClass_.constructor.call(this, text,
      opt_validator, opt_restrictor);
};
goog.inherits(Blockly.FieldTextInputRemovable, Blockly.FieldTextInput);

/**
 * Show the inline free-text editor on top of the text with the remove button.
 * @private
 */
Blockly.FieldTextInputRemovable.prototype.showEditor_ = function() {
  Blockly.FieldTextInputRemovable.superClass_.showEditor_.call(this);

  var div = Blockly.WidgetDiv.DIV;
  div.className += ' removableTextInput';
  var removeButton =
      goog.dom.createDom(goog.dom.TagName.IMG, 'blocklyTextRemoveIcon');
  removeButton.setAttribute('src',
      Blockly.mainWorkspace.options.pathToMedia + 'icons/remove.svg');
  this.removeButtonMouseWrapper_ = Blockly.bindEvent_(removeButton,
      'mousedown', this, this.removeCallback_);
  div.appendChild(removeButton);
};

/**
 * Function to call when remove button is called. Checks for removeFieldCallback
 * on sourceBlock and calls it if possible.
 * @private
 */
Blockly.FieldTextInputRemovable.prototype.removeCallback_ = function() {
  if (this.sourceBlock_ && this.sourceBlock_.removeFieldCallback) {
    this.sourceBlock_.removeFieldCallback(this);
  } else {
    console.warn('Expected a source block with removeFieldCallback');
  }
};

/**
 * Helper function to construct a FieldTextInputRemovable from a JSON arg object,
 * dereferencing any string table references.
 * @param {!Object} options A JSON object with options (text, class, and
 *                          spellcheck).
 * @returns {!Blockly.FieldTextInputRemovable} The new text input.
 * @public
 */
Blockly.FieldTextInputRemovable.fromJson = function(options) {
  var text = Blockly.utils.replaceMessageReferences(options['text']);
  var field = new Blockly.FieldTextInputRemovable(text, options['class']);
  if (typeof options['spellcheck'] == 'boolean') {
    field.setSpellcheck(options['spellcheck']);
  }
  return field;
};

Blockly.Field.register(
    'field_input_removable', Blockly.FieldTextInputRemovable);
