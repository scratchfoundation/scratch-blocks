/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
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
 * @fileoverview Methods for graphically rendering a block as SVG.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.BlockSvg');

goog.require('Blockly.Block');
goog.require('Blockly.ContextMenu');
goog.require('Blockly.Grid');
goog.require('Blockly.RenderedConnection');
goog.require('Blockly.Tooltip');
goog.require('Blockly.Touch');
goog.require('Blockly.utils');
goog.require('goog.Timer');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.math.Coordinate');
goog.require('goog.userAgent');


/**
 * Class for a block's SVG representation.
 * Not normally called directly, workspace.newBlock() is preferred.
 * @param {!Blockly.Workspace} workspace The block's workspace.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @param {string=} opt_id Optional ID.  Use this ID if provided, otherwise
 *     create a new id.
 * @extends {Blockly.Block}
 * @constructor
 */
Blockly.BlockSvg = function(workspace, prototypeName, opt_id) {
  // Create core elements for the block.
  /**
   * @type {SVGElement}
   * @private
   */
  this.svgGroup_ = Blockly.utils.createSvgElement('g', {}, null);
  /** @type {SVGElement} */
  this.svgPath_ = Blockly.utils.createSvgElement('path', {'class': 'blocklyPath blocklyBlockBackground'},
      this.svgGroup_);
  this.svgPath_.tooltip = this;

  /** @type {boolean} */
  this.rendered = false;

  /**
   * Whether to move the block to the drag surface when it is dragged.
   * True if it should move, false if it should be translated directly.
   * @type {boolean}
   * @private
   */
  this.useDragSurface_ = Blockly.utils.is3dSupported() && !!workspace.blockDragSurface_;

  Blockly.Tooltip.bindMouseEvents(this.svgPath_);
  Blockly.BlockSvg.superClass_.constructor.call(this,
      workspace, prototypeName, opt_id);
};
goog.inherits(Blockly.BlockSvg, Blockly.Block);

/**
 * Height of this block, not including any statement blocks above or below.
 * Height is in workspace units.
 */
Blockly.BlockSvg.prototype.height = 0;

/**
 * Width of this block, including any connected value blocks.
 * Width is in workspace units.
 */
Blockly.BlockSvg.prototype.width = 0;

/**
 * Minimum width of block if insertion marker; comes from inserting block.
 * @type {number}
 */
Blockly.BlockSvg.prototype.insertionMarkerMinWidth_ = 0;

/**
 * Opacity of this block between 0 and 1.
 * @type {number}
 * @private
 */
Blockly.BlockSvg.prototype.opacity_ = 1;

/**
 * Original location of block being dragged.
 * @type {goog.math.Coordinate}
 * @private
 */
Blockly.BlockSvg.prototype.dragStartXY_ = null;

/**
 * Whether the block glows as if running.
 * @type {boolean}
 * @private
 */
Blockly.BlockSvg.prototype.isGlowingBlock_ = false;

/**
 * Whether the block's whole stack glows as if running.
 * @type {boolean}
 * @private
 */
Blockly.BlockSvg.prototype.isGlowingStack_ = false;

/**
 * Constant for identifying rows that are to be rendered inline.
 * Don't collide with Blockly.INPUT_VALUE and friends.
 * @const
 */
Blockly.BlockSvg.INLINE = -1;

/**
 * Create and initialize the SVG representation of the block.
 * May be called more than once.
 */
Blockly.BlockSvg.prototype.initSvg = function() {
  goog.asserts.assert(this.workspace.rendered, 'Workspace is headless.');
  if (!this.isInsertionMarker()) { // Insertion markers not allowed to have inputs or icons
    // Input shapes are empty holes drawn when a value input is not connected.
    for (var i = 0, input; input = this.inputList[i]; i++) {
      input.init();
      input.initOutlinePath(this.svgGroup_);
    }
    var icons = this.getIcons();
    for (i = 0; i < icons.length; i++) {
      icons[i].createIcon();
    }
  }
  this.updateColour();
  this.updateMovable();
  if (!this.workspace.options.readOnly && !this.eventsInit_) {
    Blockly.bindEventWithChecks_(this.getSvgRoot(), 'mousedown', this,
                       this.onMouseDown_);
  }
  this.eventsInit_ = true;

  if (!this.getSvgRoot().parentNode) {
    this.workspace.getCanvas().appendChild(this.getSvgRoot());
  }
};

/**
 * Select this block.  Highlight it visually.
 */
Blockly.BlockSvg.prototype.select = function() {
  if (this.isShadow() && this.getParent()) {
    // Shadow blocks should not be selected.
    this.getParent().select();
    return;
  }
  if (Blockly.selected == this) {
    return;
  }
  var oldId = null;
  if (Blockly.selected) {
    oldId = Blockly.selected.id;
    // Unselect any previously selected block.
    Blockly.Events.disable();
    try {
      Blockly.selected.unselect();
    } finally {
      Blockly.Events.enable();
    }
  }
  var event = new Blockly.Events.Ui(null, 'selected', oldId, this.id);
  event.workspaceId = this.workspace.id;
  Blockly.Events.fire(event);
  Blockly.selected = this;
  this.addSelect();
};

/**
 * Unselect this block.  Remove its highlighting.
 */
Blockly.BlockSvg.prototype.unselect = function() {
  if (Blockly.selected != this) {
    return;
  }
  var event = new Blockly.Events.Ui(null, 'selected', this.id, null);
  event.workspaceId = this.workspace.id;
  Blockly.Events.fire(event);
  Blockly.selected = null;
  this.removeSelect();
};

/**
 * Glow only this particular block, to highlight it visually as if it's running.
 * @param {boolean} isGlowingBlock Whether the block should glow.
 */
Blockly.BlockSvg.prototype.setGlowBlock = function(isGlowingBlock) {
  this.isGlowingBlock_ = isGlowingBlock;
  this.updateColour();
};

/**
 * Glow the stack starting with this block, to highlight it visually as if it's running.
 * @param {boolean} isGlowingStack Whether the stack starting with this block should glow.
 */
