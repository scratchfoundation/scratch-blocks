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
 * @fileoverview Object representing a UI bubble.
 * @author kchadha@scratch.mit.edu (Karishma Chadha)
 */
'use strict';

goog.provide('Blockly.ScratchBubble');

goog.require('Blockly.Touch');
goog.require('Blockly.Workspace');
goog.require('goog.dom');
goog.require('goog.math');
goog.require('goog.math.Coordinate');
goog.require('goog.userAgent');


/**
 * Class for Scratch comment UI bubble.
 * @param {!Blockly.ScratchBlockComment} comment The comment this bubble belongs
 *     to.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace on which to draw the
 *     bubble.
 * @param {!Element} content SVG content for the bubble.
 * @param {!goog.math.Coordinate} anchorXY Absolute position of bubble's anchor
 *     point.
 * @param {?number} bubbleWidth Width of bubble, or null if not resizable.
 * @param {?number} bubbleHeight Height of bubble, or null if not resizable.
 * @param {?number} bubbleX X position of bubble
 * @param {?number} bubbleY Y position of bubble
 * @param {?boolean} minimized Whether or not this comment bubble is minimized
 *     (only the top bar displays), defaults to false if not provided.
 * @extends {Blockly.Bubble}
 * @constructor
 */
Blockly.ScratchBubble = function(comment, workspace, content, anchorXY,
    bubbleWidth, bubbleHeight, bubbleX, bubbleY, minimized) {

  // Needed for Events
  /**
   * The comment this bubble belongs to.
   * @type {Blockly.ScratchBlockComment}
   * @package
   */
  this.comment = comment;

  this.workspace_ = workspace;
  this.content_ = content;
  this.x = bubbleX;
  this.y = bubbleY;
  this.isMinimized_ = minimized || false;
  var canvas = workspace.getBubbleCanvas();
  canvas.appendChild(this.createDom_(content, !!(bubbleWidth && bubbleHeight),
      this.isMinimized_));

  this.setAnchorLocation(anchorXY);
  if (!bubbleWidth || !bubbleHeight) {
    var bBox = /** @type {SVGLocatable} */ (this.content_).getBBox();
    bubbleWidth = bBox.width + 2 * Blockly.ScratchBubble.BORDER_WIDTH;
    bubbleHeight = bBox.height + 2 * Blockly.ScratchBubble.BORDER_WIDTH;
  }
  this.setBubbleSize(bubbleWidth, bubbleHeight);

  // Render the bubble.
  this.positionBubble_();
  this.renderArrow_();
  this.rendered_ = true;

  if (!workspace.options.readOnly) {
    Blockly.bindEventWithChecks_(
        this.minimizeArrow_, 'mousedown', this, this.minimizeArrowMouseDown_);
    Blockly.bindEventWithChecks_(
        this.minimizeArrow_, 'mouseout', this, this.minimizeArrowMouseOut_);
    Blockly.bindEventWithChecks_(
        this.minimizeArrow_, 'mouseup', this, this.minimizeArrowMouseUp_);
    Blockly.bindEventWithChecks_(
        this.deleteIcon_, 'mousedown', this, this.deleteMouseDown_);
    Blockly.bindEventWithChecks_(
        this.deleteIcon_, 'mouseout', this, this.deleteMouseOut_);
    Blockly.bindEventWithChecks_(
        this.deleteIcon_, 'mouseup', this, this.deleteMouseUp_);
    Blockly.bindEventWithChecks_(
        this.commentTopBar_, 'mousedown', this, this.bubbleMouseDown_);
    Blockly.bindEventWithChecks_(
        this.bubbleBack_, 'mousedown', this, this.bubbleMouseDown_);
    if (this.resizeGroup_) {
      Blockly.bindEventWithChecks_(
          this.resizeGroup_, 'mousedown', this, this.resizeMouseDown_);
      Blockly.bindEventWithChecks_(
          this.resizeGroup_, 'mouseup', this, this.resizeMouseUp_);
    }
  }

  this.setAutoLayout(false);
  this.moveTo(this.x, this.y);
};
goog.inherits(Blockly.ScratchBubble, Blockly.Bubble);

