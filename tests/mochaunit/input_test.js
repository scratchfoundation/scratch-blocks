'use strict';

describe('Test Input', function () {
  it('Test append field', function () {
    var ws = new Blockly.Workspace();
    var block = new Blockly.Block(ws);
    var input = new Blockly.Input(Blockly.DUMMY_INPUT, 'INPUT', block);
    var field1 = new Blockly.FieldLabel('#1');
    var field2 = new Blockly.FieldLabel('#2');
  
    // Preconditions
    assert.equal(input.fieldRow.length, 0);
  
    // Actual Tests
    input.appendField(field1, 'first');
    assert.equal(input.fieldRow.length, 1);
    assert.equal(input.fieldRow[0], field1);
    assert.equal(input.fieldRow[0].name, 'first');
    assert.equal(field1.sourceBlock_, block);
  
    input.appendField(field2, 'second');
    assert.equal(input.fieldRow.length, 2);
    assert.equal(input.fieldRow[1], field2);
    assert.equal(input.fieldRow[1].name, 'second');
    assert.equal(field2.sourceBlock_, block);
  });

  it('Test append string field', function () {
    var ws = new Blockly.Workspace();
    var block = new Blockly.Block(ws);
    var input = new Blockly.Input(Blockly.DUMMY_INPUT, 'INPUT', block);
    var labelText = 'label';
  
    // Preconditions
    assert.equal(input.fieldRow.length, 0);
  
    // Actual Tests
    input.appendField(labelText, 'name');
    assert.equal(input.fieldRow.length, 1);
    assert.equal(input.fieldRow[0].constructor, Blockly.FieldLabel);
    assert.equal(input.fieldRow[0].getValue(), labelText);
    assert.equal(input.fieldRow[0].name, 'name');
  });

  it('Test append with prefix field', function () {
    var ws = new Blockly.Workspace();
    var block = new Blockly.Block(ws);
    var input = new Blockly.Input(Blockly.DUMMY_INPUT, 'INPUT', block);
    var prefix = new Blockly.FieldLabel('prefix');
    var field = new Blockly.FieldLabel('field');
    field.prefixField = prefix;
  
    // Preconditions
    assert.equal(0, input.fieldRow.length);
  
    // Actual Tests
    input.appendField(field);
    assert.equal(input.fieldRow.length, 2);
    assert.equal(input.fieldRow[0], prefix);
    assert.equal(input.fieldRow[1], field);
  });

  it('Test append with suffix field', function () {
    var ws = new Blockly.Workspace();
    var block = new Blockly.Block(ws);
    var input = new Blockly.Input(Blockly.DUMMY_INPUT, 'INPUT', block);
    var suffix = new Blockly.FieldLabel('suffix');
    var field = new Blockly.FieldLabel('field');
    field.suffixField = suffix;
  
    // Preconditions
    assert.equal(input.fieldRow.length, 0);
  
    // Actual Tests
    input.appendField(field);
    assert.equal(input.fieldRow.length, 2);
    assert.equal(input.fieldRow[0], field);
    assert.equal(input.fieldRow[1], suffix);
  });

  it('Test insert field', function () {
    var ws = new Blockly.Workspace();
    var block = new Blockly.Block(ws);
    var input = new Blockly.Input(Blockly.DUMMY_INPUT, 'INPUT', block);
    var before = new Blockly.FieldLabel('before');
    var after = new Blockly.FieldLabel('after');
    var between = new Blockly.FieldLabel('between');
    input.appendField(before);
    input.appendField(after);
  
    // Preconditions
    assert.equal(input.fieldRow.length, 2);
    assert.equal(input.fieldRow[0], before);
    assert.equal(input.fieldRow[1], after);
  
    // Actual Tests
    input.insertFieldAt(1, between, 'name');
    assert.equal(input.fieldRow.length, 3);
    assert.equal(input.fieldRow[0], before);
    assert.equal(input.fieldRow[1], between);
    assert.equal(input.fieldRow[1].name, 'name');
    assert.equal(input.fieldRow[2], after);
  });

  it('Test insert string', function () {
    var ws = new Blockly.Workspace();
    var block = new Blockly.Block(ws);
    var input = new Blockly.Input(Blockly.DUMMY_INPUT, 'INPUT', block);
    var before = new Blockly.FieldLabel('before');
    var after = new Blockly.FieldLabel('after');
    var labelText = 'label';
    input.appendField(before);
    input.appendField(after);
  
    // Preconditions
    assert.equal(input.fieldRow.length, 2);
    assert.equal(input.fieldRow[0], before);
    assert.equal(input.fieldRow[1], after);
  
    // Actual Tests
    input.insertFieldAt(1, labelText, 'name');
    assert.equal(input.fieldRow.length, 3);
    assert.equal(input.fieldRow[0], before);
    assert.equal(input.fieldRow[1].constructor, Blockly.FieldLabel);
    assert.equal(input.fieldRow[1].getValue(), labelText);
    assert.equal(input.fieldRow[1].name, 'name');
    assert.equal(input.fieldRow[2], after);
  });

  it('Test insert field with prefix', function () {
    var ws = new Blockly.Workspace();
    var block = new Blockly.Block(ws);
    var input = new Blockly.Input(Blockly.DUMMY_INPUT, 'INPUT', block);
    var before = new Blockly.FieldLabel('before');
    var after = new Blockly.FieldLabel('after');
    var prefix = new Blockly.FieldLabel('prefix');
    var between = new Blockly.FieldLabel('between');
    between.prefixField = prefix;
    input.appendField(before);
    input.appendField(after);
  
    // Preconditions
    assert.equal(input.fieldRow.length, 2);
    assert.equal(input.fieldRow[0], before);
    assert.equal(input.fieldRow[1], after);
  
    // Actual Tests
    input.insertFieldAt(1, between);
    assert.equal(input.fieldRow.length, 4);
    assert.equal(input.fieldRow[0], before);
    assert.equal(input.fieldRow[1], prefix);
    assert.equal(input.fieldRow[2], between);
    assert.equal(input.fieldRow[3], after);
  });

  it('Test insert field with suffix', function () {
    var ws = new Blockly.Workspace();
    var block = new Blockly.Block(ws);
    var input = new Blockly.Input(Blockly.DUMMY_INPUT, 'INPUT', block);
    var before = new Blockly.FieldLabel('before');
    var after = new Blockly.FieldLabel('after');
    var suffix = new Blockly.FieldLabel('suffix');
    var between = new Blockly.FieldLabel('between');
    between.suffixField = suffix;
    input.appendField(before);
    input.appendField(after);
  
    // Preconditions
    assert.equal(input.fieldRow.length, 2);
    assert.equal(input.fieldRow[0], before);
    assert.equal(input.fieldRow[1], after);
  
    // Actual Tests
    input.insertFieldAt(1, between);
    assert.equal(input.fieldRow.length, 4);
    assert.equal(input.fieldRow[0], before);
    assert.equal(input.fieldRow[1], between);
    assert.equal(input.fieldRow[2], suffix);
    assert.equal(input.fieldRow[3], after);
  });
});
