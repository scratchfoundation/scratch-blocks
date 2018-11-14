/**
 * @license
 * Visual Blocks Editor
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

 /**
 * @fileoverview Tests for Blockly.Events
 * @author marisaleung@google.com (Marisa Leung)
 */
'use strict';

goog.require('goog.testing');
goog.require('goog.testing.MockControl');

var mockControl_;
var workspace;

function eventTest_setUp() {
  workspace = new Blockly.Workspace();
  mockControl_ = new goog.testing.MockControl();
}

function eventTest_setUpWithMockBlocks() {
  eventTest_setUp();
  // TODO: Replace with defineGetVarBlock();
  Blockly.defineBlocksWithJsonArray([{
    'type': 'field_variable_test_block',
    'message0': '%1',
    'args0': [
      {
        'type': 'field_variable',
        'name': 'VAR',
        'variable': 'item'
      }
    ],
  },
  {
    'type': 'simple_test_block',
    'message0': 'simple test block'
  }]);
}

function eventTest_tearDown() {
  delete Blockly.Blocks['field_variable_test_block'];
  delete Blockly.Blocks['simple_test_block'];
  mockControl_.$tearDown();
  workspace.dispose();
}

function eventTest_tearDownWithMockBlocks() {
  eventTest_tearDown();
  delete Blockly.Blocks.field_variable_test_block;
}

function test_block_base_constructor() {
  eventTest_setUpWithMockBlocks();
  setUpMockMethod(mockControl_, Blockly.utils, 'genUid', null, '1');
  try {
    var block = createSimpleTestBlock(workspace);

    // Here's the event we care about.
    var event = new Blockly.Events.BlockBase(block);
    assertUndefined(event.varId);
    checkExactEventValues(event, {'blockId': '1', 'workspaceId': workspace.id,
      'group': '', 'recordUndo': true});
  } finally {
    eventTest_tearDownWithMockBlocks();
  }
}

function test_var_base_constructor() {
  eventTest_setUpWithMockBlocks();
  setUpMockMethod(mockControl_, Blockly.utils, 'genUid', null, '1');
  try {
    var variable = workspace.createVariable('name1', 'type1', 'id1');

    var event = new Blockly.Events.VarBase(variable);
    assertUndefined(event.blockId);
    checkExactEventValues(event, {'varId': 'id1',
      'workspaceId': workspace.id, 'group': '', 'recordUndo': true});
  } finally {
    eventTest_tearDownWithMockBlocks();
  }
}

function test_abstract_constructor() {
  eventTest_setUpWithMockBlocks();
  try {
    var event = new Blockly.Events.Abstract();
    assertUndefined(event.blockId);
    assertUndefined(event.workspaceId);
    assertUndefined(event.varId);
    checkExactEventValues(event, {'group': '', 'recordUndo': true});
  } finally {
    eventTest_tearDownWithMockBlocks();
  }
}

// Test util
function checkCreateEventValues(event, block, ids, type) {
  var expected_xml = Blockly.Xml.domToText(Blockly.Xml.blockToDom(block));
  var result_xml = Blockly.Xml.domToText(event.xml);
  assertEquals(expected_xml, result_xml);
  isEqualArrays(ids, event.ids);
  assertEquals(type, event.type);
}

// Test util
function checkDeleteEventValues(event, block, ids, type) {
  var expected_xml = Blockly.Xml.domToText(Blockly.Xml.blockToDom(block));
  var result_xml = Blockly.Xml.domToText(event.oldXml);
  assertEquals(expected_xml, result_xml);
  isEqualArrays(ids, event.ids);
  assertEquals(type, event.type);
}

// Test util
function checkExactEventValues(event, values) {
  var keys = Object.keys(values);
  for (var i = 0, field; field = keys[i]; i++) {
    assertEquals(values[field], event[field]);
  }
}

