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
 * @fileoverview Base class for a file tray containing blocks that may be
 * dragged into the workspace.  Defines basic interactions that are shared
 * between vertical and horizontal flyouts.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Flyout');

goog.require('Blockly.Block');
goog.require('Blockly.Comment');
goog.require('Blockly.Events');
goog.require('Blockly.FlyoutButton');
goog.require('Blockly.Touch');
goog.require('Blockly.WorkspaceSvg');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.math.Rect');
goog.require('goog.userAgent');


/**
 * Class for a flyout.
 * @param {!Object} workspaceOptions Dictionary of options for the workspace.
 * @constructor
 */
Blockly.Flyout = function(workspaceOptions) {
  workspaceOptions.getMetrics = this.getMetrics_.bind(this);
  workspaceOptions.setMetrics = this.setMetrics_.bind(this);

  /**
   * @type {!Blockly.Workspace}
   * @private
   */
  this.workspace_ = new Blockly.WorkspaceSvg(workspaceOptions);
  this.workspace_.isFlyout = true;

  /**
   * Is RTL vs LTR.
   * @type {boolean}
   */
  this.RTL = !!workspaceOptions.RTL;

  /**
   * Flyout should be laid out horizontally vs vertically.
   * @type {boolean}
   * @private
   */
  this.horizontalLayout_ = workspaceOptions.horizontalLayout;

  /**
   * Position of the toolbox and flyout relative to the workspace.
   * @type {number}
   * @private
   */
  this.toolboxPosition_ = workspaceOptions.toolboxPosition;

  /**
   * Opaque data that can be passed to Blockly.unbindEvent_.
   * @type {!Array.<!Array>}
   * @private
   */
  this.eventWrappers_ = [];

  /**
   * List of background buttons that lurk behind each block to catch clicks
   * landing in the blocks' lakes and bays.
   * @type {!Array.<!Element>}
   * @private
   */
  this.backgroundButtons_ = [];

  /**
   * List of visible buttons.
   * @type {!Array.<!Blockly.FlyoutButton>}
   * @private
   */
  this.buttons_ = [];

  /**
   * List of event listeners.
   * @type {!Array.<!Array>}
   * @private
   */
  this.listeners_ = [];

  /**
   * List of blocks that should always be disabled.
   * @type {!Array.<!Blockly.Block>}
   * @private
   */
  this.permanentlyDisabled_ = [];

  /**
   * y coordinate of mousedown - used to calculate scroll distances.
   * @type {number}
   * @private
   */
  this.startDragMouseY_ = 0;

  /**
   * x coordinate of mousedown - used to calculate scroll distances.
   * @type {number}
   * @private
   */
  this.startDragMouseX_ = 0;

  /**
   * The toolbox that this flyout belongs to, or none if tihs is a simple
   * workspace.
   * @type {Blockly.Toolbox}
   * @private
   */
  this.parentToolbox_ = null;
};

/**
 * When a flyout drag is in progress, this is a reference to the flyout being
 * dragged. This is used by Flyout.terminateDrag_ to reset dragMode_.
 * @type {Blockly.Flyout}
 * @private
 */
Blockly.Flyout.startFlyout_ = null;

/**
 * Event that started a drag. Used to determine the drag distance/direction and
 * also passed to BlockSvg.onMouseDown_() after creating a new block.
 * @type {Event}
 * @private
 */
Blockly.Flyout.startDownEvent_ = null;

/**
 * Flyout block where the drag/click was initiated. Used to fire click events or
 * create a new block.
 * @type {Blockly.Block}
 * @private
 */
Blockly.Flyout.startBlock_ = null;

/**
 * Wrapper function called when a mouseup occurs during a background or block
 * drag operation.
 * @type {function}
 * private
 */
Blockly.Flyout.onMouseUpWrapper_ = null;

/**
 * Wrapper function called when a mousemove occurs during a background drag.
 * @type {function}
 * @private
 */
Blockly.Flyout.onMouseMoveWrapper_ = null;

/**
 * Wrapper function called when a mousemove occurs during a block drag.
 * @private {Array.<!Array>}
 */
Blockly.Flyout.onMouseMoveBlockWrapper_ = null;

/**
 * Does the flyout automatically close when a block is created?
 * @type {boolean}
 */
Blockly.Flyout.prototype.autoClose = true;

/**
 * Whether the flyout is visible.
 * @type {boolean}
 * @private
 */