Blockly.BlockSvg.prototype.setGlowStack = function(isGlowingStack) {
  this.isGlowingStack_ = isGlowingStack;
  // Update the applied SVG filter if the property has changed
  var svg = this.getSvgRoot();
  if (this.isGlowingStack_ && !svg.hasAttribute('filter')) {
    svg.setAttribute('filter', 'url(#blocklyStackGlowFilter)');
  } else if (!this.isGlowingStack_ && svg.hasAttribute('filter')) {
    svg.removeAttribute('filter');
  }
};

/**
 * Block's mutator icon (if any).
 * @type {Blockly.Mutator}
 */
Blockly.BlockSvg.prototype.mutator = null;

/**
 * Block's comment icon (if any).
 * @type {Blockly.Comment}
 */
Blockly.BlockSvg.prototype.comment = null;

/**
 * Block's warning icon (if any).
 * @type {Blockly.Warning}
 */
Blockly.BlockSvg.prototype.warning = null;

/**
 * Returns a list of mutator, comment, and warning icons.
 * @return {!Array} List of icons.
 */
Blockly.BlockSvg.prototype.getIcons = function() {
  var icons = [];
  if (this.mutator) {
    icons.push(this.mutator);
  }
  if (this.comment) {
    icons.push(this.comment);
  }
  if (this.warning) {
    icons.push(this.warning);
  }
  return icons;
};

/**
 * Set parent of this block to be a new block or null.
 * @param {Blockly.BlockSvg} newParent New parent block.
 */
Blockly.BlockSvg.prototype.setParent = function(newParent) {
  if (newParent == this.parentBlock_) {
    return;
  }
  var svgRoot = this.getSvgRoot();
  if (this.parentBlock_ && svgRoot) {
    // Move this block up the DOM.  Keep track of x/y translations.
    var xy = this.getRelativeToSurfaceXY();
    // Avoid moving a block up the DOM if it's currently selected/dragging,
    // so as to avoid taking things off the drag surface.
    if (Blockly.selected != this) {
      this.workspace.getCanvas().appendChild(svgRoot);
      this.translate(xy.x, xy.y);
    }
  }

  Blockly.Field.startCache();
  Blockly.BlockSvg.superClass_.setParent.call(this, newParent);
  Blockly.Field.stopCache();

  if (newParent) {
    var oldXY = this.getRelativeToSurfaceXY();
    newParent.getSvgRoot().appendChild(svgRoot);
    var newXY = this.getRelativeToSurfaceXY();
    // Move the connections to match the child's new position.
    this.moveConnections_(newXY.x - oldXY.x, newXY.y - oldXY.y);
    // If we are a shadow block, inherit tertiary colour.
    if (this.isShadow()) {
      this.setColour(this.getColour(), this.getColourSecondary(),
        newParent.getColourTertiary());
    }
  }
};

/**
 * Return the coordinates of the top-left corner of this block relative to the
 * drawing surface's origin (0,0), in workspace units.
 * If the block is on the workspace, (0, 0) is the origin of the workspace
 * coordinate system.
 * This does not change with workspace scale.
 * @return {!goog.math.Coordinate} Object with .x and .y properties in
 *     workspace coordinates.
 */
Blockly.BlockSvg.prototype.getRelativeToSurfaceXY = function() {
  // The drawing surface is relative to either the workspace canvas
  // or to the drag surface group.
  var x = 0;
  var y = 0;

  var dragSurfaceGroup = this.useDragSurface_ ?
      this.workspace.blockDragSurface_.getGroup() : null;

  var element = this.getSvgRoot();
  if (element) {
    do {
      // Loop through this block and every parent.
      var xy = Blockly.utils.getRelativeXY(element);
      x += xy.x;
      y += xy.y;
      // If this element is the current element on the drag surface, include
      // the translation of the drag surface itself.
      if (this.useDragSurface_ &&
          this.workspace.blockDragSurface_.getCurrentBlock() == element) {
        var surfaceTranslation = this.workspace.blockDragSurface_.getSurfaceTranslation();
        x += surfaceTranslation.x;
        y += surfaceTranslation.y;
      }
      element = element.parentNode;
    } while (element && element != this.workspace.getCanvas() &&
        element != dragSurfaceGroup);
  }
  return new goog.math.Coordinate(x, y);
};

/**
 * Move a block by a relative offset.
 * @param {number} dx Horizontal offset in workspace units.
 * @param {number} dy Vertical offset in workspace units.
 */
Blockly.BlockSvg.prototype.moveBy = function(dx, dy) {
  goog.asserts.assert(!this.parentBlock_, 'Block has parent.');
  var eventsEnabled = Blockly.Events.isEnabled();
  if (eventsEnabled) {
    var event = new Blockly.Events.BlockMove(this);
  }
  var xy = this.getRelativeToSurfaceXY();
  this.translate(xy.x + dx, xy.y + dy);
  this.moveConnections_(dx, dy);
  if (eventsEnabled) {
    event.recordNew();
    Blockly.Events.fire(event);
  }
  this.workspace.resizeContents();
};

/**
 * Transforms a block by setting the translation on the transform attribute
 * of the block's SVG.
 * @param {number} x The x coordinate of the translation in workspace units.
 * @param {number} y The y coordinate of the translation in workspace units.
 */
Blockly.BlockSvg.prototype.translate = function(x, y) {
  this.getSvgRoot().setAttribute('transform',
      'translate(' + x + ',' + y + ')');
};

/**
 * Move this block to its workspace's drag surface, accounting for positioning.
 * Generally should be called at the same time as setDragging_(true).
 * Does nothing if useDragSurface_ is false.
 * @private
 */
