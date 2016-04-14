/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
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
 * @fileoverview Components for creating connections between blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Connection');

goog.require('goog.asserts');
goog.require('goog.dom');


/**
 * Class for a connection between blocks.
 * @param {!Blockly.Block} source The block establishing this connection.
 * @param {number} type The type of the connection.
 * @constructor
 */
Blockly.Connection = function(source, type) {
  /** @type {!Blockly.Block} */
  this.sourceBlock_ = source;
  /** @type {number} */
  this.type = type;
  // Shortcut for the databases for this connection's workspace.
  if (source.workspace.connectionDBList) {
    this.db_ = source.workspace.connectionDBList[type];
    this.dbOpposite_ =
        source.workspace.connectionDBList[Blockly.OPPOSITE_TYPE[type]];
    this.hidden_ = !this.db_;
  }
};

/**
 * Constant for identifying connections that accept a boolean.
 * @const
 */
Blockly.Connection.BOOLEAN = 1;

/**
 * Constant for identifying connections that accept a string.
 * @const
 */
Blockly.Connection.STRING = 2;

/**
 * Constant for identifying connections that accept a number OR null.
 * @const
 */
Blockly.Connection.NUMBER = 3;

/**
 * Constants for checking whether two connections are compatible.
 */
Blockly.Connection.CAN_CONNECT = 0;
Blockly.Connection.REASON_SELF_CONNECTION = 1;
Blockly.Connection.REASON_WRONG_TYPE = 2;
Blockly.Connection.REASON_TARGET_NULL = 3;
Blockly.Connection.REASON_CHECKS_FAILED = 4;
Blockly.Connection.REASON_DIFFERENT_WORKSPACES = 5;

/**
 * Connect two connections together.
 * @param {!Blockly.Connection} parentConnection Connection on superior block.
 * @param {!Blockly.Connection} childConnection Connection on inferior block.
 */
