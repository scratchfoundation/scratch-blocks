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
 * Returns the height and width of the field.
 * @return {!goog.math.Size} Height and width.
 */
Blockly.FieldLabelEditable.prototype.getSize = function() {
  if (!this.size_.width) {
    this.render_();
  }
  return this.size_;
};

/**
 * Updates the width of the field. This calls getCachedWidth which won't cache
 * the approximated width on IE/Edge when `getComputedTextLength` fails. Once
 * it eventually does succeed, the result will be cached.
 **/
Blockly.FieldLabelEditable.prototype.updateWidth = function() {
  // Calculate width of field
  var width = Blockly.Field.getCachedWidth(this.textElement_);

  // Add padding to any drawn box.
  if (this.box_) {
    width += 2 * Blockly.BlockSvg.BOX_FIELD_PADDING;
  }

  // Set width of the field.
  this.size_.width = width;
};