Blockly.Flyout.prototype.isVisible_ = false;

/**
 * Whether the workspace containing this flyout is visible.
 * @type {boolean}
 * @private
 */
Blockly.Flyout.prototype.containerVisible_ = true;

/**
 * Corner radius of the flyout background.
 * @type {number}
 * @const
 */
Blockly.Flyout.prototype.CORNER_RADIUS = 0;

/**
 * Number of pixels the mouse must move before a drag/scroll starts. Because the
 * drag-intention is determined when this is reached, it is larger than
 * Blockly.DRAG_RADIUS so that the drag-direction is clearer.
 */
Blockly.Flyout.prototype.DRAG_RADIUS = 10;

/**
 * Margin around the edges of the blocks in the flyout.
 * @type {number}
 * @const
 */
Blockly.Flyout.prototype.MARGIN = 12;

/**
 * Gap between items in horizontal flyouts. Can be overridden with the "sep"
 * element.
 * @const {number}
 */
Blockly.Flyout.prototype.GAP_X = Blockly.Flyout.prototype.MARGIN * 3;

/**
 * Gap between items in vertical flyouts. Can be overridden with the "sep"
 * element.
 * @const {number}
 */
Blockly.Flyout.prototype.GAP_Y = Blockly.Flyout.prototype.MARGIN * 3;

/**
 * Top/bottom padding between scrollbar and edge of flyout background.
 * @type {number}
 * @const
 */
Blockly.Flyout.prototype.SCROLLBAR_PADDING = 2;

/**
 * Width of flyout.
 * @type {number}
 * @private
 */
Blockly.Flyout.prototype.width_ = 0;

/**
 * Height of flyout.
 * @type {number}
 * @private
 */
Blockly.Flyout.prototype.height_ = 0;

/**
 * Width of flyout contents.
 * @type {number}
 * @private
 */
Blockly.Flyout.prototype.contentWidth_ = 0;

/**
 * Height of flyout contents.
 * @type {number}
 * @private
 */
Blockly.Flyout.prototype.contentHeight_ = 0;

/**
 * Vertical offset of flyout.
 * @type {number}
 * @private
 */
Blockly.Flyout.prototype.verticalOffset_ = 0;

/**
 * Range of a drag angle from a flyout considered "dragging toward workspace".
 * Drags that are within the bounds of this many degrees from the orthogonal
 * line to the flyout edge are considered to be "drags toward the workspace".
 * Example:
 * Flyout                                                  Edge   Workspace
 * [block] /  <-within this angle, drags "toward workspace" |
 * [block] ---- orthogonal to flyout boundary ----          |
 * [block] \                                                |
 * The angle is given in degrees from the orthogonal.
 *
 * This is used to know when to create a new block and when to scroll the
 * flyout. Setting it to 360 means that all drags create a new block.
 * @type {number}
 * @private
*/
Blockly.Flyout.prototype.dragAngleRange_ = 70;

/**
 * Is the flyout dragging (scrolling)?
 * 0 - DRAG_NONE - no drag is ongoing or state is undetermined
 * 1 - DRAG_STICKY - still within the sticky drag radius
 * 2 - DRAG_FREE - in scroll mode (never create a new block)
 * @private
 */
Blockly.Flyout.prototype.dragMode_ = Blockly.DRAG_NONE;


/**
 * Creates the flyout's DOM.  Only needs to be called once. The flyout can
 * either exist as its own <svg> element or be a <g> nested inside a separate
 * <svg> element.
 * @param {string} tagName The type of tag to put the flyout in. This
 *     should be <svg> or <g>.
 * @return {!Element} The flyout's SVG group.
 */
Blockly.Flyout.prototype.createDom = function(tagName) {
  /*
  <svg | g>
    <path class="blocklyFlyoutBackground"/>
    <g class="blocklyFlyout"></g>
  </ svg | g>
  */
  // Setting style to display:none to start. The toolbox and flyout
  // hide/show code will set up proper visibility and size later.
  this.svgGroup_ = Blockly.utils.createSvgElement(tagName,
      {'class': 'blocklyFlyout', 'style' : 'display: none'}, null);
  this.svgBackground_ = Blockly.utils.createSvgElement('path',
      {'class': 'blocklyFlyoutBackground'}, this.svgGroup_);
  this.svgGroup_.appendChild(this.workspace_.createDom());
  return this.svgGroup_;
};