// Test util
function createSimpleTestBlock(workspace) {
  // Disable events while constructing the block: this is a test of the
  // Blockly.Event constructors, not the block constructor.
  Blockly.Events.disable();
  var block = new Blockly.Block(workspace, 'simple_test_block');
  Blockly.Events.enable();
  return block;
}

function test_create_constructor() {
  eventTest_setUpWithMockBlocks();
  setUpMockMethod(mockControl_, Blockly.utils, 'genUid', null, ['1']);
  try {
    var block = createSimpleTestBlock(workspace);

    var event = new Blockly.Events.Create(block);
    checkCreateEventValues(event, block, ['1'], 'create');
  } finally {
    eventTest_tearDownWithMockBlocks();
  }
}

function test_blockCreate_constructor() {
  // expect that blockCreate behaves the same as create.
  eventTest_setUpWithMockBlocks();
  setUpMockMethod(mockControl_, Blockly.utils, 'genUid', null, ['1']);
  try {
    var block = createSimpleTestBlock(workspace);

    var event = new Blockly.Events.BlockCreate(block);
    checkCreateEventValues(event, block, ['1'], 'create');
  } finally {
    eventTest_tearDownWithMockBlocks();
  }
}

function test_delete_constructor() {
  eventTest_setUpWithMockBlocks();
  setUpMockMethod(mockControl_, Blockly.utils, 'genUid', null, ['1']);
  try {
    var block = createSimpleTestBlock(workspace);
    var event = new Blockly.Events.Delete(block);
    checkDeleteEventValues(event, block, ['1'], 'delete');
  } finally {
    eventTest_tearDownWithMockBlocks();
  }
}

function test_blockDelete_constructor() {
  eventTest_setUpWithMockBlocks();
  setUpMockMethod(mockControl_, Blockly.utils, 'genUid', null, ['1']);
  try {
    var block = createSimpleTestBlock(workspace);
    var event = new Blockly.Events.BlockDelete(block);
    checkDeleteEventValues(event, block, ['1'], 'delete');
  } finally {
    eventTest_tearDownWithMockBlocks();
  }
}

function test_change_constructor() {
  eventTest_setUpWithMockBlocks();
  setUpMockMethod(mockControl_, Blockly.utils, 'genUid', null, ['1']);
  try {
    Blockly.Events.disable();
    var block = new Blockly.Block(workspace, 'field_variable_test_block');
    Blockly.Events.enable();

    var event = new Blockly.Events.Change(block, 'field', 'VAR', 'id1', 'id2');
    checkExactEventValues(event, {'element': 'field', 'name': 'VAR',
      'oldValue': 'id1', 'newValue': 'id2', 'type': 'change'});
  } finally {
    eventTest_tearDownWithMockBlocks();
  }
}

function test_blockChange_constructor() {
  eventTest_setUpWithMockBlocks();
  setUpMockMethod(mockControl_, Blockly.utils, 'genUid', null, ['1']);
  try {
    Blockly.Events.disable();
    var block = new Blockly.Block(workspace, 'field_variable_test_block');
    Blockly.Events.enable();

    var event = new Blockly.Events.BlockChange(block, 'field', 'VAR', 'id1',
        'id2');
    checkExactEventValues(event, {'element': 'field', 'name': 'VAR',
      'oldValue': 'id1', 'newValue': 'id2', 'type': 'change'});
  } finally {
    eventTest_tearDownWithMockBlocks();
  }
}

function test_move_constructorCoordinate() {
  // Expect the oldCoordinate to be set.
  eventTest_setUpWithMockBlocks();
  setUpMockMethod(mockControl_, Blockly.utils, 'genUid', null, ['1', '2']);
  try {
    var block1 = createSimpleTestBlock(workspace);
    var coordinate = new goog.math.Coordinate(3,4);
    block1.xy_ = coordinate;

    var event = new Blockly.Events.Move(block1);
    // Need to check for individual equality of the coordinate values since
    // the move event creates a new goog.math.Coordinate object
    assertEquals(event.oldCoordinate.x, coordinate.x);
    assertEquals(event.oldCoordinate.y, coordinate.y);
    assertEquals(event.type, 'move');

  } finally {
    eventTest_tearDownWithMockBlocks();
  }
}

