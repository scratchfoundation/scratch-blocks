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
 * @fileoverview Serialized label field.  Behaves like a normal label but is
 *     always serialized to XML.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.FieldLabelEditable');

goog.require('Blockly.FieldLabel');


/**
 * Class for a variable getter field.
 * @param {string} text The initial content of the field.
 * @param {string} opt_class Optional CSS class for the field's text.
 * @extends {Blockly.FieldLabel}
 * @constructor
 *
 */
Blockly.FieldLabelEditable = function(text, opt_class) {
  Blockly.FieldLabelEditable.superClass_.constructor.call(this, text,
      opt_class);
  // Used in base field rendering, but we don't need it.
  this.arrowWidth_ = 0;
};
goog.inherits(Blockly.FieldLabelEditable, Blockly.FieldLabel);

/**
 * Editable fields are saved by the XML renderer, non-editable fields are not.
 */
Blockly.FieldLabelEditable.prototype.EDITABLE = true;

/**
 * Updates the width of the field. This calls getCachedWidth which won't cache
 * the approximated width on IE/Edge when `getComputedTextLength` fails. Once
 * it eventually does succeed, the result will be cached.
 **/
Blockly.FieldLabelEditable.prototype.updateWidth = function() {
  // Set width of the field.
  // Unlike the base Field class, this doesn't add space to editable fields.
  this.size_.width = Blockly.Field.getCachedWidth(this.textElement_);
};

/**
 * Draws the border with the correct width.
 * Saves the computed width in a property.
 * @private
 */
Blockly.FieldLabelEditable.prototype.render_ = function() {
  if (this.visible_ && this.textElement_) {
    // Replace the text.
    goog.dom.removeChildren(/** @type {!Element} */ (this.textElement_));
    var textNode = document.createTextNode(this.getDisplayText_());
    this.textElement_.appendChild(textNode);
    this.updateWidth();

    // Update text centering, based on newly calculated width.
    var centerTextX = this.size_.width / 2;

    // If half the text length is not at least center of
    // visible field (FIELD_WIDTH), center it there instead.
    var minOffset = Blockly.BlockSvg.FIELD_WIDTH / 2;
    if (this.sourceBlock_.RTL) {
      // X position starts at the left edge of the block, in both RTL and LTR.
      // First offset by the width of the block to move to the right edge,
      // and then subtract to move to the same position as LTR.
      var minCenter = this.size_.width - minOffset;
      centerTextX = Math.min(minCenter, centerTextX);
    } else {
      // (width / 2) should exceed Blockly.BlockSvg.FIELD_WIDTH / 2
      // if the text is longer.
      centerTextX = Math.max(minOffset, centerTextX);
    }
    // Apply new text element x position.
    this.textElement_.setAttribute('x', centerTextX);
  }
};


/**
 * Click events should not treat this like an editable field.
 * Suppress default editable field behaviour.
 */
Blockly.FieldLabelEditable.prototype.isCurrentlyEditable = function() {
  return false;
};
