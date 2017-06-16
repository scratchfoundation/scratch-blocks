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
 * @fileoverview Layout code for a vertical variant of the flyout.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.VerticalFlyout');

goog.require('Blockly.Block');
goog.require('Blockly.Comment');
goog.require('Blockly.Events');
goog.require('Blockly.Flyout');
goog.require('Blockly.FlyoutButton');
goog.require('Blockly.utils');
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

  /**
   * List of checkboxes next to variable blocks.
   * Each element is an object containing the SVG for the checkbox, a boolean
   * for its checked state, and the block the checkbox is associated with.
   * @type {!Array.<!Object>}
   * @private
   */
  this.checkboxes_ = [];
};
goog.inherits(Blockly.VerticalFlyout, Blockly.Flyout);

/**
 * Does the flyout automatically close when a block is created?
 * @type {boolean}
 */
Blockly.VerticalFlyout.prototype.autoClose = false;

/**
 * The width of the flyout, if not otherwise specified.
 * @type {number}
 */
Blockly.VerticalFlyout.prototype.DEFAULT_WIDTH = 250;

/**
 * Size of a checkbox next to a variable reporter.
 * @type {number}
 * @const
 */
Blockly.VerticalFlyout.prototype.CHECKBOX_SIZE = 20;

/**
 * SVG path data for checkmark in checkbox.
 * @type {string}
 * @const
 */
Blockly.VerticalFlyout.prototype.CHECKMARK_PATH =
    'M' + Blockly.VerticalFlyout.prototype.CHECKBOX_SIZE / 4 +
    ' ' + Blockly.VerticalFlyout.prototype.CHECKBOX_SIZE / 2 +
    'L' + 5 * Blockly.VerticalFlyout.prototype.CHECKBOX_SIZE / 12 +
    ' ' + 2 * Blockly.VerticalFlyout.prototype.CHECKBOX_SIZE / 3 +
    'L' + 3 * Blockly.VerticalFlyout.prototype.CHECKBOX_SIZE / 4 +
    ' ' + Blockly.VerticalFlyout.prototype.CHECKBOX_SIZE / 3;

/**
 * Size of the checkbox corner radius
 * @type {number}
 * @const
 */
Blockly.VerticalFlyout.prototype.CHECKBOX_CORNER_RADIUS = 5;

/**
 * Space above and around the checkbox.
 * @type {number}
 * @const
 */
Blockly.VerticalFlyout.prototype.CHECKBOX_MARGIN = Blockly.Flyout.prototype.MARGIN;

/**
 * Total additional width of a row that contains a checkbox.
 * @type {number}
 * @const
 */
Blockly.VerticalFlyout.prototype.CHECKBOX_SPACE_X =
    Blockly.VerticalFlyout.prototype.CHECKBOX_SIZE +
    2 * Blockly.VerticalFlyout.prototype.CHECKBOX_MARGIN;

/**
 * Initializes the flyout.
 * @param {!Blockly.Workspace} targetWorkspace The workspace in which to create
 *     new blocks.
 */
Blockly.VerticalFlyout.prototype.init = function(targetWorkspace) {
  Blockly.VerticalFlyout.superClass_.init.call(this, targetWorkspace);
  this.workspace_.scale = targetWorkspace.scale;
};

/**
 * Creates the flyout's DOM.  Only needs to be called once.
 * @param {string} tagName HTML element
 * @return {!Element} The flyout's SVG group.
 */