Blockly.Connection.connect_ = function(parentConnection, childConnection) {
  var parentBlock = parentConnection.getSourceBlock();
  var childBlock = childConnection.getSourceBlock();
  var isSurroundingC = false;
  if (parentConnection == parentBlock.getFirstStatementConnection()) {
    isSurroundingC = true;
  }
  // Disconnect any existing parent on the child connection.
  if (childConnection.isConnected()) {
    // Scratch-specific behaviour:
    // If we're using a c-shaped block to surround a stack, remember where the
    // stack used to be connected.
    if (isSurroundingC) {
      var previousParentConnection = childConnection.targetConnection;
    }
    childConnection.disconnect();
  }
  if (parentConnection.isConnected()) {
    // Other connection is already connected to something.
    // Disconnect it and reattach it or bump it as needed.
    var orphanBlock = parentConnection.targetBlock();
    var shadowDom = parentConnection.getShadowDom();
    // Temporarily set the shadow DOM to null so it does not respawn.
    parentConnection.setShadowDom(null);
    // Displaced shadow blocks dissolve rather than reattaching or bumping.
    if (orphanBlock.isShadow()) {
      // Save the shadow block so that field values are preserved.
      shadowDom = Blockly.Xml.blockToDom(orphanBlock);
      orphanBlock.dispose();
      orphanBlock = null;
    } else if (parentConnection.type == Blockly.INPUT_VALUE) {
      // Value connections.
      // If female block is already connected, disconnect and bump the male.
      if (!orphanBlock.outputConnection) {
        throw 'Orphan block does not have an output connection.';
      }
      // Attempt to reattach the orphan at the end of the newly inserted
      // block.  Since this block may be a row, walk down to the end
      // or to the first (and only) shadow block.
      var connection = Blockly.Connection.lastConnectionInRow_(
          childBlock, orphanBlock);
      if (connection) {
        orphanBlock.outputConnection.connect(connection);
        orphanBlock = null;
      }
    } else if (parentConnection.type == Blockly.NEXT_STATEMENT) {
      // Statement connections.
      // Statement blocks may be inserted into the middle of a stack.
      // Split the stack.
      if (!orphanBlock.previousConnection) {
        throw 'Orphan block does not have a previous connection.';
      }
      // Attempt to reattach the orphan at the bottom of the newly inserted
      // block.  Since this block may be a stack, walk down to the end.
      var newBlock = childBlock;
      while (newBlock.nextConnection) {
        if (newBlock.nextConnection.isConnected()) {
          newBlock = newBlock.getNextBlock();
        } else {
          if (orphanBlock.previousConnection.checkType_(
              newBlock.nextConnection)) {
            newBlock.nextConnection.connect(orphanBlock.previousConnection);
            orphanBlock = null;
          }
          break;
        }
      }
    }
    if (orphanBlock) {
      // Unable to reattach orphan.
      parentConnection.disconnect();
      if (Blockly.Events.recordUndo) {
        // Bump it off to the side after a moment.
        var group = Blockly.Events.getGroup();
        setTimeout(function() {
          // Verify orphan hasn't been deleted or reconnected (user on meth).
          if (orphanBlock.workspace && !orphanBlock.getParent()) {
            Blockly.Events.setGroup(group);
            if (orphanBlock.outputConnection) {
              orphanBlock.outputConnection.bumpAwayFrom_(parentConnection);
            } else if (orphanBlock.previousConnection) {
              orphanBlock.previousConnection.bumpAwayFrom_(parentConnection);
            }
            Blockly.Events.setGroup(false);
          }
        }, Blockly.BUMP_DELAY);
      }
    }
    // Restore the shadow DOM.
    parentConnection.setShadowDom(shadowDom);
  }

  if (isSurroundingC && previousParentConnection) {
      previousParentConnection.connect(parentBlock.previousConnection);
  }

  var event;
  if (Blockly.Events.isEnabled()) {
    event = new Blockly.Events.Move(childBlock);
  }
  // Establish the connections.
  Blockly.Connection.connectReciprocally_(parentConnection, childConnection);
  // Demote the inferior block so that one is a child of the superior one.
  childBlock.setParent(parentBlock);
  if (event) {
    event.recordNew();
    Blockly.Events.fire(event);
  }

  if (parentBlock.rendered) {
    parentBlock.updateDisabled();
  }
  if (childBlock.rendered) {
    childBlock.updateDisabled();
  }
  if (parentBlock.rendered && childBlock.rendered) {
    if (parentConnection.type == Blockly.NEXT_STATEMENT ||
        parentConnection.type == Blockly.PREVIOUS_STATEMENT) {
      // Child block may need to square off its corners if it is in a stack.
      // Rendering a child will render its parent.
      childBlock.render();
    } else {
      // Child block does not change shape.  Rendering the parent node will
      // move its connected children into position.
      parentBlock.render();
    }
  }
};

/**
 * Connection this connection connects to.  Null if not connected.
 * @type {Blockly.Connection}
 */
Blockly.Connection.prototype.targetConnection = null;

/**
 * List of compatible value types.  Null if all types are compatible.
 * @type {Array}
 * @private
 */
Blockly.Connection.prototype.check_ = null;

/**
 * DOM representation of a shadow block, or null if none.
 * @type {Element}
 * @private
 */
Blockly.Connection.prototype.shadowDom_ = null;

/**
 * Horizontal location of this connection.
 * @type {number}
 * @private
 */
Blockly.Connection.prototype.x_ = 0;

/**
 * Vertical location of this connection.
 * @type {number}
 * @private
 */
Blockly.Connection.prototype.y_ = 0;

/**
 * Has this connection been added to the connection database?
 * @type {boolean}
 * @private
 */
Blockly.Connection.prototype.inDB_ = false;

/**
 * Connection database for connections of this type on the current workspace.
 * @type {Blockly.ConnectionDB}
 * @private
 */
Blockly.Connection.prototype.db_ = null;

/**
 * Connection database for connections compatible with this type on the
 * current workspace.
 * @type {Blockly.ConnectionDB}
 * @private
 */
Blockly.Connection.prototype.dbOpposite_ = null;

