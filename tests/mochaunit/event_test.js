'use strict';

describe('Test event', function () {
  var workspace;

  function helper_setUp() {
    workspace = new Blockly.Workspace();
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

  function helper_tearDown() {
    delete Blockly.Blocks['field_variable_test_block'];
    delete Blockly.Blocks['simple_test_block'];
    workspace.dispose();
  }

  function helper_createSimpleTestBlock(workspace, id) {
    // Disable events while constructing the block: this is a test of the
    // Blockly.Event constructors, not the block constructor.
    Blockly.Events.disable();
    var block = new Blockly.Block(workspace, 'simple_test_block', id);
    Blockly.Events.enable();
    return block;
  }

  function helper_checkExactEventValues(event, values) {
    Object.keys(values).forEach(prop => {
      assert.equal(event[prop], values[prop]);
    });
  }

  function helper_checkCreateEventValues(event, block, ids, type) {
    var expected_xml = Blockly.Xml.domToText(Blockly.Xml.blockToDom(block));
    var result_xml = Blockly.Xml.domToText(event.xml);
    assert.equal(result_xml, expected_xml);
    isEqualArrays(ids, event.ids);
    assert.equal(event.type, type);
  }

  function helper_checkDeleteEventValues(event, block, ids, type) {
    var expected_xml = Blockly.Xml.domToText(Blockly.Xml.blockToDom(block));
    var result_xml = Blockly.Xml.domToText(event.oldXml);
    assert.equal(result_xml, expected_xml);
    isEqualArrays(ids, event.ids);
    assert.equal(event.type, type);
  }

  it('Test Abstract constructor', function () {
    helper_setUp();
    
    var event = new Blockly.Events.Abstract();
    assert.notExists(event.blockId);
    assert.notExists(event.workspaceId);
    assert.notExists(event.varId);
    helper_checkExactEventValues(event, { 'group': '', 'recordUndo': true });

    helper_tearDown();
  });
  
  it('Test BlockBase constructor', function () {
    helper_setUp();

    var block = helper_createSimpleTestBlock(workspace, 'simple block');
    var event = new Blockly.Events.BlockBase(block);
    helper_checkExactEventValues(event, {
      'blockId': 'simple block', 'workspaceId': workspace.id,
      'group': '', 'recordUndo': true
    });

    helper_tearDown();
  });

  it('Test VarBase constructor', function () {
    helper_setUp();

    var variable = workspace.createVariable('foo', 'type1', 'var1');
    var event = new Blockly.Events.VarBase(variable);
    helper_checkExactEventValues(event, {
      'varId': 'var1', 'workspaceId': workspace.id,
      'group': '', 'recordUndo': true
    });

    helper_tearDown();
  });

  it('Test block Create event', function () {
    helper_setUp();

    var stub_genUid = stub(Blockly.utils, 'genUid').callsFake(function () {
      return 1;
    });
    var block = helper_createSimpleTestBlock(workspace);
    var event = new Blockly.Events.Create(block);
    helper_checkCreateEventValues(event, block, ['1'], Blockly.Events.CREATE);
    stub_genUid.restore();

    helper_tearDown();
  });

  it('Test block Delete event', function () {
    helper_setUp();
    var stub_genUid = stub(Blockly.utils, 'genUid').returns(1);

    var block = helper_createSimpleTestBlock(workspace);
    var event = new Blockly.Events.Delete(block);
    helper_checkDeleteEventValues(event, block, ['1'], Blockly.Events.DELETE);

    stub_genUid.restore();
    helper_tearDown();
  });

  it('Test block Change event', function () {
    helper_setUp();

    Blockly.Events.disable();
    var block = new Blockly.Block(workspace, 'field_variable_test_block');
    Blockly.Events.enable();
    var event = new Blockly.Events.BlockChange(block, 'field', 'VAR', 'id1', 'id2');
    helper_checkExactEventValues(event, {'element': 'field', 'name': 'VAR',
      'oldValue': 'id1', 'newValue': 'id2', 'type': Blockly.Events.CHANGE});

    helper_tearDown();
  });

  it('Test block Move event', function () {
    helper_setUp();

    var block = helper_createSimpleTestBlock(workspace);
    var coordinate = new goog.math.Coordinate(3, 4);
    block.xy_ = coordinate;
    var event = new Blockly.Events.Move(block);
    // Need to check for individual equality of the coordinate values since
    // the move event creates a new goog.math.Coordinate object
    assert.equal(event.oldCoordinate.x, coordinate.x);
    assert.equal(event.oldCoordinate.y, coordinate.y);
    assert.equal(event.type, Blockly.Events.MOVE);

    helper_tearDown();
  });

  it('Test block Move event with parentId', function () {
    helper_setUp();
    var stub_genUid = stub(Blockly.utils, 'genUid')
      .onCall(0).returns(1)
      .onCall(1).returns(2);

    var block1 = helper_createSimpleTestBlock(workspace);
    var block2 = helper_createSimpleTestBlock(workspace);
    block1.parentBlock_ = block2;
    block1.xy_ = new goog.math.Coordinate(3,4);

    var event = new Blockly.Events.Move(block1);
    helper_checkExactEventValues(event, {'oldCoordinate': undefined,
      'oldParentId': '2', 'type': 'move'});
    block1.parentBlock_ = null;

    stub_genUid.restore();
    helper_tearDown();
  });

  it('Test ui event constructor with null', function () {
    Blockly.Events.setGroup('testGroup');
    var event = new Blockly.Events.Ui(null, 'foo', 'bar', 'baz');
    helper_checkExactEventValues(event, {
      'blockId': null,
      'workspaceId': null,
      'type': 'ui',
      'oldValue': 'bar',
      'newValue': 'baz',
      'element': 'foo',
      'recordUndo': false,
      'group': 'testGroup'
    });
    Blockly.Events.setGroup(false);
  });

  it('Test ui event constructor', function () {
    helper_setUp();
    var stub_genUid = stub(Blockly.utils, 'genUid').returns(1);
    Blockly.Events.setGroup('testGroup');

    var block1 = helper_createSimpleTestBlock(workspace);
    var event = new Blockly.Events.Ui(block1, 'foo', 'bar', 'baz');
    helper_checkExactEventValues(event, {
      'blockId': '1',
      'workspaceId': workspace.id,
      'type': 'ui',
      'oldValue': 'bar',
      'newValue': 'baz',
      'element': 'foo',
      'recordUndo': false,
      'group': 'testGroup'
    });

    Blockly.Events.setGroup(false);
    stub_genUid.restore();
    helper_tearDown();
  });

  it('Test var create event constructor', function () {
    helper_setUp();

    var variable = workspace.createVariable('name1', 'type1', 'id1');
    var event = new Blockly.Events.VarCreate(variable);
    helper_checkExactEventValues(event, {'varName': 'name1', 'varType': 'type1',
      'type': 'var_create'});

    helper_tearDown();
  });

  it('Test var create event to json', function () {
    helper_setUp();

    var variable = workspace.createVariable('name1', 'type1', 'id1');
    var event = new Blockly.Events.VarCreate(variable);
    var json = event.toJson();
    var expectedJson = ({type: "var_create", varId: "id1", varType: "type1",
      varName: "name1", isLocal: false, isCloud: false});

    assert.equal(JSON.stringify(json), JSON.stringify(expectedJson));

    var localVariable = workspace.createVariable('name2', 'type2', 'id2', true);
    var event2 = new Blockly.Events.VarCreate(localVariable);
    var json2 = event2.toJson();
    var expectedJson2 = ({type: "var_create", varId: "id2", varType: "type2",
      varName: "name2", isLocal: true, isCloud: false});

    assert.equal(JSON.stringify(json2), JSON.stringify(expectedJson2));

    var cloudVariable = workspace.createVariable('name3', 'type3', 'id3', false, true);
    var event3 = new Blockly.Events.VarCreate(cloudVariable);
    var json3 = event3.toJson();
    var expectedJson3 = ({type: "var_create", varId: "id3", varType: "type3",
      varName: "name3", isLocal: false, isCloud: true});

    assert.equal(JSON.stringify(json3),  JSON.stringify(expectedJson3));

    helper_tearDown();
  });

  it('Test var create event from json', function () {
    helper_setUp();

    var variable = workspace.createVariable('name1', 'type1', 'id1');
    var event = new Blockly.Events.VarCreate(variable);
    var event2 = new Blockly.Events.VarCreate(null);
    var json = event.toJson();
    event2.fromJson(json);

    assert.equal(JSON.stringify(event2.toJson()), JSON.stringify(json));

    helper_tearDown();
  });

  it('Test var create event run forward', function () {
    helper_setUp();

    var json = {type: "var_create", varId: "id1", varType: "type1",
      varName: "name1"};
    var event = Blockly.Events.fromJson(json, workspace);
    assert.notExists(workspace.getVariableById('id1'));
    event.run(true);
    helper_checkVariableValues(workspace, 'name1', 'type1', 'id1');

    helper_tearDown();
  });

  it('Test var create event run backward', function () {
    helper_setUp();

    var variable = workspace.createVariable('name1', 'type1', 'id1');
    var event = new Blockly.Events.VarCreate(variable);
    assert.exists(workspace.getVariableById('id1'));
    event.run(false);
    assert.notExists(workspace.getVariableById('id1'));

    helper_tearDown();
  });

  it('Test var delete event constructor', function () {
    helper_setUp();

    var variable = workspace.createVariable('name1', 'type1', 'id1');
    var event = new Blockly.Events.VarDelete(variable);
    helper_checkExactEventValues(event, {'varName': 'name1', 'varType': 'type1',
      'varId':'id1', 'type': 'var_delete'});

    helper_tearDown();
  });

  it('Test var delete event to json', function () {
    helper_setUp();

    var variable = workspace.createVariable('name1', 'type1', 'id1');
    var event = new Blockly.Events.VarDelete(variable);
    var json = event.toJson();
    var expectedJson = ({type: "var_delete", varId: "id1", varType: "type1",
      varName: "name1", isLocal: false, isCloud: false});
  
    assert.equal(JSON.stringify(json), JSON.stringify(expectedJson));
  
    var localVariable = workspace.createVariable('name2', 'type2', 'id2', true);
    var event2 = new Blockly.Events.VarDelete(localVariable);
    var json2 = event2.toJson();
    var expectedJson2 = ({type: "var_delete", varId: "id2", varType: "type2",
      varName: "name2", isLocal: true, isCloud: false});
  
    assert.equal(JSON.stringify(json2), JSON.stringify(expectedJson2));
  
    var cloudVariable = workspace.createVariable('name3', 'type3', 'id3', false, true);
    var event3 = new Blockly.Events.VarDelete(cloudVariable);
    var json3 = event3.toJson();
    var expectedJson3 = ({type: "var_delete", varId: "id3", varType: "type3",
      varName: "name3", isLocal: false, isCloud: true});
  
    assert.equal(JSON.stringify(json3), JSON.stringify(expectedJson3));

    helper_tearDown();
  });

  it('Test var Delete event from json', function () {
    helper_setUp();

    var variable = workspace.createVariable('name1', 'type1', 'id1');
    var event = new Blockly.Events.VarDelete(variable);
    var event2 = new Blockly.Events.VarDelete(null);
    var json = event.toJson();
    event2.fromJson(json);
  
    assert.equal(JSON.stringify(event2.toJson()), JSON.stringify(json));

    helper_tearDown();
  });

  it('Test var Delete event run forward', function () {
    helper_setUp();

    var variable = workspace.createVariable('name1', 'type1', 'id1');
    var event = new Blockly.Events.VarDelete(variable);
    assert.exists(workspace.getVariableById('id1'));
    event.run(true);
    assert.notExists(workspace.getVariableById('id1'));

    helper_tearDown();
  });

  it('Test var Delete event run backward', function () {
    helper_setUp();

    var json = {type: "var_delete", varId: "id1", varType: "type1",
      varName: "name1"};
    var event = Blockly.Events.fromJson(json, workspace);
    assert.notExists(workspace.getVariableById('id1'));
    event.run(false);
    helper_checkVariableValues(workspace, 'name1', 'type1', 'id1');

    helper_tearDown();
  });

  it('Test var Rename event constructor', function () {
    helper_setUp();

    var variable = workspace.createVariable('name1', 'type1', 'id1');
    var event = new Blockly.Events.VarRename(variable, 'name2');
    helper_checkExactEventValues(event, {'varId': 'id1', 'oldName': 'name1',
      'newName': 'name2', 'type': 'var_rename'});

    helper_tearDown();
  });

  it('Test var Rename event to json', function () {
    helper_setUp();

    var variable = workspace.createVariable('name1', 'type1', 'id1');
    var event = new Blockly.Events.VarRename(variable, 'name2');
    var json = event.toJson();
    var expectedJson = ({type: "var_rename", varId: "id1", oldName: "name1",
      newName: "name2"});
  
    assert.equal(JSON.stringify(json), JSON.stringify(expectedJson));

    helper_tearDown();
  });

  it('Test var Rename event from json', function () {
    helper_setUp();

    var variable = workspace.createVariable('name1', 'type1', 'id1');
    var event = new Blockly.Events.VarRename(variable, '');
    var event2 = new Blockly.Events.VarRename(null);
    var json = event.toJson();
    event2.fromJson(json);
  
    assert.equal(JSON.stringify(event2.toJson()), JSON.stringify(json));

    helper_tearDown();
  });

  it('Test var Rename event run forward', function () {
    helper_setUp();

    var variable = workspace.createVariable('name1', 'type1', 'id1');
    var event = new Blockly.Events.VarRename(variable, 'name2');
    event.run(true);
    assert.notExists(workspace.getVariable('name1'));
    helper_checkVariableValues(workspace, 'name2', 'type1', 'id1');

    helper_tearDown();
  });

  it('Test var Rename event run backward', function () {
    helper_setUp();

    var variable = workspace.createVariable('name2', 'type1', 'id1');
    var event = new Blockly.Events.VarRename(variable, 'name2');
    event.oldName = 'name1';
    event.run(false);
    assert.notExists(workspace.getVariable('name2'));
    helper_checkVariableValues(workspace, 'name1', 'type1', 'id1');

    helper_tearDown();
  });
});
