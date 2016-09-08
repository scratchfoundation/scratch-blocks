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

goog.provide('Blockly.VerticalFlyout');

goog.require('Blockly.Block');
goog.require('Blockly.Comment');
goog.require('Blockly.Events');
goog.require('Blockly.Flyout');
goog.require('Blockly.FlyoutButton');
goog.require('Blockly.WorkspaceSvg');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.math.Rect');
goog.require('goog.userAgent');


/**
 * Class for a flyout.
 * @param {!Object} workspaceOptions Dictionary of options for the workspace.
 * @extends {Blockly.Flyout}
 * @constructor
 */
Blockly.VerticalFlyout = function(workspaceOptions) {
  workspaceOptions.getMetrics = this.getMetrics_.bind(this);
  workspaceOptions.setMetrics = this.setMetrics_.bind(this);

  Blockly.VerticalFlyout.superClass_.constructor.call(this, workspaceOptions);
  /**
   * Flyout should be laid out horizontally vs vertically.
   * @type {boolean}
   * @private
   */
  this.horizontalLayout_ = false;
};
goog.inherits(Blockly.VerticalFlyout, Blockly.Flyout);

/**
 * Does the flyout automatically close when a block is created?
 * @type {boolean}
 */
Blockly.VerticalFlyout.prototype.autoClose = false;