/**
 * Width of the border around the bubble.
 * @package
 */
Blockly.ScratchBubble.BORDER_WIDTH = 1;

/**
 * Thickness of the line connecting the bubble
 * to the block.
 * @private
 */
Blockly.ScratchBubble.LINE_THICKNESS = 1;

/**
 * The height of the comment top bar.
 * @package
 */
Blockly.ScratchBubble.TOP_BAR_HEIGHT = 32;

/**
 * The size of the minimize arrow icon in the comment top bar.
 * @private
 */
Blockly.ScratchBubble.MINIMIZE_ICON_SIZE = 16;

/**
 * The size of the delete icon in the comment top bar.
 * @private
 */
Blockly.ScratchBubble.DELETE_ICON_SIZE = 12;

/**
 * The inset for the top bar icons.
 * @private
 */
Blockly.ScratchBubble.TOP_BAR_ICON_INSET = 6;

/**
 * Create the bubble's DOM.
 * @param {!Element} content SVG content for the bubble.
 * @param {boolean} hasResize Add diagonal resize gripper if true.
 * @param {boolean} minimized Whether the bubble is minimized
 * @return {!Element} The bubble's SVG group.
 * @private
 */
Blockly.ScratchBubble.prototype.createDom_ = function(content, hasResize, minimized) {
  this.bubbleGroup_ = Blockly.utils.createSvgElement('g', {}, null);
  this.bubbleArrow_ = Blockly.utils.createSvgElement('line',
      {'stroke-linecap': 'round'},
      this.bubbleGroup_);
  this.bubbleBack_ = Blockly.utils.createSvgElement('rect',
      {
        'class': 'blocklyDraggable scratchCommentRect',
        'x': 0,
        'y': 0,
        'rx': 4 * Blockly.ScratchBubble.BORDER_WIDTH,
        'ry': 4 * Blockly.ScratchBubble.BORDER_WIDTH
      },
      this.bubbleGroup_);

  this.labelText_ = content.labelText;
  this.createCommentTopBar_();

  // Comment Text Editor
  this.commentEditor_ = content.commentEditor;
  this.bubbleGroup_.appendChild(this.commentEditor_);

  // Comment Resize Handle
  if (hasResize) {
    this.createResizeHandle_();
  } else {
    this.resizeGroup_ = null;
  }

  // Show / hide relevant things based on minimized state
  if (minimized) {
    this.minimizeArrow_.setAttributeNS('http://www.w3.org/1999/xlink',
        'xlink:href', Blockly.mainWorkspace.options.pathToMedia + 'comment-arrow-up.svg');
    this.commentEditor_.setAttribute('display', 'none');
    this.resizeGroup_.setAttribute('display', 'none');
  } else {
    this.minimizeArrow_.setAttributeNS('http://www.w3.org/1999/xlink',
        'xlink:href', Blockly.mainWorkspace.options.pathToMedia + 'comment-arrow-down.svg');
    this.topBarLabel_.setAttribute('display', 'none');
  }

  return this.bubbleGroup_;
};

/**
 * Create the comment top bar and its contents.
 * @private
 */
Blockly.ScratchBubble.prototype.createCommentTopBar_ = function() {
  this.commentTopBar_ = Blockly.utils.createSvgElement('rect',
      {
        'class': 'blocklyDraggable scratchCommentTopBar',
        'rx': Blockly.ScratchBubble.BORDER_WIDTH,
        'ry': Blockly.ScratchBubble.BORDER_WIDTH,
        'height': Blockly.ScratchBubble.TOP_BAR_HEIGHT
      }, this.bubbleGroup_);

  this.createTopBarIcons_();
  this.createTopBarLabel_();
};

/**
 * Create the minimize toggle and delete icons that in the comment top bar.
 * @private
 */
