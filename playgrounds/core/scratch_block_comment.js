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
 * @fileoverview Object representing a code comment.
 * @author kchadha@scratch.mit.edu (Karishma Chadha)
 */
'use strict';

goog.provide('Blockly.ScratchBlockComment');

goog.require('Blockly.Comment');
goog.require('Blockly.Events.BlockChange');
goog.require('Blockly.Events.Ui');
goog.require('Blockly.Icon');
goog.require('Blockly.ScratchBubble');

goog.require('goog.math.Coordinate');
goog.require('goog.userAgent');


/**
 * Class for a comment.
 * @param {!Blockly.Block} block The block associated with this comment.
 * @param {string} text The text content of this comment.
 * @param {string=} id Optional uid for comment; a new one will be generated if
 *     not provided.
 * @param {number=} x Initial x position for comment, in workspace coordinates.
 * @param {number=} y Initial y position for comment, in workspace coordinates.
 * @param {boolean=} minimized Whether or not this comment is minimized
 *     (only the top bar displays), defaults to false.
 * @extends {Blockly.Comment}
 * @constructor
 */
Blockly.ScratchBlockComment = function(block, text, id, x, y, minimized) {
  Blockly.ScratchBlockComment.superClass_.constructor.call(this, block);
  /**
   * The text content of this comment.
   * @type {string}
   * @private
   */
  this.text_ = text;

  var xIsValidNumber = typeof x == 'number' && !isNaN(x);
  var yIsValidNumber = typeof y == 'number' && !isNaN(y);

  /**
   * Whether this comment needs to be auto-positioned (based on provided values
   * for x and y position).
   * @type {boolean}
   * @private
   */
  this.needsAutoPositioning_ = !xIsValidNumber && !yIsValidNumber;
  // If both of the given x and y params are invalid, this comment needs to be auto positioned.

  /**
   * The x position of this comment in workspace coordinates. Default to 0 if
   * x position is not provided or is not a valid number.
   * @type {number}
   * @private
   */
  this.x_ = xIsValidNumber ? x : 0;
  /**
   * The y position of this comment in workspace coordinates. Default to 0 if
   * y position is not provided or is not a valid number.
   * @type {number}
   * @private
   */
  this.y_ = yIsValidNumber ? y : 0;
  /**
   * Whether this comment is minimized.
   * @type {boolean}
   * @private
   */
  this.isMinimized_ = minimized || false;

  /**
   * The workspace this comment belongs to.
   * @type {Blockly.Workspace}
   * @package
   */
  this.workspace = block.workspace;
  /**
   * The unique identifier for this comment.
   * @type {string}
   * @package
   */
  this.id = goog.isString(id) && !this.workspace.getCommentById(id) ?
      id : Blockly.utils.genUid();
  this.workspace.addTopComment(this);

  /**
   * The id of the block this comment belongs to.
   * @type {string}
   * @package
   */
  this.blockId = block.id;

  if (!block.rendered) {
    Blockly.ScratchBlockComment.fireCreateEvent(this);
  }
  // If the block is rendered, fire event the create event when the comment is made
  // visible
};
goog.inherits(Blockly.ScratchBlockComment, Blockly.Comment);

/**
 * Width of bubble.
 * @private
 */
Blockly.ScratchBlockComment.prototype.width_ = 200;

/**
 * Height of bubble.
 * @private
 */
Blockly.ScratchBlockComment.prototype.height_ = 200;

/**
 * Comment Icon Size.
 * @package
 */
Blockly.ScratchBlockComment.prototype.SIZE = 0;

/**
 * Offset for text area in comment bubble.
 * @private
 */
Blockly.ScratchBlockComment.TEXTAREA_OFFSET = 12;

/**
 * Maximum lable length (actual label length will include
 * one additional character, the ellipsis).
 * @private
 */
Blockly.ScratchBlockComment.MAX_LABEL_LENGTH = 12;

/**
 * Maximum character length for comment text.
 * @private
 */
Blockly.ScratchBlockComment.COMMENT_TEXT_LIMIT = 8000;

/**
 * Width that a minimized comment should have.
 * @private
 */
Blockly.ScratchBlockComment.MINIMIZE_WIDTH = 200;

/**
 * Draw the comment icon.
 * @param {!Element} _group The icon group.
 * @private
 */