Blockly.BlockSvg.prototype.moveToDragSurface_ = function() {
  if (!this.useDragSurface_) {
    return;
  }
  // The translation for drag surface blocks,
  // is equal to the current relative-to-surface position,
  // to keep the position in sync as it move on/off the surface.
  // This is in workspace coordinates.
  var xy = this.getRelativeToSurfaceXY();
  this.clearTransformAttributes_();
  this.workspace.blockDragSurface_.translateSurface(xy.x, xy.y);
  // Execute the move on the top-level SVG component
  this.workspace.blockDragSurface_.setBlocksAndShow(this.getSvgRoot());
};

/**
 * Move this block back to the workspace block canvas.
 * Generally should be called at the same time as setDragging_(false).
 * Does nothing if useDragSurface_ is false.
 * @param {!goog.math.Coordinate} newXY The position the block should take on
 *     on the workspace canvas, in workspace coordinates.
 * @private
 */
Blockly.BlockSvg.prototype.moveOffDragSurface_ = function(newXY) {
  if (!this.useDragSurface_) {
    return;
  }
  // Translate to current position, turning off 3d.
  this.translate(newXY.x, newXY.y);
  this.workspace.blockDragSurface_.clearAndHide(this.workspace.getCanvas());
};

/**
 * Move this block during a drag, taking into account whether we are using a
 * drag surface to translate blocks.
 * This block must be a top-level block.
 * @param {!goog.math.Coordinate} newLoc The location to translate to, in
 *     workspace coordinates.
 * @package
 */
Blockly.BlockSvg.prototype.moveDuringDrag = function(newLoc) {
  if (this.useDragSurface_) {
    this.workspace.blockDragSurface_.translateSurface(newLoc.x, newLoc.y);
  } else {
    this.svgGroup_.translate_ = 'translate(' + newLoc.x + ',' + newLoc.y + ')';
    this.svgGroup_.setAttribute('transform',
        this.svgGroup_.translate_ + this.svgGroup_.skew_);
  }
};

/**
 * Clear the block of transform="..." attributes.
 * Used when the block is switching from 3d to 2d transform or vice versa.
 * @private
 */
Blockly.BlockSvg.prototype.clearTransformAttributes_ = function() {
  Blockly.utils.removeAttribute(this.getSvgRoot(), 'transform');
};

/**
 * Snap this block to the nearest grid point.
 */
Blockly.BlockSvg.prototype.snapToGrid = function() {
  if (!this.workspace) {
    return;  // Deleted block.
  }
  if (this.workspace.isDragging()) {
    return;  // Don't bump blocks during a drag.
  }
  if (this.getParent()) {
    return;  // Only snap top-level blocks.
  }
  if (this.isInFlyout) {
    return;  // Don't move blocks around in a flyout.
  }
  var grid = this.workspace.getGrid();
  if (!grid || !grid.shouldSnap()) {
    return;  // Config says no snapping.
  }
  var spacing = grid.getSpacing();
  var half = spacing / 2;
  var xy = this.getRelativeToSurfaceXY();
  var dx = Math.round((xy.x - half) / spacing) * spacing + half - xy.x;
  var dy = Math.round((xy.y - half) / spacing) * spacing + half - xy.y;
  dx = Math.round(dx);
  dy = Math.round(dy);
  if (dx != 0 || dy != 0) {
    this.moveBy(dx, dy);
  }
};

/**
 * Returns the coordinates of a bounding box describing the dimensions of this
 * block and any blocks stacked below it.
 * Coordinate system: workspace coordinates.
 * @return {!{topLeft: goog.math.Coordinate, bottomRight: goog.math.Coordinate}}
 *    Object with top left and bottom right coordinates of the bounding box.
 */
Blockly.BlockSvg.prototype.getBoundingRectangle = function() {
  var blockXY = this.getRelativeToSurfaceXY(this);
  var blockBounds = this.getHeightWidth();
  var topLeft;
  var bottomRight;
  if (this.RTL) {
    topLeft = new goog.math.Coordinate(blockXY.x - blockBounds.width,
        blockXY.y);
    bottomRight = new goog.math.Coordinate(blockXY.x,
        blockXY.y + blockBounds.height);
  } else {
    topLeft = new goog.math.Coordinate(blockXY.x, blockXY.y);
    bottomRight = new goog.math.Coordinate(blockXY.x + blockBounds.width,
        blockXY.y + blockBounds.height);
  }

  return {topLeft: topLeft, bottomRight: bottomRight};
};

/**
 * Set block opacity for SVG rendering.
 * @param {number} opacity Intended opacity, betweeen 0 and 1
 */
Blockly.BlockSvg.prototype.setOpacity = function(opacity) {
  this.opacity_ = opacity;
  if (this.rendered) {
    this.updateColour();
  }
};

/**
 * Get block opacity for SVG rendering.
 * @return {number} Intended opacity, betweeen 0 and 1
 */
Blockly.BlockSvg.prototype.getOpacity = function() {
  return this.opacity_;
};

/**
 * Set whether the block is collapsed or not.
 * @param {boolean} collapsed True if collapsed.
 */
Blockly.BlockSvg.prototype.setCollapsed = function(collapsed) {
  if (this.collapsed_ == collapsed) {
    return;
  }
  var renderList = [];
  // Show/hide the inputs.
  for (var i = 0, input; input = this.inputList[i]; i++) {
    renderList.push.apply(renderList, input.setVisible(!collapsed));
  }

  var COLLAPSED_INPUT_NAME = '_TEMP_COLLAPSED_INPUT';
  if (collapsed) {
    var icons = this.getIcons();
    for (i = 0; i < icons.length; i++) {
      icons[i].setVisible(false);
    }
    var text = this.toString(Blockly.COLLAPSE_CHARS);
    this.appendDummyInput(COLLAPSED_INPUT_NAME).appendField(text).init();
  } else {
    this.removeInput(COLLAPSED_INPUT_NAME);
    // Clear any warnings inherited from enclosed blocks.
    this.setWarningText(null);
  }
  Blockly.BlockSvg.superClass_.setCollapsed.call(this, collapsed);

  if (!renderList.length) {
    // No child blocks, just render this block.
    renderList[0] = this;
  }
  if (this.rendered) {
    for (var i = 0, block; block = renderList[i]; i++) {
      block.render();
    }
    // Don't bump neighbours.
    // Although bumping neighbours would make sense, users often collapse
    // all their functions and store them next to each other.  Expanding and
    // bumping causes all their definitions to go out of alignment.
  }
};

