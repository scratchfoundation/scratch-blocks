/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2013 Google Inc.
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
 * @fileoverview Dropdown menu for sounds.
 * @author ericr@media.mit.edu (Eric Rosenbaum)
 */
'use strict';

goog.provide('Blockly.FieldSoundDropdown');

goog.require('Blockly.FieldDropdown');

/**
 * Class for an editable dropdown field.
 * @param {(!Array.<!Array>|!Function)} menuGenerator An array of options
 *     for a dropdown list, or a function which generates these options.
 * @param {Function=} opt_validator A function that is executed when a new
 *     option is selected, with the newly selected value as its sole argument.
 *     If it returns a value, that value (which must be one of the options) will
 *     become selected in place of the newly selected option, unless the return
 *     value is null, in which case the change is aborted.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldSoundDropdown = function(menuGenerator, opt_validator) {
  // Call parent's constructor.
  Blockly.FieldSoundDropdown.superClass_.constructor.call(this, menuGenerator,
      opt_validator);
};
goog.inherits(Blockly.FieldSoundDropdown, Blockly.FieldDropdown);

/**
 * Handle the selection of an item in the dropdown menu.
 * @param {!goog.ui.Menu} menu The Menu component clicked.
 * @param {!goog.ui.MenuItem} menuItem The MenuItem selected within menu.
 */
Blockly.FieldSoundDropdown.prototype.onItemSelected = function(menu, menuItem) {
  var value = menuItem.getValue();

  if (value == '_record_') {
    Blockly.recordSoundCallback();
    return;
  }

  if (this.sourceBlock_) {
    // Call any validation function, and allow it to override.
    value = this.callValidator(value);
  }
  if (value !== null) {
    this.setValue(value);
  }
};

/**
 * Initialize everything needed to render this field.  This includes making sure
 * that the field's value is valid.
 * @public
 */
Blockly.FieldSoundDropdown.prototype.init = function() {
  if (this.fieldGroup_) {
    // Dropdown has already been initialized once.
    return;
  }
  Blockly.FieldSoundDropdown.superClass_.init.call(this);

  var options = this.getOptions();
  options.push(['record...', '_record_']);

};

/**
 * Construct a FieldDropdown from a JSON arg object.
 * @param {!Object} element A JSON object with options.
 * @returns {!Blockly.FieldSoundDropdown} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldSoundDropdown.fromJson = function(element) {
  return new Blockly.FieldSoundDropdown(element['options']);
};

Blockly.Field.register('field_sounddropdown', Blockly.FieldSoundDropdown);
