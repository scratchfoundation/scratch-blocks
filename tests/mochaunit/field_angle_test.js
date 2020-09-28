'use strict';

describe('Test FieldAngle', function () {
  it('Test constructor', function () {
    assert.equal(new Blockly.FieldAngle().getValue(), '0');
    assert.equal(new Blockly.FieldAngle(null).getValue(), '0');
    assert.equal(new Blockly.FieldAngle(undefined).getValue(), '0');
    assert.equal(new Blockly.FieldAngle(1).getValue(), '1');
    assert.equal(new Blockly.FieldAngle(1.5).getValue(), '1.5');
    assert.equal(new Blockly.FieldAngle('2').getValue(), '2');
    assert.equal(new Blockly.FieldAngle('2.5').getValue(), '2.5');
  
    // Bad values
    assert.equal(new Blockly.FieldAngle('bad').getValue(), '0');
    assert.equal(new Blockly.FieldAngle(NaN).getValue(), '0');
  });

  it('Test construct from json', function () {
    assert.equal(Blockly.FieldAngle.fromJson({}).getValue(), '0');
    assert.equal(Blockly.FieldAngle.fromJson({ angle: 1 }).getValue(), '1');
  });
});