Blockly.ScratchBlockComment.prototype.drawIcon_ = function(_group) {
  // NO-OP -- Don't render a comment icon for Scratch block comments
};

// Override renderIcon from Blocky.Icon so that the comment bubble is
// anchored correctly on the block. This function takes in the top margin
// as an input instead of setting an arbitrary one.
/**
 * Render the icon.
 * @param {number} cursorX Horizontal offset at which to position the icon.
 * @param {number} topMargin Vertical offset from the top of the block to position the icon.
 * @return {number} Horizontal offset for next item to draw.
 * @package
 */
Blockly.ScratchBlockComment.prototype.renderIcon = function(cursorX, topMargin) {
  if (this.collapseHidden && this.block_.isCollapsed()) {
    this.iconGroup_.setAttribute('display', 'none');
    return cursorX;
  }
  this.iconGroup_.setAttribute('display', 'block');

  var width = this.SIZE;
  if (this.block_.RTL) {
    cursorX -= width;
  }
  this.iconGroup_.setAttribute('transform',
      'translate(' + cursorX + ',' + topMargin + ')');
  this.computeIconLocation();
  if (this.block_.RTL) {
    cursorX -= Blockly.BlockSvg.SEP_SPACE_X;
  } else {
    cursorX += width + Blockly.BlockSvg.SEP_SPACE_X;
  }
  return cursorX;
};

/**
 * Create the editor for the comment's bubble.
 * @return {{commentEditor: !Element, labelText: !string}} The components used
 *     to render the comment editing/writing area and the truncated label text
 *     to display in the minimized comment top bar.
 * @private
 */
Blockly.ScratchBlockComment.prototype.createEditor_ = function() {
  this.foreignObject_ = Blockly.utils.createSvgElement('foreignObject',
      {
        'x': Blockly.ScratchBubble.BORDER_WIDTH,
        'y': Blockly.ScratchBubble.BORDER_WIDTH + Blockly.ScratchBubble.TOP_BAR_HEIGHT,
        'class': 'scratchCommentForeignObject'
      },
      null);
  var body = document.createElementNS(Blockly.HTML_NS, 'body');
  body.setAttribute('xmlns', Blockly.HTML_NS);
  body.className = 'blocklyMinimalBody scratchCommentBody';
  var textarea = document.createElementNS(Blockly.HTML_NS, 'textarea');
  textarea.className = 'scratchCommentTextarea scratchCommentText';
  textarea.setAttribute('dir', this.block_.RTL ? 'RTL' : 'LTR');
  textarea.setAttribute('maxlength', Blockly.ScratchBlockComment.COMMENT_TEXT_LIMIT);
  body.appendChild(textarea);
  this.textarea_ = textarea;
  this.textarea_.style.margin = (Blockly.ScratchBlockComment.TEXTAREA_OFFSET) + 'px';
  this.foreignObject_.appendChild(body);
  Blockly.bindEventWithChecks_(textarea, 'mouseup', this, this.textareaFocus_);
  // Don't zoom with mousewheel.
  Blockly.bindEventWithChecks_(textarea, 'wheel', this, function(e) {
    e.stopPropagation();
  });
  Blockly.bindEventWithChecks_(textarea, 'change', this, function(_e) {
    if (this.text_ != textarea.value) {
      Blockly.Events.fire(new Blockly.Events.CommentChange(
          this, {text: this.text_}, {text: textarea.value}));
      this.text_ = textarea.value;
    }
  });
  setTimeout(function() {
    textarea.focus();
  }, 0);

  // Label for comment top bar when comment is minimized
  this.label_ = this.getLabelText();

  return {
    commentEditor: this.foreignObject_,
    labelText: this.label_
  };
};

/**
 * Callback function triggered when the bubble has resized.
 * Resize the text area accordingly.
 * @private
 */
Blockly.ScratchBlockComment.prototype.resizeBubble_ = function() {
  if (this.isVisible() && !this.isMinimized_) {
    var size = this.bubble_.getBubbleSize();
    var doubleBorderWidth = 2 * Blockly.ScratchBubble.BORDER_WIDTH;
    var textOffset = Blockly.ScratchBlockComment.TEXTAREA_OFFSET * 2;
    this.foreignObject_.setAttribute('width', size.width - doubleBorderWidth);
    this.foreignObject_.setAttribute('height', size.height - doubleBorderWidth - Blockly.ScratchBubble.TOP_BAR_HEIGHT);
    this.textarea_.style.width = (size.width - textOffset) + 'px';
    this.textarea_.style.height = (size.height - doubleBorderWidth -
       Blockly.ScratchBubble.TOP_BAR_HEIGHT - textOffset) + 'px';

    // Actually set the size!
    this.width_ = size.width;
    this.height_ = size.height;
  }
};

