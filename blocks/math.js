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
 * @fileoverview Math blocks for Blockly.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.Blocks.math');

goog.require('Blockly.Blocks');

goog.require('Blockly.Colours');

goog.require('Blockly.constants');


/**
 * Common HSV hue for all blocks in this category.
 */
Blockly.Blocks.math.HUE = Blockly.Colours.textField;

Blockly.Blocks['math_number'] = {
  /**
   * Block for generic numeric value.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.MATH_NUMBER_HELPURL);
    this.setColour(Blockly.Blocks.math.HUE);
    this.appendDummyInput()
        .appendField(new Blockly.FieldNumber('0'), 'NUM');
    this.setOutput(true, 'Number');
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    // Number block is trivial.  Use tooltip of parent block if it exists.
    this.setTooltip(function() {
      var parent = thisBlock.getParent();
      return (parent && parent.getInputsInline() && parent.tooltip) ||
          Blockly.Msg.MATH_NUMBER_TOOLTIP;
    });
    this.setOutputShape(Blockly.OUTPUT_SHAPE_ROUND);
  }
};

Blockly.Blocks['math_whole_number'] = {
  /**
   * Block for whole number value, no negatives or decimals.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.MATH_NUMBER_HELPURL);
    this.setColour(Blockly.Blocks.math.HUE);
    this.appendDummyInput()
        .appendField(new Blockly.FieldNumber('0', 0, Infinity, 1), 'NUM');
    this.setOutput(true, 'Number');
    this.setOutputShape(Blockly.OUTPUT_SHAPE_ROUND);
  }
};

Blockly.Blocks['math_positive_number'] = {
  /**
   * Block for positive number value, with decimal.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.MATH_NUMBER_HELPURL);
    this.setColour(Blockly.Blocks.math.HUE);
    this.appendDummyInput()
        .appendField(new Blockly.FieldNumber('0', 0, Infinity), 'NUM');
    this.setOutput(true, 'Number');
    this.setOutputShape(Blockly.OUTPUT_SHAPE_ROUND);
  }
};
