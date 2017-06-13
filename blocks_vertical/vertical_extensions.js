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

'use strict';

goog.provide('Blockly.ScratchBlocks.VerticalExtensions');

goog.require('Blockly.Colours');
goog.require('Blockly.constants');
goog.require('Blockly.Extensions');


Blockly.ScratchBlocks.VerticalExtensions.colourHelper = function(category) {
  return function() {
    var colours = Blockly.Colours[category];
    this.setColourFromRawValues_(colours.primary, colours.secondary,
        colours.tertiary);
  };
};

/**
 * Extension to make a block fit into a stack of statements, regardless of its
 * inputs.  That means the block should have a previous connection and a next
 * connection and have inline inputs.
 */
Blockly.ScratchBlocks.VerticalExtensions.SHAPE_STATEMENT = function() {
  this.setInputsInline(true);
  this.setPreviousStatement(true, null);
  this.setNextStatement(true, null);
};


Blockly.Extensions.register('colours_control',
    Blockly.ScratchBlocks.VerticalExtensions.colourHelper("control"));

Blockly.Extensions.register('colours_data',
    Blockly.ScratchBlocks.VerticalExtensions.colourHelper("data"));

Blockly.Extensions.register('colours_sounds',
    Blockly.ScratchBlocks.VerticalExtensions.colourHelper("sounds"));

Blockly.Extensions.register('shape_statement',
    Blockly.ScratchBlocks.VerticalExtensions.SHAPE_STATEMENT);
