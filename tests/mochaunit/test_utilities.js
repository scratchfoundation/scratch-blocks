/* eslint-disable no-unused-vars */
'use strict';

const assert = chai.assert;
const stub = sinon.stub;

/**
 * Check that two arrays have the same content.
 * @param {Array} actual actual array.
 * @param {Array} expected expected array.
 * @param {string} msg message.
 */
function isEqualArrays(actual, expected, msg) {
  assert.equal(actual.length, expected.length, msg);
  for (var i = 0; i < actual.length; i++) {
    assert.equal(actual[i], expected[i], msg);
  }
}

/**
 * Check that two arrays have the same content without orderation.
 * @param {Array} actual actual array.
 * @param {Array} expected expected array.
 * @param {string} msg message.
 */
function isEqualArraysNoOrder(actual, expected, msg) {
  assert.equal(actual.length, expected.length, msg);
  for (var i = 0; i < actual.length; i++) {
    assert.include(expected, actual[i], msg);
  }
}

/**
 * Check if a variable with the given values exists.
 * @param {Blockly.Workspace|Blockly.VariableMap} container The workspace  or
 *     variableMap the checked variable belongs to.
 * @param {!string} name The expected name of the variable.
 * @param {!string} type The expected type of the variable.
 * @param {!string} id The expected id of the variable.
 */
function helper_checkVariableValues(container, name, type, id) {
  var variable = container.getVariableById(id);
  assert.exists(variable);
  assert.equal(variable.name, name);
  assert.equal(variable.type, type);
  assert.equal(variable.getId(), id);
}

/**
 * Create a test get_var block.
 * Will fail if get_var_block isn't defined.
 * @param {!Blockly.Workspace} workspace The block's workspace.
 * @param {!string} variable_id The id of the variable to reference.
 * @return {!Blockly.Block} The created block.
 */
function helper_create_getVar_mockBlock(workspace, variable_id) {
  // Turn off events to avoid testing XML at the same time.
  Blockly.Events.disable();
  var block = new Blockly.Block(workspace, 'get_var');
  block.inputList[0].fieldRow[0].setValue(variable_id);
  Blockly.Events.enable();
  return block;
}

/**
 * Helper function for connection test.
 */

function helper_verifyDB(db, expected, msg) {
  isEqualArrays(db.connections_, expected, msg);
}

function helper_createConnection(x, y, type, opt_shared_workspace, opt_rendered) {
  var workspace = opt_shared_workspace ? opt_shared_workspace : {};
  if (opt_rendered) {
    var conn = new Blockly.RenderedConnection({ workspace: workspace }, type);
  } else {
    var conn = new Blockly.Connection({ workspace: workspace }, type);
  }
  conn.x_ = x;
  conn.y_ = y;
  return conn;
}

function helper_getNeighbours(db, x, y, radius) {
  return db.getNeighbours(
    helper_createConnection(x, y, Blockly.NEXT_STATEMENT, null, true),
    radius);
}

function helper_makeSourceBlock(sharedWorkspace) {
  return {
    workspace: sharedWorkspace,
    parentBlock_: null,
    getParent: function () { return null; },
    movable_: true,
    isMovable: function () { return true; },
    isShadow: function () { return false; },
    isInsertionMarker: function () { return false; },
    getFirstStatementConnection: function () { return null; }
  };
}

function helper_searchDB(db, x, y, radius, shared_workspace) {
  var tempConn = helper_createConnection(x, y,
    Blockly.NEXT_STATEMENT, shared_workspace, true);
  tempConn.sourceBlock_ = helper_makeSourceBlock(shared_workspace);
  tempConn.sourceBlock_.nextConnection = tempConn;
  var closest = db.searchForClosest(tempConn, radius, { x: 0, y: 0 });
  return closest.connection;
}
