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
 * @fileoverview Combination number + drop-down field
 * @author tmickel@mit.edu (Tim Mickel)
 */
'use strict';

goog.provide('Blockly.FieldNumberDropdown');

goog.require('Blockly.FieldTextDropdown');
goog.require('goog.userAgent');


/**
 * Class for a combination number + drop-down field.
 * @param {number|string} value The initial content of the field.
 * @param {(!Array.<!Array.<string>>|!Function)} menuGenerator An array of
 *     options for a dropdown list, or a function which generates these options.
 * @param {number|string|undefined} opt_min Minimum value.
 * @param {number|string|undefined} opt_max Maximum value.
 * @param {number|string|undefined} opt_precision Precision for value.
 * @param {Function=} opt_validator An optional function that is called
 *     to validate any constraints on what the user entered.  Takes the new
 *     text as an argument and returns the accepted text or null to abort
 *     the change.
 * @extends {Blockly.FieldTextInput}
 * @constructor
 */
Blockly.FieldNumberDropdown = function(value, menuGenerator, opt_min, opt_max,
    opt_precision, opt_validator) {
  this.setConstraints_ = Blockly.FieldNumber.prototype.setConstraints_;

  var numRestrictor = Blockly.FieldNumber.prototype.getNumRestrictor.call(
      this, opt_min, opt_max, opt_precision
  );
  Blockly.FieldNumberDropdown.superClass_.constructor.call(
      this, value, menuGenerator, opt_validator, numRestrictor
  );
  this.addArgType('numberdropdown');
};
goog.inherits(Blockly.FieldNumberDropdown, Blockly.FieldTextDropdown);

/**
 * Construct a FieldTextDropdown from a JSON arg object,
 * dereferencing any string table references.
 * @param {!Object} element A JSON object with options.
 * @returns {!Blockly.FieldNumberDropdown} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldNumberDropdown.fromJson = function(element) {
  return new Blockly.FieldNumberDropdown(
      element['value'], element['options'],
      element['min'], element['max'], element['precision']
  );
};

Blockly.Field.register('field_numberdropdown', Blockly.FieldNumberDropdown);
