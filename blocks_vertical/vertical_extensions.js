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


/**
 * Helper function that generates an extension based on a category name.
 * The generated function with set primary, secondary, and tertiary colours
 * based on the category name.
 * @param {String} category The name of the category to set colours for.
 */
Blockly.ScratchBlocks.VerticalExtensions.colourHelper = function(category) {
  var colours = Blockly.Colours[category];
  if (!(colours.primary && colours.secondary && colours.tertiary)) {
    return function() { };
  }
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

/**
 * Extension to make a block be shaped as a hat block, regardless of its
 * inputs.  That means the block should have a next connection and have inline
 * inputs, but have no previous connection.
 */
Blockly.ScratchBlocks.VerticalExtensions.SHAPE_HAT = function() {
  this.setInputsInline(true);
  this.setNextStatement(true, null);
};

/**
 * Extension to make a block be shaped as an end block, regardless of its
 * inputs.  That means the block should have a previous connection and have
 * inline inputs, but have no next connection.
 */
Blockly.ScratchBlocks.VerticalExtensions.SHAPE_END = function() {
  this.setInputsInline(true);
  this.setPreviousStatement(true, null);
};


Blockly.ScratchBlocks.VerticalExtensions.OUTPUT_NUMBER = function() {
  this.setInputsInline(true);
  this.setOutputShape(Blockly.OUTPUT_SHAPE_ROUND);
  this.setOutput(true, 'Number');
};

Blockly.ScratchBlocks.VerticalExtensions.OUTPUT_STRING = function() {
  this.setInputsInline(true);
  this.setOutputShape(Blockly.OUTPUT_SHAPE_ROUND);
  this.setOutput(true, 'String');
};

Blockly.ScratchBlocks.VerticalExtensions.OUTPUT_BOOLEAN = function() {
  this.setInputsInline(true);
  this.setOutputShape(Blockly.OUTPUT_SHAPE_HEXAGONAL);
  this.setOutput(true, 'Boolean');
};


Blockly.ScratchBlocks.VerticalExtensions.registerAll = function() {
  var categoryNames =
      ['control', 'data', 'sounds', 'motion', 'looks', 'event', 'sensing',
      'pen', 'operators', 'more'];
  // Register functions for all category colours.
  for (var i = 0; i < categoryNames.length; i++) {
    name = categoryNames[i];
    Blockly.Extensions.register('colours_' + name,
      Blockly.ScratchBlocks.VerticalExtensions.colourHelper(name));
  }
  // Register extensions for common block shapes.
  Blockly.Extensions.register('shape_statement',
      Blockly.ScratchBlocks.VerticalExtensions.SHAPE_STATEMENT);
  Blockly.Extensions.register('shape_hat',
      Blockly.ScratchBlocks.VerticalExtensions.SHAPE_HAT);
  Blockly.Extensions.register('shape_end',
      Blockly.ScratchBlocks.VerticalExtensions.SHAPE_END);
  // Output shapes and types are related.
  Blockly.Extensions.register('output_number',
      Blockly.ScratchBlocks.VerticalExtensions.OUTPUT_NUMBER);
  Blockly.Extensions.register('output_string',
      Blockly.ScratchBlocks.VerticalExtensions.OUTPUT_STRING);
  Blockly.Extensions.register('output_boolean',
      Blockly.ScratchBlocks.VerticalExtensions.OUTPUT_BOOLEAN);
};

Blockly.ScratchBlocks.VerticalExtensions.registerAll();