Blockly.ScratchBubble.prototype.createTopBarIcons_ = function() {
  var topBarMiddleY = (Blockly.ScratchBubble.TOP_BAR_HEIGHT / 2) +
      Blockly.ScratchBubble.BORDER_WIDTH;

  // Minimize Toggle Icon in Comment Top Bar
  var xInset = Blockly.ScratchBubble.TOP_BAR_ICON_INSET;
  this.minimizeArrow_ = Blockly.utils.createSvgElement('image',
      {
        'x': xInset,
        'y': topBarMiddleY - Blockly.ScratchBubble.MINIMIZE_ICON_SIZE / 2,
        'width': Blockly.ScratchBubble.MINIMIZE_ICON_SIZE,
        'height': Blockly.ScratchBubble.MINIMIZE_ICON_SIZE
      }, this.bubbleGroup_);

  // Delete Icon in Comment Top Bar
  this.deleteIcon_ = Blockly.utils.createSvgElement('image',
      {
        'x': xInset,
        'y': topBarMiddleY - Blockly.ScratchBubble.DELETE_ICON_SIZE / 2,
        'width': Blockly.ScratchBubble.DELETE_ICON_SIZE,
        'height': Blockly.ScratchBubble.DELETE_ICON_SIZE
      }, this.bubbleGroup_);
  this.deleteIcon_.setAttributeNS('http://www.w3.org/1999/xlink',
      'xlink:href', Blockly.mainWorkspace.options.pathToMedia + 'delete-x.svg');
};

/**
 * Create the comment top bar label. This is the truncated comment text
 * that shows when comment is minimized.
 * @private
 */
Blockly.ScratchBubble.prototype.createTopBarLabel_ = function() {
  this.topBarLabel_ = Blockly.utils.createSvgElement('text',
      {
        'class': 'scratchCommentText',
        'x': this.width_ / 2,
        'y': (Blockly.ScratchBubble.TOP_BAR_HEIGHT / 2) + Blockly.ScratchBubble.BORDER_WIDTH,
        'text-anchor': 'middle',
        'dominant-baseline': 'middle'
      }, this.bubbleGroup_);

  var labelTextNode = document.createTextNode(this.labelText_);
  this.topBarLabel_.appendChild(labelTextNode);
};

/**
 * Create the comment resize handle.
 * @private
 */
Blockly.ScratchBubble.prototype.createResizeHandle_ = function() {
  this.resizeGroup_ = Blockly.utils.createSvgElement('g',
      {'class': this.workspace_.RTL ?
                'scratchCommentResizeSW' : 'scratchCommentResizeSE'},
      this.bubbleGroup_);
  var resizeSize = 12 * Blockly.ScratchBubble.BORDER_WIDTH;
  Blockly.utils.createSvgElement('polygon',
      {'points': '0,x x,x x,0'.replace(/x/g, resizeSize.toString())},
      this.resizeGroup_);
  Blockly.utils.createSvgElement('line',
      {
        'class': 'blocklyResizeLine',
        'x1': resizeSize / 3, 'y1': resizeSize - 1,
        'x2': resizeSize - 1, 'y2': resizeSize / 3
      }, this.resizeGroup_);
  Blockly.utils.createSvgElement('line',
      {
        'class': 'blocklyResizeLine',
        'x1': resizeSize * 2 / 3,
        'y1': resizeSize - 1,
        'x2': resizeSize - 1,
        'y2': resizeSize * 2 / 3
      }, this.resizeGroup_);
};

/**
  * Show the context menu for this bubble.
  * @param {!Event} e Mouse event.
  * @private
  */
Blockly.ScratchBubble.prototype.showContextMenu_ = function(e) {
  if (this.workspace_.options.readOnly) {
    return;
  }

  if (this.contextMenuCallback_) {
    this.contextMenuCallback_(e);
  }
};

/**
 * Handle a mouse-down on bubble's minimize icon.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.ScratchBubble.prototype.minimizeArrowMouseDown_ = function(e) {
  // Set a property indicating that this comment's minimize arrow got a mouse
  // down event. This property will get reset if the mouse leaves the icon or
  // when a mouse up occurs on this icon after this mouse down.
  this.shouldToggleMinimize_ = true;
  e.stopPropagation();
};

/**
 * Handle a mouse-out on bubble's minimize icon.
 * @param {!Event} _e Mouse up event.
 * @private
 */