/**
 * Change the colour of the associated bubble to match its block.
 * @package
 */
Blockly.ScratchBlockComment.prototype.updateColour = function() {
  if (this.isVisible()) {
    this.bubble_.setColour(this.block_.getColourTertiary());
  }
};

/**
 * Auto position this comment given information about the block that owns this
 * comment and the comment state, if this block needs auto positioning.
 * @private
 */
Blockly.ScratchBlockComment.prototype.autoPosition_ = function() {
  if (!this.needsAutoPositioning_) return;
  if (this.isMinimized_) {
    var minimizedOffset = 4 * Blockly.BlockSvg.GRID_UNIT;
    this.x_ = this.block_.RTL ?
        this.iconXY_.x - minimizedOffset :
        this.iconXY_.x + minimizedOffset;
    this.y_ = this.iconXY_.y - (Blockly.ScratchBubble.TOP_BAR_HEIGHT / 2);
  } else {
    // Check if the width of this block (and all it's children/descendents) is the
    // same as the width of just this block
    var fullStackWidth = Math.floor(this.block_.getHeightWidth().width);
    var thisBlockWidth = Math.floor(this.block_.svgPath_.getBBox().width);
    var offset = 8 * Blockly.BlockSvg.GRID_UNIT;
    if (fullStackWidth == thisBlockWidth && !this.block_.parentBlock_) {
      this.x_ = this.block_.RTL ?
          this.iconXY_.x - this.width_ - offset :
          this.iconXY_.x + offset;
    } else {
      this.x_ = this.block_.RTL ?
          this.iconXY_.x - this.width_ - fullStackWidth - offset :
          this.iconXY_.x + fullStackWidth + offset;
    }
    this.y_ = this.iconXY_.y - (Blockly.ScratchBubble.TOP_BAR_HEIGHT / 2);
  }
};

/**
 * Show or hide the comment bubble.
 * @param {boolean} visible True if the bubble should be visible.
 * @package
 */
Blockly.ScratchBlockComment.prototype.setVisible = function(visible) {
  if (visible == this.isVisible()) {
    // No change.
    return;
  }
  if ((!this.block_.isEditable() && !this.textarea_) || goog.userAgent.IE) {
    // Steal the code from warnings to make an uneditable text bubble.
    // MSIE does not support foreignobject; textareas are impossible.
    // http://msdn.microsoft.com/en-us/library/hh834675%28v=vs.85%29.aspx
    // Always treat comments in IE as uneditable.
    Blockly.Warning.prototype.setVisible.call(this, visible);
    return;
  }
  // Save the bubble stats before the visibility switch.
  var text = this.getText();
  var size = this.getBubbleSize();
  if (visible) {
    // Auto position this comment, if necessary.
    if (this.needsAutoPositioning_) {
      this.autoPosition_();
      // This comment has been auto-positioned so reset the flag
      this.needsAutoPositioning_ = false;
    }

    // Create the bubble.
    this.bubble_ = new Blockly.ScratchBubble(
        this, /** @type {!Blockly.WorkspaceSvg} */ (this.block_.workspace),
        this.createEditor_(), this.iconXY_, this.width_, this.height_,
        this.x_, this.y_, this.isMinimized_);
    this.bubble_.setAutoLayout(false);
    this.bubble_.registerResizeEvent(this.resizeBubble_.bind(this));
    this.bubble_.registerMinimizeToggleEvent(this.toggleMinimize_.bind(this));
    this.bubble_.registerDeleteEvent(this.dispose.bind(this));
    this.bubble_.registerContextMenuCallback(this.showContextMenu_.bind(this));
    this.updateColour();
  } else {
    // Dispose of the bubble.
    this.bubble_.dispose();
    this.bubble_ = null;
    this.textarea_ = null;
    this.foreignObject_ = null;
    this.label_ = null;
  }
  // Restore the bubble stats after the visibility switch.
  this.setText(text);
  this.setBubbleSize(size.width, size.height);
  if (visible) {
    Blockly.ScratchBlockComment.fireCreateEvent(this);
  }
};