/**
 * Initializes the flyout.
 * @param {!Blockly.Workspace} targetWorkspace The workspace in which to create
 *     new blocks.
 */
Blockly.Flyout.prototype.init = function(targetWorkspace) {
  this.targetWorkspace_ = targetWorkspace;
  this.workspace_.targetWorkspace = targetWorkspace;
  // Add scrollbar.
  this.scrollbar_ = new Blockly.Scrollbar(this.workspace_,
      this.horizontalLayout_, false);

  this.position();

  Array.prototype.push.apply(this.eventWrappers_,
      Blockly.bindEvent_(this.svgGroup_, 'wheel', this, this.wheel_));
  // Dragging the flyout up and down (or left and right).
  Array.prototype.push.apply(this.eventWrappers_,
      Blockly.bindEvent_(this.svgGroup_, 'mousedown', this, this.onMouseDown_));
};

/**
 * Dispose of this flyout.
 * Unlink from all DOM elements to prevent memory leaks.
 */
Blockly.Flyout.prototype.dispose = function() {
  this.hide();
  Blockly.unbindEvent_(this.eventWrappers_);
  if (this.scrollbar_) {
    this.scrollbar_.dispose();
    this.scrollbar_ = null;
  }
  if (this.workspace_) {
    this.workspace_.targetWorkspace = null;
    this.workspace_.dispose();
    this.workspace_ = null;
  }
  if (this.svgGroup_) {
    goog.dom.removeNode(this.svgGroup_);
    this.svgGroup_ = null;
  }
  this.parentToolbox_ = null;
  this.svgBackground_ = null;
  this.targetWorkspace_ = null;
};

/**
 * Set the parent toolbox of this flyout.
 * @param {!Blockly.Toolbox} toolbox The toolbox that owns this flyout.
 */
Blockly.Flyout.prototype.setParentToolbox = function(toolbox) {
  this.parentToolbox_ = toolbox;
};

/**
 * Get the width of the flyout.
 * @return {number} The width of the flyout.
 */
Blockly.Flyout.prototype.getWidth = function() {
  return this.parentToolbox_ ? this.parentToolbox_.getWidth() :
      this.DEFAULT_WIDTH;
};

/**
 * Get the height of the flyout.
 * @return {number} The width of the flyout.
 */
Blockly.Flyout.prototype.getHeight = function() {
  return this.height_;
};

/**
 * Get the flyout's workspace.
 * @return {!Blockly.Workspace} Workspace on which this flyout's blocks are placed.
 */
Blockly.Flyout.prototype.getWorkspace = function() {
  return this.workspace_;
};

/**
 * Is the flyout visible?
 * @return {boolean} True if visible.
 */
Blockly.Flyout.prototype.isVisible = function() {
  return this.isVisible_;
};

/**
 * Set whether the flyout is visible. A value of true does not necessarily mean
 * that the flyout is shown. It could be hidden because its container is hidden.
 * @param {boolean} visible True if visible.
 */
Blockly.Flyout.prototype.setVisible = function(visible) {
  var visibilityChanged = (visible != this.isVisible());

  this.isVisible_ = visible;
  if (visibilityChanged) {
    this.updateDisplay_();
  }
};

/**
 * Set whether this flyout's container is visible.
 * @param {boolean} visible Whether the container is visible.
 */
Blockly.Flyout.prototype.setContainerVisible = function(visible) {
  var visibilityChanged = (visible != this.containerVisible_);
  this.containerVisible_ = visible;
  if (visibilityChanged) {
    this.updateDisplay_();
  }
};

/**
 * Update the display property of the flyout based whether it thinks it should
 * be visible and whether its containing workspace is visible.
 * @private
 */
Blockly.Flyout.prototype.updateDisplay_ = function() {
  var show = true;
  if (!this.containerVisible_) {
    show = false;
  } else {
    show = this.isVisible();
  }
  this.svgGroup_.style.display = show ? 'block' : 'none';
  // Update the scrollbar's visiblity too since it should mimic the
  // flyout's visibility.
  this.scrollbar_.setContainerVisible(show);
};

/**
 * Hide and empty the flyout.
 */
Blockly.Flyout.prototype.hide = function() {
  if (!this.isVisible()) {
    return;
  }
  this.setVisible(false);
  // Delete all the event listeners.
  for (var x = 0, listen; listen = this.listeners_[x]; x++) {
    Blockly.unbindEvent_(listen);
  }
  this.listeners_.length = 0;
  if (this.reflowWrapper_) {
    this.workspace_.removeChangeListener(this.reflowWrapper_);
    this.reflowWrapper_ = null;
  }
  // Do NOT delete the blocks here.  Wait until Flyout.show.
  // https://neil.fraser.name/news/2014/08/09/
};