/**
 * Whether this connections is hidden (not tracked in a database) or not.
 * @type {boolean}
 * @private
 */
Blockly.Connection.prototype.hidden_ = null;

/**
 * Sever all links to this connection (not including from the source object).
 */
Blockly.Connection.prototype.dispose = function() {
  if (this.isConnected()) {
    throw 'Disconnect connection before disposing of it.';
  }
  if (this.inDB_) {
    this.db_.removeConnection_(this);
  }
  if (Blockly.highlightedConnection_ == this) {
    Blockly.highlightedConnection_ = null;
  }
  if (Blockly.localConnection_ == this) {
    Blockly.localConnection_ = null;
  }
  this.db_ = null;
  this.dbOpposite_ = null;
};

/**
 * @return {boolean} true if the connection is not connected or is connected to
 *    an insertion marker, false otherwise.
 */
Blockly.Connection.prototype.isConnectedToNonInsertionMarker = function() {
  return this.targetConnection && !this.targetBlock().isInsertionMarker();
};

/**
 * Get the source block for this connection.
 * @return {Blockly.Block} The source block, or null if there is none.
 */
Blockly.Connection.prototype.getSourceBlock = function() {
  return this.sourceBlock_;
};

/**
 * Does the connection belong to a superior block (higher in the source stack)?
 * @return {boolean} True if connection faces down or right.
 */
Blockly.Connection.prototype.isSuperior = function() {
  return this.type == Blockly.INPUT_VALUE ||
      this.type == Blockly.NEXT_STATEMENT;
};

/**
 * Is the connection connected?
 * @return {boolean} True if connection is connected to another connection.
 */
Blockly.Connection.prototype.isConnected = function() {
  return !!this.targetConnection;
};

/**
 * Returns the distance between this connection and another connection.
 * @param {!Blockly.Connection} otherConnection The other connection to measure
 *     the distance to.
 * @return {number} The distance between connections.
 */
Blockly.Connection.prototype.distanceFrom = function(otherConnection) {
  var xDiff = this.x_ - otherConnection.x_;
  var yDiff = this.y_ - otherConnection.y_;
  return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
};

/**
 * Checks whether the current connection can connect with the target
 * connection.
 * @param {Blockly.Connection} target Connection to check compatibility with.
 * @return {number} Blockly.Connection.CAN_CONNECT if the connection is legal,
 *    an error code otherwise.
 * @private
 */
Blockly.Connection.prototype.canConnectWithReason_ = function(target) {
  if (!target) {
    return Blockly.Connection.REASON_TARGET_NULL;
  } else if (this.sourceBlock_ &&
      target.getSourceBlock() == this.sourceBlock_) {
    return Blockly.Connection.REASON_SELF_CONNECTION;
  } else if (target.type != Blockly.OPPOSITE_TYPE[this.type]) {
    return Blockly.Connection.REASON_WRONG_TYPE;
  } else if (this.sourceBlock_ && target.getSourceBlock() &&
      this.sourceBlock_.workspace !== target.getSourceBlock().workspace) {
    return Blockly.Connection.REASON_DIFFERENT_WORKSPACES;
  } else if (!this.checkType_(target)) {
    return Blockly.Connection.REASON_CHECKS_FAILED;
  }
  return Blockly.Connection.CAN_CONNECT;
};

/**
 * Checks whether the current connection and target connection are compatible
 * and throws an exception if they are not.
 * @param {Blockly.Connection} target The connection to check compatibility
 *    with.
 * @private
 */
Blockly.Connection.prototype.checkConnection_ = function(target) {
  switch (this.canConnectWithReason_(target)) {
    case Blockly.Connection.CAN_CONNECT:
      break;
    case Blockly.Connection.REASON_SELF_CONNECTION:
      throw 'Attempted to connect a block to itself.';
    case Blockly.Connection.REASON_DIFFERENT_WORKSPACES:
      // Usually this means one block has been deleted.
      throw 'Blocks not on same workspace.';
    case Blockly.Connection.REASON_WRONG_TYPE:
      throw 'Attempt to connect incompatible types.';
    case Blockly.Connection.REASON_TARGET_NULL:
      throw 'Target connection is null.';
    case Blockly.Connection.REASON_CHECKS_FAILED:
      throw 'Connection checks failed.';
    default:
      throw 'Unknown connection failure: this should never happen!';
  }
};

