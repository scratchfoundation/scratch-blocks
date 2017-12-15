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
 * @fileoverview Vertical separator field. Draws a vertical line.
 * @author ericr@media.mit.edu (Eric Rosenbaum)
 */
'use strict';

goog.provide('Blockly.FieldVerticalSeparator');
goog.require('Blockly.Field');
goog.require('goog.dom');
goog.require('goog.math.Size');

/**
 * Class for a vertical separator line.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldVerticalSeparator = function() {
  this.sourceBlock_ = null;
  this.width_ = 1;
  this.height_ = Blockly.BlockSvg.ICON_SEPARATOR_HEIGHT;
  this.size_ = new goog.math.Size(this.width_, this.height_);
};
goog.inherits(Blockly.FieldVerticalSeparator, Blockly.Field);

/**
 * Editable fields are saved by the XML renderer, non-editable fields are not.
 */
Blockly.FieldVerticalSeparator.prototype.EDITABLE = false;

/**
 * Install this field on a block.
 */
Blockly.FieldVerticalSeparator.prototype.init = function() {
  if (this.fieldGroup_) {
    // Image has already been initialized once.
    return;
  }
  // Build the DOM.
  /** @type {SVGElement} */
  this.fieldGroup_ = Blockly.utils.createSvgElement('g', {}, null);
  if (!this.visible_) {
    this.fieldGroup_.style.display = 'none';
  }
  /** @type {SVGElement} */
  this.lineElement_ = Blockly.utils.createSvgElement('line', {
    'stroke': this.sourceBlock_.getColourSecondary(),
    'stroke-linecap': 'round',
    'x1': 0,
    'y1': 0,
    'x2': 0,
    'y2': this.height_
  }, this.fieldGroup_);

  this.sourceBlock_.getSvgRoot().appendChild(this.fieldGroup_);
};

/**
 * Set the height of the line element, without adjusting the field's height.
 * This allows the line's height to be changed without causing it to be
 * centered with the new height (needed for correct rendering of hat blocks).
 * @param {number} newHeight the new height for the line.
 */
Blockly.FieldVerticalSeparator.prototype.setLineHeight = function(newHeight) {
    this.lineElement_.setAttribute('y2', newHeight);
};

/**
 * Dispose of all DOM objects belonging to this text.
 */
Blockly.FieldVerticalSeparator.prototype.dispose = function() {
  goog.dom.removeNode(this.fieldGroup_);
  this.fieldGroup_ = null;
  this.lineElement_ = null;
};

/**
 * Get the source URL of this field.
 * @return {string} null.
 * @override
 */
Blockly.FieldVerticalSeparator.prototype.getValue = function() {
  return null;
};

/**
 * Set the value of this field.
 * @param {?string} src New value.
 * @override
 */
Blockly.FieldVerticalSeparator.prototype.setValue = function(src) {
  return;
};

/**
 * Set the text of this field.
 * @param {?string} alt New text.
 * @override
 */
Blockly.FieldVerticalSeparator.prototype.setText = function(alt) {
  return;
};

/**
 * Separator lines are fixed width, no need to render.
 * @private
 */
Blockly.FieldVerticalSeparator.prototype.render_ = function() {
  // NOP
};

/**
 * Separator lines are fixed width, no need to update.
 * @private
 */
Blockly.FieldVerticalSeparator.prototype.updateWidth = function() {
 // NOP
};
