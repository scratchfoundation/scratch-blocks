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

goog.provide('Blockly.Flyout');

goog.require('Blockly.Block');
goog.require('Blockly.Comment');
goog.require('Blockly.Events');
goog.require('Blockly.Events.BlockCreate');
goog.require('Blockly.Events.VarCreate');
goog.require('Blockly.FlyoutButton');
goog.require('Blockly.FlyoutExtensionCategoryHeader');
goog.require('Blockly.Gesture');
goog.require('Blockly.scratchBlocksUtils');
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
   * @protected
   */
  this.workspace_ = new Blockly.WorkspaceSvg(workspaceOptions);
  this.workspace_.isFlyout = true;

  // When we create blocks for this workspace, instead of using the "optional" id
  // make the default `id` the same as the `type` for easier re-use.
  var newBlock = this.workspace_.newBlock;
  this.workspace_.newBlock = function(type, id) {
    // Use `type` if `id` isn't passed. `this` will be workspace.
    return newBlock.call(this, type, id || type);
  };

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
   * @protected
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
   * @protected
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
   * The toolbox that this flyout belongs to, or none if tihs is a simple
   * workspace.
   * @type {Blockly.Toolbox}
   * @private
   */
  this.parentToolbox_ = null;

  /**
   * The target position for the flyout scroll animation in pixels.
   * Is a number while animating, null otherwise.
   * @type {?number}
   * @package
   */
  this.scrollTarget = null;

  /**
   * A recycle bin for blocks.
   * @type {!Array.<!Blockly.Block>}
   * @private
   */
  this.recycleBlocks_ = [];

};

/**
 * Does the flyout automatically close when a block is created?
 * @type {boolean}
 */
Blockly.Flyout.prototype.autoClose = false;

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
 * Margin around the edges of the blocks in the flyout.
 * @type {number}
 * @const
 */
Blockly.Flyout.prototype.MARGIN = 12;

// TODO: Move GAP_X and GAP_Y to their appropriate files.

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
Blockly.Flyout.prototype.GAP_Y = Blockly.Flyout.prototype.MARGIN;

/**
 * Top/bottom padding between scrollbar and edge of flyout background.
 * @type {number}
 * @const
 */
Blockly.Flyout.prototype.SCROLLBAR_PADDING = 2;

/**
 * Width of flyout.
 * @type {number}
 * @protected
 */
Blockly.Flyout.prototype.width_ = 0;

/**
 * Height of flyout.
 * @type {number}
 * @protected
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
 * @protected
*/
Blockly.Flyout.prototype.dragAngleRange_ = 70;

/**
 * The fraction of the distance to the scroll target to move the flyout on
 * each animation frame, when auto-scrolling. Values closer to 1.0 will make
 * the scroll animation complete faster. Use 1.0 for no animation.
 * @type {number}
 */
Blockly.Flyout.prototype.scrollAnimationFraction = 0.3;

/**
 * Whether to recycle blocks when refreshing the flyout. When false, do not allow
 * anything to be recycled. The default is to recycle.
 * @type {boolean}
 * @private
 */
Blockly.Flyout.prototype.recyclingEnabled_ = true;

/**
 * Creates the flyout's DOM.  Only needs to be called once. The flyout can
 * either exist as its own svg element or be a g element nested inside a
 * separate svg element.
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
      {'class': 'blocklyFlyout', 'style': 'display: none'}, null);
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
      this.horizontalLayout_, false, 'blocklyFlyoutScrollbar');

  this.position();

  Array.prototype.push.apply(this.eventWrappers_,
      Blockly.bindEventWithChecks_(this.svgGroup_, 'wheel', this, this.wheel_));
  // Dragging the flyout up and down (or left and right).
  Array.prototype.push.apply(this.eventWrappers_,
      Blockly.bindEventWithChecks_(
          this.svgGroup_, 'mousedown', this, this.onMouseDown_));

  // A flyout connected to a workspace doesn't have its own current gesture.
  this.workspace_.getGesture =
      this.targetWorkspace_.getGesture.bind(this.targetWorkspace_);

  // Get variables from the main workspace rather than the target workspace.
  this.workspace_.variableMap_  = this.targetWorkspace_.getVariableMap();

  this.workspace_.createPotentialVariableMap();
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
  return this.DEFAULT_WIDTH;
};

/**
 * Get the height of the flyout.
 * @return {number} The width of the flyout.
 */
Blockly.Flyout.prototype.getHeight = function() {
  return this.height_;
};