Blockly.VerticalFlyout.prototype.createDom = function(tagName) {
  Blockly.VerticalFlyout.superClass_.createDom.call(this, tagName);

  /*
    <defs>
      <clipPath id="blocklyBlockMenuClipPath">
        <rect id="blocklyBlockMenuClipRect" height="1147px"
            width="248px" y="0" x="0">
        </rect>
      </clipPath>
    </defs>
  */
  this.defs_ = Blockly.utils.createSvgElement('defs', {}, this.svgGroup_);
  var clipPath = Blockly.utils.createSvgElement('clipPath',
      {'id':'blocklyBlockMenuClipPath'}, this.defs_);
  this.clipRect_ = Blockly.utils.createSvgElement('rect',
      {'id': 'blocklyBlockMenuClipRect',
        'height': '0',
        'width': '0',
        'y': '0',
        'x': '0'
      },
      clipPath);
  this.workspace_.svgGroup_.setAttribute('clip-path',
      'url(#blocklyBlockMenuClipPath)');

  return this.svgGroup_;
};

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

  // Padding for the end of the scrollbar.
  var absoluteTop = this.SCROLLBAR_PADDING;
  var absoluteLeft = 0;

  var viewHeight = this.height_ - 2 * this.SCROLLBAR_PADDING;
  var viewWidth = this.getWidth() - this.SCROLLBAR_PADDING;

  var metrics = {
    viewHeight: viewHeight,
    viewWidth: viewWidth,
    contentHeight: optionBox.height * this.workspace_.scale + 2 * this.MARGIN,
    contentWidth: optionBox.width * this.workspace_.scale + 2 * this.MARGIN,
    viewTop: -this.workspace_.scrollY + optionBox.y,
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

  this.clipRect_.setAttribute('height', metrics.viewHeight + 'px');
  this.clipRect_.setAttribute('width', metrics.viewWidth + 'px');
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

  // This version of the flyout does not change width to fit its contents.
  // Instead it matches the width of its parent or uses a default value.
  this.width_ = this.getWidth();

  if (this.parentToolbox_) {
    var x = this.parentToolbox_.HtmlDiv.offsetLeft;
    var y = this.parentToolbox_.HtmlDiv.offsetTop +
        this.parentToolbox_.getHeight();
  } else {
    var x = this.toolboxPosition_ == Blockly.TOOLBOX_AT_RIGHT ?
        targetWorkspaceMetrics.viewWidth - this.width_ : 0;
    var y = 0;
  }

  // Record the height for Blockly.Flyout.getMetrics_
  this.height_ = targetWorkspaceMetrics.viewHeight - y;

  this.setBackgroundPath_(this.width_, this.height_);

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
    var pos = -this.workspace_.scrollY + delta;
    var limit = metrics.contentHeight - metrics.viewHeight;
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
 * Delete blocks and background buttons from a previous showing of the flyout.
 * @private
 */
Blockly.VerticalFlyout.prototype.clearOldBlocks_ = function() {
  Blockly.VerticalFlyout.superClass_.clearOldBlocks_.call(this);

  // Do the same for checkboxes.
  for (var i = 0, elem; elem = this.checkboxes_[i]; i++) {
    elem.block.flyoutCheckbox = null;
    goog.dom.removeNode(elem.svgRoot);
  }
  this.checkboxes_ = [];
};

/**
 * Add listeners to a block that has been added to the flyout.
 * @param {Element} root The root node of the SVG group the block is in.
 * @param {!Blockly.Block} block The block to add listeners for.
 * @param {!Element} rect The invisible rectangle under the block that acts as
 *     a button for that block.
 * @private
 */
Blockly.VerticalFlyout.prototype.addBlockListeners_ = function(root, block,
    rect) {
  Blockly.VerticalFlyout.superClass_.addBlockListeners_.call(this, root, block,
      rect);
  if (block.flyoutCheckbox) {
    this.listeners_.push(Blockly.bindEvent_(block.flyoutCheckbox.svgRoot,
        'mousedown', null, this.checkboxClicked_(block.flyoutCheckbox)));
  }
};

/**
 * Lay out the blocks in the flyout.
 * @param {!Array.<!Object>} contents The blocks and buttons to lay out.
 * @param {!Array.<number>} gaps The visible gaps between blocks.
 * @private
 */
Blockly.VerticalFlyout.prototype.layout_ = function(contents, gaps) {
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

      // Figure out where the block goes, taking into account its size, whether
      // we're in RTL mode, and whether it has a checkbox.
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

      // The block moves a bit extra for the hat, but the block's rectangle
      // doesn't.  That's because the hat actually extends up from 0.
      block.moveBy(moveX,
          cursorY + (block.startHat_ ? Blockly.BlockSvg.START_HAT_HEIGHT : 0));

      var rect = this.createRect_(block, this.RTL ? moveX - blockHW.width : moveX, cursorY, blockHW, i);

      this.addBlockListeners_(root, block, rect);

      cursorY += blockHW.height + gaps[i] + (block.startHat_ ? Blockly.BlockSvg.START_HAT_HEIGHT : 0);
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
      cursorY += button.height + gaps[i];
    }
  }
};