function test_move_constructoroldParentId() {
  // Expect the oldParentId to be set but not the oldCoordinate to be set.
  eventTest_setUpWithMockBlocks();
  setUpMockMethod(mockControl_, Blockly.utils, 'genUid', null, ['1', '2']);
  try {
    var block1 = createSimpleTestBlock(workspace);
    var block2 = createSimpleTestBlock(workspace);
    block1.parentBlock_ = block2;
    block1.xy_ = new goog.math.Coordinate(3,4);

    var event = new Blockly.Events.Move(block1);
    checkExactEventValues(event, {'oldCoordinate': undefined,
      'oldParentId': '2', 'type': 'move'});
    block1.parentBlock_ = null;
  } finally {
    eventTest_tearDownWithMockBlocks();
  }
}

function test_blockMove_constructorCoordinate() {
  // Expect the oldCoordinate to be set.
  eventTest_setUpWithMockBlocks();
  setUpMockMethod(mockControl_, Blockly.utils, 'genUid', null, ['1', '2']);
  try {
    var block1 = createSimpleTestBlock(workspace);
    var coordinate = new goog.math.Coordinate(3,4);
    block1.xy_ = coordinate;

    var event = new Blockly.Events.BlockMove(block1);
    // Need to check for individual equality of the coordinate values since
    // the move event creates a new goog.math.Coordinate object
    assertEquals(event.oldCoordinate.x, coordinate.x);
    assertEquals(event.oldCoordinate.y, coordinate.y);
    assertEquals(event.type, 'move');
  } finally {
    eventTest_tearDownWithMockBlocks();
  }
}

function test_blockMove_constructoroldParentId() {
  // Expect the oldParentId to be set but not the oldCoordinate to be set.
  eventTest_setUpWithMockBlocks();
  setUpMockMethod(mockControl_, Blockly.utils, 'genUid', null, ['1', '2']);
  try {
    var block1 = createSimpleTestBlock(workspace);
    var block2 = createSimpleTestBlock(workspace);
    block1.parentBlock_ = block2;
    block1.xy_ = new goog.math.Coordinate(3,4);

    var event = new Blockly.Events.BlockMove(block1);
    checkExactEventValues(event, {'oldCoordinate': undefined,
      'oldParentId': '2', 'type': 'move'});
    block1.parentBlock_ = null;
  } finally {
    eventTest_tearDownWithMockBlocks();
  }
}

function test_uiEvent_constructor_null() {
  try {
    Blockly.Events.setGroup('testGroup');
    var event = new Blockly.Events.Ui(null, 'foo', 'bar', 'baz');
    checkExactEventValues(event,
        {
          'blockId': null,
          'workspaceId': null,
          'type': 'ui',
          'oldValue': 'bar',
          'newValue': 'baz',
          'element': 'foo',
          'recordUndo': false,
          'group': 'testGroup'
        }
    );
  } finally {
    Blockly.Events.setGroup(false);
  }
}

function test_uiEvent_constructor_block() {
  eventTest_setUpWithMockBlocks();
  setUpMockMethod(mockControl_, Blockly.utils, 'genUid', null, ['1']);
  try {
    var block1 = createSimpleTestBlock(workspace);
    Blockly.Events.setGroup('testGroup');
    var event = new Blockly.Events.Ui(block1, 'foo', 'bar', 'baz');
    checkExactEventValues(event,
        {
          'blockId': '1',
          'workspaceId': workspace.id,
          'type': 'ui',
          'oldValue': 'bar',
          'newValue': 'baz',
          'element': 'foo',
          'recordUndo': false,
          'group': 'testGroup'
        }
    );
  } finally {
    Blockly.Events.setGroup(false);
    eventTest_tearDownWithMockBlocks();
  }
}

