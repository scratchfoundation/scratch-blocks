'use strict';

describe('Test Names', function () {
  it('Test safe name', function () {
    var varDB = new Blockly.Names('window,door');
    assert.equal(varDB.safeName_(''), 'unnamed', 'SafeName empty.');
    assert.equal(varDB.safeName_('foobar'), 'foobar', 'SafeName ok.');
    assert.equal(varDB.safeName_('9lives'), 'my_9lives', 'SafeName number start.');
    assert.equal(varDB.safeName_('lives9'), 'lives9', 'SafeName number end.');
    assert.equal(varDB.safeName_('!@#$'), '____', 'SafeName special chars.');
    assert.equal(varDB.safeName_('door'), 'door', 'SafeName reserved.');
  });

  it('Test get name', function () {
    var varDB = new Blockly.Names('window,door');
    assert.equal(varDB.getName('Foo.bar', 'var'), 'Foo_bar', 'Name add #1.');
    assert.equal(varDB.getName('Foo.bar', 'var'), 'Foo_bar', 'Name get #1.');
    assert.equal(varDB.getName('Foo bar', 'var'), 'Foo_bar2', 'Name add #2.');
    assert.equal(varDB.getName('foo BAR', 'var'), 'Foo_bar2', 'Name get #2.');
    assert.equal(varDB.getName('door', 'var'), 'door2', 'Name add #3.');
    assert.equal(varDB.getName('Foo.bar', 'proc'), 'Foo_bar3', 'Name add #4.');
    assert.equal(varDB.getName('Foo.bar', 'var'), 'Foo_bar', 'Name get #1b.');
    assert.equal(varDB.getName('Foo.bar', 'proc'), 'Foo_bar3', 'Name get #4.');
  });

  it('Test function Names.getDistinctName', function () {
    var varDB = new Blockly.Names('window,door');
    assert.equal(varDB.getDistinctName('Foo.bar', 'var'), 'Foo_bar', 'Name distinct #1.');
    assert.equal(varDB.getDistinctName('Foo.bar', 'var'), 'Foo_bar2', 'Name distinct #2.');
    assert.equal(varDB.getDistinctName('Foo.bar', 'proc'), 'Foo_bar3', 'Name distinct #3.');
    varDB.reset();
    assert.equal(varDB.getDistinctName('Foo.bar', 'var'), 'Foo_bar', 'Name distinct #4.');
  });

  it('Test function Names.equals', function () {
    assert.isTrue(Blockly.Names.equals('Foo.bar', 'Foo.bar'), 'Name equals #1.');
    assert.isFalse(Blockly.Names.equals('Foo.bar', 'Foo_bar'), 'Name equals #2.');
    assert.isTrue(Blockly.Names.equals('Foo.bar', 'FOO.BAR'), 'Name equals #3.');
  });
});
