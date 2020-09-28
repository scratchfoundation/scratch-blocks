'use strict';

describe('Test Procedures', function () {
  var workspace;

  function helper_setUp() {
    Blockly.Blocks[Blockly.PROCEDURES_CALL_BLOCK_TYPE] = {
      init: function () {
        this.procCode_ = '';
        this.setPreviousStatement(true);
        this.setNextStatement(true);
      },
      getProcCode: function () {
        return this.procCode_;
      }
    };
    Blockly.Blocks['foo'] = {
      init: function () {
        this.jsonInit({
          "message0": "foo",
          "previousStatement": null,
          "nextStatement": null
        });
        this.setNextStatement(true);
      }
    };
    Blockly.Blocks['loop'] = {
      init: function () {
        this.jsonInit({
          message0: 'forever %1',
          "args0": [
            {
              "type": "input_statement",
              "name": "SUBSTACK"
            }
          ]
        });
      }
    };

    workspace = new Blockly.Workspace();
  }

  function helper_tearDown() {
    delete Blockly.Blocks[Blockly.PROCEDURES_CALL_BLOCK_TYPE];
    delete Blockly.Blocks['foo'];
    delete Blockly.Blocks['loop'];
    workspace.dispose();
  }

  it('Find one caller', function () {
    var xml = '<xml xmlns="http://www.w3.org/1999/xhtml">' +
      '<variables></variables>' +
      '<block type="' + Blockly.PROCEDURES_CALL_BLOCK_TYPE +
      '" id="test_1" x="301" y="516">' +
      '</block>' +
      '</xml>';
    helper_setUp();

    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), workspace);
    workspace.getBlockById('test_1').procCode_ = 'test_procedure';
    var callers = Blockly.Procedures.getCallers('test_procedure', workspace,
      { id: '' }, false);
    assert.equal(callers.length, 1);
    assert.equal(callers[0].id, 'test_1');

    helper_tearDown();
  });

  it('Test find callers no recursion', function () {
    var xml = '<xml xmlns="http://www.w3.org/1999/xhtml">' +
      '<variables></variables>' +
      '<block type="' + Blockly.PROCEDURES_CALL_BLOCK_TYPE +
      '" id="test_1" x="301" y="516">' +
      '</block>' +
      '</xml>';
    helper_setUp();

    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), workspace);
    workspace.getBlockById('test_1').procCode_ = 'test_procedure';
    var rootBlock = workspace.getBlockById('test_1');
    var callers = Blockly.Procedures.getCallers('test_procedure', workspace,
      rootBlock, false /* allowRecursion */);

    // There was a single call to this function, but it was in a stack that
    // should be ignored.
    assert.equal(callers.length, 0);

    helper_tearDown();
  });

  it('Test find callers allowed recursion', function () {
    var xml = '<xml xmlns="http://www.w3.org/1999/xhtml">' +
      '<variables></variables>' +
      '<block type="' + Blockly.PROCEDURES_CALL_BLOCK_TYPE +
      '" id="test_1" x="301" y="516">' +
      '</block>' +
      '</xml>';
    helper_setUp();

    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), workspace);
    workspace.getBlockById('test_1').procCode_ = 'test_procedure';
    var rootBlock = workspace.getBlockById('test_1');
    var callers = Blockly.Procedures.getCallers('test_procedure', workspace,
      rootBlock, true /* allowRecursion */);

    // There was a single call to this function, in the same stack as the
    // definition root.  Recursion is allowed, so it should be found.
    assert.equal(callers.length, 1);
    assert.equal(callers[0].id, 'test_1');

    helper_tearDown();
  });

  it('Test find no caller', function () {
    var xml = '<xml xmlns="http://www.w3.org/1999/xhtml">' +
      '<variables></variables>' +
      '<block type="' + Blockly.PROCEDURES_CALL_BLOCK_TYPE +
      '" id="test_1" x="301" y="516">' +
      '</block>' +
      '</xml>';
    helper_setUp();

    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), workspace);
    var callers = Blockly.Procedures.getCallers('test_procedure', workspace,
      { id: '' }, false);

    assert.equal(callers.length, 0);

    helper_tearDown();
  });

  it('Test find wrong proCode', function () {
    var xml = '<xml xmlns="http://www.w3.org/1999/xhtml">' +
      '<variables></variables>' +
      '<block type="' + Blockly.PROCEDURES_CALL_BLOCK_TYPE +
      '" id="test_1" x="301" y="516">' +
      '</block>' +
      '</xml>';
    helper_setUp();

    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), workspace);
    workspace.getBlockById('test_1').procCode_ = 'wrong procedure';
    var callers = Blockly.Procedures.getCallers('test_procedure', workspace,
      { id: '' }, false);

    assert.equal(callers.length, 0);

    helper_tearDown();
  });

  it('Test find caller on statement input', function () {
    var xml = '<xml xmlns="http://www.w3.org/1999/xhtml">' +
      '<variables></variables>' +
      '<block type="' + Blockly.PROCEDURES_CALL_BLOCK_TYPE +
      '" id="test_3" x="301" y="516">' +
      '</block>' +
      '</xml>';
    helper_setUp();

    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), workspace);
    workspace.getBlockById('test_3').procCode_ = 'test_procedure';
    var callers = Blockly.Procedures.getCallers('test_procedure', workspace,
      { id: '' }, false);

    // There should be one caller, connected to a stack on a statement input.
    assert.equal(callers.length, 1);
    assert.equal(callers[0].id, 'test_3');

    helper_tearDown();
  });

  it('Test find callers on multiple stacks', function () {
    var xml = '<xml xmlns="http://www.w3.org/1999/xhtml">' +
      '<variables></variables>' +
      '<block type="' + Blockly.PROCEDURES_CALL_BLOCK_TYPE +
      '" id="test_2" x="301" y="516">' +
      '</block>' +
      '</xml>';
    helper_setUp();

    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), workspace);
    workspace.getBlockById('test_2').procCode_ = 'test_procedure';
    var callers = Blockly.Procedures.getCallers('test_procedure', workspace,
      { id: '' }, false);

    // There should be one caller, but multiple stacks in the workspace.
    assert.equal(callers.length, 1);
    assert.equal(callers[0].id, 'test_2');

    helper_tearDown();
  });

  it('Test find multiple callers', function () {
    var xml = '<xml xmlns="http://www.w3.org/1999/xhtml">' +
      '<block type="' + Blockly.PROCEDURES_CALL_BLOCK_TYPE +
      '" id="test_1"></block>' +
      '<block type="' + Blockly.PROCEDURES_CALL_BLOCK_TYPE +
      '" id="test_2"></block>' +
      '</xml>';
    helper_setUp();

    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), workspace);
    workspace.getBlockById('test_1').procCode_ = 'test_procedure';
    workspace.getBlockById('test_2').procCode_ = 'test_procedure';
    var callers = Blockly.Procedures.getCallers('test_procedure', workspace,
      { id: '' }, false);

    // There should be two callers, on two different stacks.
    assert.equal(callers.length, 2);
    // Order doesn't matter.
    isEqualArraysNoOrder([callers[0].id, callers[1].id], ['test_1', 'test_2']);

    helper_tearDown();
  });

  it('Delete prodecure no callers', function () {
    var xml = '<xml xmlns="http://www.w3.org/1999/xhtml">' +
      '<block type="' + Blockly.PROCEDURES_CALL_BLOCK_TYPE +
      '" id="test_1" x="301" y="516"></block>' +
      '<block type="foo" id="test_2"></block>' +
      '<block type="foo" id="test_3"></block>' +
      '</xml>';
    helper_setUp();

    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), workspace);
    workspace.getBlockById('test_1').procCode_ = 'test_procedure';
    var rootBlock = workspace.getBlockById('test_1');
    assert.isTrue(Blockly.Procedures.deleteProcedureDefCallback('test_procedure', rootBlock));
    // The other two blocks should stick around.
    assert.equal(workspace.getTopBlocks().length, 2);

    helper_tearDown();
  });

  it('Test delete procedure recursive caller', function () {
    // If there is a caller but it's a part of stack starting with definitionRoot,
    // the stack should be deleted.

    var xml = '<xml xmlns="http://www.w3.org/1999/xhtml">' +
      '<block type="loop" id="test_1">' +
        '<statement name="SUBSTACK">' +
          '<block type="foo" id="test_2">' +
            '<next>' +
              '<block type="' + Blockly.PROCEDURES_CALL_BLOCK_TYPE +
              '" id="test_3"></block>' +
            '</next></block>' +
        '</statement>' +
      '</block>' +
    '</xml>';
    helper_setUp();

    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), workspace);
    workspace.getBlockById('test_3').procCode_ = 'test_procedure';
    var rootBlock = workspace.getBlockById('test_1');
    assert.isTrue(Blockly.Procedures.deleteProcedureDefCallback('test_procedure', rootBlock));
    assert.equal(workspace.getTopBlocks().length, 0);

    helper_tearDown();
  });

  it('Test delete procedure no recursive caller', function () {
    var xml = '<xml xmlns="http://www.w3.org/1999/xhtml">' +
      '<block type="' + Blockly.PROCEDURES_CALL_BLOCK_TYPE +
      '" id="test_1" x="301" y="516"></block>' +
      '<block type="foo" id="test_2"></block>' +
      '<block type="foo" id="test_3"></block>' +
    '</xml>';
    helper_setUp();

    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), workspace);
    workspace.getBlockById('test_1').procCode_ = 'test_procedure';
    var rootBlock = workspace.getBlockById('test_2');
    assert.isFalse(Blockly.Procedures.deleteProcedureDefCallback('test_procedure', rootBlock));
    // All blocks should stay on the workspace.
    assert.equal(workspace.getTopBlocks().length, 3);

    helper_tearDown();
  });
});