/**
 * Get the workspace inside the flyout.
 * @return {!Blockly.WorkspaceSvg} The workspace inside the flyout.
 * @package
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

  this.setVisible(true);
  // Create the blocks to be shown in this flyout.
  var contents = [];
  var gaps = [];
  this.permanentlyDisabled_.length = 0;
  for (var i = 0, xml; xml = xmlList[i]; i++) {
    // Handle dynamic categories, represented by a name instead of a list of XML.
    // Look up the correct category generation function and call that to get a
    // valid XML list.
    if (typeof xml === 'string') {
      var fnToApply = this.workspace_.targetWorkspace.getToolboxCategoryCallback(
          xmlList[i]);
      var newList = fnToApply(this.workspace_.targetWorkspace);
      // Insert the new list of blocks in the middle of the list.
      // We use splice to insert at index i, and remove a single element
      // (the placeholder string). Because the spread operator (...) is not
      // available, use apply and concat the array.
      xmlList.splice.apply(xmlList, [i, 1].concat(newList));
      xml = xmlList[i];
    }
    if (xml.tagName) {
      var tagName = xml.tagName.toUpperCase();
      var default_gap = this.horizontalLayout_ ? this.GAP_X : this.GAP_Y;
      if (tagName == 'BLOCK') {

        // We assume that in a flyout, the same block id (or type if missing id) means
        // the same output BlockSVG.

        // Look for a block that matches the id or type, our createBlock will assign
        // id = type if none existed.
        var id = xml.getAttribute('id') || xml.getAttribute('type');
        var recycled = this.recycleBlocks_.findIndex(function(block) {
          return block.id === id;
        });


        // If we found a recycled item, reuse the BlockSVG from last time.
        // Otherwise, convert the XML block to a BlockSVG.
        var curBlock;
        if (recycled > -1) {
          curBlock = this.recycleBlocks_.splice(recycled, 1)[0];
        } else {
          curBlock = Blockly.Xml.domToBlock(xml, this.workspace_);
        }

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
      } else if ((tagName == 'LABEL') && (xml.getAttribute('showStatusButton') == 'true')) {
        var curButton = new Blockly.FlyoutExtensionCategoryHeader(this.workspace_,
            this.targetWorkspace_, xml);
        contents.push({type: 'button', button: curButton});
        gaps.push(default_gap);
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

  this.emptyRecycleBlocks_();

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

  this.workspace_.setResizesEnabled(true);
  this.reflow();

  // Correctly position the flyout's scrollbar when it opens.
  this.position();

  this.reflowWrapper_ = this.reflow.bind(this);
  this.workspace_.addChangeListener(this.reflowWrapper_);

  this.recordCategoryScrollPositions_();
};

/**
 * Empty out the recycled blocks, properly destroying everything.
 * @private
 */
Blockly.Flyout.prototype.emptyRecycleBlocks_ = function() {
  // Clean out the old recycle bin.
  var oldBlocks = this.recycleBlocks_;
  this.recycleBlocks_ = [];
  for (var i = 0; i < oldBlocks.length; i++) {
    oldBlocks[i].dispose(false, false);
  }
};

/**
 * Store an array of category names, ids, scrollbar positions, and category lengths.
 * This is used when scrolling the flyout to cause a category to be selected.
 * @private
 */
Blockly.Flyout.prototype.recordCategoryScrollPositions_ = function() {
  this.categoryScrollPositions = [];
  // Record category names and positions using the text label at the top of each one.
  for (var i = 0; i < this.buttons_.length; i++) {
    if (this.buttons_[i].getIsCategoryLabel()) {
      var categoryLabel = this.buttons_[i];
      this.categoryScrollPositions.push({
        categoryName: categoryLabel.getText(),
        position: this.horizontalLayout_ ?
          categoryLabel.getPosition().x : categoryLabel.getPosition().y
      });
    }
  }
  // Record the length of each category, setting the final one to 0.
  var numCategories = this.categoryScrollPositions.length;
  if (numCategories > 0) {
    for (var i = 0; i < numCategories - 1; i++) {
      var currentPos = this.categoryScrollPositions[i].position;
      var nextPos = this.categoryScrollPositions[i + 1].position;
      var length = nextPos - currentPos;
      this.categoryScrollPositions[i].length = length;
    }
    this.categoryScrollPositions[numCategories - 1].length = 0;
    // Record the id of each category.
    for (var i = 0; i < numCategories; i++) {
      var category = this.parentToolbox_.getCategoryByIndex(i);
      if (category && category.id_) {
        this.categoryScrollPositions[i].categoryId = category.id_;
      }
    }
  }
};

/**
 * Select a category using the scroll position.
 * @param {number} pos The scroll position in pixels.
 * @package
 */