/**
 * Open the next (or previous) FieldTextInput.
 * @param {Blockly.Field|Blockly.Block} start Current location.
 * @param {boolean} forward If true go forward, otherwise backward.
 */
Blockly.BlockSvg.prototype.tab = function(start, forward) {
  var list = this.createTabList_();
  var i = list.indexOf(start);
  if (i == -1) {
    // No start location, start at the beginning or end.
    i = forward ? -1 : list.length;
  }
  var target = list[forward ? i + 1 : i - 1];
  if (!target) {
    // Ran off of list.
    // If there is an output, tab up to that block.
    var outputBlock = this.outputConnection && this.outputConnection.targetBlock();
    if (outputBlock) {
      outputBlock.tab(this, forward);
    } else { // Otherwise, go to next / previous block, depending on value of `forward`
      var block = forward ? this.getNextBlock() : this.getPreviousBlock();
      if (block) {
        block.tab(this, forward);
      }
    }
  } else if (target instanceof Blockly.Field) {
    target.showEditor_();
  } else {
    target.tab(null, forward);
  }
};

/**
 * Create an ordered list of all text fields and connected inputs.
 * @return {!Array<!Blockly.FieldTextInput|!Blockly.Input>} The ordered list.
 * @private
 */
Blockly.BlockSvg.prototype.createTabList_ = function() {
  // This function need not be efficient since it runs once on a keypress.
  var list = [];
  for (var i = 0, input; input = this.inputList[i]; i++) {
    for (var j = 0, field; field = input.fieldRow[j]; j++) {
      if (field instanceof Blockly.FieldTextInput) {
        // TODO(# 1276): Also support dropdown fields.
        list.push(field);
      }
    }
    if (input.connection) {
      var block = input.connection.targetBlock();
      if (block) {
        list.push(block);
      }
    }
  }
  return list;
};

/**
 * Handle a mouse-down on an SVG block.
 * @param {!Event} e Mouse down event or touch start event.
 * @private
 */
Blockly.BlockSvg.prototype.onMouseDown_ = function(e) {
  var gesture = this.workspace && this.workspace.getGesture(e);
  if (gesture) {
    gesture.handleBlockStart(e, this);
  }
};

/**
 * Load the block's help page in a new window.
 * @private
 */
Blockly.BlockSvg.prototype.showHelp_ = function() {
  var url = goog.isFunction(this.helpUrl) ? this.helpUrl() : this.helpUrl;
  if (url) {
    // @todo rewrite
    alert(url);
  }
};

/**
 * Creates a callback function for a click on the "duplicate" context menu
 * option in Scratch Blocks.  The block is duplicated and attached to the mouse,
 * which acts as though it were pressed and mid-drag.  Clicking the mouse
 * releases the new dragging block.
 * @return {Function} A callback function that duplicates the block and starts a
 *     drag.
 * @private
 */
Blockly.BlockSvg.prototype.duplicateAndDragCallback_ = function() {
  var oldBlock = this;
  return function(e) {
    // Give the context menu a chance to close.
    setTimeout(function() {
      var ws = oldBlock.workspace;
      var svgRootOld = oldBlock.getSvgRoot();
      if (!svgRootOld) {
        throw new Error('oldBlock is not rendered.');
      }

      // Create the new block by cloning the block in the flyout (via XML).
      var xml = Blockly.Xml.blockToDom(oldBlock);
      // The target workspace would normally resize during domToBlock, which
      // will lead to weird jumps.
      // Resizing will be enabled when the drag ends.
      ws.setResizesEnabled(false);

      // Disable events and manually emit events after the block has been
      // positioned and has had its shadow IDs fixed (Scratch-specific).
      Blockly.Events.disable();
      try {
        // Using domToBlock instead of domToWorkspace means that the new block
        // will be placed at position (0, 0) in main workspace units.
        var newBlock = Blockly.Xml.domToBlock(xml, ws);

        // Scratch-specific: Give shadow dom new IDs to prevent duplicating on paste
        Blockly.utils.changeObscuredShadowIds(newBlock);

        var svgRootNew = newBlock.getSvgRoot();
        if (!svgRootNew) {
          throw new Error('newBlock is not rendered.');
        }

        // The position of the old block in workspace coordinates.
        var oldBlockPosWs = oldBlock.getRelativeToSurfaceXY();

        // Place the new block as the same position as the old block.
        // TODO: Offset by the difference between the mouse position and the upper
        // left corner of the block.
        newBlock.moveBy(oldBlockPosWs.x, oldBlockPosWs.y);
      } finally {
        Blockly.Events.enable();
      }
      if (Blockly.Events.isEnabled()) {
        Blockly.Events.fire(new Blockly.Events.BlockCreate(newBlock));
      }

      // The position of the old block in pixels relative to the main
      // workspace's origin.
      var oldBlockPosPixels = oldBlockPosWs.scale(ws.scale);

      // The offset in pixels between the main workspace's origin and the upper left
      // corner of the injection div.
      var mainOffsetPixels = ws.getOriginOffsetInPixels();

      // The position of the old block in pixels relative to the upper left corner
      // of the injection div.
      var finalOffsetPixels = goog.math.Coordinate.sum(mainOffsetPixels,
          oldBlockPosPixels);

      var injectionDiv = ws.getInjectionDiv();
      // Bounding rect coordinates are in client coordinates, meaning that they
      // are in pixels relative to the upper left corner of the visible browser
      // window.  These coordinates change when you scroll the browser window.
      var boundingRect = injectionDiv.getBoundingClientRect();

      // e is not a real mouseEvent/touchEvent/pointerEvent.  It's an event
      // created by the context menu and doesn't have the correct coordinates.
      // But it does have some information that we need.
      var fakeEvent = {
        clientX: finalOffsetPixels.x + boundingRect.left,
        clientY: finalOffsetPixels.y + boundingRect.top,
        type: 'mousedown',
        preventDefault: function() {
          e.preventDefault();
        },
        stopPropagation: function() {
          e.stopPropagation();
        },
        target: e.target
      };
      ws.startDragWithFakeEvent(fakeEvent, newBlock);
    }, 0);
  };
};

