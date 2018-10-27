/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Massachusetts Institute of Technology
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
 * @fileoverview Note input field, for selecting a musical note on a piano.
 * @author ericr@media.mit.edu (Eric Rosenbaum)
 */
'use strict';

goog.provide('Blockly.FieldNote');

goog.require('Blockly.DropDownDiv');
goog.require('Blockly.FieldTextInput');
goog.require('goog.math');
goog.require('goog.userAgent');

/**
 * Class for a note input field, for selecting a musical note on a piano.
 * @param {(string|number)=} opt_value The initial content of the field. The
 *     value should cast to a number, and if it does not, '0' will be used.
 * @param {Function=} opt_validator An optional function that is called
 *     to validate any constraints on what the user entered.  Takes the new
 *     text as an argument and returns the accepted text or null to abort
 *     the change.
 * @extends {Blockly.FieldTextInput}
 * @constructor
 */
Blockly.FieldNote = function(opt_value, opt_validator) {

  opt_value = (opt_value && !isNaN(opt_value)) ? String(opt_value) : '0';
  Blockly.FieldNote.superClass_.constructor.call(
      this, opt_value, opt_validator);
  this.addArgType('note');
};
goog.inherits(Blockly.FieldNote, Blockly.FieldTextInput);

Blockly.FieldNote.TOP_MENU_HEIGHT = 28;
Blockly.FieldNote.WHITE_KEY_COLOR = '#FFFFFF';
Blockly.FieldNote.WHITE_KEY_SELECTED_COLOR = '#b0d6ff';
Blockly.FieldNote.BLACK_KEY_COLOR = '#323133';
Blockly.FieldNote.WHITE_KEY_HEIGHT = 72;
Blockly.FieldNote.WHITE_KEY_WIDTH = 40;
Blockly.FieldNote.BLACK_KEY_HEIGHT = 40;
Blockly.FieldNote.BLACK_KEY_WIDTH = 32;
Blockly.FieldNote.BOTTOM_PADDING = 4;
Blockly.FieldNote.EDGE_KEY_WIDTH = 16;
Blockly.FieldNote.KEY_RADIUS = 6;
Blockly.FieldNote.KEY_GAP = 1;
Blockly.FieldNote.OCTAVE_BUTTON_WIDTH = 32;

Blockly.FieldNote.KEY_INFO = [
  {name: 'B'},
  {name: 'C'},
  {name: 'C#', isBlack: true},
  {name: 'D'},
  {name: 'Eb', isBlack: true},
  {name: 'E'},
  {name: 'F'},
  {name: 'F#', isBlack: true},
  {name: 'G'},
  {name: 'G#', isBlack: true},
  {name: 'A'},
  {name: 'Bb', isBlack: true},
  {name: 'B'},
  {name: 'C'},
  {name: 'C#', isBlack: true},
  {name: 'D'}
];

/**
 * Construct a FieldNote from a JSON arg object.
 * @param {!Object} options A JSON object with options (angle).
 * @returns {!Blockly.FieldNote} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldNote.fromJson = function(options) {
  return new Blockly.FieldNote(options['note']);
};

/**
 * Path to the arrow svg icon.
 */
Blockly.FieldNote.ARROW_SVG_PATH = 'icons/arrow.svg';

/**
 * Clean up this FieldNote, as well as the inherited FieldTextInput.
 * @return {!Function} Closure to call on destruction of the WidgetDiv.
 * @private
 */
Blockly.FieldNote.prototype.dispose_ = function() {
  var thisField = this;
  return function() {
    Blockly.FieldNote.superClass_.dispose_.call(thisField)();
    if (thisField.mouseDownWrapper_) {
      Blockly.unbindEvent_(thisField.mouseDownWrapper_);
    }
    if (thisField.mouseUpWrapper_) {
      Blockly.unbindEvent_(thisField.mouseUpWrapper_);
    }
    if (thisField.mouseMoveWrapper_) {
      Blockly.unbindEvent_(thisField.mouseMoveWrapper_);
    }
  };
};

/**
 * Show a field with piano keys.
 * @private
 */
