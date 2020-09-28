'use strict';

describe('Test Block', function () {
  it('Dynamicly append field', function () {
    var workspace = new Blockly.Workspace();
    var block_name = 'test_jsonInit_FieldIconMenu';
    var field_name = 'TEST_FIELD';
    var dropdown_options = [{
      value: 'VALUE'
    }];

    Blockly.Blocks[block_name] = {
      init: function () {
        this.appendDummyInput()
          .appendField(new Blockly.FieldIconMenu(dropdown_options),
            field_name);
        this.setOutput(true);
      }
    };

    var block = workspace.newBlock(block_name);
    assert.isTrue(
      block.getField(field_name) instanceof Blockly.FieldIconMenu,
      'IconMenu field not added to block by appendField'
    );
  });

  it('Use jsonInit append field', function () {
    var workspace = new Blockly.Workspace();
    var block_name = 'test_jsonInit_FieldIconMenu';
    var field_name = 'TEST_FIELD';
    var dropdown_options = [{
      value: 'VALUE'
    }];

    Blockly.Blocks[block_name] = {
      init: function () {
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
    assert.isTrue(
      block.getField(field_name) instanceof Blockly.FieldIconMenu,
      'IconMenu field not added to block by jsonInit'
    );
  });
});