Blockly.ScratchBubble.prototype.minimizeArrowMouseOut_ = function(_e) {
  // If the mouse has left the minimize arrow icon, the
  // shouldToggleMinimize property should get reset to false.
  this.shouldToggleMinimize_ = false;
};

/**
 * Handle a mouse-up on bubble's minimize icon.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.ScratchBubble.prototype.minimizeArrowMouseUp_ = function(e) {
  // First check if this icon had a mouse down event
  // on it and that the mouse never left the icon
  if (this.shouldToggleMinimize_) {
    this.shouldToggleMinimize_ = false;

    if (this.minimizeToggleCallback_) {
      this.minimizeToggleCallback_.call(this);
    }
  }
  e.stopPropagation();
};

/**
 * Handle a mouse-down on bubble's delete icon.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.ScratchBubble.prototype.deleteMouseDown_ = function(e) {
  this.shouldDelete_ = true;
  e.stopPropagation();
};

/**
 * Handle a mouse-out on bubble's delete icon.
 * @param {!Event} _e Mouse out event.
 * @private
 */
Blockly.ScratchBubble.prototype.deleteMouseOut_ = function(_e) {
  // If the mouse has left the delete icon, the shouldDelete_ property
  // should get reset to false.
  this.shouldDelete_ = false;
};

/**
 * Handle a mouse-up on bubble's delete icon.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.ScratchBubble.prototype.deleteMouseUp_ = function(e) {
  // First check that this is actually the same icon that had a mouse down event
  // on it and that the mouse never left the icon
  if (this.shouldDelete_) {
    this.shouldDelete_ = false;

    if (this.deleteCallback_) {
      this.deleteCallback_.call(this);
    }
  }
  e.stopPropagation();
};

/**
 * Handle a mouse-down on bubble's resize corner.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.ScratchBubble.prototype.resizeMouseDown_ = function(e) {
  this.resizeStartSize_ = {width: this.width_, height: this.height_};
  this.workspace_.setResizesEnabled(false);
  Blockly.ScratchBubble.superClass_.resizeMouseDown_.call(this, e);
};

/**
 * Handle a mouse-up on bubble's resize corner.
 * @param {!Event} _e Mouse up event.
 * @private
 */
Blockly.ScratchBubble.prototype.resizeMouseUp_ = function(_e) {
  var oldHW = this.resizeStartSize_;
  this.resizeStartSize_ = null;
  if (this.width_ == oldHW.width && this.height_ == oldHW.height) {
    return;
  }
  // Fire a change event for the new width/height after
  // resize mouse up
  Blockly.Events.fire(new Blockly.Events.CommentChange(
      this.comment, {width: oldHW.width , height: oldHW.height},
      {width: this.width_, height: this.height_}));

  this.workspace_.setResizesEnabled(true);
};

/**
 * Set the minimized state of the bubble.
 * @param {boolean} minimize Whether the bubble should be minimized
 * @param {?string} labelText Optional label text for the comment top bar
 *    when it is minimized.
 * @package
 */
Blockly.ScratchBubble.prototype.setMinimized = function(minimize, labelText) {
  if (minimize == this.isMinimized_) {
    return;
  }
  if (minimize) {
    this.isMinimized_ = true;
    // Change minimize icon
    this.minimizeArrow_.setAttributeNS('http://www.w3.org/1999/xlink',
        'xlink:href', Blockly.mainWorkspace.options.pathToMedia + 'comment-arrow-up.svg');
    // Hide text area
    this.commentEditor_.setAttribute('display', 'none');
    // Hide resize handle if it exists
    if (this.resizeGroup_) {
      this.resizeGroup_.setAttribute('display', 'none');
    }
    if (labelText && this.labelText_ != labelText) {
      // Update label and display
      this.topBarLabel_.textContent = labelText;
    }
    Blockly.utils.removeAttribute(this.topBarLabel_, 'display');
  } else {
    this.isMinimized_ = false;
    // Change minimize icon
    this.minimizeArrow_.setAttributeNS('http://www.w3.org/1999/xlink',
        'xlink:href', Blockly.mainWorkspace.options.pathToMedia + 'comment-arrow-down.svg');
    // Hide label
    this.topBarLabel_.setAttribute('display', 'none');
    // Show text area
    Blockly.utils.removeAttribute(this.commentEditor_, 'display');
    // Display resize handle if it exists
    if (this.resizeGroup_) {
      Blockly.utils.removeAttribute(this.resizeGroup_, 'display');
    }
  }
};

