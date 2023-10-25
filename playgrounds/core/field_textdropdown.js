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
 * @fileoverview Combination text + drop-down field
 * @author tmickel@mit.edu (Tim Mickel)
 */
'use strict';

goog.provide('Blockly.FieldTextDropdown');

goog.require('Blockly.DropDownDiv');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldTextInput');
goog.require('goog.userAgent');


/**
 * Class for a combination text + drop-down field.
 * @param {string} text The initial content of the text field.
 * @param {(!Array.<!Array.<string>>|!Function)} menuGenerator An array of
 *     options for a dropdown list, or a function which generates these options.
 * @param {Function=} opt_validator An optional function that is called
 *     to validate any constraints on what the user entered.  Takes the new
 *     text as an argument and returns the accepted text or null to abort
 *     the change.
 * @param {RegExp=} opt_restrictor An optional regular expression to restrict
 *     typed text to. Text that doesn't match the restrictor will never show
 *     in the text field.
 * @extends {Blockly.FieldTextInput}
 * @constructor
 */
Blockly.FieldTextDropdown = function(text, menuGenerator, opt_validator, opt_restrictor) {
  this.menuGenerator_ = menuGenerator;
  Blockly.FieldDropdown.prototype.trimOptions_.call(this);
  Blockly.FieldTextDropdown.superClass_.constructor.call(this, text, opt_validator, opt_restrictor);
  this.addArgType('textdropdown');
};
goog.inherits(Blockly.FieldTextDropdown, Blockly.FieldTextInput);

/**
 * Construct a FieldTextDropdown from a JSON arg object,
 * dereferencing any string table references.
 * @param {!Object} element A JSON object with options.
 * @returns {!Blockly.FieldTextDropdown} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldTextDropdown.fromJson = function(element) {
  var field =
      new Blockly.FieldTextDropdown(element['text'], element['options']);
  if (typeof element['spellcheck'] == 'boolean') {
    field.setSpellcheck(element['spellcheck']);
  }
  return field;
};

/**
 * Install this text drop-down field on a block.
 */
Blockly.FieldTextDropdown.prototype.init = function() {
  if (this.fieldGroup_) {
    // Text input + dropdown has already been initialized once.
    return;
  }
  Blockly.FieldTextDropdown.superClass_.init.call(this);
  // Add dropdown arrow: "option ▾" (LTR) or "▾ אופציה" (RTL)
  // Positioned on render, after text size is calculated.
  if (!this.arrow_) {
    /** @type {Number} */
    this.arrowSize_ = 12;
    /** @type {Number} */
    this.arrowX_ = 0;
    /** @type {Number} */
    this.arrowY_ = 11;
    this.arrow_ = Blockly.utils.createSvgElement('image',
        {
          'height': this.arrowSize_ + 'px',
          'width': this.arrowSize_ + 'px'
        });
    this.arrow_.setAttributeNS('http://www.w3.org/1999/xlink',
        'xlink:href', Blockly.mainWorkspace.options.pathToMedia + 'dropdown-arrow-dark.svg');
    this.arrow_.style.cursor = 'pointer';
    this.fieldGroup_.appendChild(this.arrow_);
    this.mouseUpWrapper_ =
        Blockly.bindEvent_(this.arrow_, 'mouseup', this, this.showDropdown_);
  }
  // Prevent the drop-down handler from changing the field colour on open.
  this.disableColourChange_ = true;
};

/**
 * Close the input widget if this input is being deleted.
 */
Blockly.FieldTextDropdown.prototype.dispose = function() {
  if (this.mouseUpWrapper_) {
    Blockly.unbindEvent_(this.mouseUpWrapper_);
    this.mouseUpWrapper_ = null;
    Blockly.Touch.clearTouchIdentifier();
  }
  Blockly.FieldTextDropdown.superClass_.dispose.call(this);
};

/**
 * If the drop-down isn't open, show the text editor.
 */
Blockly.FieldTextDropdown.prototype.showEditor_ = function() {
  if (!this.dropDownOpen_) {
    Blockly.FieldTextDropdown.superClass_.showEditor_.call(this, null, null,
        true, function() {
          // When the drop-down arrow is clicked, hide text editor and show drop-down.
          Blockly.WidgetDiv.hide();
          this.showDropdown_();
          Blockly.Touch.clearTouchIdentifier();
        });
  }
};

/**
 * Return a list of the options for this dropdown.
 * See: Blockly.FieldDropDown.prototype.getOptions_.
 * @return {!Array.<!Array.<string>>} Array of option tuples:
 *     (human-readable text, language-neutral name).
 * @private
 */
Blockly.FieldTextDropdown.prototype.getOptions_ = Blockly.FieldDropdown.prototype.getOptions_;

/**
 * Position a drop-down arrow at the appropriate location at render-time.
 * See: Blockly.FieldDropDown.prototype.positionArrow.
 * @param {number} x X position the arrow is being rendered at, in px.
 * @return {number} Amount of space the arrow is taking up, in px.
 */
Blockly.FieldTextDropdown.prototype.positionArrow = Blockly.FieldDropdown.prototype.positionArrow;

/**
 * Create the dropdown menu.
 * @private
 */
Blockly.FieldTextDropdown.prototype.showDropdown_ = Blockly.FieldDropdown.prototype.showEditor_;

/**
 * Callback when the drop-down menu is hidden.
 */
Blockly.FieldTextDropdown.prototype.onHide = Blockly.FieldDropdown.prototype.onHide;

Blockly.Field.register('field_textdropdown', Blockly.FieldTextDropdown);