Blockly.VerticalFlyout.prototype.DEFAULT_WIDTH = 250;

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
Blockly.VerticalFlyout.prototype.getMetrics_ = function() {
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

  absoluteLeft = 0;
  var viewHeight = this.height_ - 2 * this.SCROLLBAR_PADDING;
  var viewWidth = this.parentToolbox_ ?
      this.parentToolbox_.getWidth() : this.width_;
  if (!this.RTL) {
    viewWidth -= this.SCROLLBAR_PADDING;
  }

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
Blockly.VerticalFlyout.prototype.setMetrics_ = function(xyRatio) {
  var metrics = this.getMetrics_();
  // This is a fix to an apparent race condition.
  if (!metrics) {
    return;
  }
  if (goog.isNumber(xyRatio.y)) {
    this.workspace_.scrollY = -metrics.contentHeight * xyRatio.y;
  }

  this.workspace_.translate(this.workspace_.scrollX + metrics.absoluteLeft,
      this.workspace_.scrollY + metrics.absoluteTop);
};

/**
 * Move the flyout to the edge of the workspace.
 */
Blockly.VerticalFlyout.prototype.position = function() {
  if (!this.isVisible()) {
    return;
  }
  var targetWorkspaceMetrics = this.targetWorkspace_.getMetrics();
  if (!targetWorkspaceMetrics) {
    // Hidden components will return null.
    return;
  }

  this.width_ = this.getWidth();

  if (this.parentToolbox_) {
    var x = this.parentToolbox_.HtmlDiv.offsetLeft;
    var y = this.parentToolbox_.HtmlDiv.offsetTop + this.parentToolbox_.getHeight();
  } else {
    var x = this.toolboxPosition_ == Blockly.TOOLBOX_AT_RIGHT ?
        targetWorkspaceMetrics.viewWidth - this.width_ : 0;
    var y = 0;
  }

  this.svgGroup_.setAttribute('transform', 'translate(' + x + ',' + y + ')');

  // Record the height for Blockly.Flyout.getMetrics_
  this.height_ = targetWorkspaceMetrics.viewHeight - y;

  this.setBackgroundPath_(this.width_, this.height_);
      //targetWorkspaceMetrics.viewHeight);
  // Update the scrollbar (if one exists).
  if (this.scrollbar_) {
    this.scrollbar_.resize();
  }
  // The blocks need to be visible in order to be laid out and measured
  // correctly, but we don't want the flyout to show up until it's properly
  // sized.  Opacity is set to zero in show().
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
Blockly.VerticalFlyout.prototype.setBackgroundPath_ = function(width, height) {
  var atRight = this.toolboxPosition_ == Blockly.TOOLBOX_AT_RIGHT;
  // Decide whether to start on the left or right.
  var path = ['M ' + 0 + ',0'];
  // Top.
  path.push('h', width);
  // Rounded corner.
  path.push('a', this.CORNER_RADIUS, this.CORNER_RADIUS, 0, 0,
      atRight ? 0 : 1,
      atRight ? -this.CORNER_RADIUS : this.CORNER_RADIUS,
      this.CORNER_RADIUS);
  // Side closest to workspace.
  path.push('v', Math.max(0, height - this.CORNER_RADIUS * 2));
  // Rounded corner.
  path.push('a', this.CORNER_RADIUS, this.CORNER_RADIUS, 0, 0,
      atRight ? 0 : 1,
      atRight ? this.CORNER_RADIUS : -this.CORNER_RADIUS,
      this.CORNER_RADIUS);
  // Bottom.
  path.push('h', -width);
  path.push('z');
  this.svgBackground_.setAttribute('d', path.join(' '));
};

/**
 * Scroll the flyout to the top.
 */
Blockly.VerticalFlyout.prototype.scrollToStart = function() {
  this.scrollbar_.set(0);
};

/**
 * Scroll the flyout.
 * @param {!Event} e Mouse wheel scroll event.
 * @private
 */
Blockly.VerticalFlyout.prototype.wheel_ = function(e) {
  var delta = e.deltaY;

  if (delta) {
    if (goog.userAgent.GECKO) {
      // Firefox's deltas are a tenth that of Chrome/Safari.
      delta *= 10;
    }
    var metrics = this.getMetrics_();
    var pos = metrics.viewTop + delta;
    var limit = metrics.contentHeight - metrics.viewHeight;
    pos = Math.min(pos, limit);
    pos = Math.max(pos, 0);
    this.scrollbar_.set(pos);
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
Blockly.VerticalFlyout.prototype.layout_ = function(contents, gaps) {
  this.workspace_.scale = this.targetWorkspace_.scale;
  var margin = this.MARGIN;
  var flyoutWidth = this.getWidth() / this.workspace_.scale;
  var cursorX = margin;
  var cursorY = margin;

  for (var i = 0, item; item = contents[i]; i++) {
    if (item.type == 'block') {
      var block = item.block;
      var allBlocks = block.getDescendants();
      for (var j = 0, child; child = allBlocks[j]; j++) {
        // Mark blocks as being inside a flyout.  This is used to detect and
        // prevent the closure of the flyout if the user right-clicks on such a
        // block.
        child.isInFlyout = true;
      }
      var root = block.getSvgRoot();
      var blockHW = block.getHeightWidth();

      var oldX = block.getRelativeToSurfaceXY().x;
      var newX = flyoutWidth - this.MARGIN;

      var moveX = this.RTL ? newX - oldX : margin;
      if (block.hasCheckboxInFlyout()) {
        this.createCheckbox_(block, cursorX, cursorY, blockHW);
        if (this.RTL) {
          moveX -= (this.CHECKBOX_SIZE + this.CHECKBOX_MARGIN);
        } else {
          moveX += this.CHECKBOX_SIZE + this.CHECKBOX_MARGIN;
        }
      }
      block.moveBy(moveX,
          cursorY + (block.startHat_ ? Blockly.BlockSvg.START_HAT_HEIGHT : 0));

      var rect = this.createRect_(block, moveX, cursorY, blockHW, i);

      this.addBlockListeners_(root, block, rect);

      cursorY += blockHW.height + gaps[i];
    } else if (item.type == 'button') {
      var button = item.button;
      var buttonSvg = button.createDom();
      button.moveTo(cursorX, cursorY);
      button.show();
      Blockly.bindEvent_(buttonSvg, 'mouseup', button, button.onMouseUp);

      this.buttons_.push(button);
      cursorY += button.height + gaps[i];
    }
  }
};

/**
 * Create and place a rectangle corresponding to the given block.
 * @param {!Blockly.Block} block The block to associate the rect to.
 * @param {number} cursorX The x position of the cursor during this layout pass.
 * @param {number} cursorY The y position of the cursor during this layout pass.
 * @param {!{height: number, width: number}} blockHW The height and width of the
 *     block.
 * @param {number} index The index into the background buttons list where this
 *     rect should be placed.
 * @private
 */
Blockly.VerticalFlyout.prototype.createRect_ = function(block, cursorX, cursorY,
    blockHW, index) {
  // Create an invisible rectangle under the block to act as a button.  Just
  // using the block as a button is poor, since blocks have holes in them.
  var rect = Blockly.createSvgElement('rect',
    {
      'fill-opacity': 0,
      'x': this.RTL ? this.MARGIN - blockHW.width : this.MARGIN,
      'y': cursorY,
      'height': blockHW.height,
      'width': blockHW.width
    }, null);
  rect.tooltip = block;
  Blockly.Tooltip.bindMouseEvents(rect);
  // Add the rectangles under the blocks, so that the blocks' tooltips work.
  this.workspace_.getCanvas().insertBefore(rect, block.getSvgRoot());

  block.flyoutRect_ = rect;
  this.backgroundButtons_[index] = rect;
  return rect;
};

/**
 * Create and place a checkbox corresponding to the given block.
 * @param {!Blockly.Block} block The block to associate the checkbox to.
 * @param {number} cursorX The x position of the cursor during this layout pass.
 * @param {number} cursorY The y position of the cursor during this layout pass.
 * @param {!{height: number, width: number}} blockHW The height and width of the
 *     block.
 * @private
 */
Blockly.VerticalFlyout.prototype.createCheckbox_ = function(block, cursorX, cursorY,
    blockHW) {
  var svgRoot = block.getSvgRoot();
  var extraSpace = this.CHECKBOX_SIZE + this.CHECKBOX_MARGIN;
  var checkboxRect = Blockly.createSvgElement('rect',
    {
      'class': 'blocklyFlyoutCheckbox',
      'height': this.CHECKBOX_SIZE,
      'width': this.CHECKBOX_SIZE,
      'x': this.RTL ? this.getWidth() / this.workspace_.scale - extraSpace :
          cursorX,
      'y': cursorY + blockHW.height / 2 -
          this.CHECKBOX_SIZE / 2
    }, null);
  var checkboxObj = {svgRoot: checkboxRect, clicked: false, block: block};
  block.flyoutCheckbox = checkboxObj;
  this.workspace_.getCanvas().insertBefore(checkboxRect, svgRoot);
  this.checkboxes_.push(checkboxObj);
};


/**
 * Handle a mouse-move to vertically drag the flyout.
 * @param {!Event} e Mouse move event.
 * @private
 */
Blockly.VerticalFlyout.prototype.onMouseMove_ = function(e) {
  var metrics = this.getMetrics_();
  if (metrics.contentHeight - metrics.viewHeight < 0) {
    return;
  }
  var dy = e.clientY - this.startDragMouseY_;
  this.startDragMouseY_ = e.clientY;
  var y = metrics.viewTop - dy;
  y = goog.math.clamp(y, 0, metrics.contentHeight - metrics.viewHeight);
  this.scrollbar_.set(y);
};

/**
 * Determine if a drag delta is toward the workspace, based on the position
 * and orientation of the flyout. This is used in determineDragIntention_ to
 * determine if a new block should be created or if the flyout should scroll.
 * @param {number} dx X delta of the drag.
 * @param {number} dy Y delta of the drag.
 * @return {boolean} true if the drag is toward the workspace.
 * @private
 */
Blockly.VerticalFlyout.prototype.isDragTowardWorkspace_ = function(dx, dy) {
  // Direction goes from -180 to 180, with 0 toward the right and 90 on top.
  var dragDirection = Math.atan2(dy, dx) / Math.PI * 180;

  var draggingTowardWorkspace = false;
  var range = this.dragAngleRange_;
  if (this.toolboxPosition_ == Blockly.TOOLBOX_AT_LEFT) {
    // Vertical at left.
    if (dragDirection < range && dragDirection > -range) {
      draggingTowardWorkspace = true;
    }
  } else {
    // Vertical at right.
    if (dragDirection < -180 + range || dragDirection > 180 - range) {
      draggingTowardWorkspace = true;
    }
  }
  return draggingTowardWorkspace;
};

/**
 * Copy a block from the flyout to the workspace and position it correctly.
 * @param {!Blockly.Block} originBlock The flyout block to copy..
 * @return {!Blockly.Block} The new block in the main workspace.
 * @private
 */
Blockly.VerticalFlyout.prototype.placeNewBlock_ = function(originBlock) {
  var targetWorkspace = this.targetWorkspace_;
  var svgRootOld = originBlock.getSvgRoot();
  if (!svgRootOld) {
    throw 'originBlock is not rendered.';
  }
  // Figure out where the original block is on the screen, relative to the upper
  // left corner of the main workspace.
  var xyOld = Blockly.getSvgXY_(svgRootOld, targetWorkspace);
  // Take into account that the flyout might have been scrolled horizontally
  // (separately from the main workspace).
  // Generally a no-op in vertical mode but likely to happen in horizontal
  // mode.
  var scrollX = this.workspace_.scrollX;
  var scale = this.workspace_.scale;
  xyOld.x += scrollX / scale - scrollX;
  // If the flyout is on the right side, (0, 0) in the flyout is offset to
  // the right of (0, 0) in the main workspace.  Add an offset to take that
  // into account.
  if (this.toolboxPosition_ == Blockly.TOOLBOX_AT_RIGHT) {
    scrollX = targetWorkspace.getMetrics().viewWidth - this.width_;
    scale = targetWorkspace.scale;
    // Scale the scroll (getSvgXY_ did not do this).
    xyOld.x += scrollX / scale - scrollX;
  }

  // Take into account that the flyout might have been scrolled vertically
  // (separately from the main workspace).
  // Generally a no-op in horizontal mode but likely to happen in vertical
  // mode.
  var scrollY = this.workspace_.scrollY;
  scale = this.workspace_.scale;
  xyOld.y += scrollY / scale - scrollY;
  // If the flyout is on the bottom, (0, 0) in the flyout is offset to be below
  // (0, 0) in the main workspace.  Add an offset to take that into account.
  if (this.toolboxPosition_ == Blockly.TOOLBOX_AT_BOTTOM) {
    scrollY = targetWorkspace.getMetrics().viewHeight - this.height_;
    scale = targetWorkspace.scale;
    xyOld.y += scrollY / scale - scrollY;
  }

  // Create the new block by cloning the block in the flyout (via XML).
  var xml = Blockly.Xml.blockToDom(originBlock);
  var block = Blockly.Xml.domToBlock(xml, targetWorkspace);
  var svgRootNew = block.getSvgRoot();
  if (!svgRootNew) {
    throw 'block is not rendered.';
  }
  // Figure out where the new block got placed on the screen, relative to the
  // upper left corner of the workspace.  This may not be the same as the
  // original block because the flyout's origin may not be the same as the
  // main workspace's origin.
  var xyNew = Blockly.getSvgXY_(svgRootNew, targetWorkspace);
  // Scale the scroll (getSvgXY_ did not do this).
  xyNew.x +=
      targetWorkspace.scrollX / targetWorkspace.scale - targetWorkspace.scrollX;
  xyNew.y +=
      targetWorkspace.scrollY / targetWorkspace.scale - targetWorkspace.scrollY;
  // If the flyout is collapsible and the workspace can't be scrolled.
  if (targetWorkspace.toolbox_ && !targetWorkspace.scrollbar) {
    xyNew.x += targetWorkspace.toolbox_.getWidth() / targetWorkspace.scale;
    xyNew.y += targetWorkspace.toolbox_.getHeight() / targetWorkspace.scale;
  }

  // Move the new block to where the old block is.
  block.moveBy(xyOld.x - xyNew.x, xyOld.y - xyNew.y);
  return block;
};

/**
 * Return the deletion rectangle for this flyout in viewport coordinates.
 * @return {goog.math.Rect} Rectangle in which to delete.
 */
Blockly.VerticalFlyout.prototype.getClientRect = function() {
  if (!this.svgGroup_) {
    return null;
  }

  var flyoutRect = this.svgGroup_.getBoundingClientRect();
  // BIG_NUM is offscreen padding so that blocks dragged beyond the shown flyout
  // area are still deleted.  Must be larger than the largest screen size,
  // but be smaller than half Number.MAX_SAFE_INTEGER (not available on IE).
  var BIG_NUM = 1000000000;
  var x = flyoutRect.left;
  var width = flyoutRect.width;

  if (this.toolboxPosition_ == Blockly.TOOLBOX_AT_LEFT) {
    return new goog.math.Rect(x - BIG_NUM, -BIG_NUM, BIG_NUM + width,
        BIG_NUM * 2);
  } else {  // Right
    return new goog.math.Rect(x, -BIG_NUM, BIG_NUM + width, BIG_NUM * 2);
  }
};

/**
 * Compute width of flyout.  Position button under each block.
 * For RTL: Lay out the blocks right-aligned.
 * @param {!Array<!Blockly.Block>} blocks The blocks to reflow.
 */
Blockly.VerticalFlyout.prototype.reflowInternal_ = function(/* blocks */) {
  // This is a no-op because the flyout is a fixed size.
  return;
};
