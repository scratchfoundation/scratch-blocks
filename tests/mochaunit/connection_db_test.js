'use strict';

describe('Test ConnectionDB', function () {
  it('Add Connection', function () {
    var db = new Blockly.ConnectionDB();
    var o2 = {
      y_: 2, sourceBlock_: {},
      getSourceBlock: Blockly.Connection.prototype.getSourceBlock
    };
    db.addConnection(o2);
    helper_verifyDB(db, [o2], 'Adding connection #2');

    var o4 = {
      y_: 4, sourceBlock_: {},
      getSourceBlock: Blockly.Connection.prototype.getSourceBlock
    };
    db.addConnection(o4);
    helper_verifyDB(db, [o2, o4], 'Adding connection #4');

    var o1 = {
      y_: 1, sourceBlock_: {},
      getSourceBlock: Blockly.Connection.prototype.getSourceBlock
    };
    db.addConnection(o1);
    helper_verifyDB(db, [o1, o2, o4], 'Adding connection #1');

    var o3a = {
      y_: 3, sourceBlock_: {},
      getSourceBlock: Blockly.Connection.prototype.getSourceBlock
    };
    db.addConnection(o3a);
    helper_verifyDB(db, [o1, o2, o3a, o4], 'Adding connection #3a');

    var o3b = {
      y_: 3, sourceBlock_: {},
      getSourceBlock: Blockly.Connection.prototype.getSourceBlock
    };
    db.addConnection(o3b);
    helper_verifyDB(db, [o1, o2, o3b, o3a, o4], 'Adding connection #3b');
  });

  it('Add connection in order', function () {
    var db = new Blockly.ConnectionDB();

    var xCoords = [
      -29, -47, -77, 2, 43, 34, -59, -52, -90, -36, -91, 38, 87, -20,
      60, 4, -57, 65, -37, -81, 57, 58, -96, 1, 67, -79, 34, 93, -90, -99, -62,
      4, 11, -36, -51, -72, 3, -50, -24, -45, -92, -38, 37, 24, -47, -73, 79,
      -20, 99, 43, -10, -87, 19, 35, -62, -36, 49, 86, -24, -47, -89, 33, -44,
      25, -73, -91, 85, 6, 0, 89, -94, 36, -35, 84, -9, 96, -21, 52, 10, -95, 7,
      -67, -70, 62, 9, -40, -95, -9, -94, 55, 57, -96, 55, 8, -48, -57, -87, 81,
      23, 65
    ];
    var yCoords = [
      -81, 82, 5, 47, 30, 57, -12, 28, 38, 92, -25, -20, 23, -51, 73,
      -90, 8, 28, -51, -15, 81, -60, -6, -16, 77, -62, -42, -24, 35, 95, -46,
      -7, 61, -16, 14, 91, 57, -38, 27, -39, 92, 47, -98, 11, -33, -72, 64, 38,
      -64, -88, -35, -59, -76, -94, 45, -25, -100, -95, 63, -97, 45, 98, 99, 34,
      27, 52, -18, -45, 66, -32, -38, 70, -73, -23, 5, -2, -13, -9, 48, 74, -97,
      -11, 35, -79, -16, -77, 83, -57, -53, 35, -44, 100, -27, -15, 5, 39, 33,
      -19, -20, -95
    ];
    for (var i = 0; i < xCoords.length; i++) {
      db.addConnection(helper_createConnection(xCoords[i], yCoords[i],
        Blockly.PREVIOUS_STATEMENT), null, true);
    }

    for (i = 1; i < xCoords.length; i++) {
      assert.isTrue(db.connections_[i].y_ >= db.connections_[i - 1].y_);
    }
  });

  it('Remove connection', function () {
    var db = new Blockly.ConnectionDB();
    var o1 = {
      y_: 1, sourceBlock_: {},
      getSourceBlock: Blockly.Connection.prototype.getSourceBlock
    };
    var o2 = {
      y_: 2, sourceBlock_: {},
      getSourceBlock: Blockly.Connection.prototype.getSourceBlock
    };
    var o3a = {
      y_: 3, sourceBlock_: {},
      getSourceBlock: Blockly.Connection.prototype.getSourceBlock
    };
    var o3b = {
      y_: 3, sourceBlock_: {},
      getSourceBlock: Blockly.Connection.prototype.getSourceBlock
    };
    var o3c = {
      y_: 3, sourceBlock_: {},
      getSourceBlock: Blockly.Connection.prototype.getSourceBlock
    };
    var o4 = {
      y_: 4, sourceBlock_: {},
      getSourceBlock: Blockly.Connection.prototype.getSourceBlock
    };
    db.addConnection(o1);
    db.addConnection(o2);
    db.addConnection(o3c);
    db.addConnection(o3b);
    db.addConnection(o3a);
    db.addConnection(o4);
    helper_verifyDB(db, [o1, o2, o3a, o3b, o3c, o4], 'Adding connections 1-4');

    db.removeConnection_(o2);
    helper_verifyDB(db, [o1, o3a, o3b, o3c, o4], 'Removing connection #2');

    db.removeConnection_(o4);
    helper_verifyDB(db, [o1, o3a, o3b, o3c], 'Removing connection #4');

    db.removeConnection_(o1);
    helper_verifyDB(db, [o3a, o3b, o3c], 'Removing connection #1');

    db.removeConnection_(o3a);
    helper_verifyDB(db, [o3b, o3c], 'Removing connection #3a');

    db.removeConnection_(o3c);
    helper_verifyDB(db, [o3b], 'Removing connection #3c');

    db.removeConnection_(o3b);
    helper_verifyDB(db, [], 'Removing connection #3b');
  });

  describe('Test function ConnectionDB.getNeighbours', function () {
    it('Find all nearby connections to the given connection', function () {
      var db = new Blockly.ConnectionDB();

      // Search an empty list.
      assert.equal(
        helper_getNeighbours(db, 10, 10, 100).length,
        0
      );

      // Set up some connections.
      for (var i = 0; i < 10; i++) {
        db.addConnection(helper_createConnection(0, i,
          Blockly.PREVIOUS_STATEMENT, null, true));
      }
      assert.equal(db.connections_.length, 10, 'Set up some connections');

      // Test block belongs at beginning.
      var result = helper_getNeighbours(db, 0, 0, 4);
      assert.equal(result.length, 5);
      for (i = 0; i < result.length; i++) {
        assert.notEqual(
          result.indexOf(db.connections_[i]), -1,
          'Test block belongs at beginning'
        ); // contains
      }

      // Test block belongs at middle.
      result = helper_getNeighbours(db, 0, 4, 2);
      assert.equal(result.length, 5);
      for (i = 0; i < result.length; i++) {
        assert.notEqual(
          result.indexOf(db.connections_[i + 2]), -1,
          'Test block belongs at middle'
        ); // contains
      }

      // Test block belongs at end.
      result = helper_getNeighbours(db, 0, 9, 4);
      assert.equal(result.length, 5);
      for (i = 0; i < result.length; i++) {
        assert.notEqual(
          result.indexOf(db.connections_[i + 5]), -1,
          'Test block belongs at end'
        ); // contains
      }

      // Test block has no neighbours due to being out of range in the x direction.
      result = helper_getNeighbours(db, 10, 9, 4);
      assert.equal(result.length, 0,
        'Test block has no neighbours due to being out of range in the x direction'
      );

      // Test block has no neighbours due to being out of range in the y direction.
      result = helper_getNeighbours(db, 0, 19, 4);
      assert.equal(result.length, 0,
        'Test block has no neighbours due to being out of range in the y direction');

      // Test block has no neighbours due to being out of range diagonally.
      result = helper_getNeighbours(db, -2, -2, 2);
      assert.equal(result.length, 0,
        'Test block has no neighbours due to being out of range diagonally');
    });
  });

  describe('Test function ConnectionDB.findPositionForConnection_', function () {
    it('Finds a candidate position for inserting this connection into the list', function () {
      var db = new Blockly.ConnectionDB();
      db.addConnection(helper_createConnection(0, 0, Blockly.PREVIOUS_STATEMENT,
        null, true));
      db.addConnection(helper_createConnection(0, 1, Blockly.PREVIOUS_STATEMENT,
        null, true));
      db.addConnection(helper_createConnection(0, 2, Blockly.PREVIOUS_STATEMENT,
        null, true));
      db.addConnection(helper_createConnection(0, 4, Blockly.PREVIOUS_STATEMENT,
        null, true));
      db.addConnection(helper_createConnection(0, 5, Blockly.PREVIOUS_STATEMENT,
        null, true));

      assert.equal(db.connections_.length, 5);
      var conn = helper_createConnection(0, 3, Blockly.PREVIOUS_STATEMENT, null,
        true);
      assert.equal(db.findPositionForConnection_(conn), 3);
    });
  });

  describe('Test function ConnectionDB.findConnection', function () {
    it('Find the given connection', function () {
      var db = new Blockly.ConnectionDB();
      for (var i = 0; i < 10; i++) {
        db.addConnection(helper_createConnection(i, 0,
          Blockly.PREVIOUS_STATEMENT, null, true));
        db.addConnection(helper_createConnection(0, i,
          Blockly.PREVIOUS_STATEMENT, null, true));
      }

      var conn = helper_createConnection(3, 3, Blockly.PREVIOUS_STATEMENT, null,
        true);
      db.addConnection(conn);
      assert.notEqual(db.findConnection(conn), -1);

      conn = helper_createConnection(3, 3, Blockly.PREVIOUS_STATEMENT, null, true);
      assert.equal(db.findConnection(conn), -1);
    });
  });

  describe('Test function ConnectionDB.searchForClosest', function () {
    it('Find the closest compatible connection to this connection', function () {
      var db = new Blockly.ConnectionDB();
      var sharedWorkspace = { id: "Shared workspace" };

      // Search an empty list.
      assert.equal(helper_searchDB(db, 10, 10, 100), null, 'Search an empty list');

      db.addConnection(helper_createConnection(100, 0, Blockly.PREVIOUS_STATEMENT,
        sharedWorkspace, true));
      assert.equal(helper_searchDB(db, 0, 0, 5, sharedWorkspace), null,
        'Don\'t let blocks try to connect to themselves');

      db = new Blockly.ConnectionDB();
      for (var i = 0; i < 10; i++) {
        var tempConn = helper_createConnection(0, i, Blockly.PREVIOUS_STATEMENT,
          sharedWorkspace, true);
        tempConn.sourceBlock_ = helper_makeSourceBlock(sharedWorkspace);
        db.addConnection(tempConn);
      }

      // Should be at 0, 9.
      const LAST = db.connections_[db.connections_.length - 1];
      // Correct connection is last in db; many connections in radius.
      assert.equal(helper_searchDB(db, 0, 10, 15, sharedWorkspace), LAST);
      // Nothing nearby.
      assert.equal(helper_searchDB(db, 100, 100, 3, sharedWorkspace), null);
      // First in db, exact match.
      assert.equal(helper_searchDB(db, 0, 0, 0, sharedWorkspace), db.connections_[0]);

      tempConn = helper_createConnection(6, 6, Blockly.PREVIOUS_STATEMENT,
        sharedWorkspace, true);
      tempConn.sourceBlock_ = helper_makeSourceBlock(sharedWorkspace);
      db.addConnection(tempConn);
      tempConn = helper_createConnection(5, 5, Blockly.PREVIOUS_STATEMENT,
        sharedWorkspace, true);
      tempConn.sourceBlock_ = helper_makeSourceBlock(sharedWorkspace);
      db.addConnection(tempConn);

      var result = helper_searchDB(db, 4, 6, 3, sharedWorkspace);
      assert.equal(result.x_, 5);
      assert.equal(result.y_, 5);
    });
  });
});
