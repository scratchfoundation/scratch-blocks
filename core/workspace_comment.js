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
 * @fileoverview Object representing a code comment on the workspace.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.WorkspaceComment');

goog.require('Blockly.Events.CommentChange');
goog.require('Blockly.Events.CommentCreate');
goog.require('Blockly.Events.CommentDelete');
goog.require('Blockly.Events.CommentMove');

goog.require('goog.math.Coordinate');


/**
 * Class for a workspace comment.
 * @param {!Blockly.Workspace} workspace The block's workspace.
 * @param {string} content The content of this workspace comment.
 * @param {number} height Height of the comment.
 * @param {number} width Width of the comment.
 * @param {boolean} minimized Whether this comment is in the minimized state
 * @param {string=} opt_id Optional ID.  Use this ID if provided, otherwise
 *     create a new ID.  If the ID conflicts with an in-use ID, a new one will
 *     be generated.
 * @constructor
 */
Blockly.WorkspaceComment = function(workspace, content, height, width, minimized, opt_id) {
  /** @type {string} */
  this.id = (opt_id && !workspace.getCommentById(opt_id)) ?
      opt_id : Blockly.utils.genUid();

  workspace.addTopComment(this);

  /**
   * The comment's position in workspace units.  (0, 0) is at the workspace's
   * origin; scale does not change this value.
   * @type {!goog.math.Coordinate}
   * @protected
   */
  this.xy_ = new goog.math.Coordinate(0, 0);

  /**
   * The comment's height in workspace units.  Scale does not change this value.
   * @type {number}
   * @private
   */
  this.height_ = height;

  /**
   * The comment's width in workspace units.  Scale does not change this value.
   * @type {number}
   * @private
   */
  this.width_ = width;

  /**
   * The comment's minimized state.
   * @type{boolean}
   * @private
   */
  this.isMinimized_ = minimized;

  /**
   * @type {!Blockly.Workspace}
   */
  this.workspace = workspace;

  /**
   * @protected
   * @type {boolean}
   */
  this.RTL = workspace.RTL;

  /**
   * @type {boolean}
   * @private
   */
  this.deletable_ = true;

  /**
   * @type {boolean}
   * @private
   */
  this.movable_ = true;

  /**
   * @protected
   * @type {!string}
   */
  this.content_ = content;

  /**
   * @package
   * @type {boolean}
   */
  this.isComment = true;

  Blockly.WorkspaceComment.fireCreateEvent(this);
};

/**
 * Maximum lable length (actual label length will include
 * one additional character, the ellipsis).
 * @private
 */
Blockly.WorkspaceComment.MAX_LABEL_LENGTH = 12;

/**
 * Maximum character length for comment text.
 * @private
 */
Blockly.WorkspaceComment.COMMENT_TEXT_LIMIT = 8000;

/**
 * Dispose of this comment.
 * @package
 */
Blockly.WorkspaceComment.prototype.dispose = function() {
  if (!this.workspace) {
    // The comment has already been deleted.
    return;
  }

  if (Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.CommentDelete(this));
  }

  // Remove from the list of top comments and the comment database.
  this.workspace.removeTopComment(this);
  this.workspace = null;
};

// Height, width, x, and y are all stored on even non-rendered comments, to
// preserve state if you pass the contents through a headless workspace.

/**
 * Get comment height.
 * @return {number} comment height.
 * @package
 */
Blockly.WorkspaceComment.prototype.getHeight = function() {
  return this.height_;
};

/**
 * Set comment height.
 * @param {number} height comment height.
 * @package
 */
Blockly.WorkspaceComment.prototype.setHeight = function(height) {
  this.height_ = height;
};

/**
 * Get comment width.
 * @return {number} comment width.
 * @package
 */
Blockly.WorkspaceComment.prototype.getWidth = function() {
  return this.width_;
};

/**
 * Set comment width.
 * @param {number} width comment width.
 * @package
 */
Blockly.WorkspaceComment.prototype.setWidth = function(width) {
  this.width_ = width;
};

/**
 * Get the height and width of this comment.
 * @return {{height: number, width: number}} The height and width of this comment;
 *     these numbers do not change as the workspace scales.
 */
Blockly.WorkspaceComment.prototype.getHeightWidth = function() {
  return {height: this.height_, width: this.width_};
};

/**
 * Get stored location.
 * @return {!goog.math.Coordinate} The comment's stored location.  This is not
 *     valid if the comment is currently being dragged.
 * @package
 */
Blockly.WorkspaceComment.prototype.getXY = function() {
  return this.xy_.clone();
};

/**
 * Move a comment by a relative offset.
 * @param {number} dx Horizontal offset, in workspace units.
 * @param {number} dy Vertical offset, in workspace units.
 * @package
 */
Blockly.WorkspaceComment.prototype.moveBy = function(dx, dy) {
  var event = new Blockly.Events.CommentMove(this);
  this.xy_.translate(dx, dy);
  event.recordNew();
  Blockly.Events.fire(event);
};

/**
 * Get whether this comment is deletable or not.
 * @return {boolean} True if deletable.
 * @package
 */
Blockly.WorkspaceComment.prototype.isDeletable = function() {
  return this.deletable_ &&
      !(this.workspace && this.workspace.options.readOnly);
};

/**
 * Set whether this comment is deletable or not.
 * @param {boolean} deletable True if deletable.
 * @package
 */
Blockly.WorkspaceComment.prototype.setDeletable = function(deletable) {
  this.deletable_ = deletable;
};

/**
 * Get whether this comment is movable or not.
 * @return {boolean} True if movable.
 * @package
 */
Blockly.WorkspaceComment.prototype.isMovable = function() {
  return this.movable_ &&
      !(this.workspace && this.workspace.options.readOnly);
};

