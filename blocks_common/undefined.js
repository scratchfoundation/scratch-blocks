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
 * @fileoverview Text blocks for Blockly.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Blocks.undefined');

goog.require('Blockly.Blocks');

goog.require('Blockly.Colours');

goog.require('Blockly.constants');

Blockly.Blocks['undefined_block'] = {
  /**
   * Undefined Block
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "undefined",
      "inputsInline": true,
      "previousStatement": null,
      "category": "undefined",
      "colour": "#FF0000",
      "colourSecondary": "#FF7474",
      "colourTertiary":"#FFA2A2"
    });
  },
  updateUndefinedShape: function(data) {
    this.setPreviousStatement(eval(data[0]));
    this.setOutput(eval(data[1]));
    this.setOutputShape(data[2]);
  }
};
