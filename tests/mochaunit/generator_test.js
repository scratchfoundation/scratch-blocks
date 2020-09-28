'use strict';

describe('Test Generator', function () {
  it('Test prefix', function () {
    var generator = new Blockly.Generator('INTERCAL');
    assert.equal(generator.prefixLines('', ''), '', 'Prefix nothing.');
    assert.equal(generator.prefixLines('Hello', '@'), '@Hello', 'Prefix a word.');
    assert.equal(generator.prefixLines('Hello\n', '12'), '12Hello\n', 'Prefix one line.');
    assert.equal(generator.prefixLines('Hello\nWorld\n', '***'), '***Hello\n***World\n', 'Prefix two lines.');
  });
});
