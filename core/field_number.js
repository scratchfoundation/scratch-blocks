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
  var noFocus =
      goog.userAgent.MOBILE || goog.userAgent.ANDROID || goog.userAgent.IPAD;
  // Mobile browsers have issues with in-line textareas (focus & keyboards).
  Blockly.FieldNumber.superClass_.showEditor_.call(this, noFocus);
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
