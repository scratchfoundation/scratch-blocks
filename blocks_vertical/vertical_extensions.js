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
 * @fileoverview Extensions for vertical blocks in scratch-blocks.
 * The following extensions can be used to describe a block in Scratch terms.
 * For instance, a block in the operators colour scheme with a number output
 * would have the "colours_operators" and "output_number" extensions.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.ScratchBlocks.VerticalExtensions');

goog.require('Blockly.Colours');
goog.require('Blockly.constants');


/**
 * Helper function that generates an extension based on a category name.
 * The generated function will set primary, secondary, and tertiary colours
 * based on the category name.
 * @param {String} category The name of the category to set colours for.
 * @return {function} An extension function that sets colours based on the given
 *     category.
 */
Blockly.ScratchBlocks.VerticalExtensions.colourHelper = function(category) {
  var colours = Blockly.Colours[category];
  if (!(colours && colours.primary && colours.secondary && colours.tertiary)) {
    throw new Error('Could not find colours for category "' + category + '"');
  }
  /**
   * Set the primary, secondary, and tertiary colours on this block for the
   * given category.
   * @this {Blockly.Block}
   */
  return function() {
    this.setColourFromRawValues_(colours.primary, colours.secondary,
        colours.tertiary);
    this.setCategory(Blockly.Categories[category]);
  };
};

/**
 * Extension to set the colours of a text field, which are all the same.
 */
Blockly.ScratchBlocks.VerticalExtensions.COLOUR_TEXTFIELD = function() {
  this.setColourFromRawValues_(Blockly.Colours.textField,
      Blockly.Colours.textField, Blockly.Colours.textField);
};

/**
 * Extension to make a block fit into a stack of statements, regardless of its
 * inputs.  That means the block should have a previous connection and a next
 * connection and have inline inputs.
 * @this {Blockly.Block}
 * @readonly
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
 * @this {Blockly.Block}
 * @readonly
 */
Blockly.ScratchBlocks.VerticalExtensions.SHAPE_HAT = function() {
  this.setInputsInline(true);
  this.setNextStatement(true, null);
};

/**
 * Extension to make a block be shaped as an end block, regardless of its
 * inputs.  That means the block should have a previous connection and have
 * inline inputs, but have no next connection.
 * @this {Blockly.Block}
 * @readonly
 */
Blockly.ScratchBlocks.VerticalExtensions.SHAPE_END = function() {
  this.setInputsInline(true);
  this.setPreviousStatement(true, null);
};

/**
 * Extension to make represent a number reporter in Scratch-Blocks.
 * That means the block has inline inputs, a round output shape, and a 'Number'
 * output type.
 * @this {Blockly.Block}
 * @readonly
 */
Blockly.ScratchBlocks.VerticalExtensions.OUTPUT_NUMBER = function() {
  this.setInputsInline(true);
  this.setOutputShape(Blockly.OUTPUT_SHAPE_ROUND);
  this.setOutput(true, 'Number');
};

/**
 * Extension to make represent a string reporter in Scratch-Blocks.
 * That means the block has inline inputs, a round output shape, and a 'String'
 * output type.
 * @this {Blockly.Block}
 * @readonly
 */
Blockly.ScratchBlocks.VerticalExtensions.OUTPUT_STRING = function() {
  this.setInputsInline(true);
  this.setOutputShape(Blockly.OUTPUT_SHAPE_ROUND);
  this.setOutput(true, 'String');
};

/**
 * Extension to make represent a boolean reporter in Scratch-Blocks.
 * That means the block has inline inputs, a round output shape, and a 'Boolean'
 * output type.
 * @this {Blockly.Block}
 * @readonly
 */
Blockly.ScratchBlocks.VerticalExtensions.OUTPUT_BOOLEAN = function() {
  this.setInputsInline(true);
  this.setOutputShape(Blockly.OUTPUT_SHAPE_HEXAGONAL);
  this.setOutput(true, 'Boolean');
};

/**
 * Register all extensions for scratch-blocks.
 * @package
 */
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

  // Text fields transcend categories.
  Blockly.Extensions.register('colours_textfield',
      Blockly.ScratchBlocks.VerticalExtensions.COLOUR_TEXTFIELD);

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