function test_varCreate_constructor() {
  eventTest_setUp();
  try {
    var variable = workspace.createVariable('name1', 'type1', 'id1');
    var event = new Blockly.Events.VarCreate(variable);
    checkExactEventValues(event, {'varName': 'name1', 'varType': 'type1',
      'type': 'var_create'});
  } finally {
    eventTest_tearDown();
  }
}

function test_varCreate_toJson() {
  eventTest_setUp();
  try {
    var variable = workspace.createVariable('name1', 'type1', 'id1');
    var event = new Blockly.Events.VarCreate(variable);
    var json = event.toJson();
    var expectedJson = ({type: "var_create", varId: "id1", varType: "type1",
      varName: "name1", isLocal: false, isCloud: false});

    assertEquals(JSON.stringify(expectedJson), JSON.stringify(json));

    var localVariable = workspace.createVariable('name2', 'type2', 'id2', true);
    var event2 = new Blockly.Events.VarCreate(localVariable);
    var json2 = event2.toJson();
    var expectedJson2 = ({type: "var_create", varId: "id2", varType: "type2",
      varName: "name2", isLocal: true, isCloud: false});

    assertEquals(JSON.stringify(expectedJson2), JSON.stringify(json2));

    var cloudVariable = workspace.createVariable('name3', 'type3', 'id3', false, true);
    var event3 = new Blockly.Events.VarCreate(cloudVariable);
    var json3 = event3.toJson();
    var expectedJson3 = ({type: "var_create", varId: "id3", varType: "type3",
      varName: "name3", isLocal: false, isCloud: true});

    assertEquals(JSON.stringify(expectedJson3), JSON.stringify(json3));

  } finally {
    eventTest_tearDown();
  }
}

function test_varCreate_fromJson() {
  eventTest_setUp();
  try {
    var variable = workspace.createVariable('name1', 'type1', 'id1');
    var event = new Blockly.Events.VarCreate(variable);
    var event2 = new Blockly.Events.VarCreate(null);
    var json = event.toJson();
    event2.fromJson(json);

    assertEquals(JSON.stringify(json), JSON.stringify(event2.toJson()));
  } finally {
    eventTest_tearDown();
  }
}

function test_varCreate_runForward() {
  eventTest_setUp();
  var json = {type: "var_create", varId: "id1", varType: "type1",
    varName: "name1"};
  var event = Blockly.Events.fromJson(json, workspace);
  assertNull(workspace.getVariableById('id1'));
  event.run(true);
  checkVariableValues(workspace, 'name1', 'type1', 'id1');
  eventTest_tearDown();
}

function test_varCreate_runBackwards() {
  eventTest_setUp();
  var variable = workspace.createVariable('name1', 'type1', 'id1');
  var event = new Blockly.Events.VarCreate(variable);
  assertNotNull(workspace.getVariableById('id1'));
  event.run(false);
  assertNull(workspace.getVariableById('id1'));
  eventTest_tearDown();
}

function test_varDelete_constructor() {
  eventTest_setUp();
  var variable = workspace.createVariable('name1', 'type1', 'id1');
  var event = new Blockly.Events.VarDelete(variable);
  checkExactEventValues(event, {'varName': 'name1', 'varType': 'type1',
    'varId':'id1', 'type': 'var_delete'});
  eventTest_tearDown();
}