Blockly.Flyout.prototype.selectCategoryByScrollPosition = function(pos) {
  // If we are currently auto-scrolling, due to selecting a category by clicking on it,
  // do not update the category selection.
  if (this.scrollTarget) {
    return;
  }
  var workspacePos = Math.round(pos / this.workspace_.scale);
  // Traverse the array of scroll positions in reverse, so we can select the furthest
  // category that the scroll position is beyond.
  for (var i = this.categoryScrollPositions.length - 1; i >= 0; i--) {
    if (workspacePos >= this.categoryScrollPositions[i].position) {
      this.parentToolbox_.selectCategoryById(this.categoryScrollPositions[i].categoryId);
      return;
    }
  }
};

/**
 * Step the scrolling animation by scrolling a fraction of the way to
 * a scroll target, and request the next frame if necessary.
 * @package
 */
Blockly.Flyout.prototype.stepScrollAnimation = function() {
  if (!this.scrollTarget) {
    return;
  }
  var scrollPos = this.horizontalLayout_ ?
    -this.workspace_.scrollX : -this.workspace_.scrollY;
  var diff = this.scrollTarget - scrollPos;
  if (Math.abs(diff) < 1) {
    this.scrollbar_.set(this.scrollTarget);
    this.scrollTarget = null;
    return;
  }
  this.scrollbar_.set(scrollPos + diff * this.scrollAnimationFraction);

  // Polyfilled by goog.dom.animationFrame.polyfill
  requestAnimationFrame(this.stepScrollAnimation.bind(this));
};

/**
 * Get the scaled scroll position.
 * @return {number} The current scroll position.
 */
Blockly.Flyout.prototype.getScrollPos = function() {
  var pos = this.horizontalLayout_ ?
    -this.workspace_.scrollX : -this.workspace_.scrollY;
  return pos / this.workspace_.scale;
};

/**
 * Set the scroll position, scaling it.
 * @param {number} pos The scroll position to set.
 */
Blockly.Flyout.prototype.setScrollPos = function(pos) {
  this.scrollbar_.set(pos * this.workspace_.scale);
};

/**
 * Set whether the flyout can recycle blocks. A value of true allows blocks to be recycled.
 * @param {boolean} recycle True if recycling is possible.
 */
Blockly.Flyout.prototype.setRecyclingEnabled = function(recycle) {
  this.recyclingEnabled_ = recycle;
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
      if (this.recyclingEnabled_ &&
          Blockly.scratchBlocksUtils.blockIsRecyclable(block)) {
        this.recycleBlock_(block);
      } else {
        block.dispose(false, false);
      }
    }
  }
  // Delete any background buttons from a previous showing.
  for (var j = 0; j < this.backgroundButtons_.length; j++) {
    var rect = this.backgroundButtons_[j];
    if (rect) goog.dom.removeNode(rect);
  }
  this.backgroundButtons_.length = 0;

  for (var i = 0, button; button = this.buttons_[i]; i++) {
    button.dispose();
  }
  this.buttons_.length = 0;

  // Clear potential variables from the previous showing.
  this.workspace_.getPotentialVariableMap().clear();
};

/**
 * Add listeners to a block that has been added to the flyout.
 * @param {!Element} root The root node of the SVG group the block is in.
 * @param {!Blockly.Block} block The block to add listeners for.
 * @param {!Element} rect The invisible rectangle under the block that acts as
 *     a button for that block.
 * @private
 */