/**
 * Show and populate the flyout.
 * @param {!Array|string} xmlList List of blocks to show.
 *     Variables and procedures have a custom set of blocks.
 */
Blockly.Flyout.prototype.show = function(xmlList) {
  this.workspace_.setResizesEnabled(false);
  this.hide();
  this.clearOldBlocks_();

  if (xmlList == Blockly.Variables.NAME_TYPE) {
    // Special category for variables.
    xmlList =
        Blockly.Variables.flyoutCategory(this.workspace_.targetWorkspace);
  } else if (xmlList == Blockly.Procedures.NAME_TYPE) {
    // Special category for procedures.
    xmlList =
        Blockly.Procedures.flyoutCategory(this.workspace_.targetWorkspace);
  }

  this.setVisible(true);
  // Create the blocks to be shown in this flyout.
  var contents = [];
  var gaps = [];
  this.permanentlyDisabled_.length = 0;
  for (var i = 0, xml; xml = xmlList[i]; i++) {
    if (xml.tagName) {
      var tagName = xml.tagName.toUpperCase();
      var default_gap = this.horizontalLayout_ ? this.GAP_X : this.GAP_Y;
      if (tagName == 'BLOCK') {
        var curBlock = Blockly.Xml.domToBlock(xml, this.workspace_);
        if (curBlock.disabled) {
          // Record blocks that were initially disabled.
          // Do not enable these blocks as a result of capacity filtering.
          this.permanentlyDisabled_.push(curBlock);
        }
        contents.push({type: 'block', block: curBlock});
        var gap = parseInt(xml.getAttribute('gap'), 10);
        gaps.push(isNaN(gap) ? default_gap : gap);
      } else if (xml.tagName.toUpperCase() == 'SEP') {
        // Change the gap between two blocks.
        // <sep gap="36"></sep>
        // The default gap is 24, can be set larger or smaller.
        // This overwrites the gap attribute on the previous block.
        // Note that a deprecated method is to add a gap to a block.
        // <block type="math_arithmetic" gap="8"></block>
        var newGap = parseInt(xml.getAttribute('gap'), 10);
        // Ignore gaps before the first block.
        if (!isNaN(newGap) && gaps.length > 0) {
          gaps[gaps.length - 1] = newGap;
        } else {
          gaps.push(default_gap);
        }
      } else if (tagName == 'BUTTON' || tagName == 'LABEL') {
        // Labels behave the same as buttons, but are styled differently.
        var isLabel = tagName == 'LABEL';
        var curButton = new Blockly.FlyoutButton(this.workspace_,
            this.targetWorkspace_, xml, isLabel);
        contents.push({type: 'button', button: curButton});
        gaps.push(default_gap);
      }
    }
  }

  this.layout_(contents, gaps);

  // IE 11 is an incompetent browser that fails to fire mouseout events.
  // When the mouse is over the background, deselect all blocks.
  var deselectAll = function() {
    var topBlocks = this.workspace_.getTopBlocks(false);
    for (var i = 0, block; block = topBlocks[i]; i++) {
      block.removeSelect();
    }
  };

  this.listeners_.push(Blockly.bindEvent_(this.svgBackground_, 'mouseover',
      this, deselectAll));

  this.reflow();

  // Correctly position the flyout's scrollbar when it opens.
  this.position();

  this.reflowWrapper_ = this.reflow.bind(this);
  this.workspace_.addChangeListener(this.reflowWrapper_);
};

/**
 * Delete blocks and background buttons from a previous showing of the flyout.
 * @private
 */
Blockly.Flyout.prototype.clearOldBlocks_ = function() {
  // Delete any blocks from a previous showing.
  var oldBlocks = this.workspace_.getTopBlocks(false);
  for (var i = 0, block; block = oldBlocks[i]; i++) {
    if (block.workspace == this.workspace_) {
      block.dispose(false, false);
    }
  }
  // Delete any background buttons from a previous showing.
  for (var j = 0, rect; rect = this.backgroundButtons_[j]; j++) {
    goog.dom.removeNode(rect);
  }
  this.backgroundButtons_.length = 0;

  for (var i = 0, button; button = this.buttons_[i]; i++) {
    button.dispose();
  }
  this.buttons_.length = 0;
};