/**
 * Check if the two connections can be dragged to connect to each other.
 * This is used by the connection database when searching for the closest
 * connection.
 * @param {!Blockly.Connection} candidate A nearby connection to check.
 * @param {number} maxRadius The maximum radius allowed for connections.
 * @return {boolean} True if the connection is allowed, false otherwise.
 */
Blockly.Connection.prototype.isConnectionAllowed = function(candidate,
    maxRadius) {
  if (!this.checkBasicCompatibility_(candidate, maxRadius)) {
    return false;
  }

  var firstStatementConnection =
      this.sourceBlock_.getFirstStatementConnection();

  switch (candidate.type) {
    case Blockly.PREVIOUS_STATEMENT: {
      if (!firstStatementConnection || this != firstStatementConnection) {
        if (this.targetConnection) {
          return false;
        }
        if (candidate.targetConnection) {
          // If the other side of this connection is the active insertion marker
          // connection, we've obviously already decided that this is a good
          // connection.
          if (candidate.targetConnection ==
              Blockly.insertionMarkerConnection_) {
            return true;
          } else {
            return false;
          }
        }
      }

      // Scratch-specific behaviour:
      // If this is a c-shaped block, statement blocks cannot be connected
      // anywhere other than inside the first statement input.
      if (firstStatementConnection) {
        // Can't connect if there is already a block inside the first statement
        // input.
        if (this == firstStatementConnection) {
          if (this.targetConnection) {
            return false;
          }
        }
        // Can't connect this block's next connection unless we're connecting
        // in front of the first block on a stack.
        else if (this == this.sourceBlock_.nextConnection &&
            candidate.isConnectedToNonInsertionMarker()) {
          return false;
        }
      }
      break;
    }
    case Blockly.OUTPUT_VALUE: {
      // Don't offer to connect an already connected left (male) value plug to
      // an available right (female) value plug.
      if (candidate.targetConnection || this.targetConnection) {
        return false;
      }
      break;
    }
    case Blockly.INPUT_VALUE: {
      // Offering to connect the left (male) of a value block to an already
      // connected value pair is ok, we'll splice it in.
      // However, don't offer to splice into an unmovable block.
      if (candidate.targetConnection &&
          !candidate.targetBlock().isMovable() &&
          !candidate.targetBlock().isShadow()) {
        return false;
      }
      break;
    }
    case Blockly.NEXT_STATEMENT: {
        // Scratch-specific behaviour:
        // If this is a c-block, we can't connect this block's
        // previous connection unless we're connecting to the end of the last
        // block on a stack or there's already a block connected inside the c.
      if (firstStatementConnection &&
          this == this.sourceBlock_.previousConnection &&
          candidate.isConnectedToNonInsertionMarker() &&
          !firstStatementConnection.targetConnection) {
        return false;
      }
      // Don't let a block with no next connection bump other blocks out of the
      // stack.
      if (candidate.isConnectedToNonInsertionMarker() &&
          !this.sourceBlock_.nextConnection) {
        return false;
      }
      break;
    }
    default:
      throw 'Unknown connection type in isConnectionAllowed';
  }

  // Don't let blocks try to connect to themselves or ones they nest.
  if (Blockly.draggingConnections_.indexOf(candidate) != -1) {
    return false;
  }

  return true;
};

/**
 * Do basic checks for whether this connection can be dragged to connect to the
 * candidate.  These checks don't care about the type of the connections.
 * @param {Blockly.Connection} candidate The candidate connection.
 * @return True if the connections are compatible, false otherwise.
 */
