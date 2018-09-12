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
 * @fileoverview Flyout tray containing blocks which may be created.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.HorizontalFlyout');

goog.require('Blockly.Block');
goog.require('Blockly.Comment');
goog.require('Blockly.Events');
goog.require('Blockly.FlyoutButton');
goog.require('Blockly.Flyout');
goog.require('Blockly.WorkspaceSvg');
goog.require('goog.dom');
goog.require('goog.dom.animationFrame.polyfill');
goog.require('goog.events');
goog.require('goog.math.Rect');
goog.require('goog.userAgent');


/**
 * Class for a flyout.
 * @param {!Object} workspaceOptions Dictionary of options for the workspace.
 * @extends {Blockly.Flyout}
 * @constructor
 */
Blockly.HorizontalFlyout = function(workspaceOptions) {
  workspaceOptions.getMetrics = this.getMetrics_.bind(this);
  workspaceOptions.setMetrics = this.setMetrics_.bind(this);

  Blockly.HorizontalFlyout.superClass_.constructor.call(this, workspaceOptions);
  /**
   * Flyout should be laid out horizontally vs vertically.
   * @type {boolean}
   * @private
   */
  this.horizontalLayout_ = true;
};
goog.inherits(Blockly.HorizontalFlyout, Blockly.Flyout);

/**
 * Return an object with all the metrics required to size scrollbars for the
 * flyout.  The following properties are computed:
 * .viewHeight: Height of the visible rectangle,
 * .viewWidth: Width of the visible rectangle,
 * .contentHeight: Height of the contents,
 * .contentWidth: Width of the contents,
 * .viewTop: Offset of top edge of visible rectangle from parent,
 * .contentTop: Offset of the top-most content from the y=0 coordinate,
 * .absoluteTop: Top-edge of view.
 * .viewLeft: Offset of the left edge of visible rectangle from parent,
 * .contentLeft: Offset of the left-most content from the x=0 coordinate,
 * .absoluteLeft: Left-edge of view.
 * @return {Object} Contains size and position metrics of the flyout.
 * @private
 */
Blockly.HorizontalFlyout.prototype.getMetrics_ = function() {
  if (!this.isVisible()) {
    // Flyout is hidden.
    return null;
  }

  try {
    var optionBox = this.workspace_.getCanvas().getBBox();
  } catch (e) {
    // Firefox has trouble with hidden elements (Bug 528969).
    var optionBox = {height: 0, y: 0, width: 0, x: 0};
  }

  var absoluteTop = this.SCROLLBAR_PADDING;
  var absoluteLeft = this.SCROLLBAR_PADDING;
  if (this.toolboxPosition_ == Blockly.TOOLBOX_AT_BOTTOM) {
    absoluteTop = 0;
  }
  var viewHeight = this.height_;
  if (this.toolboxPosition_ == Blockly.TOOLBOX_AT_TOP) {
    viewHeight += this.MARGIN;
  }
  var viewWidth = this.width_ - 2 * this.SCROLLBAR_PADDING;

  var metrics = {
    viewHeight: viewHeight,
    viewWidth: viewWidth,
    contentHeight: optionBox.height * this.workspace_.scale + 2 * this.MARGIN,
    contentWidth: optionBox.width * this.workspace_.scale + 2 * this.MARGIN,
    viewTop: -this.workspace_.scrollY,
    viewLeft: -this.workspace_.scrollX,
    contentTop: optionBox.y,
    contentLeft: optionBox.x,
    absoluteTop: absoluteTop,
    absoluteLeft: absoluteLeft
  };
  return metrics;
};

/**
 * Sets the translation of the flyout to match the scrollbars.
 * @param {!Object} xyRatio Contains a y property which is a float
 *     between 0 and 1 specifying the degree of scrolling and a
 *     similar x property.
 * @private
 */
Blockly.HorizontalFlyout.prototype.setMetrics_ = function(xyRatio) {
  var metrics = this.getMetrics_();
  // This is a fix to an apparent race condition.
  if (!metrics) {
    return;
  }

  if (goog.isNumber(xyRatio.x)) {
    this.workspace_.scrollX = -metrics.contentWidth * xyRatio.x;
  }

  this.workspace_.translate(this.workspace_.scrollX + metrics.absoluteLeft,
      this.workspace_.scrollY + metrics.absoluteTop);

  if (this.categoryScrollPositions) {
    this.selectCategoryByScrollPosition(-this.workspace_.scrollX);
  }
};

