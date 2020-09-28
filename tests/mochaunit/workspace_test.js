'use strict';

describe('Test Workspace', function () {
  var workspace;

  function helper_setUp() {
    workspace = new Blockly.Workspace();

    Blockly.defineBlocksWithJsonArray([{
      "type": "get_var",
      "message0": "%1",
      "args0": [
        {
          "type": "field_variable",
          "name": "VAR",
          "variableTypes": ["", "type1", "type2"]
        }
      ]
    }]);
  }

  function helper_tearDown() {
    workspace.dispose();

    delete Blockly.Blocks['get_var'];
  }
  it('Test empty wrokspace', function () {
    helper_setUp();

    assert.equal(workspace.getTopBlocks(true).length, 0, 'Empty workspace (1).');
    assert.equal(workspace.getTopBlocks(false).length, 0, 'Empty workspace (2).');
    assert.equal(workspace.getAllBlocks().length, 0, 'Empty workspace (3).');
    workspace.clear();
    assert.equal(workspace.getTopBlocks(true).length, 0, 'Empty workspace (4).');
    assert.equal(workspace.getTopBlocks(false).length, 0, 'Empty workspace (5).');
    assert.equal(workspace.getAllBlocks().length, 0, 'Empty workspace (6).');

    helper_tearDown();
  });

  it('Test flat workspace', function () {
    helper_setUp();

    var blockA = workspace.newBlock('');
    assert.equal(workspace.getTopBlocks(true).length, 1, 'One block workspace (1).');
    assert.equal(workspace.getTopBlocks(false).length, 1, 'One block workspace (2).',);
    assert.equal(workspace.getAllBlocks().length, 1, 'One block workspace (3).');
    var blockB = workspace.newBlock('');
    assert.equal(workspace.getTopBlocks(true).length, 2, 'Two block workspace (1).');
    assert.equal(workspace.getTopBlocks(false).length, 2, 'Two block workspace (2).');
    assert.equal(workspace.getAllBlocks().length, 2, 'Two block workspace (3).');
    blockA.dispose();
    assert.equal(workspace.getTopBlocks(true).length, 1, 'One block workspace (4).');
    assert.equal(workspace.getTopBlocks(false).length, 1, 'One block workspace (5).');
    assert.equal(workspace.getAllBlocks().length, 1, 'One block workspace (6).');
    workspace.clear();
    assert.equal(workspace.getTopBlocks(true).length, 0, 'Cleared workspace (1).');
    assert.equal(workspace.getTopBlocks(false).length, 0, 'Cleared workspace (2).');
    assert.equal(workspace.getAllBlocks().length, 0, 'Cleared workspace (3).');

    helper_tearDown();
  });

  it('Test get workspace by id', function () {
    var wsA = new Blockly.Workspace();
    var wsB = new Blockly.Workspace();

    assert.equal(Blockly.Workspace.getById(wsA.id), wsA, 'Find workspaceA.');
    assert.equal(Blockly.Workspace.getById(wsB.id), wsB, 'Find workspaceB.');
    assert.notExists(Blockly.Workspace.getById('I do not exist.'), 'No workspace found.');
    wsA.dispose();
    assert.notExists(Blockly.Workspace.getById(wsA.id), 'Can\'t find workspaceA.');
    assert.equal(Blockly.Workspace.getById(wsB.id), wsB, 'WorkspaceB exists.');

    wsB.dispose();
    wsA.dispose();
  });

  it('Test get block by id', function () {
    helper_setUp();

    var blockA = workspace.newBlock('');
    var blockB = workspace.newBlock('');
    assert.equal(workspace.getBlockById(blockA.id), blockA, 'Find blockA.');
    assert.equal(workspace.getBlockById(blockB.id), blockB, 'Find blockB.');
    assert.notExists(workspace.getBlockById('I do not exist.'), 'No block found.');
    blockA.dispose();
    assert.notExists(workspace.getBlockById(blockA.id), 'Can\'t find blockA.');
    assert.equal(workspace.getBlockById(blockB.id), blockB, 'BlockB exists.');
    workspace.clear();
    assert.notExists(workspace.getBlockById(blockB.id), 'Can\'t find blockB.');

    helper_tearDown();
  });

  it('Test delete variable internal', function () {
    helper_setUp();
    var var_1 = workspace.createVariable('name1', 'type1', 'id1');
    workspace.createVariable('name2', 'type2', 'id2');
    helper_create_getVar_mockBlock(workspace, 'id1');
    helper_create_getVar_mockBlock(workspace, 'id1');
    helper_create_getVar_mockBlock(workspace, 'id2');

    var uses = workspace.getVariableUsesById(var_1.getId());
    workspace.deleteVariableInternal_(var_1, uses);

    assert.notExists(workspace.getVariableById('id1'));
    helper_checkVariableValues(workspace, 'name2', 'type2', 'id2');
    assert.equal(workspace.topBlocks_[0].getVarModels()[0].name, 'name2');

    helper_tearDown();
  });

  it('Test flyout workspace add top block', function () {
    helper_setUp();

    var targetWorkspace = new Blockly.Workspace();
    workspace.isFlyout = true;
    workspace.targetWorkspace = targetWorkspace;
    targetWorkspace.createVariable('name1', '', '1');

    // Flyout.init usually does this binding.
    workspace.variableMap_ = targetWorkspace.getVariableMap();

    var block = helper_create_getVar_mockBlock(workspace, '1');
    workspace.removeTopBlock(block);
    workspace.addTopBlock(block);
    helper_checkVariableValues(workspace, 'name1', '', '1');

    helper_tearDown();
    // Have to dispose of the main workspace after the flyout workspace, because
    // it holds the variable map.
    // Normally the main workspace disposes of the flyout workspace.
    targetWorkspace.dispose();
  });

  it('Test clear workspace', function () {
    helper_setUp();

    workspace.createVariable('name1', 'type1', 'id1');
    workspace.createVariable('name2', 'type2', 'id2');

    workspace.clear();
    assert.equal(workspace.topBlocks_.length, 0);
    assert.equal(Object.keys(workspace.variableMap_.variableMap_).length, 0);

    helper_tearDown();
  });

  it('Test clear empty workspace', function () {
    helper_setUp();

    workspace.clear();
    assert.equal(workspace.topBlocks_.length, 0);
    assert.equal(Object.keys(workspace.variableMap_.variableMap_).length, 0);

    helper_tearDown();
  });

  it('Test rename non-referenced variable', function () {
    // Test renaming a variable in the simplest case: when no blocks refer to it.
    helper_setUp();
    var id = 'id1';
    var type = 'type1';
    var oldName = 'name1';
    var newName = 'name2';
    workspace.createVariable(oldName, type, id);

    workspace.renameVariableById(id, newName);
    helper_checkVariableValues(workspace, newName, type, id);
    // Renaming should not have created a new variable.
    assert.equal(workspace.getAllVariables().length, 1);

    helper_tearDown();
  });

  it('Test rename referenced variable', function () {
    // Test renaming a variable when a reference to it exists.
    // Expect 'renameVariable' to change oldName variable name to newName.
    helper_setUp();
    var newName = 'name2';
    workspace.createVariable('name1', 'type1', 'id1');
    helper_create_getVar_mockBlock(workspace, 'id1');

    workspace.renameVariableById('id1', newName);
    helper_checkVariableValues(workspace, newName, 'type1', 'id1');
    // Renaming should not have created a new variable.
    assert.equal(workspace.getAllVariables().length, 1);
    var block_var_name = workspace.topBlocks_[0].getVarModels()[0].name;
    assert.equal(block_var_name, newName);

    helper_tearDown();
  });

  it('Test rename variable two variable same type', function () {
    // Cannot rename variable to a name that already exists
    // for a variable of the same type.
    // Note: this behavior is different from that of blockly which allows
    // renaming variables to a name that already exists if the variables have the
    // same type.
    helper_setUp();
    var id1 = 'id1';
    var id2 = 'id2';
    var type = 'type1';

    var oldName = 'name1';
    var newName = 'name2';
    // Create two variables of the same type.
    workspace.createVariable(oldName, type, id1);
    workspace.createVariable(newName, type, id2);
    // Create blocks to refer to both of them.
    helper_create_getVar_mockBlock(workspace, id1);
    helper_create_getVar_mockBlock(workspace, id2);

    workspace.renameVariableById(id1, newName);

    // Both variables should retain the same names/ids as before.
    helper_checkVariableValues(workspace, oldName, type, id1);
    helper_checkVariableValues(workspace, newName, type, id2);

    // Both variables should remain on the workspace.
    assert.equal(workspace.getAllVariables().length, 2);

    // References should have the correct names.
    var block_var_name_1 = workspace.topBlocks_[0].getVarModels()[0].name;
    var block_var_name_2 = workspace.topBlocks_[1].getVarModels()[0].name;
    assert.equal(block_var_name_1, oldName);
    assert.equal(block_var_name_2, newName);

    helper_tearDown();
  });

  it('Test rename variable old case', function () {
    // Rename a variable with a single reference.  Update only the capitalization.
    helper_setUp();
    var newName = 'Name1';

    workspace.createVariable('name1', 'type1', 'id1');
    helper_create_getVar_mockBlock(workspace, 'id1');

    workspace.renameVariableById('id1', newName);
    helper_checkVariableValues(workspace, newName, 'type1', 'id1');
    var variable = workspace.getVariableById('id1');
    assert.notEqual(variable.name, 'name1');

    helper_tearDown();
  });
});