/**
 * Add listeners to a block that has been added to the flyout.
 * @param {Element} root The root node of the SVG group the block is in.
 * @param {!Blockly.Block} block The block to add listeners for.
 * @param {!Element} rect The invisible rectangle under the block that acts as
 *     a button for that block.
 * @private
 */
Blockly.Flyout.prototype.addBlockListeners_ = function(root, block, rect) {
  if (this.autoClose) {
    this.listeners_.push(Blockly.bindEventWithChecks_(root, 'mousedown', null,
        this.createBlockFunc_(block)));
    this.listeners_.push(Blockly.bindEventWithChecks_(rect, 'mousedown', null,
        this.createBlockFunc_(block)));
  } else {
    this.listeners_.push(Blockly.bindEventWithChecks_(root, 'mousedown', null,
        this.blockMouseDown_(block)));
    this.listeners_.push(Blockly.bindEventWithChecks_(rect, 'mousedown', null,
        this.blockMouseDown_(block)));
  }
  this.listeners_.push(Blockly.bindEvent_(root, 'mouseover', block,
      block.addSelect));
  this.listeners_.push(Blockly.bindEvent_(root, 'mouseout', block,
      block.removeSelect));
  this.listeners_.push(Blockly.bindEvent_(rect, 'mouseover', block,
      block.addSelect));
  this.listeners_.push(Blockly.bindEvent_(rect, 'mouseout', block,
      block.removeSelect));
};

/**
 * Actions to take when a block in the flyout is right-clicked.
 * @param {!Event} e Event that triggered the right-click.  Could originate from
 *     a long-press in a touch environment.
 * @param {Blockly.BlockSvg} block The block that was clicked.
 */
Blockly.Flyout.blockRightClick_ = function(e, block) {
  Blockly.terminateDrag_();
  Blockly.WidgetDiv.hide(true);
  Blockly.DropDownDiv.hideWithoutAnimation();
  Blockly.hideChaff(true);
  block.showContextMenu_(e);
  // This was a right-click, so end the gesture immediately.
  Blockly.Touch.clearTouchIdentifier();
};

/**
 * Handle a mouse-down on an SVG block in a non-closing flyout.
 * @param {!Blockly.Block} block The flyout block to copy.
 * @return {!Function} Function to call when block is clicked.
 * @private
 */
Blockly.Flyout.prototype.blockMouseDown_ = function(block) {
  var flyout = this;
  return function(e) {
    if (Blockly.utils.isRightButton(e)) {
      Blockly.Flyout.blockRightClick_(e, block);
    } else {
      flyout.dragMode_ = Blockly.DRAG_NONE;
      Blockly.terminateDrag_();
      Blockly.WidgetDiv.hide(true);
      Blockly.DropDownDiv.hideWithoutAnimation();
      Blockly.hideChaff();
      // Left-click (or middle click)
      // Record the current mouse position.
      flyout.startDragMouseY_ = e.clientY;
      flyout.startDragMouseX_ = e.clientX;
      Blockly.Flyout.startDownEvent_ = e;
      Blockly.Flyout.startBlock_ = block;
      Blockly.Flyout.startFlyout_ = flyout;
      Blockly.Flyout.onMouseUpWrapper_ = Blockly.bindEvent_(document,
          'mouseup', flyout, flyout.onMouseUp_);
      Blockly.Flyout.onMouseMoveBlockWrapper_ = Blockly.bindEvent_(document,
          'mousemove', flyout, flyout.onMouseMoveBlock_);
    }
    // This event has been handled.  No need to bubble up to the document.
    e.stopPropagation();
    e.preventDefault();
  };
};

