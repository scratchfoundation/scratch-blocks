/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
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
 * @fileoverview Classes for all comment events.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.Events.CommentBase');
goog.provide('Blockly.Events.CommentChange');
goog.provide('Blockly.Events.CommentCreate');
goog.provide('Blockly.Events.CommentDelete');
goog.provide('Blockly.Events.CommentMove');

goog.require('Blockly.Events');
goog.require('Blockly.Events.Abstract');

goog.require('goog.math.Coordinate');


/**
 * Abstract class for a comment event.
 * @param {Blockly.WorkspaceComment | Blockly.ScratchBlockComment} comment
 *    The comment this event corresponds to.
 * @extends {Blockly.Events.Abstract}
 * @constructor
 */
Blockly.Events.CommentBase = function(comment) {
  /**
   * The ID of the comment this event pertains to.
   * @type {string}
   */
  this.commentId = comment.id;

  /**
   * The workspace identifier for this event.
   * @type {string}
   */
  this.workspaceId = comment.workspace.id;

  /**
   * The ID of the block this comment belongs to or null if it is not a block
   * comment.
   * @type {string}
   */
  this.blockId = comment.blockId || null;

  /**
   * The event group id for the group this event belongs to. Groups define
   * events that should be treated as an single action from the user's
   * perspective, and should be undone together.
   * @type {string}
   */
  this.group = Blockly.Events.group_;

  /**
   * Sets whether the event should be added to the undo stack.
   * @type {boolean}
   */
  this.recordUndo = Blockly.Events.recordUndo;
};
goog.inherits(Blockly.Events.CommentBase, Blockly.Events.Abstract);

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.CommentBase.prototype.toJson = function() {
  var json = {
    'type': this.type
  };
  if (this.group) {
    json['group'] = this.group;
  }
  if (this.commentId) {
    json['commentId'] = this.commentId;
  }
  if (this.blockId) {
    json['blockId'] = this.blockId;
  }
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.CommentBase.prototype.fromJson = function(json) {
  this.commentId = json['commentId'];
  this.group = json['group'];
  this.blockId = json['blockId'];
};

/**
 * Helper function for finding the comment this event pertains to.
 * @return {?(Blockly.WorkspaceComment | Blockly.ScratchBlockComment)}
 *     The comment this event pertains to, or null if it no longer exists.
 * @private
 */
Blockly.Events.CommentBase.prototype.getComment_ = function() {
  var workspace = this.getEventWorkspace_();
  return workspace.getCommentById(this.commentId);
};

/**
 * Class for a comment change event.
 * @param {Blockly.WorkspaceComment | Blockly.ScratchBlockComment} comment
 *     The comment that is being changed. Null for a blank event.
 * @param {!object} oldContents Object containing previous state of a comment's
 *     properties. The possible properties can be: 'minimized', 'text', or
 *     'width' and 'height' together. Must contain the same property (or in the
 *     case of 'width' and 'height' properties) as the 'newContents' param.
 * @param {!object} newContents Object containing the new state of a comment's
 *     properties. The possible properties can be: 'minimized', 'text', or
 *     'width' and 'height' together. Must contain the same property (or in the
 *     case of 'width' and 'height' properties) as the 'oldContents' param.
 * @extends {Blockly.Events.CommentBase}
 * @constructor
 */
Blockly.Events.CommentChange = function(comment, oldContents, newContents) {
  if (!comment) {
    return;  // Blank event to be populated by fromJson.
  }
  Blockly.Events.CommentChange.superClass_.constructor.call(this, comment);
  this.oldContents_ = oldContents;
  this.newContents_ = newContents;
};
goog.inherits(Blockly.Events.CommentChange, Blockly.Events.CommentBase);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.CommentChange.prototype.type = Blockly.Events.COMMENT_CHANGE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.CommentChange.prototype.toJson = function() {
  var json = Blockly.Events.CommentChange.superClass_.toJson.call(this);
  json['newContents'] = this.newContents_;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.CommentChange.prototype.fromJson = function(json) {
  Blockly.Events.CommentChange.superClass_.fromJson.call(this, json);
  this.newContents_ = json['newValue'];
};

/**
 * Does this event record any change of state?
 * @return {boolean} False if something changed.
 */
Blockly.Events.CommentChange.prototype.isNull = function() {
  return this.oldContents_ == this.newContents_;
};

/**
 * Run a change event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
Blockly.Events.CommentChange.prototype.run = function(forward) {
  var comment = this.getComment_();
  if (!comment) {
    console.warn('Can\'t change non-existent comment: ' + this.commentId);
    return;
  }
  var contents = forward ? this.newContents_ : this.oldContents_;

  if (contents.hasOwnProperty('minimized')) {
    comment.setMinimized(contents.minimized);
  }
  if (contents.hasOwnProperty('width') && contents.hasOwnProperty('height')) {
    comment.setSize(contents.width, contents.height);
  }
  if (contents.hasOwnProperty('text')) {
    comment.setText(contents.text);
  }
};

/**
 * Class for a comment creation event.
 * @param {Blockly.WorkspaceComment | Blockly.ScratchBlockComment} comment
 *     The created comment. Null for a blank event.
 * @param {string=} opt_blockId Optional id for the block this comment belongs
 *     to, if it is a block comment.
 * @extends {Blockly.Events.CommentBase}
 * @constructor
 */
Blockly.Events.CommentCreate = function(comment) {
  if (!comment) {
    return;  // Blank event to be populated by fromJson.
  }
  Blockly.Events.CommentCreate.superClass_.constructor.call(this, comment);

  /**
   * The text content of this comment.
   * @type {string}
   */
  this.text = comment.getText();

  /**
   * The XY position of this comment on the workspace.
   * @type {goog.math.Coordinate}
   */
  this.xy = comment.getXY();

  var hw = comment.getHeightWidth();

  /**
   * The width of this comment when it is full size.
   * @type {number}
   */
  this.width = hw.width;

  /**
   * The height of this comment when it is full size.
   * @type {number}
   */
  this.height = hw.height;

  /**
   * Whether or not this comment is minimized.
   * @type {boolean}
   */
  this.minimized = comment.isMinimized() || false;

  this.xml = comment.toXmlWithXY();
};
goog.inherits(Blockly.Events.CommentCreate, Blockly.Events.CommentBase);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.CommentCreate.prototype.type = Blockly.Events.COMMENT_CREATE;

/**
 * Encode the event as JSON.
 * TODO (github.com/google/blockly/issues/1266): "Full" and "minimal"
 * serialization.
 * @return {!Object} JSON representation.
 */
Blockly.Events.CommentCreate.prototype.toJson = function() {
  var json = Blockly.Events.CommentCreate.superClass_.toJson.call(this);
  json['xml'] = Blockly.Xml.domToText(this.xml);
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.CommentCreate.prototype.fromJson = function(json) {
  Blockly.Events.CommentCreate.superClass_.fromJson.call(this, json);
  this.xml = Blockly.Xml.textToDom('<xml>' + json['xml'] + '</xml>').firstChild;
};

/**
 * Run a creation event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
Blockly.Events.CommentCreate.prototype.run = function(forward) {
  if (forward) {
    var workspace = this.getEventWorkspace_();
    if (this.blockId) {
      var block = workspace.getBlockById(this.blockId);
      if (block) {
        block.setCommentText('', this.commentId, this.xy.x, this.xy.y, this.minimized);
      }
    } else {
      var xml = goog.dom.createDom('xml');
      xml.appendChild(this.xml);
      Blockly.Xml.domToWorkspace(xml, workspace);
    }
  } else {
    var comment = this.getComment_();
    if (comment) {
      comment.dispose(false, false);
    } else {
      // Only complain about root-level block.
      console.warn("Can't uncreate non-existent comment: " + this.commentId);
    }
  }
};

/**
 * Class for a comment deletion event.
 * @param {Blockly.WorkspaceComment | Blockly.ScratchBlockComment} comment
 *     The deleted comment. Null for a blank event.
 * @extends {Blockly.Events.CommentBase}
 * @constructor
 */
Blockly.Events.CommentDelete = function(comment) {
  if (!comment) {
    return;  // Blank event to be populated by fromJson.
  }
  Blockly.Events.CommentDelete.superClass_.constructor.call(this, comment);
  this.xy = comment.getXY();
  this.minimized = comment.isMinimized() || false;
  this.text = comment.getText();
  var hw = comment.getHeightWidth();
  this.height = hw.height;
  this.width = hw.width;

  this.xml = comment.toXmlWithXY();
};
goog.inherits(Blockly.Events.CommentDelete, Blockly.Events.CommentBase);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.CommentDelete.prototype.type = Blockly.Events.COMMENT_DELETE;

/**
 * Encode the event as JSON.
 * TODO (github.com/google/blockly/issues/1266): "Full" and "minimal"
 * serialization.
 * @return {!Object} JSON representation.
 */
Blockly.Events.CommentDelete.prototype.toJson = function() {
  var json = Blockly.Events.CommentDelete.superClass_.toJson.call(this);
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.CommentDelete.prototype.fromJson = function(json) {
  Blockly.Events.CommentDelete.superClass_.fromJson.call(this, json);
};

/**
 * Run a creation event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
Blockly.Events.CommentDelete.prototype.run = function(forward) {
  if (forward) {
    var comment = this.getComment_();
    if (comment) {
      comment.dispose(false, false);
    } else {
      // Only complain about root-level block.
      console.warn("Can't delete non-existent comment: " + this.commentId);
    }
  } else {
    var workspace = this.getEventWorkspace_();
    if (this.blockId) {
      var block = workspace.getBlockById(this.blockId);
      block.setCommentText(this.text, this.commentId, this.xy.x, this.xy.y, this.minimized);
      block.comment.setSize(this.width, this.height);
    } else {
      var xml = goog.dom.createDom('xml');
      xml.appendChild(this.xml);
      Blockly.Xml.domToWorkspace(xml, workspace);
    }
  }
};

/**
 * Class for a comment move event.  Created before the move.
 * @param {Blockly.WorkspaceComment | Blockly.ScratchBlockComment} comment
 *     The comment that is being moved. Null for a blank event.
 * @extends {Blockly.Events.CommentBase}
 * @constructor
 */
Blockly.Events.CommentMove = function(comment) {
  if (!comment) {
    return;  // Blank event to be populated by fromJson.
  }
  Blockly.Events.CommentMove.superClass_.constructor.call(this, comment);

  /**
   * The comment that is being moved.  Will be cleared after recording the new
   * location.
   * @type {?Blockly.WorkspaceComment | Blockly.ScratchBlockComment}
   */
  this.comment_ = comment;

  this.workspaceWidth_ = comment.workspace.getWidth();
  /**
   * The location before the move, in workspace coordinates.
   * @type {!goog.math.Coordinate}
   */
  this.oldCoordinate_ = this.currentLocation_();

  /**
   * The location after the move, in workspace coordinates.
   * @type {!goog.math.Coordinate}
   */
  this.newCoordinate_ = null;
};
goog.inherits(Blockly.Events.CommentMove, Blockly.Events.CommentBase);

/**
 * Calculate the current, language agnostic location of the comment.
 * This value should not report different numbers in LTR vs. RTL.
 * @return {goog.math.Coordinate} The location of the comment.
 * @private
 */
Blockly.Events.CommentMove.prototype.currentLocation_ = function() {
  var xy = this.comment_.getXY();
  if (!this.comment_.workspace.RTL) {
    return xy;
  }

  var rtlAwareX;
  if (this.comment_ instanceof Blockly.ScratchBlockComment) {
    var commentWidth = this.comment_.getBubbleSize().width;
    rtlAwareX = this.workspaceWidth_ - xy.x - commentWidth;
  } else {
    rtlAwareX = this.workspaceWidth_ - xy.x;
  }
  return new goog.math.Coordinate(rtlAwareX, xy.y);
};

/**
 * Record the comment's new location.  Called after the move.  Can only be
 * called once.
 */
Blockly.Events.CommentMove.prototype.recordNew = function() {
  if (!this.comment_) {
    throw new Error('Tried to record the new position of a comment on the ' +
        'same event twice.');
  }
  this.newCoordinate_ = this.currentLocation_();
  this.comment_ = null;
};

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.CommentMove.prototype.type = Blockly.Events.COMMENT_MOVE;

/**
 * Override the location before the move.  Use this if you don't create the
 * event until the end of the move, but you know the original location.
 * @param {!goog.math.Coordinate} xy The location before the move, in workspace
 *     coordinates.
 */
Blockly.Events.CommentMove.prototype.setOldCoordinate = function(xy) {
  this.oldCoordinate_ = new goog.math.Coordinate(this.comment_.workspace.RTL ?
      this.workspaceWidth_ - xy.x : xy.x, xy.y);
};

/**
 * Encode the event as JSON.
 * TODO (github.com/google/blockly/issues/1266): "Full" and "minimal"
 * serialization.
 * @return {!Object} JSON representation.
 */
Blockly.Events.CommentMove.prototype.toJson = function() {
  var json = Blockly.Events.CommentMove.superClass_.toJson.call(this);
  if (this.newCoordinate_) {
    json['newCoordinate'] = Math.round(this.newCoordinate_.x) + ',' +
        Math.round(this.newCoordinate_.y);
  }
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.CommentMove.prototype.fromJson = function(json) {
  Blockly.Events.CommentMove.superClass_.fromJson.call(this, json);

  if (json['newCoordinate']) {
    var xy = json['newCoordinate'].split(',');
    this.newCoordinate_ =
        new goog.math.Coordinate(parseFloat(xy[0]), parseFloat(xy[1]));
  }
};

/**
 * Does this event record any change of state?
 * @return {boolean} False if something changed.
 */
Blockly.Events.CommentMove.prototype.isNull = function() {
  return goog.math.Coordinate.equals(this.oldCoordinate_, this.newCoordinate_);
};

/**
 * Run a move event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
Blockly.Events.CommentMove.prototype.run = function(forward) {
  var comment = this.getComment_();
  if (!comment) {
    console.warn('Can\'t move non-existent comment: ' + this.commentId);
    return;
  }

  var target = forward ? this.newCoordinate_ : this.oldCoordinate_;

  if (comment instanceof Blockly.ScratchBlockComment) {
    if (comment.workspace.RTL) {
      comment.moveTo(this.workspaceWidth_ - target.x, target.y);
    } else {
      comment.moveTo(target.x, target.y);
    }
  } else {
    // TODO: Check if the comment is being dragged, and give up if so.
    var current = comment.getXY();
    if (comment.workspace.RTL) {
      var deltaX = target.x - (this.workspaceWidth_ - current.x);
      comment.moveBy(-deltaX, target.y - current.y);
    } else {
      comment.moveBy(target.x - current.x, target.y - current.y);
    }

  }
};