Blockly.Connection.prototype.checkBasicCompatibility_ = function(candidate,
    maxRadius) {
  if (this.distanceFrom(candidate) > maxRadius) {
    return false;
  }

  // Don't consider insertion markers.
  if (candidate.sourceBlock_.isInsertionMarker()) {
    return false;
  }

  // Type checking.
  var canConnect = this.canConnectWithReason_(candidate);
  if (canConnect != Blockly.Connection.CAN_CONNECT &&
      canConnect != Blockly.Connection.REASON_MUST_DISCONNECT) {
    return false;
  }

  return true;
};

/**
 * Connect this connection to another connection.
 * @param {!Blockly.Connection} otherConnection Connection to connect to.
 */
Blockly.Connection.prototype.connect = function(otherConnection) {
  if (this.targetConnection == otherConnection) {
    // Already connected together.  NOP.
    return;
  }
  this.checkConnection_(otherConnection);
  // Determine which block is superior (higher in the source stack).
  var parentBlock, childBlock;
  if (this.isSuperior()) {
    // Superior block.
    Blockly.Connection.connect_(this, otherConnection);
  } else {
    // Inferior block.
    Blockly.Connection.connect_(otherConnection, this);
  }
};

/**
 * Update two connections to target each other.
 * @param {Blockly.Connection} first The first connection to update.
 * @param {Blockly.Connection} second The second conneciton to update.
 * @private
 */
Blockly.Connection.connectReciprocally_ = function(first, second) {
  goog.asserts.assert(first && second, 'Cannot connect null connections.');
  first.targetConnection = second;
  second.targetConnection = first;
};

/**
 * Does the given block have one and only one connection point that will accept
 * an orphaned block?
 * @param {!Blockly.Block} block The superior block.
 * @param {!Blockly.Block} orphanBlock The inferior block.
 * @return {Blockly.Connection} The suitable connection point on 'block',
 *     or null.
 * @private
 */
Blockly.Connection.singleConnection_ = function(block, orphanBlock) {
  var connection = false;
  for (var i = 0; i < block.inputList.length; i++) {
    var thisConnection = block.inputList[i].connection;
    if (thisConnection && thisConnection.type == Blockly.INPUT_VALUE &&
        orphanBlock.outputConnection.checkType_(thisConnection)) {
      if (connection) {
        return null;  // More than one connection.
      }
      connection = thisConnection;
    }
  }
  return connection;
};

/**
 * Walks down a row a blocks, at each stage checking if there are any
 * connections that will accept the orphaned block.  If at any point there
 * are zero or multiple eligible connections, returns null.  Otherwise
 * returns the only input on the last block in the chain.
 * Terminates early for shadow blocks.
 * @param {!Blockly.Block} startBlock The block on which to start the search.
 * @param {!Blockly.Block} orphanBlock The block that is looking for a home.
 * @return {Blockly.Connection} The suitable connection point on the chain
 *    of blocks, or null.
 * @private
 */
Blockly.Connection.lastConnectionInRow_ = function(startBlock, orphanBlock) {
  var newBlock = startBlock;
  var connection;
  while (connection = Blockly.Connection.singleConnection_(
      /** @type {!Blockly.Block} */ (newBlock), orphanBlock)) {
    // '=' is intentional in line above.
    newBlock = connection.targetBlock();
    if (!newBlock || newBlock.isShadow()) {
      return connection;
    }
  }
  return null;
};

/**
 * Disconnect this connection.
 */
