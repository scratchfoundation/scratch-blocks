'use strict';

describe('xml_test.js', function () {
  var workspace;
  var XML_TEXT = ['<xml xmlns="http://www.w3.org/1999/xhtml">',
    '  <block type="controls_repeat_ext" inline="true" x="21" y="23">',
    '    <value name="TIMES">',
    '      <block type="math_number">',
    '        <field name="NUM">10</field>',
    '      </block>',
    '    </value>',
    '    <statement name="DO">',
    '      <block type="variables_set" inline="true">',
    '        <field name="VAR">item</field>',
    '        <value name="VALUE">',
    '          <block type="lists_create_empty"></block>',
    '        </value>',
    '        <next>',
    '          <block type="text_print" inline="false">',
    '            <value name="TEXT">',
    '              <block type="text">',
    '                <field name="TEXT">Hello</field>',
    '              </block>',
    '            </value>',
    '          </block>',
    '        </next>',
    '      </block>',
    '    </statement>',
    '  </block>',
    '</xml>'].join('\n');

  function helper_setUp() {
    workspace = new Blockly.Workspace();
    Blockly.defineBlocksWithJsonArray([{
      'type': 'field_variable_test_block',
      'message0': '%1',
      'args0': [
        {
          'type': 'field_variable',
          'name': 'VAR',
          'variable': 'item'
        }
      ]
    },
    {
      'type': 'field_serializable_test_block',
      'message0': '%1 %2',
      'args0': [
        {
          'type': 'field_label_serializable',
          'name': 'FIELD'
        },
        {
          "type": "field_input",
          "name": "TEXTINPUT",
          "text": "default"
        }
      ]
    }]);
  }

  function helper_tearDown() {
    workspace.dispose();
    delete Blockly.Blocks['field_variable_test_block'];
    delete Blockly.Blocks['field_serializable_test_block'];
  }

  /**
   * Check the values of the non variable field dom.
   * @param {!Element} fieldDom The xml dom of the non variable field.
   * @param {!string} name The expected name of the variable.
   * @param {!string} text The expected text of the variable.
   */
  function helper_checkNonVariableField(fieldDom, name, text) {
    assert.equal(fieldDom.getAttribute('name'), name);
    assert.equal(fieldDom.textContent, text);
    assert.notExists(fieldDom.getAttribute('id'));
    assert.notExists(fieldDom.getAttribute('variabletype'));
  }

  /**
   * Check the values of the variable field DOM.
   * @param {!Element} fieldDom The xml dom of the variable field.
   * @param {!string} name The expected name of the variable.
   * @param {!string} type The expected type of the variable.
   * @param {!string} id The expected id of the variable.
   * @param {!string} text The expected text of the variable.
   */
  function helper_checkVariableFieldDomValues(fieldDom, name, type, id, text) {
    assert.equal(fieldDom.getAttribute('name'), name);
    assert.equal(fieldDom.getAttribute('variabletype'), type);
    assert.equal(fieldDom.getAttribute('id'), id);
    assert.equal(fieldDom.textContent, text);
  }

  /**
   * Check the values of the variable DOM.
   * @param {!Element} variableDom The xml dom of the variable.
   * @param {!string} type The expected type of the variable.
   * @param {!string} id The expected id of the variable.
   * @param {!string} text The expected text of the variable.
   */
  function helper_checkVariableDomValues(variableDom, type, id, text) {
    assert.equal(variableDom.getAttribute('type'), type);
    assert.equal(variableDom.getAttribute('id'), id);
    assert.equal(variableDom.textContent, text);
  }

  it('Test text to dom', function () {
    var dom = Blockly.Xml.textToDom(XML_TEXT);
    assert.equal(dom.nodeName, 'xml', 'XML tag');
    assert.equal(dom.getElementsByTagName('block').length, 6, 'Block tags');
  });

  it('Test dom to text', function () {
    var dom = Blockly.Xml.textToDom(XML_TEXT);
    var text = Blockly.Xml.domToText(dom);
    assert.equal(text.replace(/\s+/g, ''), XML_TEXT.replace(/\s+/g, ''), 'Round trip');
  });

  it('Test dom to workspace backward compatibility', function () {
    helper_setUp();
    var stub_genUid = stub(Blockly.utils, 'genUid').callsFake(function () {
      return '1';
    });

    var dom = Blockly.Xml.textToDom(
      '<xml>' +
      '  <block type="field_variable_test_block" id="block_id">' +
      '    <field name="VAR">name1</field>' +
      '  </block>' +
      '</xml>');
    Blockly.Xml.domToWorkspace(dom, workspace);
    assert.equal(workspace.getAllBlocks().length, 1, 'Block count');
    helper_checkVariableValues(workspace, 'name1', '', '1');

    helper_tearDown();
    stub_genUid.restore();
  });

  it('Test dom to workspace with variables at top', function () {
    helper_setUp();

    var dom = Blockly.Xml.textToDom(
      '<xml>' +
      '  <variables>' +
      '    <variable type="type1" id="id1">name1</variable>' +
      '    <variable type="type2" id="id2">name2</variable>' +
      '    <variable type="" id="id3">name3</variable>' +
      '  </variables>' +
      '  <block type="field_variable_test_block">' +
      '    <field name="VAR" id="id3" variabletype="">name3</field>' +
      '  </block>' +
      '</xml>');
    Blockly.Xml.domToWorkspace(dom, workspace);
    assert.equal(workspace.getAllBlocks().length, 1, 'Block count');
    helper_checkVariableValues(workspace, 'name1', 'type1', 'id1');
    helper_checkVariableValues(workspace, 'name2', 'type2', 'id2');
    helper_checkVariableValues(workspace, 'name3', '', 'id3');

    helper_tearDown();
  });

  it('Test dom to workspace with duplicate variable tags', function () {
    // Expect thrown Error because of duplicate 'variables' tag
    helper_setUp();

    assert.throws(function () {
      var dom = Blockly.Xml.textToDom(
        '<xml>' +
        '  <variables>' +
        '  </variables>' +
        '  <variables>' +
        '  </variables>' +
        '</xml>');
      Blockly.Xml.domToWorkspace(dom, workspace);
    }, Error);

    helper_tearDown();
  });

  it('Test dom to workspace with variable type missing', function () {
    helper_setUp();

    assert.throws(function () {
      var dom = Blockly.Xml.textToDom(
        '<xml>' +
        '  <variables>' +
        '    <variable id="id1">name1</variable>' +
        '  </variables>' +
        '  <block type="field_variable_test_block">' +
        '    <field name="VAR" id="id1" variabletype="">name3</field>' +
        '  </block>' +
        '</xml>');
      Blockly.Xml.domToWorkspace(dom, workspace);
    }, Error);

    helper_tearDown();
  });

  it('Test dom to workspace with variables type mismatch', function () {
    helper_setUp();

    assert.throws(function () {
      var dom = Blockly.Xml.textToDom(
        '<xml>' +
        '  <variables>' +
        '    <variable type="type1" id="id1">name1</variable>' +
        '  </variables>' +
        '  <block type="field_variable_test_block">' +
        '    <field name="VAR" id="id1" variabletype="">name1</field>' +
        '  </block>' +
        '</xml>');
      Blockly.Xml.domToWorkspace(dom, workspace);
    });

    helper_tearDown();
  });

  it('Test dom to pertty text', function () {
    var dom = Blockly.Xml.textToDom(XML_TEXT);
    var text = Blockly.Xml.domToPrettyText(dom);
    assert.equal(text.replace(/\s+/g, ''), XML_TEXT.replace(/\s+/g, ''), 'Round trip');
  });

  it('Test append dom to workspace', function () {
    // Tests the that appendDomToWorkspace works in a headless mode.
    Blockly.Blocks.test_block = {
      init: function () {
        this.jsonInit({
          message0: 'test',
        });
      }
    };

    var dom = Blockly.Xml.textToDom(
      '<xml xmlns="http://www.w3.org/1999/xhtml">' +
      '  <block type="test_block" inline="true" x="21" y="23">' +
      '  </block>' +
      '</xml>');
    var workspace = new Blockly.Workspace();
    Blockly.Xml.appendDomToWorkspace(dom, workspace);
    assert.equal(workspace.getAllBlocks().length, 1, 'Block count');
    var newBlockIds = Blockly.Xml.appendDomToWorkspace(dom, workspace);
    assert.equal(workspace.getAllBlocks().length, 2, 'Block count');
    assert.equal(newBlockIds.length, 1, 'Number of new block ids');

    delete Blockly.Blocks.test_block;
    workspace.dispose();
  });

  it('Test field to dom with FieldVariable default case', function () {
    helper_setUp();
    var stub_genUid = stub(Blockly.utils, 'genUid')
      .onFirstCall().returns('1')
      .onSecondCall().returns('2');


    Blockly.Events.disable();
    var block = new Blockly.Block(workspace, 'field_variable_test_block');
    Blockly.Events.enable();

    var resultFieldDom = Blockly.Xml.blockToDom(block).childNodes[0];
    helper_checkVariableFieldDomValues(resultFieldDom, 'VAR', '', '2', 'item');

    helper_tearDown();
    stub_genUid.restore();
  });

  it('Test field to dom with FieldAngle ', function () {
    Blockly.defineBlocksWithJsonArray([{
      "type": "field_angle_test_block",
      "message0": "%1",
      "args0": [
        {
          "type": "field_angle",
          "name": "VAR",
          "angle": 90
        }
      ],
    }]);
    helper_setUp();

    var block = new Blockly.Block(workspace, 'field_angle_test_block');
    var resultFieldDom = Blockly.Xml.blockToDom(block).childNodes[0];
    helper_checkNonVariableField(resultFieldDom, 'VAR', '90');
    delete Blockly.Blocks.field_angle_block;

    helper_tearDown();
  });

  it('Test variable to dom with one variable', function () {
    helper_setUp();
    var stub_genUid = stub(Blockly.utils, 'genUid').callsFake(function () {
      return '1';
    });

    workspace.createVariable('name1');
    var resultDom = Blockly.Xml.variablesToDom(workspace.getAllVariables());
    assert.equal(resultDom.children.length, 1);
    var resultVariableDom = resultDom.children[0];
    assert.equal(resultVariableDom.textContent, 'name1');
    assert.equal(resultVariableDom.getAttribute('type'), '');
    assert.equal(resultVariableDom.getAttribute('id'), '1');

    helper_tearDown();
    stub_genUid.restore();
  });

  it('Test variable to dom with two variable one block', function () {
    helper_setUp();

    workspace.createVariable('name1', '', 'id1');
    workspace.createVariable('name2', 'type2', 'id2');
    // If events are enabled during block construction, it will create a default
    // variable.
    Blockly.Events.disable();
    var block = new Blockly.Block(workspace, 'field_variable_test_block');
    block.inputList[0].fieldRow[0].setValue('id1');
    Blockly.Events.enable();

    var resultDom = Blockly.Xml.variablesToDom(workspace.getAllVariables());
    assert.equal(resultDom.children.length, 2);
    helper_checkVariableDomValues(resultDom.children[0], '', 'id1', 'name1');
    helper_checkVariableDomValues(resultDom.children[1], 'type2', 'id2', 'name2');

    helper_tearDown();
  });

  it('Test serializable field', function () {
    helper_setUp();

    var block = new Blockly.Block(workspace, 'field_serializable_test_block');
    block.getField('FIELD').setValue('serialized');

    var resultDom = Blockly.Xml.blockToDom(block).childNodes[0];
    assert.equal(resultDom.textContent, 'serialized');
    assert.equal(resultDom.getAttribute('name'), 'FIELD');

    helper_tearDown();
  });

  it('Ttest non-serializable field', function () {
    helper_setUp();

    var block = new Blockly.Block(workspace, 'field_serializable_test_block');
    block.getField('FIELD').SERIALIZABLE = false;
    block.getField('FIELD').setValue('serialized');

    var resultDom = Blockly.Xml.blockToDom(block).childNodes[0];
    assert.equal(resultDom.textContent, 'default');
    assert.equal(resultDom.getAttribute('name'), 'TEXTINPUT');

    helper_tearDown();
  });

  it('test_variableFieldXml_caseSensitive', function () {
    var id = 'testId';
    var type = 'testType';
    var name = 'testName';

    var mockVariableModel = {
      type: type,
      name: name,
      getId: function () {
        return id;
      }
    };

    var generatedXml =
      Blockly.Variables.generateVariableFieldXml_(mockVariableModel);
    var goldenXml =
      '<field name="VARIABLE"' +
      ' id="' + id + '"' +
      ' variabletype="' + type + '"' +
      '>' + name + '</field>';
    assert.equal(generatedXml, goldenXml);
  });
});