/**
 * Move the flyout to the edge of the workspace.
 */
Blockly.HorizontalFlyout.prototype.position = function() {
  if (!this.isVisible()) {
    return;
  }
  var targetWorkspaceMetrics = this.targetWorkspace_.getMetrics();
  if (!targetWorkspaceMetrics) {
    // Hidden components will return null.
    return;
  }
  var edgeWidth = this.horizontalLayout_ ?
      targetWorkspaceMetrics.viewWidth - 2 * this.CORNER_RADIUS :
      this.width_ - this.CORNER_RADIUS;

  var edgeHeight = this.horizontalLayout_ ?
    this.height_ - this.CORNER_RADIUS :
    targetWorkspaceMetrics.viewHeight - 2 * this.CORNER_RADIUS;

  this.setBackgroundPath_(edgeWidth, edgeHeight);

  var x = targetWorkspaceMetrics.absoluteLeft;
  if (this.toolboxPosition_ == Blockly.TOOLBOX_AT_RIGHT) {
    x += targetWorkspaceMetrics.viewWidth;
    x -= this.width_;
  }

  var y = targetWorkspaceMetrics.absoluteTop;
  if (this.toolboxPosition_ == Blockly.TOOLBOX_AT_BOTTOM) {
    y += targetWorkspaceMetrics.viewHeight;
    y -= this.height_;
  }

  // Record the height for Blockly.Flyout.getMetrics_, or width if the layout is
  // horizontal.
  if (this.horizontalLayout_) {
    this.width_ = targetWorkspaceMetrics.viewWidth;
  } else {
    this.height_ = targetWorkspaceMetrics.viewHeight;
  }

  this.svgGroup_.setAttribute("width", this.width_);
  this.svgGroup_.setAttribute("height", this.height_);
  var transform = 'translate(' + x + 'px,' + y + 'px)';
  Blockly.utils.setCssTransform(this.svgGroup_, transform);

  // Update the scrollbar (if one exists).
  if (this.scrollbar_) {
    // Set the scrollbars origin to be the top left of the flyout.
    this.scrollbar_.setOrigin(x, y);
    this.scrollbar_.resize();
  }
  // The blocks need to be visible in order to be laid out and measured correctly, but we don't
  // want the flyout to show up until it's properly sized.
  // Opacity is set to zero in show().
  this.svgGroup_.style.opacity = 1;
};

/**
 * Create and set the path for the visible boundaries of the flyout.
 * @param {number} width The width of the flyout, not including the
 *     rounded corners.
 * @param {number} height The height of the flyout, not including
 *     rounded corners.
 * @private
 */
Blockly.HorizontalFlyout.prototype.setBackgroundPath_ = function(width, height) {
  var atTop = this.toolboxPosition_ == Blockly.TOOLBOX_AT_TOP;
  // Start at top left.
  var path = ['M 0,' + (atTop ? 0 : this.CORNER_RADIUS)];

  if (atTop) {
    // Top.
    path.push('h', width + 2 * this.CORNER_RADIUS);
    // Right.
    path.push('v', height);
    // Bottom.
    path.push('a', this.CORNER_RADIUS, this.CORNER_RADIUS, 0, 0, 1,
        -this.CORNER_RADIUS, this.CORNER_RADIUS);
    path.push('h', -1 * width);
    // Left.
    path.push('a', this.CORNER_RADIUS, this.CORNER_RADIUS, 0, 0, 1,
        -this.CORNER_RADIUS, -this.CORNER_RADIUS);
    path.push('z');
  } else {
    // Top.
    path.push('a', this.CORNER_RADIUS, this.CORNER_RADIUS, 0, 0, 1,
        this.CORNER_RADIUS, -this.CORNER_RADIUS);
    path.push('h', width);
    // Right.
    path.push('a', this.CORNER_RADIUS, this.CORNER_RADIUS, 0, 0, 1,
        this.CORNER_RADIUS, this.CORNER_RADIUS);
    path.push('v', height);
    // Bottom.
    path.push('h', -width - 2 * this.CORNER_RADIUS);
    // Left.
    path.push('z');
  }
  this.svgBackground_.setAttribute('d', path.join(' '));
};

/**
 * Scroll the flyout to the top.
 */
Blockly.HorizontalFlyout.prototype.scrollToStart = function() {
  this.scrollbar_.set(this.RTL ? Infinity : 0);
};

/**
 * Scroll the flyout to a position.
 * @param {number} pos The targeted scroll position.
 * @package
 */