/**
 * Show the context menu for this block.
 * @param {!Event} e Mouse event.
 * @private
 */
Blockly.BlockSvg.prototype.showContextMenu_ = function(e) {
  if (this.workspace.options.readOnly || !this.contextMenu) {
    return;
  }
  // Save the current block in a variable for use in closures.
  var block = this;
  var menuOptions = [];

  if (this.isDeletable() && this.isMovable() && !block.isInFlyout) {
    menuOptions.push(Blockly.ContextMenu.blockDuplicateOption(block));
    if (this.isEditable() && this.workspace.options.comments) {
      menuOptions.push(Blockly.ContextMenu.blockCommentOption(block));
    }
    menuOptions.push(Blockly.ContextMenu.blockDeleteOption(block));
  } else if (this.parentBlock_ && this.isShadow_) {
    this.parentBlock_.showContextMenu_(e);
    return;
  }

  menuOptions.push(Blockly.ContextMenu.blockHelpOption(block));

  // Allow the block to add or modify menuOptions.
  if (this.customContextMenu) {
    this.customContextMenu(menuOptions);
  }
  Blockly.ContextMenu.show(e, menuOptions, this.RTL);
  Blockly.ContextMenu.currentBlock = this;
};

/**
 * Move the connections for this block and all blocks attached under it.
 * Also update any attached bubbles.
 * @param {number} dx Horizontal offset from current location, in workspace
 *     units.
 * @param {number} dy Vertical offset from current location, in workspace
 *     units.
 * @private
 */
Blockly.BlockSvg.prototype.moveConnections_ = function(dx, dy) {
  if (!this.rendered) {
    // Rendering is required to lay out the blocks.
    // This is probably an invisible block attached to a collapsed block.
    return;
  }
  var myConnections = this.getConnections_(false);
  for (var i = 0; i < myConnections.length; i++) {
    myConnections[i].moveBy(dx, dy);
  }
  var icons = this.getIcons();
  for (i = 0; i < icons.length; i++) {
    icons[i].computeIconLocation();
  }

  // Recurse through all blocks attached under this one.
  for (i = 0; i < this.childBlocks_.length; i++) {
    this.childBlocks_[i].moveConnections_(dx, dy);
  }
};

/**
 * Recursively adds or removes the dragging class to this node and its children.
 * @param {boolean} adding True if adding, false if removing.
 * @package
 */
Blockly.BlockSvg.prototype.setDragging = function(adding) {
  if (adding) {
    var group = this.getSvgRoot();
    group.translate_ = '';
    group.skew_ = '';
    Blockly.draggingConnections_ =
        Blockly.draggingConnections_.concat(this.getConnections_(true));
    Blockly.utils.addClass(/** @type {!Element} */ (this.svgGroup_),
                      'blocklyDragging');
  } else {
    Blockly.draggingConnections_ = [];
    Blockly.utils.removeClass(/** @type {!Element} */ (this.svgGroup_),
                         'blocklyDragging');
  }
  // Recurse through all blocks attached under this one.
  for (var i = 0; i < this.childBlocks_.length; i++) {
    this.childBlocks_[i].setDragging(adding);
  }
};

/**
 * Add or remove the UI indicating if this block is movable or not.
 */
Blockly.BlockSvg.prototype.updateMovable = function() {
  if (this.isMovable()) {
    Blockly.utils.addClass(/** @type {!Element} */ (this.svgGroup_),
                      'blocklyDraggable');
  } else {
    Blockly.utils.removeClass(/** @type {!Element} */ (this.svgGroup_),
                         'blocklyDraggable');
  }
};

/**
 * Set whether this block is movable or not.
 * @param {boolean} movable True if movable.
 */
Blockly.BlockSvg.prototype.setMovable = function(movable) {
  Blockly.BlockSvg.superClass_.setMovable.call(this, movable);
  this.updateMovable();
};

/**
 * Set whether this block is editable or not.
 * @param {boolean} editable True if editable.
 */
Blockly.BlockSvg.prototype.setEditable = function(editable) {
  Blockly.BlockSvg.superClass_.setEditable.call(this, editable);
  var icons = this.getIcons();
  for (var i = 0; i < icons.length; i++) {
    icons[i].updateEditable();
  }
};

/**
 * Set whether this block is a shadow block or not.
 * @param {boolean} shadow True if a shadow.
 */
Blockly.BlockSvg.prototype.setShadow = function(shadow) {
  Blockly.BlockSvg.superClass_.setShadow.call(this, shadow);
  this.updateColour();
};

/**
 * Set whether this block is an insertion marker block or not.
 * @param {boolean} insertionMarker True if an insertion marker.
 * @param {Number=} opt_minWidth Optional minimum width of the marker.
 */
Blockly.BlockSvg.prototype.setInsertionMarker = function(insertionMarker, opt_minWidth) {
  Blockly.BlockSvg.superClass_.setInsertionMarker.call(this, insertionMarker);
  this.insertionMarkerMinWidth_ = opt_minWidth;
  this.updateColour();
};

/**
 * Return the root node of the SVG or null if none exists.
 * @return {Element} The root SVG node (probably a group).
 */
Blockly.BlockSvg.prototype.getSvgRoot = function() {
  return this.svgGroup_;
};

/**
 * Dispose of this block.
 * @param {boolean} healStack If true, then try to heal any gap by connecting
 *     the next statement with the previous statement.  Otherwise, dispose of
 *     all children of this block.
 * @param {boolean} animate If true, show a disposal animation and sound.
 */
