'use strict';

describe('Test json', function () {
  it('Ensure message0 creates an input', function () {
    var BLOCK_TYPE = 'test_json_message0';
    var MESSAGE0 = 'message0';
  
    var workspace = new Blockly.Workspace();
    var block;
    Blockly.defineBlocksWithJsonArray([{
      "type": BLOCK_TYPE,
      "message0": MESSAGE0
    }]);

    block = new Blockly.Block(workspace, BLOCK_TYPE);
    assert.equal(block.inputList.length, 1);
    assert.equal(block.inputList[0].fieldRow.length, 1);
    var textField = block.inputList[0].fieldRow[0];
    assert.equal(textField.constructor, Blockly.FieldLabel);
    assert.equal(textField.getText(), MESSAGE0);
    
    block && block.dispose();
    workspace && workspace.dispose();
    delete Blockly.Blocks[BLOCK_TYPE];
  });

  it('Ensure message1 creates a new input', function () {
    var BLOCK_TYPE = 'test_json_message1';
    var MESSAGE0 = 'message0';
    var MESSAGE1 = 'message1';
  
    var workspace = new Blockly.Workspace();
    var block;
    Blockly.defineBlocksWithJsonArray([{
      "type": BLOCK_TYPE,
      "message0": MESSAGE0,
      "message1": MESSAGE1
    }]);

    block = new Blockly.Block(workspace, BLOCK_TYPE);
    assert.equal(block.inputList.length, 2);

    assert.equal(block.inputList[0].fieldRow.length, 1);
    var textField = block.inputList[0].fieldRow[0];
    assert.equal(textField.constructor, Blockly.FieldLabel);
    assert.equal(textField.getText(), MESSAGE0);

    assert.equal(block.inputList[1].fieldRow.length, 1);
    textField = block.inputList[1].fieldRow[0];
    assert.equal(textField.constructor, Blockly.FieldLabel);
    assert.equal(textField.getText(), MESSAGE1);
    
    block && block.dispose();
    workspace && workspace.dispose();
    delete Blockly.Blocks[BLOCK_TYPE];
  });

  it('Ensure message string is referenced', function () {
    var BLOCK_TYPE = 'test_json_message0_i18n';
    var MESSAGE0 = '%{BKY_MESSAGE}';
    var MESSAGE = 'message';
  
    Blockly.Msg['MESSAGE'] = MESSAGE;
  
    var workspace = new Blockly.Workspace();
    var block;
    Blockly.defineBlocksWithJsonArray([{
      "type": BLOCK_TYPE,
      "message0": MESSAGE0
    }]);

    block = new Blockly.Block(workspace, BLOCK_TYPE);
    assert.equal(block.inputList.length, 1);
    assert.equal(block.inputList[0].fieldRow.length, 1);
    var textField = block.inputList[0].fieldRow[0];
    assert.equal(Blockly.FieldLabel, textField.constructor);
    assert.equal(textField.getText(), MESSAGE);
    
    block && block.dispose(); // Disposes of textField, too.
    workspace && workspace.dispose();
    delete Blockly.Blocks[BLOCK_TYPE];
    delete Blockly.Msg['MESSAGE'];
  });

  it('Test dropdown', function () {
    var BLOCK_TYPE = 'test_json_dropdown';
    var FIELD_NAME = 'FIELD_NAME';
    var LABEL0 = 'LABEL0';
    var VALUE0 = 'VALUE0';
    var LABEL1 = 'LABEL1';
    var VALUE1 = 'VALUE1';
  
    var workspace = new Blockly.Workspace();
    var block;
    Blockly.defineBlocksWithJsonArray([{
      "type": BLOCK_TYPE,
      "message0": "%1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": FIELD_NAME,
          "options": [
            [LABEL0, VALUE0],
            [LABEL1, VALUE1]
          ]
        }
      ]
    }]);

    block = new Blockly.Block(workspace, BLOCK_TYPE);
    assert.equal(block.inputList.length, 1);
    assert.equal(block.inputList[0].fieldRow.length, 1);
    var dropdown = block.inputList[0].fieldRow[0];
    assert.equal(block.getField(FIELD_NAME), dropdown);
    assert.equal(dropdown.constructor, Blockly.FieldDropdown);
    assert.equal(dropdown.getValue(), VALUE0);

    var options = dropdown.getOptions();
    assert.equal(options[0][0], LABEL0);
    assert.equal(options[0][1], VALUE0);
    assert.equal(options[1][0], LABEL1);
    assert.equal(options[1][1], VALUE1);
    
    block && block.dispose();  // Disposes of dropdown, too.
    workspace && workspace.dispose();
    delete Blockly.Blocks[BLOCK_TYPE];
  });

  it('Test dropdown image', function () {
    var BLOCK_TYPE = 'test_json_dropdown';
    var FIELD_NAME = 'FIELD_NAME';
    var IMAGE1_ALT_TEXT = 'Localized message.';
    Blockly.Msg['ALT_TEXT'] = IMAGE1_ALT_TEXT;
    var IMAGE0 = {
      'width': 12,
      'height': 34,
      'src': 'http://image0.src',
      'alt': 'IMAGE0 alt text'
    };
    var VALUE0 = 'VALUE0';
    var IMAGE1 = {
      'width': 56,
      'height': 78,
      'src': 'http://image1.src',
      'alt': '%{BKY_ALT_TEXT}'
    };
    var VALUE1 = 'VALUE1';
    var IMAGE2 = {
      'width': 90,
      'height': 123,
      'src': 'http://image2.src'
    };
    var VALUE2 = 'VALUE2';
  
    var workspace = new Blockly.Workspace();
    var block;
    Blockly.defineBlocksWithJsonArray([{
      "type": BLOCK_TYPE,
      "message0": "%1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": FIELD_NAME,
          "options": [
            [IMAGE0, VALUE0],
            [IMAGE1, VALUE1],
            [IMAGE2, VALUE2]
          ]
        }
      ]
    }]);

    block = new Blockly.Block(workspace, BLOCK_TYPE);
    assert.equal(block.inputList.length, 1);
    assert.equal(block.inputList[0].fieldRow.length, 1);
    var dropdown = block.inputList[0].fieldRow[0];
    assert.equal(block.getField(FIELD_NAME), dropdown);
    assert.equal(dropdown.constructor, Blockly.FieldDropdown);
    assert.equal(dropdown.getValue(), VALUE0);

    var options = dropdown.getOptions();
    var image0 = options[0][0];
    assert.equal(image0.width, IMAGE0.width);
    assert.equal(image0.height, IMAGE0.height);
    assert.equal(image0.src, IMAGE0.src);
    assert.equal(image0.alt, IMAGE0.alt);
    assert.equal(options[0][1], VALUE0);

    var image1 = options[1][0];
    assert.equal(image1.width, IMAGE1.width);
    assert.equal(image1.height, IMAGE1.height);
    assert.equal(image1.src, IMAGE1.src);
    assert.equal(image1.alt, IMAGE1_ALT_TEXT); // Via Msg reference
    
    assert.equal(options[1][1], VALUE1);

    var image2 = options[2][0];
    assert.equal(image2.width, IMAGE2.width);
    assert.equal(image2.height, IMAGE2.height);
    assert.equal(image2.src, IMAGE2.src);
    assert.notExists(image2.alt);  // No alt specified.
    assert.equal(options[2][1], VALUE2);
    
    block && block.dispose();  // Disposes of dropdown, too.
    workspace && workspace.dispose();
    delete Blockly.Blocks[BLOCK_TYPE];
    delete Blockly.Msg['ALTTEXT'];
  });
});
