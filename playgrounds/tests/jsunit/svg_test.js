/**
 * @license
 * Blockly Tests
 *
 * Copyright 2016 Google Inc.
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

var svgTest_workspace;

function svgTest_setUp() {
  svgTest_workspace = Blockly.inject('blocklyDiv',
      {toolbox: document.getElementById('toolbox')});
}

function svgTest_tearDown() {
  svgTest_workspace.dispose();
  svgTest_workspace = null;
}

/**
 * Create a block with one field. Must be called after svgTest_setUp().
 * @return {!Blockly.Block} The new block with one field.
 */
function svgTest_newOneFieldBlock() {
  Blockly.Blocks['one_field_block'] = {
    init: function() {
      this.jsonInit({
        'message0': '%1',
        'args0': [
          {
            'type': 'field_input',
            'name': 'FIELD'
          }
        ]
      });
    }
  };

  var block = svgTest_workspace.newBlock('one_field_block');
  block.initSvg();
  block.render(false);
  return block;
}

/**
 * Create a block with two fields. Must be called after svgTest_setUp().
 * @return {!Blockly.Block} The new block with two fields.
 */
function svgTest_newTwoFieldBlock() {
  Blockly.Blocks['two_field_block'] = {
    init: function() {
      this.jsonInit({
        'message0': 'text_field %1',
        'args0': [
          {
            'type': 'field_input',
            'name': 'FIELD'
          }
        ]
      });
    }
  };

  var block = svgTest_workspace.newBlock('two_field_block');
  block.initSvg();
  block.render(false);
  return block;
}