Blockly.Flyout.prototype.addBlockListeners_ = function(root, block, rect) {
  this.listeners_.push(Blockly.bindEventWithChecks_(root, 'mousedown', null,
      this.blockMouseDown_(block)));
  this.listeners_.push(Blockly.bindEventWithChecks_(rect, 'mousedown', null,
      this.blockMouseDown_(block)));
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
 * Handle a mouse-down on an SVG block in a non-closing flyout.
 * @param {!Blockly.Block} block The flyout block to copy.
 * @return {!Function} Function to call when block is clicked.
 * @private
 */
Blockly.Flyout.prototype.blockMouseDown_ = function(block) {
  var flyout = this;
  return function(e) {
    var gesture = flyout.targetWorkspace_.getGesture(e);
    if (gesture) {
      gesture.setStartBlock(block);
      gesture.handleFlyoutStart(e, flyout);
    }
  };
};

/**
 * Mouse down on the flyout background.  Start a scroll drag.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.Flyout.prototype.onMouseDown_ = function(e) {
  var gesture = this.targetWorkspace_.getGesture(e);
  if (gesture) {
    gesture.handleFlyoutStart(e, this);
  }
};

/**
 * Create a copy of this block on the workspace.
 * @param {!Blockly.BlockSvg} originalBlock The block to copy from the flyout.
 * @return {Blockly.BlockSvg} The newly created block, or null if something
 *     went wrong with deserialization.
 * @package
 */
Blockly.Flyout.prototype.createBlock = function(originalBlock) {
  var newBlock = null;
  Blockly.Events.disable();
  var variablesBeforeCreation = this.targetWorkspace_.getAllVariables();
  this.targetWorkspace_.setResizesEnabled(false);
  try {
    newBlock = this.placeNewBlock_(originalBlock);
    // Close the flyout.
    Blockly.hideChaff();
  } finally {
    Blockly.Events.enable();
  }

  var newVariables = Blockly.Variables.getAddedVariables(this.targetWorkspace_,
      variablesBeforeCreation);

  if (Blockly.Events.isEnabled()) {
    Blockly.Events.setGroup(true);
    Blockly.Events.fire(new Blockly.Events.Create(newBlock));
    // Fire a VarCreate event for each (if any) new variable created.
    for (var i = 0; i < newVariables.length; i++) {
      var thisVariable = newVariables[i];
      Blockly.Events.fire(new Blockly.Events.VarCreate(thisVariable));
    }
  }
  if (this.autoClose) {
    this.hide();
  }
  return newBlock;
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

/**
 * @return {boolean} True if this flyout may be scrolled with a scrollbar or by
 *     dragging.
 * @package
 */
Blockly.Flyout.prototype.isScrollable = function() {
  return this.scrollbar_ ? this.scrollbar_.isVisible() : false;
};

/**
 * Copy a block from the flyout to the workspace and position it correctly.
 * @param {!Blockly.Block} oldBlock The flyout block to copy.
 * @return {!Blockly.Block} The new block in the main workspace.
 * @private
 */
Blockly.Flyout.prototype.placeNewBlock_ = function(oldBlock) {
  var targetWorkspace = this.targetWorkspace_;
  var svgRootOld = oldBlock.getSvgRoot();
  if (!svgRootOld) {
    throw 'oldBlock is not rendered.';
  }

  // Create the new block by cloning the block in the flyout (via XML).
  var xml = Blockly.Xml.blockToDom(oldBlock);
  // The target workspace would normally resize during domToBlock, which will
  // lead to weird jumps.  Save it for terminateDrag.
  targetWorkspace.setResizesEnabled(false);

  // Using domToBlock instead of domToWorkspace means that the new block will be
  // placed at position (0, 0) in main workspace units.
  var block = Blockly.Xml.domToBlock(xml, targetWorkspace);
  var svgRootNew = block.getSvgRoot();
  if (!svgRootNew) {
    throw 'block is not rendered.';
  }

  // The offset in pixels between the main workspace's origin and the upper left
  // corner of the injection div.
  var mainOffsetPixels = targetWorkspace.getOriginOffsetInPixels();

  // The offset in pixels between the flyout workspace's origin and the upper
  // left corner of the injection div.
  var flyoutOffsetPixels = this.workspace_.getOriginOffsetInPixels();

  // The position of the old block in flyout workspace coordinates.
  var oldBlockPosWs = oldBlock.getRelativeToSurfaceXY();

  // The position of the old block in pixels relative to the flyout
  // workspace's origin.
  var oldBlockPosPixels = oldBlockPosWs.scale(this.workspace_.scale);

  // The position of the old block in pixels relative to the upper left corner
  // of the injection div.
  var oldBlockOffsetPixels = goog.math.Coordinate.sum(flyoutOffsetPixels,
      oldBlockPosPixels);

  // The position of the old block in pixels relative to the origin of the
  // main workspace.
  var finalOffsetPixels = goog.math.Coordinate.difference(oldBlockOffsetPixels,
      mainOffsetPixels);

  // The position of the old block in main workspace coordinates.
  var finalOffsetMainWs = finalOffsetPixels.scale(1 / targetWorkspace.scale);

  block.moveBy(finalOffsetMainWs.x, finalOffsetMainWs.y);
  return block;
};

/**
 * Put a previously created block into the recycle bin, used during large
 * workspace swaps to limit the number of new dom elements we need to create
 *
 * @param {!Blockly.BlockSvg} block The block to recycle.
 * @private
 */
Blockly.Flyout.prototype.recycleBlock_ = function(block) {
  var xy = block.getRelativeToSurfaceXY();
  block.moveBy(-xy.x, -xy.y);
  this.recycleBlocks_.push(block);
};
