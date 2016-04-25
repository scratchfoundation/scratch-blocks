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
 * @fileoverview Field for numbers. Includes validator and numpad on touch.
 * @author tmickel@mit.edu (Tim Mickel)
 */
'use strict';

goog.provide('Blockly.FieldNumber');

goog.require('Blockly.FieldTextInput');
goog.require('goog.math');
goog.require('goog.userAgent');


/**
 * Class for an editable number field.
 * @param {string} text The initial content of the field.
 * @param {Function=} opt_validator An optional function that is called
 *     to validate any constraints on what the user entered.  Takes the new
 *     text as an argument and returns the accepted text or null to abort
 *     the change.
 * @param {number} precision Precision of the decimal value (negative power of 10).
 * @param {number} min Minimum value of the number.
 * @param {number} max Maximum value of the number.
 * @extends {Blockly.FieldTextInput}
 * @constructor
 */
Blockly.FieldNumber = function(text, opt_validator, precision, min, max) {
  this.precision_ = precision;
  this.min_ = min;
  this.max_ = max;
  Blockly.FieldNumber.superClass_.constructor.call(this, text, opt_validator);
};
goog.inherits(Blockly.FieldNumber, Blockly.FieldTextInput);

/**
 * Fixed width of the numpad drop-down, in px.
 * @type {number}
 * @const
 */
Blockly.FieldNumber.DROPDOWN_WIDTH = 168;

/**
 * Extra padding to add between the block and the num-pad drop-down, in px.
 * @type {number}
 * @const
 */
Blockly.FieldNumber.DROPDOWN_Y_PADDING = 8;

/**
 * Sets a new change handler for angle field.
 * @param {Function} handler New change handler, or null.
 */
Blockly.FieldNumber.prototype.setValidator = function(handler) {
  var wrappedHandler;
  if (handler) {
    // Wrap the user's change handler together with the number validator.
    // This is based entirely on FieldAngle.
    wrappedHandler = function(value) {
      var v1 = handler.call(this, value);
      var v2;
      if (v1 === null) {
        v2 = v1;
      } else {
        if (v1 === undefined) {
          v1 = value;
        }
        v2 = Blockly.FieldNumber.numberValidator.call(this, v1);
        if (v2 === undefined) {
          v2 = v1;
        }
      }
      return v2 === value ? undefined : v2;
    };
  } else {
    wrappedHandler = Blockly.FieldNumber.numberValidator;
  }
  Blockly.FieldNumber.superClass_.setValidator.call(this, wrappedHandler);
};

/**
 * Show the inline free-text editor on top of the text.
 * @private
 */
Blockly.FieldNumber.prototype.showEditor_ = function() {
  Blockly.FieldNumber.activeField_ = this;
  // Do not focus on mobile devices so we can show the keypad
  var noFocusReadOnly =
      goog.userAgent.MOBILE || goog.userAgent.ANDROID || goog.userAgent.IPAD;
  Blockly.FieldNumber.superClass_.showEditor_.call(this, false, noFocusReadOnly);

  // Show a numeric keypad in the drop-down on touch
  if (noFocusReadOnly) {
    // If there is an existing drop-down someone else owns, hide it immediately and clear it.
    Blockly.DropDownDiv.hideWithoutAnimation();
    Blockly.DropDownDiv.clearContent();

    var contentDiv = Blockly.DropDownDiv.getContentDiv();
    // Accessibility properties
    contentDiv.setAttribute('role', 'menu');
    contentDiv.setAttribute('aria-haspopup', 'true');

    // Add numeric keypad buttons
    // Calculator order
    var buttons = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0'];
    for (var i = 0, buttonText; buttonText = buttons[i]; i++) {
      var button = document.createElement('button');
      button.setAttribute('role', 'menuitem');
      button.setAttribute('class', 'blocklyNumPadButton');
      button.title = buttonText;
      button.innerHTML = buttonText;
      button.style.width = '48px';
      button.style.height = '48px';
      button.ontouchend = Blockly.FieldNumber.buttonClick_;
      contentDiv.appendChild(button);
    }
    Blockly.DropDownDiv.setColour(Blockly.Colours.numPadBackground, Blockly.Colours.numPadBorder);
    contentDiv.style.width = Blockly.FieldNumber.DROPDOWN_WIDTH + 'px';

    // Calculate positioning for the drop-down
    // sourceBlock_ is the rendered shadow field input box
    var scale = this.sourceBlock_.workspace.scale;
    var bBox = this.sourceBlock_.getHeightWidth();
    bBox.width *= scale;
    bBox.height *= scale;
    var position = this.getAbsoluteXY_();
    // If we can fit it, render below the shadow block
    var primaryX = position.x + bBox.width / 2;
    var primaryY = position.y + bBox.height + Blockly.FieldNumber.DROPDOWN_Y_PADDING;
    // If we can't fit it, render above the entire parent block
    var secondaryX = primaryX;
    var secondaryY = position.y - (Blockly.BlockSvg.MIN_BLOCK_Y * scale) - (Blockly.BlockSvg.FIELD_Y_OFFSET * scale);

    Blockly.DropDownDiv.setBoundsElement(this.sourceBlock_.workspace.getParentSvg().parentNode);
    Blockly.DropDownDiv.show(this, primaryX, primaryY, secondaryX, secondaryY, this.onHide_.bind(this));
  }
};

Blockly.FieldNumber.buttonClick_ = function() {
  var spliceValue = this.innerHTML;
  var oldValue = Blockly.FieldTextInput.htmlInput_.value;
  var selectionStart = Blockly.FieldTextInput.htmlInput_.selectionStart;
  var selectionEnd = Blockly.FieldTextInput.htmlInput_.selectionEnd;
  var newValue = oldValue.slice(0, selectionStart) + spliceValue + oldValue.slice(selectionEnd);
  Blockly.FieldTextInput.htmlInput_.value = Blockly.FieldTextInput.htmlInput_.defaultValue = newValue;
  Blockly.FieldTextInput.htmlInput_.setSelectionRange(newValue.length, newValue.length);
  Blockly.FieldNumber.superClass_.resizeEditor_.call(Blockly.FieldNumber.activeField_);
  Blockly.FieldTextInput.htmlInput_.scrollLeft = Blockly.FieldTextInput.htmlInput_.scrollWidth;
};

/**
 * Callback for when the drop-down is hidden.
 */
Blockly.FieldNumber.prototype.onHide_ = function() {
  // Clear accessibility properties
  Blockly.DropDownDiv.content_.removeAttribute('role');
  Blockly.DropDownDiv.content_.removeAttribute('aria-haspopup');
};

/**
 * Ensure that only an angle may be entered.
 * @param {string} text The user's text.
 * @return {?string} A string representing a valid angle, or null if invalid.
 */
Blockly.FieldNumber.numberValidator = function(text) {
  var n = Blockly.FieldTextInput.numberValidator(text);
  if (n !== null) {
    // string -> float
    n = parseFloat(n);
    // Keep within min and max
    n = Math.min(Math.max(n, this.min_), this.max_);
    // Update float precision (returns a string)
    n = n.toFixed(this.precision_);
    // Parse to a float and back to string to remove trailing decimals
    n = parseFloat(n);
    n = String(n);
  }
  return n;
};
