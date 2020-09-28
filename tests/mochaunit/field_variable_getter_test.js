'use strict';

describe('Test FieldVariableGetter', function () {
  it('Test constructro', function () {
    var field = new Blockly.FieldVariableGetter('text', 'name');
    // The field does not have a variable until after init() is called.
    assert.equal(field.getText(), '');
    assert.equal(field.getValue(), '');
  });

  it('Test non-editable field without source block', function () {
    var field = new Blockly.FieldVariableGetter('text', 'name');
    // EDITABLE is true by default, but without a source block a field can't be
    // edited.
    assert.isFalse(field.isCurrentlyEditable(),
      'Field without a block is not editable');
  });

  it('Test non-editable field with editable source block',function () {
    var field = new Blockly.FieldVariableGetter('text', 'name');

    var editableBlock = {
      isEditable: function () {
        return true;
      }
    };
  
    field.sourceBlock_ = editableBlock;
  
    // Variable getter fields aren't user editable.
    assert.isFalse(field.isCurrentlyEditable(),
      'Variable getter field should not be editable');
  });

  it('Test field is serializable', function () {
    var field = new Blockly.FieldVariableGetter('text', 'name');
    // Variable getter fields are serializable by default.
    assert.isTrue(field.SERIALIZABLE, 'Variable getter field should be serializable');
  });
});