Blockly.Connection.prototype.disconnect = function() {
  var otherConnection = this.targetConnection;
  goog.asserts.assert(otherConnection, 'Source connection not connected.');
  goog.asserts.assert(otherConnection.targetConnection == this,
      'Target connection not connected to source connection.');

  var parentBlock, childBlock, parentConnection;
  if (this.isSuperior()) {
    // Superior block.
    parentBlock = this.sourceBlock_;
    childBlock = otherConnection.getSourceBlock();
    parentConnection = this;
  } else {
    // Inferior block.
    parentBlock = otherConnection.getSourceBlock();
    childBlock = this.sourceBlock_;
    parentConnection = otherConnection;
  }

  var event;
  if (Blockly.Events.isEnabled()) {
    event = new Blockly.Events.Move(childBlock);
  }
  otherConnection.targetConnection = null;
  this.targetConnection = null;
  childBlock.setParent(null);
  if (event) {
    event.recordNew();
    Blockly.Events.fire(event);
  }

  // Respawn the shadow block if there is one.
  var shadow = parentConnection.getShadowDom();
  if (parentBlock.workspace && shadow && Blockly.Events.recordUndo) {
    var blockShadow =
        Blockly.Xml.domToBlock(parentBlock.workspace, shadow);
    if (blockShadow.outputConnection) {
      parentConnection.connect(blockShadow.outputConnection);
    } else if (blockShadow.previousConnection) {
      parentConnection.connect(blockShadow.previousConnection);
    } else {
      throw 'Child block does not have output or previous statement.';
    }
    blockShadow.initSvg();
    blockShadow.render(false);
  }

  // Rerender the parent so that it may reflow.
  if (parentBlock.rendered) {
    parentBlock.render();
  }
  if (childBlock.rendered) {
    childBlock.updateDisabled();
    childBlock.render();
  }
};

/**
 * Returns the block that this connection connects to.
 * @return {Blockly.Block} The connected block or null if none is connected.
 */
Blockly.Connection.prototype.targetBlock = function() {
  if (this.isConnected()) {
    return this.targetConnection.getSourceBlock();
  }
  return null;
};

/**
 * Move the block(s) belonging to the connection to a point where they don't
 * visually interfere with the specified connection.
 * @param {!Blockly.Connection} staticConnection The connection to move away
 *     from.
 * @private
 */
Blockly.Connection.prototype.bumpAwayFrom_ = function(staticConnection) {
  if (Blockly.dragMode_ != Blockly.DRAG_NONE) {
    // Don't move blocks around while the user is doing the same.
    return;
  }
  // Move the root block.
  var rootBlock = this.sourceBlock_.getRootBlock();
  if (rootBlock.isInFlyout) {
    // Don't move blocks around in a flyout.
    return;
  }
  var reverse = false;
  if (!rootBlock.isMovable()) {
    // Can't bump an uneditable block away.
    // Check to see if the other block is movable.
    rootBlock = staticConnection.getSourceBlock().getRootBlock();
    if (!rootBlock.isMovable()) {
      return;
    }
    // Swap the connections and move the 'static' connection instead.
    staticConnection = this;
    reverse = true;
  }
  // Raise it to the top for extra visibility.
  rootBlock.getSvgRoot().parentNode.appendChild(rootBlock.getSvgRoot());
  var dx = (staticConnection.x_ + Blockly.SNAP_RADIUS) - this.x_;
  var dy = (staticConnection.y_ + Blockly.SNAP_RADIUS) - this.y_;
  if (reverse) {
    // When reversing a bump due to an uneditable block, bump up.
    dy = -dy;
  }
  if (rootBlock.RTL) {
    dx = -dx;
  }
  rootBlock.moveBy(dx, dy);
};

/**
 * Change the connection's coordinates.
 * @param {number} x New absolute x coordinate.
 * @param {number} y New absolute y coordinate.
 */
Blockly.Connection.prototype.moveTo = function(x, y) {
  // Remove it from its old location in the database (if already present)
  if (this.inDB_ && !Blockly.connectionsFrozen) {
    this.db_.removeConnection_(this);
  }
  this.x_ = x;
  this.y_ = y;
  // Insert it into its new location in the database.
  if (!this.hidden_ && !Blockly.connectionsFrozen) {
    this.db_.addConnection(this);
  }
};

/**
 * Change the connection's coordinates.
 * @param {number} dx Change to x coordinate.
 * @param {number} dy Change to y coordinate.
 */
Blockly.Connection.prototype.moveBy = function(dx, dy) {
  this.moveTo(this.x_ + dx, this.y_ + dy);
};

/**
 * Add highlighting around this connection.
 */