function test_varDelete_toJson() {
  eventTest_setUp();
  var variable = workspace.createVariable('name1', 'type1', 'id1');
  var event = new Blockly.Events.VarDelete(variable);
  var json = event.toJson();
  var expectedJson = ({type: "var_delete", varId: "id1", varType: "type1",
    varName: "name1", isLocal: false, isCloud: false});

  assertEquals(JSON.stringify(expectedJson), JSON.stringify(json));

  var localVariable = workspace.createVariable('name2', 'type2', 'id2', true);
  var event2 = new Blockly.Events.VarDelete(localVariable);
  var json2 = event2.toJson();
  var expectedJson2 = ({type: "var_delete", varId: "id2", varType: "type2",
    varName: "name2", isLocal: true, isCloud: false});

  assertEquals(JSON.stringify(expectedJson2), JSON.stringify(json2));

  var cloudVariable = workspace.createVariable('name3', 'type3', 'id3', false, true);
  var event3 = new Blockly.Events.VarDelete(cloudVariable);
  var json3 = event3.toJson();
  var expectedJson3 = ({type: "var_delete", varId: "id3", varType: "type3",
    varName: "name3", isLocal: false, isCloud: true});

  assertEquals(JSON.stringify(expectedJson2), JSON.stringify(json2));
  eventTest_tearDown();
}

function test_varDelete_fromJson() {
  eventTest_setUp();
  var variable = workspace.createVariable('name1', 'type1', 'id1');
  var event = new Blockly.Events.VarDelete(variable);
  var event2 = new Blockly.Events.VarDelete(null);
  var json = event.toJson();
  event2.fromJson(json);

  assertEquals(JSON.stringify(json), JSON.stringify(event2.toJson()));
  eventTest_tearDown();
}

function test_varDelete_runForwards() {
  eventTest_setUp();
  var variable = workspace.createVariable('name1', 'type1', 'id1');
  var event = new Blockly.Events.VarDelete(variable);
  assertNotNull(workspace.getVariableById('id1'));
  event.run(true);
  assertNull(workspace.getVariableById('id1'));
  eventTest_tearDown();
}

function test_varDelete_runBackwards() {
  eventTest_setUp();
  var json = {type: "var_delete", varId: "id1", varType: "type1",
    varName: "name1"};
  var event = Blockly.Events.fromJson(json, workspace);
  assertNull(workspace.getVariableById('id1'));
  event.run(false);
  checkVariableValues(workspace, 'name1', 'type1', 'id1');
  eventTest_tearDown();
}

function test_varRename_constructor() {
  eventTest_setUp();
  var variable = workspace.createVariable('name1', 'type1', 'id1');
  var event = new Blockly.Events.VarRename(variable, 'name2');
  checkExactEventValues(event, {'varId': 'id1', 'oldName': 'name1',
    'newName': 'name2', 'type': 'var_rename'});
  eventTest_tearDown();
}

function test_varRename_toJson() {
  eventTest_setUp();
  var variable = workspace.createVariable('name1', 'type1', 'id1');
  var event = new Blockly.Events.VarRename(variable, 'name2');
  var json = event.toJson();
  var expectedJson = ({type: "var_rename", varId: "id1", oldName: "name1",
    newName: "name2"});

  assertEquals(JSON.stringify(expectedJson), JSON.stringify(json));
  eventTest_tearDown();
}

function test_varRename_fromJson() {
  eventTest_setUp();
  var variable = workspace.createVariable('name1', 'type1', 'id1');
  var event = new Blockly.Events.VarRename(variable, '');
  var event2 = new Blockly.Events.VarRename(null);
  var json = event.toJson();
  event2.fromJson(json);

  assertEquals(JSON.stringify(json), JSON.stringify(event2.toJson()));
  eventTest_tearDown();
}

function test_varRename_runForward() {
  eventTest_setUp();
  var variable = workspace.createVariable('name1', 'type1', 'id1');
  var event = new Blockly.Events.VarRename(variable, 'name2');
  event.run(true);
  assertNull(workspace.getVariable('name1'));
  checkVariableValues(workspace, 'name2', 'type1', 'id1');
  eventTest_tearDown();
}

function test_varBackard_runForward() {
  eventTest_setUp();
  var variable = workspace.createVariable('name1', 'type1', 'id1');
  var event = new Blockly.Events.VarRename(variable, 'name2');
  event.run(false);
  assertNull(workspace.getVariable('name2'));
  checkVariableValues(workspace, 'name1', 'type1', 'id1');
  eventTest_tearDown();
}
