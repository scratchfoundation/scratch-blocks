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
 * @fileoverview Utility functions for handling procedures.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Extensions');

goog.require('Blockly.Blocks');
goog.require('Blockly.Field');
goog.require('Blockly.Names');
goog.require('Blockly.Workspace');


/**
 * Category to separate procedure names from variables and generated functions.
 */
Blockly.Extensions.NAME_TYPE = 'EXTENSION';

Blockly.Extensions.EXTENSIONS = [];

/**
 * Construct the blocks required by the flyout for the procedure category.
 * @param {!Blockly.Workspace} workspace The workspace contianing procedures.
 * @return {!Array.<!Element>} Array of XML block elements.
 */
Blockly.Extensions.flyoutCategory = function(workspace) {
  var xmlList = [];
  function populateExtensions(extensions) {
    for (var v = 0; v < extensions.length; v++)
      for (var i = 0; i < extensions[v].length; i++) {
        var data = JSON.parse(extensions[v][i]);
        var code = data.code;
        var block = goog.dom.createDom('block');
        block.setAttribute('type', 'extensions_' + data.type);
        block.setAttribute('gap', 16);
        var mutation = goog.dom.createDom('mutation');
        mutation.setAttribute('code', code);
        block.appendChild(mutation);
        xmlList.push(block);
      }
    }
  }
  populateExtensions(Blockly.Extensions.EXTENSIONS);
  return xmlList;
};