'use strict';

describe('Test utils', function () {
  it('Test function genUid', function () {
    var uuids = [];
    for (var i = 0; i < 1000; i++) {
      var uuid = Blockly.utils.genUid();
      assert.notIncludeMembers(uuids, [uuid], 'UUID different: ' + uuid);
      uuids.push(uuid);
    }
  });

  it('Test function addClass', function () {
    var p = document.createElement('p');
    Blockly.utils.addClass(p, 'one');
    assert.equal(p.className, 'one', 'Adding "one"');
    Blockly.utils.addClass(p, 'one');
    assert.equal(p.className, 'one', 'Adding duplicate "one"');
    Blockly.utils.addClass(p, 'two');
    assert.equal(p.className, 'one two', 'Adding "two"', 'one two');
    Blockly.utils.addClass(p, 'two');
    assert.equal(p.className, 'one two', 'Adding duplicate "two"', 'one two');
    Blockly.utils.addClass(p, 'three');
    assert.equal(p.className, 'one two three', 'Adding "three"');
  });

  it('Test function hasClass', function () {
    var p = document.createElement('p');
    p.className = ' one three  two three  ';
    assert.isTrue(Blockly.utils.hasClass(p, 'one'), 'Has "one"');
    assert.isTrue(Blockly.utils.hasClass(p, 'two'), 'Has "two"');
    assert.isTrue(Blockly.utils.hasClass(p, 'three'), 'Has "three"');
    assert.isFalse(Blockly.utils.hasClass(p, 'four'), 'Has no "four"');
    assert.isFalse(Blockly.utils.hasClass(p, 't'), 'Has no "t"');
  });

  it('Test function removeClass', function () {
    var p = document.createElement('p');
    p.className = ' one three  two three  ';
    Blockly.utils.removeClass(p, 'two');
    assert.equal(p.className, 'one three three', 'Removing "two"');
    Blockly.utils.removeClass(p, 'four');
    assert.equal(p.className, 'one three three', 'Removing "four"');
    Blockly.utils.removeClass(p, 'three');
    assert.equal(p.className, 'one', 'Removing "three"');
    Blockly.utils.removeClass(p, 'ne');
    assert.equal(p.className, 'one', 'Removing "ne"');
    Blockly.utils.removeClass(p, 'one');
    assert.equal(p.className, '', 'Removing "one"');
    Blockly.utils.removeClass(p, 'zero');
    assert.equal(p.className, '', 'Removing "zero"');
  });

  it('Test function shortestStringLength', function () {
    var len = Blockly.utils.shortestStringLength('one,two,three,four,five'.split(','));
    assert.equal(len, 3, 'Length of "one"');
    len = Blockly.utils.shortestStringLength('one,two,three,four,five,'.split(','));
    assert.equal(len, 0, 'Length of ""');
    len = Blockly.utils.shortestStringLength(['Hello World']);
    assert.equal(len, 11, 'List of one');
    len = Blockly.utils.shortestStringLength([]);
    assert.equal(len, 0, 'Empty list');
  });

  it('Test function commonWordPrefix', function () {
    var len = Blockly.utils.commonWordPrefix('one,two,three,four,five'.split(','));
    assert.equal(len, 0, 'No prefix');
    len = Blockly.utils.commonWordPrefix('Xone,Xtwo,Xthree,Xfour,Xfive'.split(','));
    assert.equal(len, 0, 'No word prefix');
    len = Blockly.utils.commonWordPrefix('abc de,abc de,abc de,abc de'.split(','));
    assert.equal(len, 6, 'Full equality');
    len = Blockly.utils.commonWordPrefix('abc deX,abc deY'.split(','));
    assert.equal(len, 4, 'One word prefix');
    len = Blockly.utils.commonWordPrefix('abc de,abc deY'.split(','));
    assert.equal(len, 4, 'Overflow no');
    len = Blockly.utils.commonWordPrefix('abc de,abc de Y'.split(','));
    assert.equal(len, 6, 'Overflow yes');
    len = Blockly.utils.commonWordPrefix(['Hello World']);
    assert.equal(len, 11, 'List of one');
    len = Blockly.utils.commonWordPrefix([]);
    assert.equal(len, 0, 'Empty list');
    len = Blockly.utils.commonWordPrefix('turn&nbsp;left,turn&nbsp;right'.split(','));
    assert.equal(len, 0, 'No prefix due to &amp;nbsp;');
    len = Blockly.utils.commonWordPrefix('turn\u00A0left,turn\u00A0right'.split(','));
    assert.equal(len, 0, 'No prefix due to \\u00A0');
  });

  it('Test function commonWordSuffix', function () {
    var len = Blockly.utils.commonWordSuffix('one,two,three,four,five'.split(','));
    assert.equal(len, 0, 'No suffix');
    len = Blockly.utils.commonWordSuffix('oneX,twoX,threeX,fourX,fiveX'.split(','));
    assert.equal(len, 0, 'No word suffix');
    len = Blockly.utils.commonWordSuffix('abc de,abc de,abc de,abc de'.split(','));
    assert.equal(len, 6, 'Full equality');
    len = Blockly.utils.commonWordSuffix('Xabc de,Yabc de'.split(','));
    assert.equal(len, 3, 'One word suffix');
    len = Blockly.utils.commonWordSuffix('abc de,Yabc de'.split(','));
    assert.equal(len, 3, 'Overflow no');
    len = Blockly.utils.commonWordSuffix('abc de,Y abc de'.split(','));
    assert.equal(len, 6, 'Overflow yes');
    len = Blockly.utils.commonWordSuffix(['Hello World']);
    assert.equal(len, 11, 'List of one');
    len = Blockly.utils.commonWordSuffix([]);
    assert.equal(len, 0, 'Empty list');
  });

  it('Test function tokenizeInterpolation', function () {
    var tokens = Blockly.utils.tokenizeInterpolation('');
    isEqualArrays(tokens, [], 'Null interpolation');
  
    tokens = Blockly.utils.tokenizeInterpolation('Hello');
    isEqualArrays(tokens, ['Hello'], 'No interpolation');
    
    tokens = Blockly.utils.tokenizeInterpolation('Hello%World');
    isEqualArrays(tokens, ['Hello%World'], 'Unescaped %.');
    
    tokens = Blockly.utils.tokenizeInterpolation('Hello%%World');
    isEqualArrays(tokens, ['Hello%World'], 'Escaped %.');
    
    tokens = Blockly.utils.tokenizeInterpolation('Hello %1 World');
    isEqualArrays(tokens, ['Hello ', 1, ' World'], 'Interpolation.');
    
    tokens = Blockly.utils.tokenizeInterpolation('%123Hello%456World%789');
    isEqualArrays(tokens, [123, 'Hello', 456, 'World', 789], 'Interpolations.');
    
    tokens = Blockly.utils.tokenizeInterpolation('%%%x%%0%00%01%');
    isEqualArrays(tokens, ['%%x%0', 0, 1, '%'], 'Torture interpolations.');
  
    Blockly.Msg = Blockly.Msg || {};
  
    Blockly.Msg.STRING_REF = 'test string';
    tokens = Blockly.utils.tokenizeInterpolation('%{bky_string_ref}');
    isEqualArrays(tokens, ['test string'], 'String table reference, lowercase');
    tokens = Blockly.utils.tokenizeInterpolation('%{BKY_STRING_REF}');
    isEqualArrays(tokens, ['test string'], 'String table reference, uppercase',);
  
    Blockly.Msg.WITH_PARAM = 'before %1 after';
    tokens = Blockly.utils.tokenizeInterpolation('%{bky_with_param}');
    isEqualArrays(tokens, ['before ', 1, ' after'], 'String table reference, with parameter');
  
    Blockly.Msg.RECURSE = 'before %{bky_string_ref} after';
    tokens = Blockly.utils.tokenizeInterpolation('%{bky_recurse}');
    isEqualArrays(tokens, ['before test string after'], 'String table reference, with subreference');
  
    // Error cases...
    tokens = Blockly.utils.tokenizeInterpolation('%{bky_undefined}');
    isEqualArrays(tokens, ['%{bky_undefined}'], 'Undefined string table reference');
  
    Blockly.Msg['1'] = 'Will not match';
    tokens = Blockly.utils.tokenizeInterpolation('before %{1} after');
    isEqualArrays(tokens, ['before %{1} after'], 'Invalid initial digit in string table reference');
  
    Blockly.Msg['TWO WORDS'] = 'Will not match';
    tokens = Blockly.utils.tokenizeInterpolation('before %{two words} after');
    isEqualArrays(tokens, ['before %{two words} after'], 'Invalid character in string table reference: space');
  
    Blockly.Msg['TWO-WORDS'] = 'Will not match';
    tokens = Blockly.utils.tokenizeInterpolation('before %{two-words} after');
    isEqualArrays(tokens, ['before %{two-words} after'], 'Invalid character in string table reference: dash');
  
    Blockly.Msg['TWO.WORDS'] = 'Will not match';
    tokens = Blockly.utils.tokenizeInterpolation('before %{two.words} after');
    isEqualArrays(tokens, ['before %{two.words} after'], 'Invalid character in string table reference: period');
  
    Blockly.Msg['AB&C'] = 'Will not match';
    tokens = Blockly.utils.tokenizeInterpolation('before %{ab&c} after');
    isEqualArrays(tokens, ['before %{ab&c} after'], 'Invalid character in string table reference: &');
  
    Blockly.Msg['UNCLOSED'] = 'Will not match';
    tokens = Blockly.utils.tokenizeInterpolation('before %{unclosed');
    isEqualArrays(tokens, ['before %{unclosed'], 'String table reference, with parameter');
  });

  it('Test function replaceMessageReferences', function () {
    Blockly.Msg = Blockly.Msg || {};
    Blockly.Msg.STRING_REF = 'test string';
  
    var resultString = Blockly.utils.replaceMessageReferences('');
    assert.equal(resultString, '', 'Empty string produces empty string');
  
    resultString = Blockly.utils.replaceMessageReferences('%{bky_string_ref}');
    assert.equal(resultString, 'test string', 'Message ref dereferenced.');
    resultString = Blockly.utils.replaceMessageReferences('before %{bky_string_ref} after');
    assert.equal(resultString, 'before test string after', 'Message ref dereferenced.');
  
    resultString = Blockly.utils.replaceMessageReferences('%1');
    assert.equal(resultString, '%1', 'Interpolation tokens ignored.');
    resultString = Blockly.utils.replaceMessageReferences('%1 %2');
    assert.equal(resultString, '%1 %2', 'Interpolation tokens ignored.');
    resultString = Blockly.utils.replaceMessageReferences('before %1 after');
    assert.equal(resultString, 'before %1 after', 'Interpolation tokens ignored.');
  
    resultString = Blockly.utils.replaceMessageReferences('%%');
    assert.equal(resultString, '%',  'Escaped %');
    resultString = Blockly.utils.replaceMessageReferences('%%{bky_string_ref}');
    assert.equal(resultString, '%{bky_string_ref}', 'Escaped %');
  
    resultString = Blockly.utils.replaceMessageReferences('%a');
    assert.equal(resultString, '%a', 'Unrecognized % escape code treated as literal');
  });
});