/**
 * Register a function as a callback event for when the bubble is minimized.
 * @param {!Function} callback The function to call on resize.
 * @package
 */
Blockly.ScratchBubble.prototype.registerMinimizeToggleEvent = function(callback) {
  this.minimizeToggleCallback_ = callback;
};

/**
 * Register a function as a callback event for when the bubble is resized.
 * @param {!Function} callback The function to call on resize.
 * @package
 */
Blockly.ScratchBubble.prototype.registerDeleteEvent = function(callback) {
  this.deleteCallback_ = callback;
};

/**
 * Register a function as a callback to show the context menu for this comment.
 * @param {!Function} callback The function to call on resize.
 * @package
 */
Blockly.ScratchBubble.prototype.registerContextMenuCallback = function(callback) {
  this.contextMenuCallback_ = callback;
};

/**
 * Notification that the anchor has moved.
 * Update the arrow and bubble accordingly.
 * @param {!goog.math.Coordinate} xy Absolute location.
 * @package
 */
Blockly.ScratchBubble.prototype.setAnchorLocation = function(xy) {
  this.anchorXY_ = xy;
  if (this.rendered_) {
    this.positionBubble_();
  }
};

/**
 * Move the bubble group to the specified location in workspace coordinates.
 * @param {number} x The x position to move to.
 * @param {number} y The y position to move to.
 * @package
 */
Blockly.ScratchBubble.prototype.moveTo = function(x, y) {
  Blockly.ScratchBubble.superClass_.moveTo.call(this, x, y);
  this.updatePosition_(x, y);
};

/**
 * Size this bubble.
 * @param {number} width Width of the bubble.
 * @param {number} height Height of the bubble.
 * @package
 */
Blockly.ScratchBubble.prototype.setBubbleSize = function(width, height) {
  var doubleBorderWidth = 2 * Blockly.ScratchBubble.BORDER_WIDTH;
  // Minimum size of a bubble.
  width = Math.max(width, doubleBorderWidth + 50);
  height = Math.max(height, Blockly.ScratchBubble.TOP_BAR_HEIGHT);
  this.width_ = width;
  this.height_ = height;
  this.bubbleBack_.setAttribute('width', width);
  this.bubbleBack_.setAttribute('height', height);
  this.commentTopBar_.setAttribute('width', width);
  this.commentTopBar_.setAttribute('height', Blockly.ScratchBubble.TOP_BAR_HEIGHT);
  if (this.workspace_.RTL) {
    this.minimizeArrow_.setAttribute('x', width -
        (Blockly.ScratchBubble.MINIMIZE_ICON_SIZE) -
        Blockly.ScratchBubble.TOP_BAR_ICON_INSET);
  } else {
    this.deleteIcon_.setAttribute('x', width -
        Blockly.ScratchBubble.DELETE_ICON_SIZE -
        Blockly.ScratchBubble.TOP_BAR_ICON_INSET);
  }
  if (this.resizeGroup_) {
    var resizeSize = 12 * Blockly.ScratchBubble.BORDER_WIDTH;
    if (this.workspace_.RTL) {
      // Mirror the resize group.
      this.resizeGroup_.setAttribute('transform', 'translate(' +
          (resizeSize + doubleBorderWidth) + ',' +
          (this.height_ - doubleBorderWidth - resizeSize) + ') scale(-1, 1)');
    } else {
      this.resizeGroup_.setAttribute('transform', 'translate(' +
          (this.width_ - doubleBorderWidth - resizeSize) + ',' +
          (this.height_ - doubleBorderWidth - resizeSize) + ')');
    }
  }
  if (this.isMinimized_) {
    this.topBarLabel_.setAttribute('x', this.width_ / 2);
    this.topBarLabel_.setAttribute('y', this.height_ / 2);
  }
  if (this.rendered_) {
    this.positionBubble_();
    this.renderArrow_();
  }
  // Allow the contents to resize.
  if (this.resizeCallback_) {
    this.resizeCallback_();
  }
};