Blockly.FieldNote.prototype.showEditor_ = function() {
  // @todo what does this do?
  // var noFocus =
  //     goog.userAgent.MOBILE || goog.userAgent.ANDROID || goog.userAgent.IPAD;
  // // Mobile browsers have issues with in-line textareas (focus & keyboards).
  // Blockly.FieldNote.superClass_.showEditor_.call(this, noFocus);

  // If there is an existing drop-down someone else owns, hide it immediately and clear it.
  Blockly.DropDownDiv.hideWithoutAnimation();
  Blockly.DropDownDiv.clearContent();
  var div = Blockly.DropDownDiv.getContentDiv();

  // Build the SVG DOM.
  var fieldWidth = 8 * Blockly.FieldNote.WHITE_KEY_WIDTH +
    2 * Blockly.FieldNote.EDGE_KEY_WIDTH;
  var fieldHeight = Blockly.FieldNote.TOP_MENU_HEIGHT +
    Blockly.FieldNote.WHITE_KEY_HEIGHT +
    Blockly.FieldNote.BOTTOM_PADDING;

  var svg = Blockly.utils.createSvgElement('svg', {
    'xmlns': 'http://www.w3.org/2000/svg',
    'xmlns:html': 'http://www.w3.org/1999/xhtml',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'version': '1.1',
    'height': fieldHeight + 'px',
    'width': fieldWidth + 'px'
  }, div);

  // Add the white and black keys

  // Since we are adding the keys from left to right in order, they need
  // to be in two groups in order to layer correctly.
  var whiteKeyGroup = Blockly.utils.createSvgElement('g', {}, svg);
  var blackKeyGroup = Blockly.utils.createSvgElement('g', {}, svg);

  var xIncrement, width, height, fill, group;
  // Start drawing the keys off the left edge (relying on the field's clipping)
  var x = Blockly.FieldNote.EDGE_KEY_WIDTH - Blockly.FieldNote.WHITE_KEY_WIDTH;
  var y = Blockly.FieldNote.TOP_MENU_HEIGHT;
  for (var i = 0; i < Blockly.FieldNote.KEY_INFO.length; i++) {
    // Draw a black or white key
    if (Blockly.FieldNote.KEY_INFO[i].isBlack) {
      // Black keys are shifted back half a key
      x -= Blockly.FieldNote.BLACK_KEY_WIDTH / 2;
      xIncrement = Blockly.FieldNote.BLACK_KEY_WIDTH / 2;
      width = Blockly.FieldNote.BLACK_KEY_WIDTH;
      height = Blockly.FieldNote.BLACK_KEY_HEIGHT;
      fill = Blockly.FieldNote.BLACK_KEY_COLOR;
      group = blackKeyGroup;
    } else {
      xIncrement = Blockly.FieldNote.WHITE_KEY_WIDTH;
      width = Blockly.FieldNote.WHITE_KEY_WIDTH - Blockly.FieldNote.KEY_GAP;
      height = Blockly.FieldNote.WHITE_KEY_HEIGHT;
      fill = Blockly.FieldNote.WHITE_KEY_COLOR;
      group = whiteKeyGroup;
    }
    var attr = {
      'd': this.getPianoKeyPath(x, y, width, height),
      'fill': fill
    };
    Blockly.utils.createSvgElement('path', attr, group);
    x += xIncrement;
  }

  Blockly.DropDownDiv.setColour(this.sourceBlock_.parentBlock_.getColour(),
      this.sourceBlock_.getColourTertiary());
  Blockly.DropDownDiv.setCategory(this.sourceBlock_.parentBlock_.getCategory());
  Blockly.DropDownDiv.showPositionedByBlock(this, this.sourceBlock_);

  // this.mouseDownWrapper_ =
  //     Blockly.bindEvent_(this.handle_, 'mousedown', this, this.onMouseDown);
};

/**
 * Construct the SVG path string for a piano key shape: a rectangle with rounded
 * corners at the bottom.
 * @param {number} x the x position for the key.
 * @param {number} y the y position for the key.
 * @param {number} width the width of the key.
 * @param {number} height the height of the key.
 * @returns {string} the SVG path as a string.
 */
Blockly.FieldNote.prototype.getPianoKeyPath = function(x, y, width, height) {
  return  'M' + x + ' ' + y + ' ' +
    'L' + x + ' ' + (y + height -  Blockly.FieldNote.KEY_RADIUS) + ' ' +
    'Q' + x + ' ' + (y + height) + ' ' +
    (x + Blockly.FieldNote.KEY_RADIUS) + ' ' + (y + height) + ' ' +
    'L' + (x + width - Blockly.FieldNote.KEY_RADIUS) + ' ' + (y + height) + ' ' +
    'Q' + (x + width) + ' ' + (y + height) + ' ' +
    (x + width) + ' ' + (y + height - Blockly.FieldNote.KEY_RADIUS) + ' ' +
    'L' + (x + width) + ' ' + y + ' ' +
    'L' + x +  ' ' + y;
};

/**
 * Set the angle to match the mouse's position.
 * @param {!Event} e Mouse move event.
 */
Blockly.FieldNote.prototype.onMouseDown = function() {
  this.mouseUpWrapper_ = Blockly.bindEvent_(document.body, 'mouseup', this, this.onMouseUp);
};

/**
 * Set the angle to match the mouse's position.
 * @param {!Event} e Mouse move event.
 */
Blockly.FieldNote.prototype.onMouseUp = function() {
  Blockly.unbindEvent_(this.mouseUpWrapper_);
};

/**
 * Ensure that only an angle may be entered.
 * @param {string} text The user's text.
 * @return {?string} A string representing a valid angle, or null if invalid.
 */
Blockly.FieldNote.prototype.classValidator = function(text) {
  if (text === null) {
    return null;
  }
  var n = parseFloat(text || 0);
  if (isNaN(n)) {
    return null;
  }
  return String(n);
};

Blockly.Field.register('field_note', Blockly.FieldNote);