Blockly.BlockSvg.prototype.dispose = function(healStack, animate) {
  if (!this.workspace) {
    // The block has already been deleted.
    return;
  }
  Blockly.Tooltip.hide();
  Blockly.Field.startCache();
  // Save the block's workspace temporarily so we can resize the
  // contents once the block is disposed.
  var blockWorkspace = this.workspace;
  // If this block is being dragged, unlink the mouse events.
  if (Blockly.selected == this) {
    this.unselect();
    this.workspace.cancelCurrentGesture();
  }
  // If this block has a context menu open, close it.
  if (Blockly.ContextMenu.currentBlock == this) {
    Blockly.ContextMenu.hide();
  }

  if (animate && this.rendered) {
    this.unplug(healStack);
    this.disposeUiEffect();
  }
  // Stop rerendering.
  this.rendered = false;

  Blockly.Events.disable();
  try {
    var icons = this.getIcons();
    for (var i = 0; i < icons.length; i++) {
      icons[i].dispose();
    }
  } finally {
    Blockly.Events.enable();
  }
  Blockly.BlockSvg.superClass_.dispose.call(this, healStack);

  goog.dom.removeNode(this.svgGroup_);
  blockWorkspace.resizeContents();
  // Sever JavaScript to DOM connections.
  this.svgGroup_ = null;
  this.svgPath_ = null;
  Blockly.Field.stopCache();
};

/**
 * Play some UI effects (sound, animation) when disposing of a block.
 */
Blockly.BlockSvg.prototype.disposeUiEffect = function() {
  this.workspace.getAudioManager().play('delete');

  var xy = this.workspace.getSvgXY(/** @type {!Element} */ (this.svgGroup_));
  // Deeply clone the current block.
  var clone = this.svgGroup_.cloneNode(true);
  clone.translateX_ = xy.x;
  clone.translateY_ = xy.y;
  clone.setAttribute('transform',
      'translate(' + clone.translateX_ + ',' + clone.translateY_ + ')');
  this.workspace.getParentSvg().appendChild(clone);
  clone.bBox_ = clone.getBBox();
  // Start the animation.
  Blockly.BlockSvg.disposeUiStep_(clone, this.RTL, new Date,
      this.workspace.scale);
};

/**
 * Play some UI effects (sound) after a connection has been established.
 */
Blockly.BlockSvg.prototype.connectionUiEffect = function() {
  this.workspace.getAudioManager().play('click');
};

/**
 * Animate a cloned block and eventually dispose of it.
 * This is a class method, not an instance method since the original block has
 * been destroyed and is no longer accessible.
 * @param {!Element} clone SVG element to animate and dispose of.
 * @param {boolean} rtl True if RTL, false if LTR.
 * @param {!Date} start Date of animation's start.
 * @param {number} workspaceScale Scale of workspace.
 * @private
 */
Blockly.BlockSvg.disposeUiStep_ = function(clone, rtl, start, workspaceScale) {
  var ms = new Date - start;
  var percent = ms / 150;
  if (percent > 1) {
    goog.dom.removeNode(clone);
  } else {
    var x = clone.translateX_ +
        (rtl ? -1 : 1) * clone.bBox_.width * workspaceScale / 2 * percent;
    var y = clone.translateY_ + clone.bBox_.height * workspaceScale * percent;
    var scale = (1 - percent) * workspaceScale;
    clone.setAttribute('transform', 'translate(' + x + ',' + y + ')' +
        ' scale(' + scale + ')');
    setTimeout(Blockly.BlockSvg.disposeUiStep_, 10, clone, rtl, start,
               workspaceScale);
  }
};

/**
 * Play some UI effects (sound, animation) when disconnecting a block.
 * No-op in scratch-blocks, which has no disconnect animation.
 * @private
 */
Blockly.BlockSvg.prototype.disconnectUiEffect = function() {
};

/**
 * Stop the disconnect UI animation immediately.
 * No-op in scratch-blocks, which has no disconnect animation.
 * @private
 */
Blockly.BlockSvg.disconnectUiStop_ = function() {
};

/**
 * Enable or disable a block.
 */
Blockly.BlockSvg.prototype.updateDisabled = function() {
  // not supported
};

/**
 * Returns the comment on this block (or '' if none).
 * @return {string} Block's comment.
 */
Blockly.BlockSvg.prototype.getCommentText = function() {
  if (this.comment) {
    var comment = this.comment.getText();
    // Trim off trailing whitespace.
    return comment.replace(/\s+$/, '').replace(/ +\n/g, '\n');
  }
  return '';
};

/**
 * Set this block's comment text.
 * @param {?string} text The text, or null to delete.
 */
Blockly.BlockSvg.prototype.setCommentText = function(text) {
  var changedState = false;
  if (goog.isString(text)) {
    if (!this.comment) {
      this.comment = new Blockly.Comment(this);
      changedState = true;
    }
    this.comment.setText(/** @type {string} */ (text));
  } else {
    if (this.comment) {
      this.comment.dispose();
      changedState = true;
    }
  }
  if (changedState && this.rendered) {
    this.render();
    // Adding or removing a comment icon will cause the block to change shape.
    this.bumpNeighbours_();
  }
};

/**
 * Set this block's warning text.
 * @param {?string} text The text, or null to delete.
 * @param {string=} opt_id An optional ID for the warning text to be able to
 *     maintain multiple warnings.
 */