/**
 * Draw the line between the bubble and the origin.
 * @private
 */
Blockly.ScratchBubble.prototype.renderArrow_ = function() {
  // Find the relative coordinates of the top bar center of the bubble.
  var relBubbleX = this.width_ / 2;
  var relBubbleY = Blockly.ScratchBubble.TOP_BAR_HEIGHT / 2;
  // Find the relative coordinates of the center of the anchor.
  var relAnchorX = -this.relativeLeft_;
  var relAnchorY = -this.relativeTop_;
  if (relBubbleX != relAnchorX || relBubbleY != relAnchorY) {
    // Compute the angle of the arrow's line.
    var rise = relAnchorY - relBubbleY;
    var run = relAnchorX - relBubbleX;
    if (this.workspace_.RTL) {
      run *= -1;
      run -= this.width_;
    }

    var baseX1 = relBubbleX;
    var baseY1 = relBubbleY;

    this.bubbleArrow_.setAttribute('x1', baseX1);
    this.bubbleArrow_.setAttribute('y1', baseY1);
    this.bubbleArrow_.setAttribute('x2', baseX1 + run);
    this.bubbleArrow_.setAttribute('y2', baseY1 + rise);
    this.bubbleArrow_.setAttribute('stroke-width', Blockly.ScratchBubble.LINE_THICKNESS);
  }
};

/**
 * Change the colour of a bubble.
 * @param {string} hexColour Hex code of colour.
 * @package
 */
Blockly.ScratchBubble.prototype.setColour = function(hexColour) {
  this.bubbleBack_.setAttribute('stroke', hexColour);
  this.bubbleArrow_.setAttribute('stroke', hexColour);
};

/**
 * Move this bubble during a drag, taking into account whether or not there is
 * a drag surface.
 * @param {?Blockly.BlockDragSurfaceSvg} dragSurface The surface that carries
 *     rendered items during a drag, or null if no drag surface is in use.
 * @param {!goog.math.Coordinate} newLoc The location to translate to, in
 *     workspace coordinates.
 * @package
 */
Blockly.ScratchBubble.prototype.moveDuringDrag = function(dragSurface, newLoc) {
  if (dragSurface) {
    dragSurface.translateSurface(newLoc.x, newLoc.y);
    this.updatePosition_(newLoc.x, newLoc.y);
  } else {
    this.moveTo(newLoc.x, newLoc.y);
  }
};

/**
 * Update the relative left and top of the bubble after a move.
 * @param {number} x The x position of the bubble
 * @param {number} y The y position of the bubble
 * @private
 */
Blockly.ScratchBubble.prototype.updatePosition_ = function(x, y) {
  // Relative left is the distance *and* direction to get from the comment
  // anchor position on the block to the starting edge of the comment (e.g.
  // the left edge of the comment in LTR and the right edge of the comment in RTL)
  if (this.workspace_.RTL) {
    // we want relativeLeft_ to actually be the distance from the anchor point to the *right* edge of the comment in RTL
    this.relativeLeft_ = this.anchorXY_.x - x;
  } else {
    this.relativeLeft_ = x - this.anchorXY_.x;
  }
  this.relativeTop_ = y - this.anchorXY_.y;
  this.renderArrow_();
};

/**
 * Dispose of this bubble.
 * @package
 */
Blockly.ScratchBubble.prototype.dispose = function() {
  Blockly.ScratchBubble.superClass_.dispose.call(this);
  this.topBarLabel_ = null;
  this.commentTopBar_ = null;
  this.minimizeArrow_ = null;
  this.deleteIcon_ = null;
};