/**
 * Set whether this comment is movable or not.
 * @param {boolean} movable True if movable.
 * @package
 */
Blockly.WorkspaceComment.prototype.setMovable = function(movable) {
  this.movable_ = movable;
};

/**
 * Returns this comment's text.
 * @return {string} Comment text.
 * @package
 */
Blockly.WorkspaceComment.prototype.getText = function() {
  return this.content_;
};

/**
 * Set this comment's text content.
 * @param {string} text Comment text.
 * @package
 */
Blockly.WorkspaceComment.prototype.setText = function(text) {
  if (this.content_ != text) {
    Blockly.Events.fire(new Blockly.Events.CommentChange(
        this, {text: this.content_}, {text: text}));
    this.content_ = text;
  }
};

/**
 * Check whether this comment is currently minimized.
 * @return {boolean} True if minimized
 * @package
 */
Blockly.WorkspaceComment.prototype.isMinimized = function() {
  return this.isMinimized_;
};

/**
 * Encode a comment subtree as XML with XY coordinates.
 * @param {boolean=} opt_noId True if the encoder should skip the comment id.
 * @return {!Element} Tree of XML elements.
 * @package
 */
Blockly.WorkspaceComment.prototype.toXmlWithXY = function(opt_noId) {
  var element = this.toXml(opt_noId);
  element.setAttribute('x', Math.round(this.xy_.x));
  element.setAttribute('y', Math.round(this.xy_.y));
  element.setAttribute('h', this.height_);
  element.setAttribute('w', this.width_);
  return element;
};

/**
 * Get the truncated text for this comment to display in the minimized
 * top bar.
 * @return {string} The truncated comment text
 * @package
 */
Blockly.WorkspaceComment.prototype.getLabelText = function() {
  if (this.content_.length > Blockly.WorkspaceComment.MAX_LABEL_LENGTH) {
    if (this.RTL) {
      return '\u2026' + this.content_.slice(0, Blockly.WorkspaceComment.MAX_LABEL_LENGTH);
    }
    return this.content_.slice(0, Blockly.WorkspaceComment.MAX_LABEL_LENGTH) + '\u2026';
  } else {
    return this.content_;
  }
};

/**
 * Encode a comment subtree as XML, but don't serialize the XY coordinates or
 * width and height.  If you need that additional information use toXmlWithXY.
 * @param {boolean=} opt_noId True if the encoder should skip the comment id.
 * @return {!Element} Tree of XML elements.
 * @package
 */
Blockly.WorkspaceComment.prototype.toXml = function(opt_noId) {
  var commentElement = goog.dom.createDom('comment');
  if (!opt_noId) {
    commentElement.setAttribute('id', this.id);
  }
  if (this.isMinimized_) {
    commentElement.setAttribute('minimized', true);
  }
  commentElement.textContent = this.getText();
  return commentElement;
};

/**
 * Fire a create event for the given workspace comment, if comments are enabled.
 * @param {!Blockly.WorkspaceComment} comment The comment that was just created.
 * @package
 */
Blockly.WorkspaceComment.fireCreateEvent = function(comment) {
  if (Blockly.Events.isEnabled()) {
    var existingGroup = Blockly.Events.getGroup();
    if (!existingGroup) {
      Blockly.Events.setGroup(true);
    }
    try {
      Blockly.Events.fire(new Blockly.Events.CommentCreate(comment));
    } finally {
      if (!existingGroup) {
        Blockly.Events.setGroup(false);
      }
    }
  }
};

/**
 * Decode an XML comment tag and create a comment on the workspace.
 * @param {!Element} xmlComment XML comment element.
 * @param {!Blockly.Workspace} workspace The workspace.
 * @return {!Blockly.WorkspaceComment} The created workspace comment.
 * @package
 */
Blockly.WorkspaceComment.fromXml = function(xmlComment, workspace) {
  var info = Blockly.WorkspaceComment.parseAttributes(xmlComment);

  var comment = new Blockly.WorkspaceComment(
      workspace, info.content, info.h, info.w, info.minimized, info.id);

  if (!isNaN(info.x) && !isNaN(info.y)) {
    comment.moveBy(info.x, info.y);
  }

  Blockly.WorkspaceComment.fireCreateEvent(comment);
  return comment;
};

/**
 * Decode an XML comment tag and return the results in an object.
 * @param {!Element} xml XML comment element.
 * @return {!Object} An object containing the information about the comment.
 * @package
 */
Blockly.WorkspaceComment.parseAttributes = function(xml) {
  var xmlH = xml.getAttribute('h');
  var xmlW = xml.getAttribute('w');

  return {
    /* @type {string} */
    id: xml.getAttribute('id'),
    /**
     * The height of the comment in workspace units, or 100 if not specified.
     * @type {number}
     */
    h: xmlH ? parseInt(xmlH, 10) : 100,
    /**
     * The width of the comment in workspace units, or 100 if not specified.
     * @type {number}
     */
    w: xmlW ? parseInt(xmlW, 10) : 100,
    /**
     * The x position of the comment in workspace coordinates, or NaN if not
     * specified in the XML.
     * @type {number}
     */
    x: parseInt(xml.getAttribute('x'), 10),
    /**
     * The y position of the comment in workspace coordinates, or NaN if not
     * specified in the XML.
     * @type {number}
     */
    y: parseInt(xml.getAttribute('y'), 10),
    /**
     * Whether this comment is minimized. Defaults to false if not specified in
     * the XML.
     * @type {boolean}
     */
    minimized: xml.getAttribute('minimized') == 'true' || false,
    /* @type {string} */
    content: xml.textContent
  };
};