/**
 * Mouse down on the flyout background.  Start a scroll drag.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.Flyout.prototype.onMouseDown_ = function(e) {
  this.dragMode_ = Blockly.DRAG_FREE;
  if (Blockly.utils.isRightButton(e)) {
    // Don't start drags with right clicks.
    Blockly.Touch.clearTouchIdentifier();
    return;
  }
  Blockly.WidgetDiv.hide(true);
  Blockly.DropDownDiv.hideWithoutAnimation();
  Blockly.hideChaff(true);
  this.dragMode_ = Blockly.DRAG_FREE;
  this.startDragMouseY_ = e.clientY;
  this.startDragMouseX_ = e.clientX;
  Blockly.Flyout.startFlyout_ = this;
  Blockly.Flyout.onMouseMoveWrapper_ = Blockly.bindEvent_(document, 'mousemove',
      this, this.onMouseMove_);
  Blockly.Flyout.onMouseUpWrapper_ = Blockly.bindEvent_(document, 'mouseup',
      this, Blockly.Flyout.terminateDrag_);
  // This event has been handled.  No need to bubble up to the document.
  e.preventDefault();
  e.stopPropagation();
};

/**
 * Handle a mouse-up anywhere in the SVG pane.  Is only registered when a
 * block is clicked.  We can't use mouseUp on the block since a fast-moving
 * cursor can briefly escape the block before it catches up.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.Flyout.prototype.onMouseUp_ = function(/*e*/) {
  if (!this.workspace_.isDragging()) {
    // This was a click, not a drag.  End the gesture.
    Blockly.Touch.clearTouchIdentifier();
    // A field is being edited if either the WidgetDiv or DropDownDiv is currently open.
    // If a field is being edited, don't fire any click events.
    var fieldEditing = Blockly.WidgetDiv.isVisible() || Blockly.DropDownDiv.isVisible();
    if (this.autoClose) {
      this.createBlockFunc_(Blockly.Flyout.startBlock_)(
          Blockly.Flyout.startDownEvent_);
    } else if (!fieldEditing) {
      Blockly.Events.fire(
          new Blockly.Events.Ui(Blockly.Flyout.startBlock_, 'click',
                                undefined, undefined));
      Blockly.Events.fire(
          new Blockly.Events.Ui(Blockly.Flyout.startBlock_, 'stackclick',
                                undefined, undefined));
    }
  }
  Blockly.terminateDrag_();
};

/**
 * Handle a mouse-move to vertically drag the flyout.
 * @param {!Event} e Mouse move event.
 * @private
 */
Blockly.Flyout.prototype.onMouseMove_ = function(e) {
  var metrics = this.getMetrics_();
  if (this.horizontalLayout_) {
    if (metrics.contentWidth - metrics.viewWidth < 0) {
      return;
    }
    var dx = e.clientX - this.startDragMouseX_;
    this.startDragMouseX_ = e.clientX;
    var x = metrics.viewLeft - dx;
    x = goog.math.clamp(x, 0, metrics.contentWidth - metrics.viewWidth);
    this.scrollbar_.set(x);
  } else {
    if (metrics.contentHeight - metrics.viewHeight < 0) {
      return;
    }
    var dy = e.clientY - this.startDragMouseY_;
    this.startDragMouseY_ = e.clientY;
    var y = metrics.viewTop - dy;
    y = goog.math.clamp(y, 0, metrics.contentHeight - metrics.viewHeight);
    this.scrollbar_.set(y);
  }
};

/**
 * Mouse button is down on a block in a non-closing flyout.  Create the block
 * if the mouse moves beyond a small radius.  This allows one to play with
 * fields without instantiating blocks that instantly self-destruct.
 * @param {!Event} e Mouse move event.
 * @private
 */
Blockly.Flyout.prototype.onMouseMoveBlock_ = function(e) {
  if (e.type == 'mousemove' && e.clientX <= 1 && e.clientY == 0 &&
      e.button == 0) {
    /* HACK:
     Safari Mobile 6.0 and Chrome for Android 18.0 fire rogue mousemove events
     on certain touch actions. Ignore events with these signatures.
     This may result in a one-pixel blind spot in other browsers,
     but this shouldn't be noticeable. */
    e.stopPropagation();
    return;
  }
  Blockly.Css.setCursor(Blockly.Css.Cursor.CLOSED);
  var dx = e.clientX - Blockly.Flyout.startDownEvent_.clientX;
  var dy = e.clientY - Blockly.Flyout.startDownEvent_.clientY;
  var createBlock = this.determineDragIntention_(dx, dy);
  Blockly.longStop_();
  if (createBlock) {
    this.createBlockFunc_(Blockly.Flyout.startBlock_)(
        Blockly.Flyout.startDownEvent_);
  } else if (this.dragMode_ == Blockly.DRAG_FREE) {
    // Do a scroll.
    this.onMouseMove_(e);
  }
  e.stopPropagation();
};

