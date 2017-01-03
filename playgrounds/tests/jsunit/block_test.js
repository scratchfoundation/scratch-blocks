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

function test_appendField_FieldIconMenu() {
  var workspace = new Blockly.Workspace();
  var block_name = 'test_jsonInit_FieldIconMenu';
  var field_name = 'TEST_FIELD';
  var dropdown_options = [{
    value: 'VALUE'
  }];

  Blockly.Blocks[block_name] = {
    init: function() {
      this.appendDummyInput()
          .appendField(new Blockly.FieldIconMenu(dropdown_options),
              field_name);
      this.setOutput(true);
    }
  };

  var block = workspace.newBlock(block_name);
  assertTrue('IconMenu field not added to block by appendField',
      block.getField(field_name) instanceof Blockly.FieldIconMenu);
}

function test_jsonInit_FieldIconMenu() {
  var workspace = new Blockly.Workspace();
  var block_name = 'test_jsonInit_FieldIconMenu';
  var field_name = 'TEST_FIELD';
  var dropdown_options = [{
    value: 'VALUE'
  }];

  Blockly.Blocks[block_name] = {
    init: function() {
      this.jsonInit({
        message0: '%1',
        args0: [{
          type: 'field_iconmenu',
          name: field_name,
          options: dropdown_options
        }],
        output: null
      });
    }
  };

  var block = workspace.newBlock(block_name);
  assertTrue('IconMenu field not added to block by jsonInit',
      block.getField(field_name) instanceof Blockly.FieldIconMenu);
}