Blockly.HorizontalFlyout.prototype.scrollTo = function(pos) {
  this.scrollTarget = pos * this.workspace_.scale;

  // Make sure not to set the scroll target past the farthest point we can
  // scroll to, i.e. the content width minus the view width
  var metrics = this.workspace_.getMetrics();
  var contentWidth = metrics.contentWidth;
  var viewWidth = metrics.viewWidth;
  this.scrollTarget = Math.min(this.scrollTarget, contentWidth - viewWidth);

  this.stepScrollAnimation();
};

/**
 * Scroll the flyout.
 * @param {!Event} e Mouse wheel scroll event.
 * @private
 */
Blockly.HorizontalFlyout.prototype.wheel_ = function(e) {
  // remove scrollTarget to stop auto scrolling in stepScrollAnimation
  this.scrollTarget = null;

  var delta = e.deltaX;

  // If we're scrolling more vertically than horizontally, use the vertical
  // scroll delta instead. This allows people using a mouse wheel (which can
  // only scroll vertically) to scroll the horizontal flyout. It also allows
  // trackpad users to scroll it by scrolling either horizontally or
  // vertically.
  if (Math.abs(e.deltaY) > Math.abs(delta)) {
    delta = e.deltaY;
  }

  if (delta) {
    // Firefox's mouse wheel deltas are a tenth that of Chrome/Safari.
    // DeltaMode is 1 for a mouse wheel, but not for a trackpad scroll event
    if (goog.userAgent.GECKO && (e.deltaMode === 1)) {
      delta *= 10;
    }
    var metrics = this.getMetrics_();
    var pos = metrics.viewLeft + delta;
    var limit = metrics.contentWidth - metrics.viewWidth;
    pos = Math.min(pos, limit);
    pos = Math.max(pos, 0);
    this.scrollbar_.set(pos);
    // When the flyout moves from a wheel event, hide WidgetDiv and DropDownDiv.
    Blockly.WidgetDiv.hide(true);
    Blockly.DropDownDiv.hideWithoutAnimation();
  }

  // Don't scroll the page.
  e.preventDefault();
  // Don't propagate mousewheel event (zooming).
  e.stopPropagation();
};

/**
 * Lay out the blocks in the flyout.
 * @param {!Array.<!Object>} contents The blocks and buttons to lay out.
 * @param {!Array.<number>} gaps The visible gaps between blocks.
 * @private
 */
Blockly.HorizontalFlyout.prototype.layout_ = function(contents, gaps) {
  this.workspace_.scale = this.targetWorkspace_.scale;
  var margin = this.MARGIN;
  var cursorX = margin;
  var cursorY = margin;
  if (this.RTL) {
    contents = contents.reverse();
  }

  for (var i = 0, item; item = contents[i]; i++) {
    if (item.type == 'block') {
      var block = item.block;
      var allBlocks = block.getDescendants(false);
      for (var j = 0, child; child = allBlocks[j]; j++) {
        // Mark blocks as being inside a flyout.  This is used to detect and
        // prevent the closure of the flyout if the user right-clicks on such a
        // block.
        child.isInFlyout = true;
      }
      var root = block.getSvgRoot();
      var blockHW = block.getHeightWidth();

      var moveX = cursorX;
      if (this.RTL) {
        moveX += blockHW.width;
      }

      block.moveBy(moveX, cursorY);
      cursorX += blockHW.width + gaps[i];

      // Create an invisible rectangle under the block to act as a button.  Just
      // using the block as a button is poor, since blocks have holes in them.
      var rect = Blockly.utils.createSvgElement('rect', {'fill-opacity': 0}, null);
      rect.tooltip = block;
      Blockly.Tooltip.bindMouseEvents(rect);
      // Add the rectangles under the blocks, so that the blocks' tooltips work.
      this.workspace_.getCanvas().insertBefore(rect, block.getSvgRoot());
      block.flyoutRect_ = rect;
      this.backgroundButtons_[i] = rect;

      this.addBlockListeners_(root, block, rect);
    } else if (item.type == 'button') {
      var button = item.button;
      var buttonSvg = button.createDom();
      button.moveTo(cursorX, cursorY);
      button.show();
      // Clicking on a flyout button or label is a lot like clicking on the
      // flyout background.
      this.listeners_.push(Blockly.bindEventWithChecks_(buttonSvg, 'mousedown',
          this, this.onMouseDown_));


      this.buttons_.push(button);
      cursorX += (button.width + gaps[i]);
    }
  }
};