Blockly.BlockSvg.prototype.setWarningText = function(text, opt_id) {
  if (!this.setWarningText.pid_) {
    // Create a database of warning PIDs.
    // Only runs once per block (and only those with warnings).
    this.setWarningText.pid_ = Object.create(null);
  }
  var id = opt_id || '';
  if (!id) {
    // Kill all previous pending processes, this edit supersedes them all.
    for (var n in this.setWarningText.pid_) {
      clearTimeout(this.setWarningText.pid_[n]);
      delete this.setWarningText.pid_[n];
    }
  } else if (this.setWarningText.pid_[id]) {
    // Only queue up the latest change.  Kill any earlier pending process.
    clearTimeout(this.setWarningText.pid_[id]);
    delete this.setWarningText.pid_[id];
  }
  if (this.workspace.isDragging()) {
    // Don't change the warning text during a drag.
    // Wait until the drag finishes.
    var thisBlock = this;
    this.setWarningText.pid_[id] = setTimeout(function() {
      if (thisBlock.workspace) {  // Check block wasn't deleted.
        delete thisBlock.setWarningText.pid_[id];
        thisBlock.setWarningText(text, id);
      }
    }, 100);
    return;
  }
  if (this.isInFlyout) {
    text = null;
  }

  var changedState = false;
  if (goog.isString(text)) {
    if (!this.warning) {
      this.warning = new Blockly.Warning(this);
      changedState = true;
    }
    this.warning.setText(/** @type {string} */ (text), id);
  } else {
    // Dispose all warnings if no id is given.
    if (this.warning && !id) {
      this.warning.dispose();
      changedState = true;
    } else if (this.warning) {
      var oldText = this.warning.getText();
      this.warning.setText('', id);
      var newText = this.warning.getText();
      if (!newText) {
        this.warning.dispose();
      }
      changedState = oldText != newText;
    }
  }
  if (changedState && this.rendered) {
    this.render();
    // Adding or removing a warning icon will cause the block to change shape.
    this.bumpNeighbours_();
  }
};

/**
 * Give this block a mutator dialog.
 * @param {Blockly.Mutator} mutator A mutator dialog instance or null to remove.
 */
Blockly.BlockSvg.prototype.setMutator = function(mutator) {
  if (this.mutator && this.mutator !== mutator) {
    this.mutator.dispose();
  }
  if (mutator) {
    mutator.block_ = this;
    this.mutator = mutator;
    mutator.createIcon();
  }
};

/**
 * Select this block.  Highlight it visually.
 */
Blockly.BlockSvg.prototype.addSelect = function() {
  Blockly.utils.addClass(/** @type {!Element} */ (this.svgGroup_),
                    'blocklySelected');
};

/**
 * Unselect this block.  Remove its highlighting.
 */
Blockly.BlockSvg.prototype.removeSelect = function() {
  Blockly.utils.removeClass(/** @type {!Element} */ (this.svgGroup_),
                       'blocklySelected');
};

/**
 * Update the cursor over this block by adding or removing a class.
 * @param {boolean} letMouseThrough True if the blocks should ignore pointer
 *     events, false otherwise.
 * @package
 */
Blockly.BlockSvg.prototype.setMouseThroughStyle = function(letMouseThrough) {
  if (letMouseThrough) {
    Blockly.utils.addClass(/** @type {!Element} */ (this.svgGroup_),
        'blocklyDraggingMouseThrough');
  } else {
    Blockly.utils.removeClass(/** @type {!Element} */ (this.svgGroup_),
        'blocklyDraggingMouseThrough');
  }
};

/**
 * Update the cursor over this block by adding or removing a class.
 * @param {boolean} enable True if the delete cursor should be shown, false
 *     otherwise.
 * @package
 */
Blockly.BlockSvg.prototype.setDeleteStyle = function(enable) {
  if (enable) {
    Blockly.utils.addClass(/** @type {!Element} */ (this.svgGroup_),
        'blocklyDraggingDelete');
  } else {
    Blockly.utils.removeClass(/** @type {!Element} */ (this.svgGroup_),
        'blocklyDraggingDelete');
  }
};

// Overrides of functions on Blockly.Block that take into account whether the
// block has been rendered.

/**
 * Change the colour of a block.
 * @param {number|string} colour HSV hue value, or #RRGGBB string.
 * @param {number|string} colourSecondary Secondary HSV hue value, or #RRGGBB
 *    string.
 * @param {number|string} colourTertiary Tertiary HSV hue value, or #RRGGBB
 *    string.
 */
Blockly.BlockSvg.prototype.setColour = function(colour, colourSecondary,
    colourTertiary) {
  Blockly.BlockSvg.superClass_.setColour.call(this, colour, colourSecondary,
      colourTertiary);

  if (this.rendered) {
    this.updateColour();
  }
};

/**
 * Move this block to the front of the visible workspace.
 * <g> tags do not respect z-index so svg renders them in the
 * order that they are in the dom.  By placing this block first within the
 * block group's <g>, it will render on top of any other blocks.
 * @package
 */
Blockly.BlockSvg.prototype.bringToFront = function() {
  var block = this;
  do {
    var root = block.getSvgRoot();
    root.parentNode.appendChild(root);
    block = block.getParent();
  } while (block);
};

/**
 * Set whether this block can chain onto the bottom of another block.
 * @param {boolean} newBoolean True if there can be a previous statement.
 * @param {string|Array.<string>|null|undefined} opt_check Statement type or
 *     list of statement types.  Null/undefined if any type could be connected.
 */
Blockly.BlockSvg.prototype.setPreviousStatement =
    function(newBoolean, opt_check) {
  /* eslint-disable indent */
  Blockly.BlockSvg.superClass_.setPreviousStatement.call(this, newBoolean,
      opt_check);

  if (this.rendered) {
    this.render();
    this.bumpNeighbours_();
  }
};  /* eslint-enable indent */

/**
 * Set whether another block can chain onto the bottom of this block.
 * @param {boolean} newBoolean True if there can be a next statement.
 * @param {string|Array.<string>|null|undefined} opt_check Statement type or
 *     list of statement types.  Null/undefined if any type could be connected.
 */
Blockly.BlockSvg.prototype.setNextStatement = function(newBoolean, opt_check) {
  Blockly.BlockSvg.superClass_.setNextStatement.call(this, newBoolean,
      opt_check);

  if (this.rendered) {
    this.render();
    this.bumpNeighbours_();
  }
};

/**
 * Set whether this block returns a value.
 * @param {boolean} newBoolean True if there is an output.
 * @param {string|Array.<string>|null|undefined} opt_check Returned type or list
 *     of returned types.  Null or undefined if any type could be returned
 *     (e.g. variable get).
 */
