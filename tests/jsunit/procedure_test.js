/**
 * @license
 * Blockly Tests
 *
 * Copyright 2017 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

goog.require('goog.testing');
goog.require('goog.testing.MockControl');

var workspace;
//var mockControl_;

function procedureTest_setUp() {
  Blockly.Blocks[Blockly.PROCEDURES_CALL_BLOCK_TYPE] = {
    init: function() {
      this.procCode_ = '';
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    },
    getProcCode: function() {
      return this.procCode_;
    }
  };
  Blockly.Blocks['foo'] = {
    init: function() {
      this.jsonInit({
        "message0": "foo",
        "previousStatement": null,
        "nextStatement": null
      });
      this.setNextStatement(true);
    }
  };
  Blockly.Blocks['loop'] = {
    init: function() {
      this.jsonInit({ message0: 'forever %1',
      "args0": [
        {
          "type": "input_statement",
          "name": "SUBSTACK"
        }
      ]});
    }
  };


  workspace = new Blockly.Workspace();
  //mockControl_ = new goog.testing.MockControl();
}

function procedureTest_tearDown() {
  delete Blockly.Blocks[Blockly.PROCEDURES_CALL_BLOCK_TYPE];
  delete Blockly.Blocks['foo'];
  delete Blockly.Blocks['loop'];
  //mockControl_.$tearDown();
  workspace.dispose();
}

function test_findCallers_simple_oneCaller() {
  var xml = '<xml xmlns="http://www.w3.org/1999/xhtml">' +
    '<variables></variables>' +
    '<block type="' + Blockly.PROCEDURES_CALL_BLOCK_TYPE +
    '" id="test_1" x="301" y="516">' +
    '</block>' +
  '</xml>';
  procedureTest_setUp();
  try {
    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), workspace);
    workspace.getBlockById('test_1').procCode_ = 'test_procedure';
    var callers = Blockly.Procedures.getCallers('test_procedure', workspace,
        {id: ''}, false);
    assertEquals(1, callers.length);
    assertEquals('test_1', callers[0].id);
  }
  finally {
    procedureTest_tearDown();
  }
}

function test_findCallers_noRecursion() {
  var xml = '<xml xmlns="http://www.w3.org/1999/xhtml">' +
    '<variables></variables>' +
    '<block type="' + Blockly.PROCEDURES_CALL_BLOCK_TYPE +
    '" id="test_1" x="301" y="516">' +
    '</block>' +
  '</xml>';
  procedureTest_setUp();
  try {
    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), workspace);
    workspace.getBlockById('test_1').procCode_ = 'test_procedure';
    var rootBlock = workspace.getBlockById('test_1');
    var callers = Blockly.Procedures.getCallers('test_procedure', workspace,
        rootBlock, false /* allowRecursion */);

    // There was a single call to this function, but it was in a stack that
    // should be ignored.
    assertEquals(0, callers.length);
  }
  finally {
    procedureTest_tearDown();
  }
}

function test_findCallers_allowRecursion() {
  var xml = '<xml xmlns="http://www.w3.org/1999/xhtml">' +
    '<variables></variables>' +
    '<block type="' + Blockly.PROCEDURES_CALL_BLOCK_TYPE +
    '" id="test_1" x="301" y="516">' +
    '</block>' +
  '</xml>';
  procedureTest_setUp();
  try {
    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), workspace);
    workspace.getBlockById('test_1').procCode_ = 'test_procedure';
    var rootBlock = workspace.getBlockById('test_1');
    var callers = Blockly.Procedures.getCallers('test_procedure', workspace,
        rootBlock, true /* allowRecursion */);

    // There was a single call to this function, in the same stack as the
    // definition root.  Recursion is allowed, so it should be found.
    assertEquals(1, callers.length);
    assertEquals('test_1', callers[0].id);
  }
  finally {
    procedureTest_tearDown();
  }
}

function test_findCallers_simple_noCallers() {
  var xml = '<xml xmlns="http://www.w3.org/1999/xhtml">' +
    '<variables></variables>' +
    '<block type="foo" id="test_1" x="301" y="516">' +
    '</block>' +
  '</xml>';
  procedureTest_setUp();
  try {
    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), workspace);
    var callers = Blockly.Procedures.getCallers('test_procedure', workspace,
        {id: ''}, false);

    // There weren't even blocks of type procedures_callnoreturn.
    assertEquals(0, callers.length);
  }
  finally {
    procedureTest_tearDown();
  }
}

function test_findCallers_wrongProcCode() {
  var xml = '<xml xmlns="http://www.w3.org/1999/xhtml">' +
    '<variables></variables>' +
    '<block type="' + Blockly.PROCEDURES_CALL_BLOCK_TYPE +
    '" id="test_1" x="301" y="516">' +
    '</block>' +
  '</xml>';
  procedureTest_setUp();
  try {
    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), workspace);
    workspace.getBlockById('test_1').procCode_ = 'wrong procedure';
    var callers = Blockly.Procedures.getCallers('test_procedure', workspace,
        {id: ''}, false);

    // There was a procedure_callnoreturn call, but it had the wrong procCode.
    assertEquals(0, callers.length);
  }
  finally {
    procedureTest_tearDown();
  }
}