/**
 * Create and place a rectangle corresponding to the given block.
 * @param {!Blockly.Block} block The block to associate the rect to.
 * @param {number} x The x position of the cursor during this layout pass.
 * @param {number} y The y position of the cursor during this layout pass.
 * @param {!{height: number, width: number}} blockHW The height and width of the
 *     block.
 * @param {number} index The index into the background buttons list where this
 *     rect should be placed.
 * @return {!SVGElement} Newly created SVG element for the rectangle behind the
 *     block.
 * @private
 */
Blockly.VerticalFlyout.prototype.createRect_ = function(block, x, y,
    blockHW, index) {
  // Create an invisible rectangle under the block to act as a button.  Just
  // using the block as a button is poor, since blocks have holes in them.
  var rect = Blockly.utils.createSvgElement('rect',
    {
      'fill-opacity': 0,
      'x': x,
      'y': y,
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
Blockly.VerticalFlyout.prototype.createCheckbox_ = function(block, cursorX,
     cursorY, blockHW) {
  var checkboxState = Blockly.VerticalFlyout.getCheckboxState(block.id);
  var svgRoot = block.getSvgRoot();
  var extraSpace = this.CHECKBOX_SIZE + this.CHECKBOX_MARGIN;
  var width = this.RTL ? this.getWidth() / this.workspace_.scale - extraSpace : cursorX;
  var height = cursorY + blockHW.height / 2 - this.CHECKBOX_SIZE / 2;
  var checkboxGroup = Blockly.utils.createSvgElement('g',
    {
      'class': 'blocklyFlyoutCheckbox',
      'transform': 'translate(' + width + ', ' + height + ')'
    }, null);
  Blockly.utils.createSvgElement('rect',
    {
      'height': this.CHECKBOX_SIZE,
      'width': this.CHECKBOX_SIZE,
      'rx': this.CHECKBOX_CORNER_RADIUS,
      'ry': this.CHECKBOX_CORNER_RADIUS
    }, checkboxGroup);
  Blockly.utils.createSvgElement('path',
    {
      'class': 'blocklyFlyoutCheckboxPath',
      'd': this.CHECKMARK_PATH
    }, checkboxGroup);
  var checkboxObj = {svgRoot: checkboxGroup, clicked: checkboxState, block: block};

  if (checkboxState) {
    Blockly.utils.addClass((checkboxObj.svgRoot), 'checked');
  }

  block.flyoutCheckbox = checkboxObj;
  this.workspace_.getCanvas().insertBefore(checkboxGroup, svgRoot);
  this.checkboxes_.push(checkboxObj);
};

/**
 * Respond to a click on a checkbox in the flyout.
 * @param {!Object} checkboxObj An object containing the svg element of the
 *    checkbox, a boolean for the state of the checkbox, and the block the
 *    checkbox is associated with.
 * @return {!Function} Function to call when checkbox is clicked.
 * @private
 */
Blockly.VerticalFlyout.prototype.checkboxClicked_ = function(checkboxObj) {
  return function(e) {
    this.setCheckboxState(checkboxObj.block.id, !checkboxObj.clicked);
    // This event has been handled.  No need to bubble up to the document.
    e.stopPropagation();
    e.preventDefault();
  }.bind(this);
};

/**
 * Set the state of a checkbox by block ID.
 * @param {string} blockId ID of the block whose checkbox should be set
 * @param {boolean} value Value to set the checkbox to.
 * @public
 */
Blockly.VerticalFlyout.prototype.setCheckboxState = function(blockId, value) {
  for (var i = 0; i < this.checkboxes_.length; i++) {
    var checkboxObj = this.checkboxes_[i];
    if (checkboxObj.block.id === blockId) {
      if (checkboxObj.clicked === value) return;

      var oldValue = checkboxObj.clicked;
      checkboxObj.clicked = value;

      if (checkboxObj.clicked) {
        Blockly.utils.addClass((checkboxObj.svgRoot), 'checked');
      } else {
        Blockly.utils.removeClass((checkboxObj.svgRoot), 'checked');
      }

      Blockly.Events.fire(new Blockly.Events.Change(
          checkboxObj.block, 'checkbox', null, oldValue, value));

      return;
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
Blockly.VerticalFlyout.prototype.isDragTowardWorkspace = function(currentDragDeltaXY) {
  var dx = currentDragDeltaXY.x;
  var dy = currentDragDeltaXY.y;
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
 * @param {!Blockly.Block} originBlock The flyout block to copy.
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
  // In what coordinates?  Pixels?
  var xyOld = Blockly.utils.getInjectionDivXY_(svgRootOld);

  // Take into account that the flyout might have been scrolled horizontally
  // (separately from the main workspace).
  // Generally a no-op in vertical mode but likely to happen in horizontal
  // mode.
  // var scrollX = this.workspace_.scrollX;
  var scale = this.workspace_.scale;
  // xyOld.x += scrollX / scale - scrollX;

  var targetMetrics = targetWorkspace.getMetrics();

  // If the flyout is on the right side, (0, 0) in the flyout is offset to
  // the right of (0, 0) in the main workspace.  Add an offset to take that
  // into account.
  var scrollX = 0;
  if (this.toolboxPosition_ == Blockly.TOOLBOX_AT_RIGHT) {
    scrollX = targetMetrics.viewWidth - this.width_;
    // Scale the scroll (getSvgXY_ did not do this).
    xyOld.x += scrollX / scale - scrollX;
  }

  // The main workspace has 0,0 at the top inside corner of the toolbox.
  // Need to take that into account now that the flyout is offset from there in
  // both directions.
  if (this.parentToolbox_) {
    // TODO (fenichel): fix these offsets to correctly deal with scaling
    // changes.
    xyOld.y += (this.parentToolbox_.getHeight()) /
        targetWorkspace.scale -
        (this.parentToolbox_.getHeight());
    var xOffset = this.parentToolbox_.getWidth() / targetWorkspace.scale -
        this.parentToolbox_.getWidth();
    if (this.toolboxPosition_ == Blockly.TOOLBOX_AT_RIGHT) {
      xyOld.x += xOffset;
    } else {
      xyOld.x -= xOffset;
    }
  }

  // Take into account that the flyout might have been scrolled vertically
  // (separately from the main workspace).
  var scrollY = this.workspace_.scrollY;
  xyOld.y += scrollY / scale - scrollY;

  // Create the new block by cloning the block in the flyout (via XML).
  var xml = Blockly.Xml.blockToDom(originBlock);
  // The target workspace would normally resize during domToBlock, which will
  // lead to weird jumps.  Save it for terminateDrag.
  targetWorkspace.setIsUpdating(true);
  var block = Blockly.Xml.domToBlock(xml, targetWorkspace);
  var svgRootNew = block.getSvgRoot();
  if (!svgRootNew) {
    throw 'block is not rendered.';
  }
  // Figure out where the new block got placed on the screen, relative to the
  // upper left corner of the workspace.  This may not be the same as the
  // original block because the flyout's origin may not be the same as the
  // main workspace's origin.
  var xyNew = Blockly.utils.getInjectionDivXY_(svgRootNew);

  // Scale the scroll (getSvgXY_ did not do this).
  xyNew.x +=
      targetWorkspace.scrollX / targetWorkspace.scale - targetWorkspace.scrollX;
  xyNew.y +=
      targetWorkspace.scrollY / targetWorkspace.scale - targetWorkspace.scrollY;

  // Move the new block to where the old block is.
  var dx = ((scale * xyOld.x) - (targetWorkspace.scale * xyNew.x)) /
      targetWorkspace.scale;
  var dy = ((scale * xyOld.y) - (targetWorkspace.scale * xyNew.y)) /
      targetWorkspace.scale;
  block.moveBy(dx, dy);

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

/**
 * Gets the checkbox state for a block
 * @param {string} blockId The ID of the block in question.
 * @return {boolean} Whether the block is checked.
 * @public
 */
Blockly.VerticalFlyout.getCheckboxState = function(/* blockId */) {
  return false;
};