/**
 * Determine if a drag delta is toward the workspace, based on the position
 * and orientation of the flyout. This to decide if a new block should be
 * created or if the flyout should scroll.
 * @param {!goog.math.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at mouse down, in pixel units.
 * @return {boolean} true if the drag is toward the workspace.
 * @package
 */
Blockly.HorizontalFlyout.prototype.isDragTowardWorkspace = function(currentDragDeltaXY) {
  var dx = currentDragDeltaXY.x;
  var dy = currentDragDeltaXY.y;
  // Direction goes from -180 to 180, with 0 toward the right and 90 on top.
  var dragDirection = Math.atan2(dy, dx) / Math.PI * 180;

  var draggingTowardWorkspace = false;
  var range = this.dragAngleRange_;
  if (this.toolboxPosition_ == Blockly.TOOLBOX_AT_TOP) {
    // Horizontal at top.
    if (dragDirection < 90 + range && dragDirection > 90 - range) {
      draggingTowardWorkspace = true;
    }
  } else {
    // Horizontal at bottom.
    if (dragDirection > -90 - range && dragDirection < -90 + range) {
      draggingTowardWorkspace = true;
    }
  }
  return draggingTowardWorkspace;
};

/**
 * Return the deletion rectangle for this flyout in viewport coordinates.
 * @return {goog.math.Rect} Rectangle in which to delete.
 */
Blockly.HorizontalFlyout.prototype.getClientRect = function() {
  if (!this.svgGroup_) {
    return null;
  }

  var flyoutRect = this.svgGroup_.getBoundingClientRect();
  // BIG_NUM is offscreen padding so that blocks dragged beyond the shown flyout
  // area are still deleted.  Must be larger than the largest screen size,
  // but be smaller than half Number.MAX_SAFE_INTEGER (not available on IE).
  var BIG_NUM = 1000000000;
  var y = flyoutRect.top;
  var height = flyoutRect.height;

  if (this.toolboxPosition_ == Blockly.TOOLBOX_AT_TOP) {
    return new goog.math.Rect(-BIG_NUM, y - BIG_NUM, BIG_NUM * 2,
        BIG_NUM + height);
  } else if (this.toolboxPosition_ == Blockly.TOOLBOX_AT_BOTTOM) {
    return new goog.math.Rect(-BIG_NUM, y, BIG_NUM * 2,
        BIG_NUM + height);
  }
};

/**
 * Compute height of flyout.  Position button under each block.
 * For RTL: Lay out the blocks right-aligned.
 * @param {!Array<!Blockly.Block>} blocks The blocks to reflow.
 */
Blockly.HorizontalFlyout.prototype.reflowInternal_ = function(blocks) {
  this.workspace_.scale = this.targetWorkspace_.scale;
  var flyoutHeight = 0;
  for (var i = 0, block; block = blocks[i]; i++) {
    flyoutHeight = Math.max(flyoutHeight, block.getHeightWidth().height);
  }
  flyoutHeight += this.MARGIN * 1.5;
  flyoutHeight *= this.workspace_.scale;
  flyoutHeight += Blockly.Scrollbar.scrollbarThickness;
  if (this.height_ != flyoutHeight) {
    for (var i = 0, block; block = blocks[i]; i++) {
      var blockHW = block.getHeightWidth();
      if (block.flyoutRect_) {
        block.flyoutRect_.setAttribute('width', blockHW.width);
        block.flyoutRect_.setAttribute('height', blockHW.height);
        // Rectangles behind blocks with output tabs are shifted a bit.
        var blockXY = block.getRelativeToSurfaceXY();
        block.flyoutRect_.setAttribute('y', blockXY.y);
        block.flyoutRect_.setAttribute('x',
            this.RTL ? blockXY.x - blockHW.width : blockXY.x);
        // For hat blocks we want to shift them down by the hat height
        // since the y coordinate is the corner, not the top of the hat.
        var hatOffset =
            block.startHat_ ? Blockly.BlockSvg.START_HAT_HEIGHT : 0;
        if (hatOffset) {
          block.moveBy(0, hatOffset);
        }
        block.flyoutRect_.setAttribute('y', blockXY.y);
      }
    }
    // Record the height for .getMetrics_ and .position.
    this.height_ = flyoutHeight;
    // Call this since it is possible the trash and zoom buttons need
    // to move. e.g. on a bottom positioned flyout when zoom is clicked.
    this.targetWorkspace_.resize();
  }
};