function test_findCallers_onStatementInput() {
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
  procedureTest_setUp();
  try {
    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), workspace);
    workspace.getBlockById('test_3').procCode_ = 'test_procedure';
    var callers = Blockly.Procedures.getCallers('test_procedure', workspace,
        {id: ''}, false);

    // There should be one caller, connected to a stack on a statement input.
    assertEquals(1, callers.length);
    assertEquals('test_3', callers[0].id);
  }
  finally {
    procedureTest_tearDown();
  }
}

function test_findCallers_multipleStacks() {
  var xml = '<xml xmlns="http://www.w3.org/1999/xhtml">' +
    '<block type="foo" id="test_1"></block>' +
    '<block type="' + Blockly.PROCEDURES_CALL_BLOCK_TYPE +
    '" id="test_2"></block>'+
    '<block type="foo" id="test_1"></block>' +
  '</xml>';
  procedureTest_setUp();
  try {
    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), workspace);
    workspace.getBlockById('test_2').procCode_ = 'test_procedure';
    var callers = Blockly.Procedures.getCallers('test_procedure', workspace,
        {id: ''}, false);

    // There should be one caller, but multiple stacks in the workspace.
    assertEquals(1, callers.length);
    assertEquals('test_2', callers[0].id);
  }
  finally {
    procedureTest_tearDown();
  }
}

function test_findCallers_multipleCallers() {
  var xml = '<xml xmlns="http://www.w3.org/1999/xhtml">' +
    '<block type="' + Blockly.PROCEDURES_CALL_BLOCK_TYPE +
    '" id="test_1"></block>' +
    '<block type="' + Blockly.PROCEDURES_CALL_BLOCK_TYPE +
    '" id="test_2"></block>'+
  '</xml>';
  procedureTest_setUp();
  try {
    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), workspace);
    workspace.getBlockById('test_2').procCode_ = 'test_procedure';
    workspace.getBlockById('test_1').procCode_ = 'test_procedure';
    var callers = Blockly.Procedures.getCallers('test_procedure', workspace,
        {id: ''}, false);

    // There should be two callers, on two different stacks.
    assertEquals(2, callers.length);
    // Order doesn't matter.
    assertTrue(callers[0].id == 'test_1' || callers[0].id == 'test_2');
    assertTrue(callers[1].id == 'test_1' || callers[1].id == 'test_2');
  }
  finally {
    procedureTest_tearDown();
  }
}

function test_deleteProcedure_noCallers() {
  // If there are no callers, the stack should be deleted.
  procedureTest_setUp();
  var xml = '<xml xmlns="http://www.w3.org/1999/xhtml">' +
    '<block type="' + Blockly.PROCEDURES_CALL_BLOCK_TYPE +
    '" id="test_1" x="301" y="516"></block>' +
    '<block type="foo" id="test_2"></block>' +
    '<block type="foo" id="test_3"></block>' +
    '</block>' +
  '</xml>';
  try {
    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), workspace);
    workspace.getBlockById('test_1').procCode_ = 'test_procedure';
    var rootBlock = workspace.getBlockById('test_1');
    assertTrue(Blockly.Procedures.deleteProcedureDefCallback('test_procedure',
        rootBlock));
    // The other two blocks should stick around.
    assertEquals(2, workspace.getTopBlocks().length);
  }
  finally {
    procedureTest_tearDown();
  }
}

function test_deleteProcedure_recursiveCaller() {
  // If there is a caller but it's a part of stack starting with definitionRoot,
  // the stack should be deleted.

  procedureTest_setUp();

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
    '</block>' +
  '</xml>';
  try {
    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), workspace);
    workspace.getBlockById('test_3').procCode_ = 'test_procedure';
    var rootBlock = workspace.getBlockById('test_1');
    assertTrue(Blockly.Procedures.deleteProcedureDefCallback('test_procedure',
        rootBlock));
    assertEquals(0, workspace.getTopBlocks().length);
  }
  finally {
    procedureTest_tearDown();
  }
}

function test_deleteProcedure_nonRecursiveCaller() {
  // If there is a caller and it's not part of the procedure definition, the
  // stack should not be deleted.

  procedureTest_setUp();
  var xml = '<xml xmlns="http://www.w3.org/1999/xhtml">' +
    '<block type="' + Blockly.PROCEDURES_CALL_BLOCK_TYPE +
    '" id="test_1" x="301" y="516"></block>' +
    '<block type="foo" id="test_2"></block>' +
    '<block type="foo" id="test_3"></block>' +
  '</xml>';
  try {
    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), workspace);
    workspace.getBlockById('test_1').procCode_ = 'test_procedure';
    var rootBlock = workspace.getBlockById('test_2');
    assertFalse(Blockly.Procedures.deleteProcedureDefCallback('test_procedure',
        rootBlock));
    // All blocks should stay on the workspace.
    assertEquals(3, workspace.getTopBlocks().length);
  }
  finally {
    procedureTest_tearDown();
  }
}