Blockly.Connection.prototype.highlight = function() {
  var steps;
  if (this.type == Blockly.INPUT_VALUE || this.type == Blockly.OUTPUT_VALUE) {
    var tabWidth = this.sourceBlock_.RTL ? -Blockly.BlockSvg.TAB_WIDTH :
        Blockly.BlockSvg.TAB_WIDTH;
    steps = 'm 0,0 v 4 ' + Blockly.BlockSvg.NOTCH_PATH_DOWN + ' v 4';

  } else {
    steps = 'm 0,0 v -4 ' + Blockly.BlockSvg.NOTCH_PATH_UP + ' v -4';
  }
  var xy = this.sourceBlock_.getRelativeToSurfaceXY();
  var x = this.x_ - xy.x;
  var y = this.y_ - xy.y;
  Blockly.Connection.highlightedPath_ = Blockly.createSvgElement('path',
      {'class': 'blocklyHighlightedConnectionPath',
       'd': steps,
       transform: 'translate(' + x + ',' + y + ')' +
           (this.sourceBlock_.RTL ? ' scale(-1 1)' : '')},
      this.sourceBlock_.getSvgRoot());
};

/**
 * Remove the highlighting around this connection.
 */
Blockly.Connection.prototype.unhighlight = function() {
  goog.dom.removeNode(Blockly.Connection.highlightedPath_);
  delete Blockly.Connection.highlightedPath_;
};

/**
 * Move the blocks on either side of this connection right next to each other.
 * @private
 */
Blockly.Connection.prototype.tighten_ = function() {
  var dx = this.targetConnection.x_ - this.x_;
  var dy = this.targetConnection.y_ - this.y_;
  if (dx != 0 || dy != 0) {
    var block = this.targetBlock();
    var svgRoot = block.getSvgRoot();
    if (!svgRoot) {
      throw 'block is not rendered.';
    }
    var xy = Blockly.getRelativeXY_(svgRoot);
    block.getSvgRoot().setAttribute('transform',
        'translate(' + (xy.x - dx) + ',' + (xy.y - dy) + ')');
    block.moveConnections_(-dx, -dy);
  }
};

/**
 * Find the closest compatible connection to this connection.
 * @param {number} maxLimit The maximum radius to another connection.
 * @param {number} dx Horizontal offset between this connection's location
 *     in the database and the current location (as a result of dragging).
 * @param {number} dy Vertical offset between this connection's location
 *     in the database and the current location (as a result of dragging).
 * @return {!{connection: ?Blockly.Connection, radius: number}} Contains two
 *     properties:' connection' which is either another connection or null,
 *     and 'radius' which is the distance.
 */
Blockly.Connection.prototype.closest = function(maxLimit, dx, dy) {
  return this.dbOpposite_.searchForClosest(this, maxLimit, dx, dy);
};

/**
 * Is this connection compatible with another connection with respect to the
 * value type system.  E.g. square_root("Hello") is not compatible.
 * @param {!Blockly.Connection} otherConnection Connection to compare against.
 * @return {boolean} True if the connections share a type.
 * @private
 */
Blockly.Connection.prototype.checkType_ = function(otherConnection) {
  if (!this.check_ || !otherConnection.check_) {
    // One or both sides are promiscuous enough that anything will fit.
    return true;
  }
  // Find any intersection in the check lists.
  for (var i = 0; i < this.check_.length; i++) {
    if (otherConnection.check_.indexOf(this.check_[i]) != -1) {
      return true;
    }
  }
  // No intersection.
  return false;
};

/**
 * Change a connection's compatibility.
 * @param {*} check Compatible value type or list of value types.
 *     Null if all types are compatible.
 * @return {!Blockly.Connection} The connection being modified
 *     (to allow chaining).
 */
Blockly.Connection.prototype.setCheck = function(check) {
  if (check) {
    // Ensure that check is in an array.
    if (!goog.isArray(check)) {
      check = [check];
    }
    this.check_ = check;
    // The new value type may not be compatible with the existing connection.
    if (this.isConnected() && !this.checkType_(this.targetConnection)) {
      var child = this.isSuperior() ? this.targetBlock() : this.sourceBlock_;
      child.unplug();
      // Bump away.
      this.sourceBlock_.bumpNeighbours_();
    }
  } else {
    this.check_ = null;
  }
  return this;
};