/**
 * Toggle the minimization state of this comment.
 * @private
 */
Blockly.ScratchBlockComment.prototype.toggleMinimize_ = function() {
  this.setMinimized(!this.isMinimized_);
};

/**
 * Set the minimized state for this comment.
 * @param {boolean} minimize Whether the comment should be minimized
 * @package
 */
Blockly.ScratchBlockComment.prototype.setMinimized = function(minimize) {
  if (this.isMinimized_ == minimize) {
    return;
  }
  Blockly.Events.fire(new Blockly.Events.CommentChange(this,
      {minimized: this.isMinimized_}, {minimized: minimize}));
  this.isMinimized_ = minimize;
  if (minimize) {
    this.bubble_.setMinimized(true, this.getLabelText());
    this.setBubbleSize(Blockly.ScratchBlockComment.MINIMIZE_WIDTH,
        Blockly.ScratchBubble.TOP_BAR_HEIGHT);
    // Note we are not updating this.width_ or this.height_ here
    // because we want to keep track of the width/height of the
    // maximized comment
  } else {
    this.bubble_.setMinimized(false);
    this.setText(this.text_);
    this.setBubbleSize(this.width_, this.height_);
  }
};

/**
 * Size this comment's bubble.
 * @param {number} width Width of the bubble.
 * @param {number} height Height of the bubble.
 * @package
 */
Blockly.ScratchBlockComment.prototype.setBubbleSize = function(width, height) {
  if (this.bubble_) {
    if (this.isMinimized_) {
      this.bubble_.setBubbleSize(Blockly.ScratchBlockComment.MINIMIZE_WIDTH,
          Blockly.ScratchBubble.TOP_BAR_HEIGHT);
    } else {
      this.bubble_.setBubbleSize(width, height);
    }
  }
};

/**
 * Set the un-minimized size of this comment. If the comment has an un-minimized
 * bubble, also set the bubble's size.
 * @param {number} width Width of the unminimized comment.
 * @param {number} height Height of the unminimized comment.
 * @package
 */
Blockly.ScratchBlockComment.prototype.setSize = function(width, height) {
  var oldWidth = this.width_;
  var oldHeight = this.height_;

  if (!this.isMinimized_) {
    this.setBubbleSize(width, height);
  }

  this.height_ = height;
  this.width_ = width;

  if (oldWidth != this.width_ || oldHeight != this.height_) {
    Blockly.Events.fire(new Blockly.Events.CommentChange(
        this,
        {width: oldWidth, height: oldHeight},
        {width: this.width_, height: this.height_}));
  }
};

/**
 * Get the truncated text for this comment to display in the minimized
 * top bar.
 * @return {string} The truncated comment text
 * @package
 */
Blockly.ScratchBlockComment.prototype.getLabelText = function() {
  if (this.text_.length > Blockly.ScratchBlockComment.MAX_LABEL_LENGTH) {
    if (this.block_.RTL) {
      return '\u2026' + this.text_.slice(0, Blockly.ScratchBlockComment.MAX_LABEL_LENGTH);
    }
    return this.text_.slice(0, Blockly.ScratchBlockComment.MAX_LABEL_LENGTH) + '\u2026';
  } else {
    return this.text_;
  }
};

/**
 * Set this comment's text.
 * @param {string} text Comment text.
 * @package
 */
Blockly.ScratchBlockComment.prototype.setText = function(text) {
  if (this.text_ != text) {
    Blockly.Events.fire(new Blockly.Events.CommentChange(
        this, {text: this.text_}, {text: text}));
    this.text_ = text;
  }
  if (this.textarea_) {
    this.textarea_.value = text;
  }
};

/**
 * Move this comment to a position given x and y coordinates.
 * @param {number} x The x-coordinate on the workspace.
 * @param {number} y The y-coordinate on the workspace.
 * @package
 */
Blockly.ScratchBlockComment.prototype.moveTo = function(x, y) {
  var event = new Blockly.Events.CommentMove(this);
  if (this.bubble_) {
    this.bubble_.moveTo(x, y);
  }
  this.x_ = x;
  this.y_ = y;
  event.recordNew();
  Blockly.Events.fire(event);
};

