'use strict';

describe('Test FieldNumber', function () {
  it('Test constructor', function () {
    // No arguments
    var field = new Blockly.FieldNumber();
    assert.equal(field.getValue(), '0');

    // Unlike blockly, scratch-blocks doesn't store min, max, and precision.
    // TODO: Update this to check the restrictor, based on min, max, and precision.
    assert.equal(field.min_, undefined);
    assert.equal(field.max_, undefined);
    assert.equal(field.precision_, undefined);

    // Numeric values
    field = new Blockly.FieldNumber(1);
    assert.equal(field.getValue(), '1');
    field = new Blockly.FieldNumber(1.5);
    assert.equal(field.getValue(), '1.5');

    // String value
    field = new Blockly.FieldNumber('2');
    assert.equal(field.getValue(), '2');
    field = new Blockly.FieldNumber('2.5');
    assert.equal(field.getValue(), '2.5');

    // All values
    field = new Blockly.FieldNumber(
      /* value */ 0,
      /* min */ -128,
      /* max */ 127,
      /* precision */ 1);
    // Unlike blockly, scratch-blocks doesn't store min, max, and precision.
    assert.equal(field.getValue(), '0');
    assert.equal(field.min_, undefined);
    assert.equal(field.max_, undefined);
    assert.equal(field.precision_, undefined);

    // Bad value defaults to '0'
    field = new Blockly.FieldNumber('bad');
    assert.equal(field.getValue(), '0');
    field = new Blockly.FieldNumber(NaN);
    assert.equal(field.getValue(), '0');
  });

  it('Test construct from json', function () {
    assert.equal(Blockly.FieldNumber.fromJson({}).getValue(), '0');
    assert.equal(Blockly.FieldNumber.fromJson({ value: 1 }).getValue(), '1');
  
    // All options, but scratch-blocks parses min/max/precision differently from
    // Blockly. See notes in field_number.js.
    var field = Blockly.FieldNumber.fromJson({
      value: 0,
      min: -128,
      max: 127,
      precision: 1
    });
    assert.equal(field.getValue(), '0');
  });
});