Blockly.BlockSvg.prototype.setOutput = function(newBoolean, opt_check) {
  Blockly.BlockSvg.superClass_.setOutput.call(this, newBoolean, opt_check);

  if (this.rendered) {
    this.render();
    this.bumpNeighbours_();
  }
};

/**
 * Set whether value inputs are arranged horizontally or vertically.
 * @param {boolean} newBoolean True if inputs are horizontal.
 */
Blockly.BlockSvg.prototype.setInputsInline = function(newBoolean) {
  Blockly.BlockSvg.superClass_.setInputsInline.call(this, newBoolean);

  if (this.rendered) {
    this.render();
    this.bumpNeighbours_();
  }
};

/**
 * Remove an input from this block.
 * @param {string} name The name of the input.
 * @param {boolean=} opt_quiet True to prevent error if input is not present.
 * @throws {goog.asserts.AssertionError} if the input is not present and
 *     opt_quiet is not true.
 */
Blockly.BlockSvg.prototype.removeInput = function(name, opt_quiet) {
  Blockly.BlockSvg.superClass_.removeInput.call(this, name, opt_quiet);

  if (this.rendered) {
    this.render();
    // Removing an input will cause the block to change shape.
    this.bumpNeighbours_();
  }
};

/**
 * Move a numbered input to a different location on this block.
 * @param {number} inputIndex Index of the input to move.
 * @param {number} refIndex Index of input that should be after the moved input.
 */
Blockly.BlockSvg.prototype.moveNumberedInputBefore = function(
    inputIndex, refIndex) {
  Blockly.BlockSvg.superClass_.moveNumberedInputBefore.call(this, inputIndex,
      refIndex);

  if (this.rendered) {
    this.render();
    // Moving an input will cause the block to change shape.
    this.bumpNeighbours_();
  }
};

/**
 * Add a value input, statement input or local variable to this block.
 * @param {number} type Either Blockly.INPUT_VALUE or Blockly.NEXT_STATEMENT or
 *     Blockly.DUMMY_INPUT.
 * @param {string} name Language-neutral identifier which may used to find this
 *     input again.  Should be unique to this block.
 * @return {!Blockly.Input} The input object created.
 * @private
 */
Blockly.BlockSvg.prototype.appendInput_ = function(type, name) {
  var input = Blockly.BlockSvg.superClass_.appendInput_.call(this, type, name);

  if (this.rendered) {
    this.render();
    // Adding an input will cause the block to change shape.
    this.bumpNeighbours_();
  }
  return input;
};

/**
 * Returns connections originating from this block.
 * @param {boolean} all If true, return all connections even hidden ones.
 *     Otherwise, for a non-rendered block return an empty list, and for a
 *     collapsed block don't return inputs connections.
 * @return {!Array.<!Blockly.Connection>} Array of connections.
 * @package
 */
Blockly.BlockSvg.prototype.getConnections_ = function(all) {
  var myConnections = [];
  if (all || this.rendered) {
    if (this.outputConnection) {
      myConnections.push(this.outputConnection);
    }
    if (this.previousConnection) {
      myConnections.push(this.previousConnection);
    }
    if (this.nextConnection) {
      myConnections.push(this.nextConnection);
    }
    if (all || !this.collapsed_) {
      for (var i = 0, input; input = this.inputList[i]; i++) {
        if (input.connection) {
          myConnections.push(input.connection);
        }
      }
    }
  }
  return myConnections;
};

/**
 * Create a connection of the specified type.
 * @param {number} type The type of the connection to create.
 * @return {!Blockly.RenderedConnection} A new connection of the specified type.
 * @private
 */
Blockly.BlockSvg.prototype.makeConnection_ = function(type) {
  return new Blockly.RenderedConnection(this, type);
};

/**
 * Bump unconnected blocks out of alignment.  Two blocks which aren't actually
 * connected should not coincidentally line up on screen.
 * @private
 */
Blockly.BlockSvg.prototype.bumpNeighbours_ = function() {
  if (!this.workspace) {
    return;  // Deleted block.
  }
  if (this.workspace.isDragging()) {
    return;  // Don't bump blocks during a drag.
  }
  var rootBlock = this.getRootBlock();
  if (rootBlock.isInFlyout) {
    return;  // Don't move blocks around in a flyout.
  }
  // Loop through every connection on this block.
  var myConnections = this.getConnections_(false);
  for (var i = 0, connection; connection = myConnections[i]; i++) {

    // Spider down from this block bumping all sub-blocks.
    if (connection.isConnected() && connection.isSuperior()) {
      connection.targetBlock().bumpNeighbours_();
    }

    var neighbours = connection.neighbours_(Blockly.SNAP_RADIUS);
    for (var j = 0, otherConnection; otherConnection = neighbours[j]; j++) {

      // If both connections are connected, that's probably fine.  But if
      // either one of them is unconnected, then there could be confusion.
      if (!connection.isConnected() || !otherConnection.isConnected()) {
        // Only bump blocks if they are from different tree structures.
        if (otherConnection.getSourceBlock().getRootBlock() != rootBlock) {

          // Always bump the inferior block.
          if (connection.isSuperior()) {
            otherConnection.bumpAwayFrom_(connection);
          } else {
            connection.bumpAwayFrom_(otherConnection);
          }
        }
      }
    }
  }
};

/**
 * Schedule snapping to grid and bumping neighbours to occur after a brief
 * delay.
 * @package
 */
Blockly.BlockSvg.prototype.scheduleSnapAndBump = function() {
  var block = this;
  // Ensure that any snap and bump are part of this move's event group.
  var group = Blockly.Events.getGroup();

  setTimeout(function() {
    Blockly.Events.setGroup(group);
    block.snapToGrid();
    Blockly.Events.setGroup(false);
  }, Blockly.BUMP_DELAY / 2);

  setTimeout(function() {
    Blockly.Events.setGroup(group);
    block.bumpNeighbours_();
    Blockly.Events.setGroup(false);
  }, Blockly.BUMP_DELAY);
};
