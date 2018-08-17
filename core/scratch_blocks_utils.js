/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
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
 * @fileoverview Utility methods for Scratch Blocks but not Blockly.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

/**
 * @name Blockly.scratchBlocksUtils
 * @namespace
 **/
goog.provide('Blockly.scratchBlocksUtils');


/**
 * Measure some text using a canvas in-memory.
 * Does not exist in Blockly, but needed in scratch-blocks
 * @param {string} fontSize E.g., '10pt'
 * @param {string} fontFamily E.g., 'Arial'
 * @param {string} fontWeight E.g., '600'
 * @param {string} text The actual text to measure
 * @return {number} Width of the text in px.
 * @package
 */
Blockly.scratchBlocksUtils.measureText = function(fontSize, fontFamily,
    fontWeight, text) {
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  context.font = fontWeight + ' ' + fontSize + ' ' + fontFamily;
  return context.measureText(text).width;
};

/**
 * Encode a string's HTML entities.
 * E.g., <a> -> &lt;a&gt;
 * Does not exist in Blockly, but needed in scratch-blocks
 * @param {string} rawStr Unencoded raw string to encode.
 * @return {string} String with HTML entities encoded.
 * @package
 */
Blockly.scratchBlocksUtils.encodeEntities = function(rawStr) {
  // CC-BY-SA https://stackoverflow.com/questions/18749591/encode-html-entities-in-javascript
  return rawStr.replace(/[\u00A0-\u9999<>&]/gim, function(i) {
    return '&#' + i.charCodeAt(0) + ';';
  });
};

/**
 * Re-assign obscured shadow blocks new IDs to prevent collisions
 * Scratch specific to help the VM handle deleting obscured shadows.
 * @param {Blockly.Block} block the root block to be processed.
 * @package
 */
Blockly.scratchBlocksUtils.changeObscuredShadowIds = function(block) {
  var blocks = block.getDescendants(false);
  for (var i = blocks.length - 1; i >= 0; i--) {
    var descendant = blocks[i];
    for (var j = 0; j < descendant.inputList.length; j++) {
      var connection = descendant.inputList[j].connection;
      if (connection) {
        var shadowDom = connection.getShadowDom();
        if (shadowDom) {
          shadowDom.setAttribute('id', Blockly.utils.genUid());
          connection.setShadowDom(shadowDom);
        }
      }
    }
  }
};

/**
 * Whether a block is both a shadow block and an argument reporter.  These
 * blocks have special behaviour in scratch-blocks: they're duplicated when
 * dragged, and they are rendered slightly differently from normal shadow
 * blocks.
 * @param {!Blockly.BlockSvg} block The block that should be used to make this
 *     decision.
 * @return {boolean} True if the block should be duplicated on drag.
 * @package
 */
Blockly.scratchBlocksUtils.isShadowArgumentReporter = function(block) {
  return (block.isShadow() && (block.type == 'argument_reporter_boolean' ||
      block.type == 'argument_reporter_string_number'));
};

/**
 * Compare strings with natural number sorting.
 * @param {string} str1 First input.
 * @param {string} str2 Second input.
 * @return {number} -1, 0, or 1 to signify greater than, equality, or less than.
 */
Blockly.scratchBlocksUtils.compareStrings = function(str1, str2) {
  return str1.localeCompare(str2, [], {
    sensitivity: 'base',
    numeric: true
  });
};

/**
 * Determine if this block can be recycled in the flyout.  Blocks that have no
 * variablees and are not dynamic shadows can be recycled.
 * @param {Blockly.Block} block The block to check.
 * @return {boolean} True if the block can be recycled.
 * @package
 */
Blockly.scratchBlocksUtils.blockIsRecyclable = function(block) {
  // If the block needs to parse mutations, never recycle.
  if (block.mutationToDom && block.domToMutation) {
    return false;
  }

  for (var i = 0; i < block.inputList.length; i++) {
    var input = block.inputList[i];
    for (var j = 0; j < input.fieldRow.length; j++) {
      var field = input.fieldRow[j];
      // No variables.
      if (field instanceof Blockly.FieldVariable ||
          field instanceof Blockly.FieldVariableGetter) {
        return false;
      }
      if (field instanceof Blockly.FieldDropdown ||
          field instanceof Blockly.FieldNumberDropdown ||
          field instanceof Blockly.FieldTextDropdown) {
        if (field.isOptionListDynamic()) {
          return false;
        }
      }
    }
    // Check children.
    if (input.connection) {
      var child = input.connection.targetBlock();
      if (child && !Blockly.scratchBlocksUtils.blockIsRecyclable(child)) {
        return false;
      }
    }
  }
  return true;
};
