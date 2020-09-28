'use strict';

describe('Test svg', function () {
  var workspace;

  function helper_setup() {
    workspace = Blockly.inject('blocklyDiv', {
      toolbox: document.getElementById('toolbox')
    });
  }

  function helper_teardown() {
    workspace.dispose();
  }

  /**
 * Create a block with one field. Must be called after svgTest_setUp().
 * @return {!Blockly.Block} The new block with one field.
 */
  function helper_newOneFieldBlock() {
    Blockly.Blocks['one_field_block'] = {
      init: function () {
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
  function helper_newTwoFieldBlock() {
    Blockly.Blocks['two_field_block'] = {
      init: function () {
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
});