/**
 * Get the x and y position of this comment.
 * @return {goog.math.Coordinate} The XY position
 * @package
 */
Blockly.ScratchBlockComment.prototype.getXY = function() {
  if (this.bubble_) {
    return this.bubble_.getRelativeToSurfaceXY();
  }
  // Auto position this comment if iconXY_ is provided
  // (auto positioning will only occur if it is necessary).
  if (this.needsAutoPositioning_ && this.iconXY_) {
    this.autoPosition_();
    // Do not reset the needsAutoPositioning flag here. This will be reset
    // after the comment has been made visible and the re-auto positioned,
    // because the block may have moved by that point.
  }
  return new goog.math.Coordinate(this.x_, this.y_);
};

/**
 * Get the height and width of this comment.
 * Note: this does not use the current bubble size because
 * the bubble may be minimized.
 * @return {{height: number, width: number}} The height and width of
 *     this comment when it is full size. These numbers do not change
 *     as the workspace zoom changes.
 * @package
 */
Blockly.ScratchBlockComment.prototype.getHeightWidth = function() {
  return {height: this.height_, width: this.width_};
};

/**
 * Returns the coordinates of a bounding box describing the dimensions of this
 * comment.
 * Coordinate system: workspace coordinates.
 * @return {!{topLeft: goog.math.Coordinate, bottomRight: goog.math.Coordinate}}
 *    Object with top left and bottom right coordinates of the bounding box.
 * @package
 */
Blockly.ScratchBlockComment.prototype.getBoundingRectangle = function() {
  var commentXY = this.getXY();
  var commentBounds = this.getHeightWidth();
  var topLeft;
  var bottomRight;
  if (this.workspace.RTL) {
    // TODO (#1562) for some reason this doesn't work with workspace scroll in RTL
    topLeft = new goog.math.Coordinate(commentXY.x - commentBounds.width,
        commentXY.y);
    bottomRight = new goog.math.Coordinate(commentXY.x,
        commentXY.y + commentBounds.height);
  } else {
    topLeft = new goog.math.Coordinate(commentXY.x, commentXY.y);
    bottomRight = new goog.math.Coordinate(commentXY.x + commentBounds.width,
        commentXY.y + commentBounds.height);
  }
  return {topLeft: topLeft, bottomRight: bottomRight};
};

/**
 * Check whether this comment is currently minimized.
 * @return {boolean} True if minimized
 * @package
 */
Blockly.ScratchBlockComment.prototype.isMinimized = function() {
  return this.isMinimized_;
};

/**
 * Show the context menu for this comment's bubble.
 * @param {!Event} e The mouse event
 * @private
 */
Blockly.ScratchBlockComment.prototype.showContextMenu_ = function(e) {
  var menuOptions = [];
  menuOptions.push(Blockly.ContextMenu.commentDeleteOption(this, Blockly.Msg.DELETE));
  Blockly.ContextMenu.show(e, menuOptions, this.block_.RTL);
};

/**
 * Encode a comment subtree as XML with XY coordinates.
 * @param {boolean=} opt_noId True if the encoder should skip the comment id.
 * @return {!Element} Tree of XML elements.
 * @package
 */
Blockly.ScratchBlockComment.prototype.toXmlWithXY = function() {
  var element = goog.dom.createDom('comment');
  element.setAttribute('id', this.id);
  element.textContent = this.text_;
  element.setAttribute('x', Math.round(this.x_));
  element.setAttribute('y', Math.round(this.y_));
  element.setAttribute('h', this.height_);
  element.setAttribute('w', this.width_);
  return element;
};

/**
 * Fire a create event for the given workspace comment, if comments are enabled.
 * @param {!Blockly.WorkspaceComment} comment The comment that was just created.
 * @package
 */
Blockly.ScratchBlockComment.fireCreateEvent = function(comment) {
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
 * Dispose of this comment.
 */
Blockly.ScratchBlockComment.prototype.dispose = function() {
  if (Blockly.Events.isEnabled()) {
    // Emit delete event before disposal begins so that the
    // event's reference to this comment contains all the relevant
    // information (for undoing this event)
    Blockly.Events.fire(new Blockly.Events.CommentDelete(this));
  }
  this.block_.comment = null;
  this.workspace.removeTopComment(this);
  Blockly.Icon.prototype.dispose.call(this);
};