/**
 * Determine the intention of a drag.
 * Updates dragMode_ based on a drag delta and the current mode,
 * and returns true if we should create a new block.
 * @param {number} dx X delta of the drag.
 * @param {number} dy Y delta of the drag.
 * @return {boolean} True if a new block should be created.
 * @private
 */
Blockly.Flyout.prototype.determineDragIntention_ = function(dx, dy) {
  if (this.dragMode_ == Blockly.DRAG_FREE) {
    // Once in free mode, always stay in free mode and never create a block.
    return false;
  }
  var dragDistance = Math.sqrt(dx * dx + dy * dy);
  if (dragDistance < this.DRAG_RADIUS) {
    // Still within the sticky drag radius.
    this.dragMode_ = Blockly.DRAG_STICKY;
    return false;
  } else {
    if (this.isDragTowardWorkspace_(dx, dy) || !this.scrollbar_.isVisible()) {
      // Immediately create a block.
      return true;
    } else {
      // Immediately move to free mode - the drag is away from the workspace.
      this.dragMode_ = Blockly.DRAG_FREE;
      return false;
    }
  }
};

/**
 * Create a copy of this block on the workspace.
 * @param {!Blockly.Block} originBlock The flyout block to copy.
 * @return {!Function} Function to call when block is clicked.
 * @private
 */
Blockly.Flyout.prototype.createBlockFunc_ = function(originBlock) {
  var flyout = this;
  return function(e) {
    // Hide drop-downs and animating WidgetDiv immediately
    Blockly.WidgetDiv.hide(true);
    Blockly.DropDownDiv.hideWithoutAnimation();
    if (Blockly.utils.isRightButton(e)) {
      // Right-click.  Don't create a block, let the context menu show.
      return;
    }
    if (originBlock.disabled) {
      // Beyond capacity.
      return;
    }
    Blockly.Events.disable();
    // Disable workspace resizing. Reenable at the end of the drag. This avoids
    // a spurious resize between creating the new block and placing it in the
    // workspace.
    flyout.targetWorkspace_.setResizesEnabled(false);
    try {
      var block = flyout.placeNewBlock_(originBlock);
    } finally {
      Blockly.Events.enable();
    }
    if (Blockly.Events.isEnabled()) {
      Blockly.Events.setGroup(true);
      Blockly.Events.fire(new Blockly.Events.Create(block));
    }
    if (flyout.autoClose) {
      flyout.hide();
    }
    // Start a dragging operation on the new block.
    block.onMouseDown_(e);
    Blockly.dragMode_ = Blockly.DRAG_FREE;
    block.setDragging_(true);
    block.moveToDragSurface_();
  };
};

/**
 * Stop binding to the global mouseup and mousemove events.
 * @private
 */
Blockly.Flyout.terminateDrag_ = function() {
  if (Blockly.Flyout.startFlyout_) {
    // User was dragging the flyout background, and has stopped.
    if (Blockly.Flyout.startFlyout_.dragMode_ == Blockly.DRAG_FREE) {
      Blockly.Touch.clearTouchIdentifier();
    }
    Blockly.Flyout.startFlyout_.dragMode_ = Blockly.DRAG_NONE;
    Blockly.Flyout.startFlyout_ = null;
  }
  if (Blockly.Flyout.onMouseUpWrapper_) {
    Blockly.unbindEvent_(Blockly.Flyout.onMouseUpWrapper_);
    Blockly.Flyout.onMouseUpWrapper_ = null;
  }
  if (Blockly.Flyout.onMouseMoveBlockWrapper_) {
    Blockly.unbindEvent_(Blockly.Flyout.onMouseMoveBlockWrapper_);
    Blockly.Flyout.onMouseMoveBlockWrapper_ = null;
  }
  if (Blockly.Flyout.onMouseMoveWrapper_) {
    Blockly.unbindEvent_(Blockly.Flyout.onMouseMoveWrapper_);
    Blockly.Flyout.onMouseMoveWrapper_ = null;
  }
  Blockly.Flyout.startDownEvent_ = null;
  Blockly.Flyout.startBlock_ = null;
};

/**
 * Reflow blocks and their buttons.
 */
Blockly.Flyout.prototype.reflow = function() {
  if (this.reflowWrapper_) {
    this.workspace_.removeChangeListener(this.reflowWrapper_);
  }
  var blocks = this.workspace_.getTopBlocks(false);

  this.reflowInternal_(blocks);
  if (this.reflowWrapper_) {
    this.workspace_.addChangeListener(this.reflowWrapper_);
  }
};