/**
 * Returns a shape enum for this connection.
 * @return {number} Enum representing shape.
 */
Blockly.Connection.prototype.getOutputShape = function() {
    if (!this.check_) return Blockly.Connection.NUMBER;
    if (this.check_.indexOf('Boolean') !== -1) {
        return Blockly.Connection.BOOLEAN;
    }
    if (this.check_.indexOf('String') !== -1) {
        return Blockly.Connection.STRING;
    }

    return Blockly.Connection.NUMBER;
};

/**
 * Change a connection's shadow block.
 * @param {Element} shadow DOM representation of a block or null.
 */
Blockly.Connection.prototype.setShadowDom = function(shadow) {
  this.shadowDom_ = shadow;
};

/**
 * Return a connection's shadow block.
 * @return {Element} shadow DOM representation of a block or null.
 */
Blockly.Connection.prototype.getShadowDom = function() {
  return this.shadowDom_;
};

/**
 * Find all nearby compatible connections to this connection.
 * Type checking does not apply, since this function is used for bumping.
 * @param {number} maxLimit The maximum radius to another connection.
 * @return {!Array.<Blockly.Connection>} List of connections.
 * @private
 */
Blockly.Connection.prototype.neighbours_ = function(maxLimit) {
  return this.dbOpposite_.getNeighbours(this, maxLimit);
};

// Appearance or lack thereof.

/**
 * Set whether this connections is hidden (not tracked in a database) or not.
 * @param {boolean} hidden True if connection is hidden.
 */
Blockly.Connection.prototype.setHidden = function(hidden) {
  this.hidden_ = hidden;
  if (hidden && this.inDB_) {
    this.db_.removeConnection_(this);
  } else if (!hidden && !this.inDB_) {
    this.db_.addConnection(this);
  }
};

/**
 * Hide this connection, as well as all down-stream connections on any block
 * attached to this connection.  This happens when a block is collapsed.
 * Also hides down-stream comments.
 */
Blockly.Connection.prototype.hideAll = function() {
  this.setHidden(true);
  if (this.isConnected()) {
    var blocks = this.targetBlock().getDescendants();
    for (var b = 0; b < blocks.length; b++) {
      var block = blocks[b];
      // Hide all connections of all children.
      var connections = block.getConnections_(true);
      for (var c = 0; c < connections.length; c++) {
        connections[c].setHidden(true);
      }
      // Close all bubbles of all children.
      var icons = block.getIcons();
      for (var i = 0; i < icons.length; i++) {
        icons[i].setVisible(false);
      }
    }
  }
};

/**
 * Unhide this connection, as well as all down-stream connections on any block
 * attached to this connection.  This happens when a block is expanded.
 * Also unhides down-stream comments.
 * @return {!Array.<!Blockly.Block>} List of blocks to render.
 */
Blockly.Connection.prototype.unhideAll = function() {
  this.setHidden(false);
  // All blocks that need unhiding must be unhidden before any rendering takes
  // place, since rendering requires knowing the dimensions of lower blocks.
  // Also, since rendering a block renders all its parents, we only need to
  // render the leaf nodes.
  var renderList = [];
  if (this.type != Blockly.INPUT_VALUE && this.type != Blockly.NEXT_STATEMENT) {
    // Only spider down.
    return renderList;
  }
  var block = this.targetBlock();
  if (block) {
    var connections;
    if (block.isCollapsed()) {
      // This block should only be partially revealed since it is collapsed.
      connections = [];
      block.outputConnection && connections.push(block.outputConnection);
      block.nextConnection && connections.push(block.nextConnection);
      block.previousConnection && connections.push(block.previousConnection);
    } else {
      // Show all connections of this block.
      connections = block.getConnections_(true);
    }
    for (var c = 0; c < connections.length; c++) {
      renderList.push.apply(renderList, connections[c].unhideAll());
    }
    if (!renderList.length) {
      // Leaf block.
      renderList[0] = block;
    }
  }
  return renderList;
};
