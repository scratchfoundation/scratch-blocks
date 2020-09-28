'use strict';

describe('Test Field', function () {
  it('Test editble field without source block', function () {
    var field = new Blockly.Field("Dummy text");
    // EDITABLE is true by default, but without a source block a field can't be
    // edited.
    assert.isFalse(field.isCurrentlyEditable(),
      'Field without a block is not editable');
    field.EDITABLE = false;
    assert.isFalse(field.isCurrentlyEditable(),
      'Field without a block is not editable');
  });

  it('Test editable field with editable source block', function () {
    var editableBlock = {
      isEditable: function () {
        return true;
      }
    };
  
    var field = new Blockly.Field("Dummy text");
    field.sourceBlock_ = editableBlock;
  
    assert.isTrue(field.isCurrentlyEditable(),
      'Editable field with editable block is editable');
  });

  it('Test non-editable field with editable source block', function () {
    var editableBlock = {
      isEditable: function () {
        return true;
      }
    };
  
    var field = new Blockly.Field("Dummy text");
    field.sourceBlock_ = editableBlock;
    field.EDITABLE = false;
  
    assert.isFalse(field.isCurrentlyEditable(),
      'Non-editable field with editable block is not editable');
  });

  it('Test editable field with non-editable source block', function () {
    var nonEditableBlock = {
      isEditable: function () {
        return false;
      }
    };
  
    var field = new Blockly.Field("Dummy text");
    field.sourceBlock_ = nonEditableBlock;
  
    assert.isFalse(field.isCurrentlyEditable(),
      'Editable field with non-editable block is not editable');
  });

  it('Test non-editable field with non-editable block', function () {
    var nonEditableBlock = {
      isEditable: function () {
        return false;
      }
    };
  
    var field = new Blockly.Field("Dummy text");
    field.sourceBlock_ = nonEditableBlock;
    field.EDITABLE = false;
  
    assert.isFalse(field.isCurrentlyEditable(),
      'Non-editable field with non-editable block is not editable');
  });

  it('Test custom field', function () {
    var CustomFieldType = function (value) {
      CustomFieldType.superClass_.constructor.call(this, value);
    };
    goog.inherits(CustomFieldType, Blockly.Field);
  
    CustomFieldType.fromJson = function (options) {
      return new CustomFieldType(options['value']);
    };
  
    var json = {
      type: 'field_custom_test',
      value: 'ok'
    };
  
    // before registering
    var field = Blockly.Field.fromJson(json);
    assert.notExists(field);
  
    Blockly.Field.register('field_custom_test', CustomFieldType);
  
    // after registering
    field = Blockly.Field.fromJson(json);
    assert.exists(field);
    assert.equal(field.getValue(), 'ok');
  });
});
