'use strict';

describe('Test Connection', function () {
  var input;
  var output;
  var previous;
  var next;

  var sharedWorkspace;

  function helper_setUp() {
    sharedWorkspace = { id: "Shared workspace" };

    input = helper_createConnection(0, 0, Blockly.INPUT_VALUE, sharedWorkspace);
    input.sourceBlock_ = helper_makeSourceBlock(sharedWorkspace);
    input.sourceBlock_.inputList = [input];

    output = helper_createConnection(0, 0, Blockly.OUTPUT_VALUE, sharedWorkspace);
    output.sourceBlock_ = helper_makeSourceBlock(sharedWorkspace);
    output.sourceBlock_.outputConnection = output;

    previous = helper_createConnection(0, 0, Blockly.PREVIOUS_STATEMENT, sharedWorkspace);
    previous.sourceBlock_ = helper_makeSourceBlock(sharedWorkspace);
    previous.sourceBlock_.previousConnection = previous;

    next = helper_createConnection(0, 0, Blockly.NEXT_STATEMENT, sharedWorkspace);
    next.sourceBlock_ = helper_makeSourceBlock(sharedWorkspace);
    next.sourceBlock_.nextConnection = next;
  }

  function helper_tearDown() {
    input = null;
    output = null;
    previous = null;
    next = null;

    sharedWorkspace = null;
  }

  describe('Test function Connection.canConnectWithReason_', function () {
    it(`检查错误码是否符合预期`, function () {
      helper_setUp();
      assert.equal(input.canConnectWithReason_(output),
        Blockly.Connection.CAN_CONNECT);
      assert.equal(previous.canConnectWithReason_(next),
        Blockly.Connection.CAN_CONNECT);
      assert.equal(next.canConnectWithReason_(previous),
        Blockly.Connection.CAN_CONNECT);
      assert.equal(input.canConnectWithReason_(output),
        Blockly.Connection.CAN_CONNECT);
      assert.equal(output.canConnectWithReason_(input),
        Blockly.Connection.CAN_CONNECT);
      helper_tearDown();

      helper_setUp();
      output.sourceBlock_ = input.sourceBlock_;
      assert.equal(output.canConnectWithReason_(input),
        Blockly.Connection.REASON_SELF_CONNECTION);
      helper_tearDown();

      helper_setUp();
      assert.equal(input.canConnectWithReason_(previous),
        Blockly.Connection.REASON_WRONG_TYPE);
      assert.equal(input.canConnectWithReason_(next),
        Blockly.Connection.REASON_WRONG_TYPE);
      assert.equal(output.canConnectWithReason_(previous),
        Blockly.Connection.REASON_WRONG_TYPE);
      assert.equal(output.canConnectWithReason_(next),
        Blockly.Connection.REASON_WRONG_TYPE);
      assert.equal(previous.canConnectWithReason_(input),
        Blockly.Connection.REASON_WRONG_TYPE);
      assert.equal(previous.canConnectWithReason_(output),
        Blockly.Connection.REASON_WRONG_TYPE);
      assert.equal(next.canConnectWithReason_(input),
        Blockly.Connection.REASON_WRONG_TYPE);
      assert.equal(next.canConnectWithReason_(output),
        Blockly.Connection.REASON_WRONG_TYPE);
      helper_tearDown();

      helper_setUp();
      assert.equal(input.canConnectWithReason_(null),
        Blockly.Connection.REASON_TARGET_NULL);
      helper_tearDown();

      helper_setUp();
      var anotherWrokspace = { id: 'Another workspace' };
      var anotherInput = helper_createConnection(0, 0, Blockly.INPUT_VALUE, anotherWrokspace);
      anotherInput.sourceBlock_ = helper_makeSourceBlock(anotherWrokspace);
      assert.equal(anotherInput.canConnectWithReason_(output),
        Blockly.Connection.REASON_DIFFERENT_WORKSPACES);
      helper_tearDown();
    });

    it('检查 procedure block 的错误码是否符合预期', function () {
      var sharedWorkspace = { id: 'Shared worksapce' };
      var next, previous;

      next = helper_createConnection(0, 0, Blockly.NEXT_STATEMENT);
      next.sourceBlock_ = helper_makeSourceBlock(sharedWorkspace);
      next.sourceBlock_.type = Blockly.PROCEDURES_DEFINITION_BLOCK_TYPE;
      // Make next be the connection on its source block's input.
      next.sourceBlock_.getInput = function () {
        return {
          connection: next
        };
      };
      previous = helper_createConnection(0, 0, Blockly.PREVIOUS_STATEMENT);
      previous.sourceBlock_ = helper_makeSourceBlock(sharedWorkspace);
      // Fail because previous's source block is the wrong type.
      previous.sourceBlock_.type = 'wrong_type';
      assert.equal(previous.canConnectWithReason_(next),
        Blockly.Connection.REASON_CUSTOM_PROCEDURE);

      previous.sourceBlock_.type = Blockly.PROCEDURES_PROTOTYPE_BLOCK_TYPE;
      assert.equal(previous.canConnectWithReason_(next),
        Blockly.Connection.CAN_CONNECT);

      next.sourceBlock_.getInput = function () {
        return {
          connection: null
        };
      };
      // It should be okay, even if two's source block has the wrong type, because
      // it's not trying to connect to the input.
      previous.sourceBlock_.type = 'wrong_type';
      assert.equal(previous.canConnectWithReason_(next),
        Blockly.Connection.CAN_CONNECT);
    });
  });

  describe('Test function Connection.checkConnection_', function () {
    it('应该抛出异常', function () {
      helper_setUp();
      assert.throws(function () {
        output.sourceBlock_ = input.sourceBlock_;
        output.checkConnection_(input);
      }, 'Attempted to connect a block to itself.');
      helper_tearDown();

      helper_setUp();
      assert.throws(function () {
        input.checkConnection_(previous);
      }, 'Attempt to connect incompatible types.');
      assert.throws(function () {
        input.checkConnection_(next);
      }, 'Attempt to connect incompatible types.');
      assert.throws(function () {
        output.checkConnection_(previous);
      }, 'Attempt to connect incompatible types.');
      assert.throws(function () {
        previous.checkConnection_(input);
      }, 'Attempt to connect incompatible types.');
      assert.throws(function () {
        previous.checkConnection_(output);
      }, 'Attempt to connect incompatible types.');
      assert.throws(function () {
        next.checkConnection_(input);
      }, 'Attempt to connect incompatible types.');
      assert.throws(function () {
        next.checkConnection_(output);
      }, 'Attempt to connect incompatible types.');
      helper_tearDown();
    });
  });

  describe('Test function Connection.isConnectionAllowed', function () {
    it('Check if the two connections can be dragged to connect to each other',
      function () {
        helper_setUp();

        assert.isTrue(output.isConnectionAllowed(input));
        // Don't offer to connect a left (male) value plug to
        // an available right (female) value plug.
        // Unlike in Blockly, you can't do this even if the left value plug isn't
        // already connected.
        assert.isFalse(input.isConnectionAllowed(output));

        var anotherInput = helper_createConnection(0, 0, Blockly.INPUT_VALUE, sharedWorkspace);
        anotherInput.sourceBlock_ = helper_makeSourceBlock(sharedWorkspace);
        anotherInput.sourceBlock_.inputList = [anotherInput];
        Blockly.Connection.connectReciprocally_(input, output);
        assert.isTrue(output.isConnectionAllowed(anotherInput));

        assert.isTrue(previous.isConnectionAllowed(next));
        assert.isTrue(next.isConnectionAllowed(previous));

        var anotherPrevious = helper_createConnection(0, 0, Blockly.PREVIOUS_STATEMENT, sharedWorkspace);
        anotherPrevious.sourceBlock_ = helper_makeSourceBlock(sharedWorkspace);
        anotherPrevious.sourceBlock_.previousConnection = anotherPrevious;
        Blockly.Connection.connectReciprocally_(previous, next);
        // A terminal block is allowed to replace another terminal block.
        assert.isTrue(anotherPrevious.isConnectionAllowed(next));

        helper_tearDown();
      });

    it('Test rendered connections with distance', function () {
      helper_setUp();

      var one = helper_createConnection(5 /* x */, 10 /* y */,
        Blockly.INPUT_VALUE, null, true);
      one.sourceBlock_ = helper_makeSourceBlock(sharedWorkspace);

      var two = helper_createConnection(10 /* x */, 15 /* y */,
        Blockly.OUTPUT_VALUE, null, true);
      two.sourceBlock_ = helper_makeSourceBlock(sharedWorkspace);

      assert.isTrue(two.isConnectionAllowed(one, 20.0),
        'Two connections of opposite types near each other');

      two.x_ = 100;
      two.y_ = 100;
      assert.isFalse(two.isConnectionAllowed(one, 20.0),
        'Move connections farther apart');

      helper_tearDown();
    });

    it('Don not allowed connect insertion marker', function () {
      helper_setUp();

      input.sourceBlock_.isInsertionMarker = function () { return true; };
      assert.isFalse(output.isConnectionAllowed(input, 10.0));

      helper_tearDown();
    });
  });
});
