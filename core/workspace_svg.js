/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2014 Google Inc.
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
 * @fileoverview Object representing a workspace rendered as SVG.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.WorkspaceSvg');

// TODO(scr): Fix circular dependencies
//goog.require('Blockly.BlockSvg');
goog.require('Blockly.Colours');
goog.require('Blockly.ConnectionDB');
goog.require('Blockly.constants');
goog.require('Blockly.DropDownDiv');
goog.require('Blockly.Events');
//goog.require('Blockly.HorizontalFlyout');
goog.require('Blockly.Options');
goog.require('Blockly.ScrollbarPair');
goog.require('Blockly.Touch');
goog.require('Blockly.Trashcan');
//goog.require('Blockly.VerticalFlyout');
goog.require('Blockly.Workspace');
goog.require('Blockly.WorkspaceDragSurfaceSvg');
goog.require('Blockly.Xml');
goog.require('Blockly.ZoomControls');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.math.Coordinate');
goog.require('goog.userAgent');


/**
 * Class for a workspace.  This is an onscreen area with optional trashcan,
 * scrollbars, bubbles, and dragging.
 * @param {!Blockly.Options} options Dictionary of options.
 * @param {Blockly.BlockDragSurfaceSvg=} opt_blockDragSurface Drag surface for
 *     blocks.
 * @param {Blockly.workspaceDragSurfaceSvg=} opt_wsDragSurface Drag surface for
 *     the workspace.
 * @extends {Blockly.Workspace}
 * @constructor
 */
Blockly.WorkspaceSvg = function(options, opt_blockDragSurface, opt_wsDragSurface) {
  Blockly.WorkspaceSvg.superClass_.constructor.call(this, options);
  this.getMetrics =
      options.getMetrics || Blockly.WorkspaceSvg.getTopLevelWorkspaceMetrics_;
  this.setMetrics =
      options.setMetrics || Blockly.WorkspaceSvg.setTopLevelWorkspaceMetrics_;

  Blockly.ConnectionDB.init(this);
  if (opt_blockDragSurface) {
    this.blockDragSurface_ = opt_blockDragSurface;
  }

  if (opt_wsDragSurface) {
    this.workspaceDragSurface_ = opt_wsDragSurface;
  }

  this.useWorkspaceDragSurface_ =
      this.workspaceDragSurface_ && Blockly.utils.is3dSupported();

  /**
   * Database of pre-loaded sounds.
   * @private
   * @const
   */
  this.SOUNDS_ = Object.create(null);
  /**
   * List of currently highlighted blocks.  Block highlighting is often used to
   * visually mark blocks currently being executed.
   * @type !Array.<!Blockly.BlockSvg>
   * @private
   */
  this.highlightedBlocks_ = [];
};
goog.inherits(Blockly.WorkspaceSvg, Blockly.Workspace);

/**
 * A wrapper function called when a resize event occurs.
 * You can pass the result to `unbindEvent_`.
 * @type {Array.<!Array>}
 */
Blockly.WorkspaceSvg.prototype.resizeHandlerWrapper_ = null;

/**
 * The render status of an SVG workspace.
 * Returns `true` for visible workspaces and `false` for non-visible,
 * or headless, workspaces.
 * @type {boolean}
 */
Blockly.WorkspaceSvg.prototype.rendered = true;

/**
 * Is this workspace the surface for a flyout?
 * @type {boolean}
 */
Blockly.WorkspaceSvg.prototype.isFlyout = false;

/**
 * Is this workspace the surface for a mutator?
 * @type {boolean}
 * @package
 */
Blockly.WorkspaceSvg.prototype.isMutator = false;

/**
 * Is this workspace currently being dragged around?
 * DRAG_NONE - No drag operation.
 * DRAG_BEGIN - Still inside the initial DRAG_RADIUS.
 * DRAG_FREE - Workspace has been dragged further than DRAG_RADIUS.
 * @private
 */
Blockly.WorkspaceSvg.prototype.dragMode_ = Blockly.DRAG_NONE;

/**
 * Whether this workspace has resizes enabled.
 * Disable during batch operations for a performance improvement.
 * @type {boolean}
 * @private
 */
Blockly.WorkspaceSvg.prototype.resizesEnabled_ = true;

/**
 * Current horizontal scrolling offset.
 * @type {number}
 */
Blockly.WorkspaceSvg.prototype.scrollX = 0;

/**
 * Current vertical scrolling offset.
 * @type {number}
 */
Blockly.WorkspaceSvg.prototype.scrollY = 0;

/**
 * Horizontal scroll value when scrolling started.
 * @type {number}
 */
Blockly.WorkspaceSvg.prototype.startScrollX = 0;

/**
 * Vertical scroll value when scrolling started.
 * @type {number}
 */
Blockly.WorkspaceSvg.prototype.startScrollY = 0;

/**
 * Distance from mouse to object being dragged.
 * @type {goog.math.Coordinate}
 * @private
 */
Blockly.WorkspaceSvg.prototype.dragDeltaXY_ = null;

/**
 * Current scale.
 * @type {number}
 */
Blockly.WorkspaceSvg.prototype.scale = 1;

/**
 * The workspace's trashcan (if any).
 * @type {Blockly.Trashcan}
 */
Blockly.WorkspaceSvg.prototype.trashcan = null;

/**
 * This workspace's scrollbars, if they exist.
 * @type {Blockly.ScrollbarPair}
 */
Blockly.WorkspaceSvg.prototype.scrollbar = null;

/**
 * This workspace's surface for dragging blocks, if it exists.
 * @type {Blockly.BlockDragSurfaceSvg}
 * @private
 */
Blockly.WorkspaceSvg.prototype.blockDragSurface_ = null;

/**
 * This workspace's drag surface, if it exists.
 * @type {Blockly.WorkspaceDragSurfaceSvg}
 * @private
 */
Blockly.WorkspaceSvg.prototype.workspaceDragSurface_ = null;

/**
  * Whether to move workspace to the drag surface when it is dragged.
  * True if it should move, false if it should be translated directly.
  * @type {boolean}
  * @private
  */
Blockly.WorkspaceSvg.prototype.useWorkspaceDragSurface_ = false;

/**
 * Whether the drag surface is actively in use. When true, calls to
 * translate will translate the drag surface instead of the translating the
 * workspace directly.
 * This is set to true in setupDragSurface and to false in resetDragSurface.
 * @type {boolean}
 * @private
 */
Blockly.WorkspaceSvg.prototype.isDragSurfaceActive_ = false;

/**
 * Time that the last sound was played.
 * @type {Date}
 * @private
 */
Blockly.WorkspaceSvg.prototype.inverseScreenCTM_ = null;

/**
 * Getter for the inverted screen CTM.
 * @return {SVGMatrix} The matrix to use in mouseToSvg
 */
Blockly.WorkspaceSvg.prototype.getInverseScreenCTM = function() {
  return this.inverseScreenCTM_;
};

/**
 * Update the inverted screen CTM.
 */
Blockly.WorkspaceSvg.prototype.updateInverseScreenCTM = function() {
  this.inverseScreenCTM_ = this.getParentSvg().getScreenCTM().inverse();
};

/**
 * Save resize handler data so we can delete it later in dispose.
 * @param {!Array.<!Array>} handler Data that can be passed to unbindEvent_.
 */
Blockly.WorkspaceSvg.prototype.setResizeHandlerWrapper = function(handler) {
  this.resizeHandlerWrapper_ = handler;
};

/**
 * Last known position of the page scroll.
 * This is used to determine whether we have recalculated screen coordinate
 * stuff since the page scrolled.
 * @type {!goog.math.Coordinate}
 * @private
 */
Blockly.WorkspaceSvg.prototype.lastRecordedPageScroll_ = null;

/**
 * Map from function names to callbacks, for deciding what to do when a button
 * is clicked.
 * @type {!Object<string, function(!Blockly.FlyoutButton)>}
 * @private
 */
Blockly.WorkspaceSvg.prototype.flyoutButtonCallbacks_ = {};

/**
 * Inverted screen CTM, for use in mouseToSvg.
 * @type {SVGMatrix}
 * @private
 */
Blockly.WorkspaceSvg.prototype.inverseScreenCTM_ = null;

/**
 * Getter for the inverted screen CTM.
 * @return {SVGMatrix} The matrix to use in mouseToSvg
 */
Blockly.WorkspaceSvg.prototype.getInverseScreenCTM = function() {
  return this.inverseScreenCTM_;
};

/**
 * Update the inverted screen CTM.
 */
Blockly.WorkspaceSvg.prototype.updateInverseScreenCTM = function() {
  var ctm = this.getParentSvg().getScreenCTM();
  if (ctm) {
    this.inverseScreenCTM_ = ctm.inverse();
  }
};

/**
 * Return the absolute coordinates of the top-left corner of this element,
 * scales that after canvas SVG element, if it's a descendant.
 * The origin (0,0) is the top-left corner of the Blockly SVG.
 * @param {!Element} element Element to find the coordinates of.
 * @return {!goog.math.Coordinate} Object with .x and .y properties.
 * @private
 */
Blockly.WorkspaceSvg.prototype.getSvgXY = function(element) {
  var x = 0;
  var y = 0;
  var scale = 1;
  if (goog.dom.contains(this.getCanvas(), element) ||
      goog.dom.contains(this.getBubbleCanvas(), element)) {
    // Before the SVG canvas, scale the coordinates.
    scale = this.scale;
  }
  do {
    // Loop through this block and every parent.
    var xy = Blockly.utils.getRelativeXY(element);
    if (element == this.getCanvas() ||
        element == this.getBubbleCanvas()) {
      // After the SVG canvas, don't scale the coordinates.
      scale = 1;
    }
    x += xy.x * scale;
    y += xy.y * scale;
    element = element.parentNode;
  } while (element && element != this.getParentSvg());
  return new goog.math.Coordinate(x, y);
};

/**
 * Save resize handler data so we can delete it later in dispose.
 * @param {!Array.<!Array>} handler Data that can be passed to unbindEvent_.
 */
Blockly.WorkspaceSvg.prototype.setResizeHandlerWrapper = function(handler) {
  this.resizeHandlerWrapper_ = handler;
};

/**
 * Create the workspace DOM elements.
 * @param {string=} opt_backgroundClass Either 'blocklyMainBackground' or
 *     'blocklyMutatorBackground'.
 * @return {!Element} The workspace's SVG group.
 */
Blockly.WorkspaceSvg.prototype.createDom = function(opt_backgroundClass) {
  /**
   * <g class="blocklyWorkspace">
   *   <rect class="blocklyMainBackground" height="100%" width="100%"></rect>
   *   [Trashcan and/or flyout may go here]
   *   <g class="blocklyBlockCanvas"></g>
   *   <g class="blocklyBubbleCanvas"></g>
   *   [Scrollbars may go here]
   * </g>
   * @type {SVGElement}
   */
  this.svgGroup_ = Blockly.utils.createSvgElement('g',
      {'class': 'blocklyWorkspace'}, null);
  if (opt_backgroundClass) {
    /** @type {SVGElement} */
    this.svgBackground_ = Blockly.utils.createSvgElement('rect',
        {'height': '100%', 'width': '100%', 'class': opt_backgroundClass},
        this.svgGroup_);
    if (opt_backgroundClass == 'blocklyMainBackground') {
      this.svgBackground_.style.fill =
          'url(#' + this.options.gridPattern.id + ')';
    }
  }
  /** @type {SVGElement} */
  this.svgBlockCanvas_ = Blockly.utils.createSvgElement('g',
      {'class': 'blocklyBlockCanvas'}, this.svgGroup_, this);
  /** @type {SVGElement} */
  this.svgBubbleCanvas_ = Blockly.utils.createSvgElement('g',
      {'class': 'blocklyBubbleCanvas'}, this.svgGroup_, this);
  var bottom = Blockly.Scrollbar.scrollbarThickness;
  if (this.options.hasTrashcan) {
    bottom = this.addTrashcan_(bottom);
  }
  if (this.options.zoomOptions && this.options.zoomOptions.controls) {
    bottom = this.addZoomControls_(bottom);
  }

  if (!this.isFlyout) {
    Blockly.bindEventWithChecks_(this.svgGroup_, 'mousedown', this,
        this.onMouseDown_);
    var thisWorkspace = this;
    Blockly.bindEvent_(this.svgGroup_, 'touchstart', null,
                       function(e) {Blockly.longStart_(e, thisWorkspace);});
    if (this.options.zoomOptions && this.options.zoomOptions.wheel) {
      // Mouse-wheel.
      Blockly.bindEventWithChecks_(this.svgGroup_, 'wheel', this,
          this.onMouseWheel_);
    }
  }

  // Determine if there needs to be a category tree, or a simple list of
  // blocks.  This cannot be changed later, since the UI is very different.
  if (this.options.hasCategories) {
    /**
     * @type {Blockly.Toolbox}
     * @private
     */
    this.toolbox_ = new Blockly.Toolbox(this);
  }
  this.updateGridPattern_();
  this.updateStackGlowScale_();
  this.recordDeleteAreas();
  return this.svgGroup_;
};

/**
 * Dispose of this workspace.
 * Unlink from all DOM elements to prevent memory leaks.
 */
Blockly.WorkspaceSvg.prototype.dispose = function() {
  // Stop rerendering.
  this.rendered = false;
  Blockly.WorkspaceSvg.superClass_.dispose.call(this);
  if (this.svgGroup_) {
    goog.dom.removeNode(this.svgGroup_);
    this.svgGroup_ = null;
  }
  this.svgBlockCanvas_ = null;
  this.svgBubbleCanvas_ = null;
  if (this.toolbox_) {
    this.toolbox_.dispose();
    this.toolbox_ = null;
  }
  if (this.flyout_) {
    this.flyout_.dispose();
    this.flyout_ = null;
  }
  if (this.trashcan) {
    this.trashcan.dispose();
    this.trashcan = null;
  }
  if (this.scrollbar) {
    this.scrollbar.dispose();
    this.scrollbar = null;
  }
  if (this.zoomControls_) {
    this.zoomControls_.dispose();
    this.zoomControls_ = null;
  }
  if (!this.options.parentWorkspace) {
    // Top-most workspace.  Dispose of the div that the
    // svg is injected into (i.e. injectionDiv).
    goog.dom.removeNode(this.getParentSvg().parentNode);
  }
  if (this.resizeHandlerWrapper_) {
    Blockly.unbindEvent_(this.resizeHandlerWrapper_);
    this.resizeHandlerWrapper_ = null;
  }
};

/**
 * Obtain a newly created block.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @param {string=} opt_id Optional ID.  Use this ID if provided, otherwise
 *     create a new ID.
 * @return {!Blockly.BlockSvg} The created block.
 */
Blockly.WorkspaceSvg.prototype.newBlock = function(prototypeName, opt_id) {
  return new Blockly.BlockSvg(this, prototypeName, opt_id);
};

/**
 * Add a trashcan.
 * @param {number} bottom Distance from workspace bottom to bottom of trashcan.
 * @return {number} Distance from workspace bottom to the top of trashcan.
 * @private
 */
Blockly.WorkspaceSvg.prototype.addTrashcan_ = function(bottom) {
  /** @type {Blockly.Trashcan} */
  this.trashcan = new Blockly.Trashcan(this);
  var svgTrashcan = this.trashcan.createDom();
  this.svgGroup_.insertBefore(svgTrashcan, this.svgBlockCanvas_);
  return this.trashcan.init(bottom);
};

/**
 * Add zoom controls.
 * @param {number} bottom Distance from workspace bottom to bottom of controls.
 * @return {number} Distance from workspace bottom to the top of controls.
 * @private
 */
Blockly.WorkspaceSvg.prototype.addZoomControls_ = function(bottom) {
  /** @type {Blockly.ZoomControls} */
  this.zoomControls_ = new Blockly.ZoomControls(this);
  var svgZoomControls = this.zoomControls_.createDom();
  this.svgGroup_.appendChild(svgZoomControls);
  return this.zoomControls_.init(bottom);
};

/**
 * Add a flyout element in an element with the given tag name.
 * @param {string} tagName What type of tag the flyout belongs in.
 * @return {!Element} The element containing the flyout dom.
 * @private
 */
Blockly.WorkspaceSvg.prototype.addFlyout_ = function(tagName) {
  var workspaceOptions = {
    disabledPatternId: this.options.disabledPatternId,
    parentWorkspace: this,
    RTL: this.RTL,
    oneBasedIndex: this.options.oneBasedIndex,
    horizontalLayout: this.horizontalLayout,
    toolboxPosition: this.options.toolboxPosition
  };
  if (this.horizontalLayout) {
    this.flyout_ = new Blockly.HorizontalFlyout(workspaceOptions);
  } else {
    this.flyout_ = new Blockly.VerticalFlyout(workspaceOptions);
  }
  this.flyout_.autoClose = false;

  // Return the element  so that callers can place it in their desired
  // spot in the dom.  For exmaple, mutator flyouts do not go in the same place
  // as main workspace flyouts.
  return this.flyout_.createDom(tagName);
};

/**
 * Getter for the flyout associated with this workspace.  This flyout may be
 * owned by either the toolbox or the workspace, depending on toolbox
 * configuration.  It will be null if there is no flyout.
 * @return {Blockly.Flyout} The flyout on this workspace.
 * @package
 */
Blockly.WorkspaceSvg.prototype.getFlyout_ = function() {
  if (this.flyout_) {
    return this.flyout_;
  }
  if (this.toolbox_) {
    return this.toolbox_.flyout_;
  }
  return null;
};

/**
 * Update items that use screen coordinate calculations
 * because something has changed (e.g. scroll position, window size).
 * @private
 */
Blockly.WorkspaceSvg.prototype.updateScreenCalculations_ = function() {
  this.updateInverseScreenCTM();
  this.recordDeleteAreas();
};

/**
 * If enabled, resize the parts of the workspace that change when the workspace
 * contents (e.g. block positions) change.  This will also scroll the
 * workspace contents if needed.
 * @package
 */
Blockly.WorkspaceSvg.prototype.resizeContents = function() {
  if (!this.resizesEnabled_ || !this.rendered) {
    return;
  }
  if (this.scrollbar) {
    // TODO(picklesrus): Once rachel-fenichel's scrollbar refactoring
    // is complete, call the method that only resizes scrollbar
    // based on contents.
    this.scrollbar.resize();
  }
  this.updateInverseScreenCTM();
};

/**
 * Resize and reposition all of the workspace chrome (toolbox,
 * trash, scrollbars etc.)
 * This should be called when something changes that
 * requires recalculating dimensions and positions of the
 * trash, zoom, toolbox, etc. (e.g. window resize).
 */
Blockly.WorkspaceSvg.prototype.resize = function() {
  if (this.toolbox_) {
    this.toolbox_.position();
  }
  if (this.flyout_) {
    this.flyout_.position();
  }
  if (this.trashcan) {
    this.trashcan.position();
  }
  if (this.zoomControls_) {
    this.zoomControls_.position();
  }
  if (this.scrollbar) {
    this.scrollbar.resize();
  }
  this.updateScreenCalculations_();
};

/**
 * Resizes and repositions workspace chrome if the page has a new
 * scroll position.
 * @package
 */
Blockly.WorkspaceSvg.prototype.updateScreenCalculationsIfScrolled
    = function() {
  /* eslint-disable indent */
  var currScroll = goog.dom.getDocumentScroll();
  if (!goog.math.Coordinate.equals(this.lastRecordedPageScroll_,
     currScroll)) {
    this.lastRecordedPageScroll_ = currScroll;
    this.updateScreenCalculations_();
  }
}; /* eslint-enable indent */

/**
 * Get the SVG element that forms the drawing surface.
 * @return {!Element} SVG element.
 */
Blockly.WorkspaceSvg.prototype.getCanvas = function() {
  return this.svgBlockCanvas_;
};

/**
 * Get the SVG element that forms the bubble surface.
 * @return {!SVGGElement} SVG element.
 */
Blockly.WorkspaceSvg.prototype.getBubbleCanvas = function() {
  return this.svgBubbleCanvas_;
};

/**
 * Get the SVG element that contains this workspace.
 * @return {!Element} SVG element.
 */
Blockly.WorkspaceSvg.prototype.getParentSvg = function() {
  if (this.cachedParentSvg_) {
    return this.cachedParentSvg_;
  }
  var element = this.svgGroup_;
  while (element) {
    if (element.tagName == 'svg') {
      this.cachedParentSvg_ = element;
      return element;
    }
    element = element.parentNode;
  }
  return null;
};

/**
  * Get a flyout associated with this workspace, if one exists.
  * @return {?Blockly.Flyout} Flyout associated with this workspace.
  */
Blockly.WorkspaceSvg.prototype.getFlyout = function() {
  if (this.flyout_) {
    return this.flyout_;
  }
  if (this.toolbox_ && this.toolbox_.flyout_) {
    return this.toolbox_.flyout_;
  }
  return null;
};

/**
 * Translate this workspace to new coordinates.
 * @param {number} x Horizontal translation.
 * @param {number} y Vertical translation.
 */
Blockly.WorkspaceSvg.prototype.translate = function(x, y) {
  if (this.useWorkspaceDragSurface_ && this.isDragSurfaceActive_) {
    this.workspaceDragSurface_.translateSurface(x,y);
  } else {
    var translation = 'translate(' + x + ',' + y + ') ' +
        'scale(' + this.scale + ')';
    this.svgBlockCanvas_.setAttribute('transform', translation);
    this.svgBubbleCanvas_.setAttribute('transform', translation);
  }
  // Now update the block drag surface if we're using one.
  if (this.blockDragSurface_) {
    this.blockDragSurface_.translateAndScaleGroup(x, y, this.scale);
  }
};

/**
 * Called at the end of a workspace drag to take the contents
 * out of the drag surface and put them back into the workspace svg.
 * Does nothing if the workspace drag surface is not enabled.
 * @package
 */
Blockly.WorkspaceSvg.prototype.resetDragSurface = function() {
  // Don't do anything if we aren't using a drag surface.
  if (!this.useWorkspaceDragSurface_) {
    return;
  }

  this.isDragSurfaceActive_ = false;

  var trans = this.workspaceDragSurface_.getSurfaceTranslation();
  this.workspaceDragSurface_.clearAndHide(this.svgGroup_);
  var translation = 'translate(' + trans.x + ',' + trans.y + ') ' +
        'scale(' + this.scale + ')';
  this.svgBlockCanvas_.setAttribute('transform', translation);
  this.svgBubbleCanvas_.setAttribute('transform', translation);
};

/**
 * Called at the beginning of a workspace drag to move contents of
 * the workspace to the drag surface.
 * Does nothing if the drag surface is not enabled.
 * @package
 */
Blockly.WorkspaceSvg.prototype.setupDragSurface = function() {
  // Don't do anything if we aren't using a drag surface.
  if (!this.useWorkspaceDragSurface_) {
    return;
  }

  this.isDragSurfaceActive_ = true;

  // Figure out where we want to put the canvas back.  The order
  // in the is important because things are layered.
  var previousElement = this.svgBlockCanvas_.previousSibling;
  var width = this.getParentSvg().getAttribute("width");
  var height = this.getParentSvg().getAttribute("height");
  var coord = Blockly.utils.getRelativeXY(this.svgBlockCanvas_);
  this.workspaceDragSurface_.setContentsAndShow(this.svgBlockCanvas_,
      this.svgBubbleCanvas_, previousElement, width, height, this.scale);
  this.workspaceDragSurface_.translateSurface(coord.x, coord.y);
};

/**
 * Returns the horizontal offset of the workspace.
 * Intended for LTR/RTL compatibility in XML.
 * @return {number} Width.
 */
Blockly.WorkspaceSvg.prototype.getWidth = function() {
  var metrics = this.getMetrics();
  return metrics ? metrics.viewWidth / this.scale : 0;
};

/**
 * Toggles the visibility of the workspace.
 * Currently only intended for main workspace.
 * @param {boolean} isVisible True if workspace should be visible.
 */
Blockly.WorkspaceSvg.prototype.setVisible = function(isVisible) {

  // Tell the scrollbar whether its container is visible so it can
  // tell when to hide itself.
  if (this.scrollbar) {
    this.scrollbar.setContainerVisible(isVisible);
  }

  // Tell the flyout whether its container is visible so it can
  // tell when to hide itself.
  if (this.getFlyout_()) {
    this.getFlyout_().setContainerVisible(isVisible);
  }

  this.getParentSvg().style.display = isVisible ? 'block' : 'none';
  if (this.toolbox_) {
    // Currently does not support toolboxes in mutators.
    this.toolbox_.HtmlDiv.style.display = isVisible ? 'block' : 'none';
  }
  if (isVisible) {
    this.render();
    if (this.toolbox_) {
      this.toolbox_.position();
    }
  } else {
    Blockly.hideChaff(true);
    Blockly.DropDownDiv.hideWithoutAnimation();
  }
};

/**
 * Render all blocks in workspace.
 */
Blockly.WorkspaceSvg.prototype.render = function() {
  // Generate list of all blocks.
  var blocks = this.getAllBlocks();
  // Render each block.
  for (var i = blocks.length - 1; i >= 0; i--) {
    blocks[i].render(false);
  }
};

/**
 * Was used back when block highlighting (for execution) and block selection
 * (for editing) were the same thing.
 * Any calls of this function can be deleted.
 * @deprecated October 2016
 */
Blockly.WorkspaceSvg.prototype.traceOn = function() {
  console.warn('Deprecated call to traceOn, delete this.');
};

/**
 * Highlight or unhighlight a block in the workspace.  Block highlighting is
 * often used to visually mark blocks currently being executed.
 * @param {?string} id ID of block to highlight/unhighlight,
 *   or null for no block (used to unhighlight all blocks).
 * @param {boolean=} opt_state If undefined, highlight specified block and
 * automatically unhighlight all others.  If true or false, manually
 * highlight/unhighlight the specified block.
 */
Blockly.WorkspaceSvg.prototype.highlightBlock = function(id, opt_state) {
  if (opt_state === undefined) {
    // Unhighlight all blocks.
    for (var i = 0, block; block = this.highlightedBlocks_[i]; i++) {
      block.setHighlighted(false);
    }
    this.highlightedBlocks_.length = 0;
  }
  // Highlight/unhighlight the specified block.
  var block = id ? this.getBlockById(id) : null;
  if (block) {
    var state = (opt_state === undefined) || opt_state;
    // Using Set here would be great, but at the cost of IE10 support.
    if (!state) {
      goog.array.remove(this.highlightedBlocks_, block);
    } else if (this.highlightedBlocks_.indexOf(block) == -1) {
      this.highlightedBlocks_.push(block);
    }
    block.setHighlighted(state);
  }
};

/**
 * Glow/unglow a block in the workspace.
 * @param {?string} id ID of block to find.
 * @param {boolean} isGlowingBlock Whether to glow the block.
 */
Blockly.WorkspaceSvg.prototype.glowBlock = function(id, isGlowingBlock) {
  var block = null;
  if (id) {
    block = this.getBlockById(id);
    if (!block) {
      throw 'Tried to glow block that does not exist.';
    }
  }
  block.setGlowBlock(isGlowingBlock);
};

/**
 * Glow/unglow a stack in the workspace.
 * @param {?string} id ID of block which starts the stack.
 * @param {boolean} isGlowingStack Whether to glow the stack.
 */
Blockly.WorkspaceSvg.prototype.glowStack = function(id, isGlowingStack) {
  var block = null;
  if (id) {
    block = this.getBlockById(id);
    if (!block) {
      throw 'Tried to glow stack on block that does not exist.';
    }
  }
  block.setGlowStack(isGlowingStack);
};

/**
 * Visually report a value associated with a block.
 * In Scratch, appears as a pop-up next to the block when a reporter block is clicked.
 * @param {?string} id ID of block to report associated value.
 * @param {?string} value String value to visually report.
 */
Blockly.WorkspaceSvg.prototype.reportValue = function(id, value) {
  var block = this.getBlockById(id);
  if (!block) {
    throw 'Tried to report value on block that does not exist.';
  }
  Blockly.DropDownDiv.hideWithoutAnimation();
  Blockly.DropDownDiv.clearContent();
  var contentDiv = Blockly.DropDownDiv.getContentDiv();
  var valueReportBox = goog.dom.createElement('div');
  valueReportBox.setAttribute('class', 'valueReportBox');
  valueReportBox.innerHTML = Blockly.encodeEntities(value);
  contentDiv.appendChild(valueReportBox);
  Blockly.DropDownDiv.setColour(
    Blockly.Colours.valueReportBackground,
    Blockly.Colours.valueReportBorder
  );
  Blockly.DropDownDiv.showPositionedByBlock(this, block);
};

/**
 * Paste the provided block onto the workspace.
 * @param {!Element} xmlBlock XML block element.
 */
Blockly.WorkspaceSvg.prototype.paste = function(xmlBlock) {
  if (!this.rendered) {
    return;
  }
  Blockly.terminateDrag_();  // Dragging while pasting?  No.
  Blockly.Events.disable();
  try {
    var block = Blockly.Xml.domToBlock(xmlBlock, this);
    // Move the duplicate to original position.
    var blockX = parseInt(xmlBlock.getAttribute('x'), 10);
    var blockY = parseInt(xmlBlock.getAttribute('y'), 10);
    if (!isNaN(blockX) && !isNaN(blockY)) {
      if (this.RTL) {
        blockX = -blockX;
      }
      // Offset block until not clobbering another block and not in connection
      // distance with neighbouring blocks.
      do {
        var collide = false;
        var allBlocks = this.getAllBlocks();
        for (var i = 0, otherBlock; otherBlock = allBlocks[i]; i++) {
          var otherXY = otherBlock.getRelativeToSurfaceXY();
          if (Math.abs(blockX - otherXY.x) <= 1 &&
              Math.abs(blockY - otherXY.y) <= 1) {
            collide = true;
            break;
          }
        }
        if (!collide) {
          // Check for blocks in snap range to any of its connections.
          var connections = block.getConnections_(false);
          for (var i = 0, connection; connection = connections[i]; i++) {
            var neighbour = connection.closest(Blockly.SNAP_RADIUS,
                new goog.math.Coordinate(blockX, blockY));
            if (neighbour.connection) {
              collide = true;
              break;
            }
          }
        }
        if (collide) {
          if (this.RTL) {
            blockX -= Blockly.SNAP_RADIUS;
          } else {
            blockX += Blockly.SNAP_RADIUS;
          }
          blockY += Blockly.SNAP_RADIUS * 2;
        }
      } while (collide);
      block.moveBy(blockX, blockY);
    }
  } finally {
    Blockly.Events.enable();
  }
  if (Blockly.Events.isEnabled() && !block.isShadow()) {
    Blockly.Events.fire(new Blockly.Events.Create(block));
  }
  block.select();
};

/**
 * Create a new variable with the given name.  Update the flyout to show the new
 *     variable immediately.
 * TODO: #468
 * @param {string} name The new variable's name.
 */
Blockly.WorkspaceSvg.prototype.createVariable = function(name) {
  Blockly.WorkspaceSvg.superClass_.createVariable.call(this, name);
  // Don't refresh the toolbox if there's a drag in progress.
  if (this.toolbox_ && this.toolbox_.flyout_ && !Blockly.Flyout.startFlyout_) {
    this.toolbox_.refreshSelection();
  }
};

/**
 * Make a list of all the delete areas for this workspace.
 */
Blockly.WorkspaceSvg.prototype.recordDeleteAreas = function() {
  if (this.trashcan) {
    this.deleteAreaTrash_ = this.trashcan.getClientRect();
  } else {
    this.deleteAreaTrash_ = null;
  }
  if (this.flyout_) {
    this.deleteAreaToolbox_ = this.flyout_.getClientRect();
  } else if (this.toolbox_) {
    this.deleteAreaToolbox_ = this.toolbox_.getClientRect();
  } else {
    this.deleteAreaToolbox_ = null;
  }
};

/**
 * Is the mouse event over a delete area (toolbox or non-closing flyout)?
 * Opens or closes the trashcan and sets the cursor as a side effect.
 * @param {!Event} e Mouse move event.
 * @return {?number} Null if not over a delete area, or an enum representing
 *     which delete area the event is over.
 */
Blockly.WorkspaceSvg.prototype.isDeleteArea = function(e) {
  var xy = new goog.math.Coordinate(e.clientX, e.clientY);
  if (this.deleteAreaTrash_ && this.deleteAreaTrash_.contains(xy)) {
    return Blockly.DELETE_AREA_TRASH;
  }
  if (this.deleteAreaToolbox_ && this.deleteAreaToolbox_.contains(xy)) {
    return Blockly.DELETE_AREA_TOOLBOX;
  }
  return null;
};

/**
 * Handle a mouse-down on SVG drawing surface.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.WorkspaceSvg.prototype.onMouseDown_ = function(e) {
  this.markFocused();
  if (Blockly.utils.isTargetInput(e)) {
    Blockly.Touch.clearTouchIdentifier();
    return;
  }
  Blockly.terminateDrag_();  // In case mouse-up event was lost.
  Blockly.hideChaff();
  Blockly.DropDownDiv.hide();
  var isTargetWorkspace = e.target && e.target.nodeName &&
      (e.target.nodeName.toLowerCase() == 'svg' ||
       e.target == this.svgBackground_);
  if (isTargetWorkspace && Blockly.selected && !this.options.readOnly) {
    // Clicking on the document clears the selection.
    Blockly.selected.unselect();
  }
  if (Blockly.utils.isRightButton(e)) {
    // Right-click.
    this.showContextMenu_(e);
    // This is to handle the case where the event is pretending to be a right
    // click event but it was really a long press. In that case, we want to make
    // sure any in progress drags are stopped.
    Blockly.onMouseUp_(e);
    // Since this was a click, not a drag, end the gesture immediately.
    Blockly.Touch.clearTouchIdentifier();
  } else if (this.scrollbar) {
    this.dragMode_ = Blockly.DRAG_BEGIN;
    // Record the current mouse position.
    this.startDragMouseX = e.clientX;
    this.startDragMouseY = e.clientY;
    this.startDragMetrics = this.getMetrics();
    this.startScrollX = this.scrollX;
    this.startScrollY = this.scrollY;

    this.setupDragSurface();
    // If this is a touch event then bind to the mouseup so workspace drag mode
    // is turned off and double move events are not performed on a block.
    // See comment in inject.js Blockly.init_ as to why mouseup events are
    // bound to the document instead of the SVG's surface.
    if ('mouseup' in Blockly.Touch.TOUCH_MAP) {
      Blockly.Touch.onTouchUpWrapper_ = Blockly.Touch.onTouchUpWrapper_ || [];
      Blockly.Touch.onTouchUpWrapper_ = Blockly.Touch.onTouchUpWrapper_.concat(
          Blockly.bindEventWithChecks_(document, 'mouseup', null,
          Blockly.onMouseUp_));
    }
    Blockly.onMouseMoveWrapper_ = Blockly.onMouseMoveWrapper_ || [];
    Blockly.onMouseMoveWrapper_ = Blockly.onMouseMoveWrapper_.concat(
        Blockly.bindEventWithChecks_(document, 'mousemove', null,
        Blockly.onMouseMove_));
  } else {
    // It was a click, but the workspace isn't draggable.
    Blockly.Touch.clearTouchIdentifier();
  }
  // This event has been handled.  No need to bubble up to the document.
  e.stopPropagation();
  e.preventDefault();
};

/**
 * Start tracking a drag of an object on this workspace.
 * @param {!Event} e Mouse down event.
 * @param {!goog.math.Coordinate} xy Starting location of object.
 */
Blockly.WorkspaceSvg.prototype.startDrag = function(e, xy) {
  // Record the starting offset between the bubble's location and the mouse.
  var point = Blockly.utils.mouseToSvg(e, this.getParentSvg(),
      this.getInverseScreenCTM());
  // Fix scale of mouse event.
  point.x /= this.scale;
  point.y /= this.scale;
  this.dragDeltaXY_ = goog.math.Coordinate.difference(xy, point);
};

/**
 * Track a drag of an object on this workspace.
 * @param {!Event} e Mouse move event.
 * @return {!goog.math.Coordinate} New location of object.
 */
Blockly.WorkspaceSvg.prototype.moveDrag = function(e) {
  var point = Blockly.utils.mouseToSvg(e, this.getParentSvg(),
      this.getInverseScreenCTM());
  // Fix scale of mouse event.
  point.x /= this.scale;
  point.y /= this.scale;
  return goog.math.Coordinate.sum(this.dragDeltaXY_, point);
};

/**
 * Is the user currently dragging a block or scrolling the flyout/workspace?
 * @return {boolean} True if currently dragging or scrolling.
 */
Blockly.WorkspaceSvg.prototype.isDragging = function() {
  return Blockly.dragMode_ == Blockly.DRAG_FREE ||
      (Blockly.Flyout.startFlyout_ &&
          Blockly.Flyout.startFlyout_.dragMode_ == Blockly.DRAG_FREE) ||
      this.dragMode_ == Blockly.DRAG_FREE;
};

/**
 * Handle a mouse-wheel on SVG drawing surface.
 * @param {!Event} e Mouse wheel event.
 * @private
 */
Blockly.WorkspaceSvg.prototype.onMouseWheel_ = function(e) {
  // TODO: Remove terminateDrag and compensate for coordinate skew during zoom.
  if (e.ctrlKey) {
    Blockly.terminateDrag_();
    // The vertical scroll distance that corresponds to a click of a zoom button.
    var PIXELS_PER_ZOOM_STEP = 50;
    var delta = -e.deltaY / PIXELS_PER_ZOOM_STEP;
    var position = Blockly.utils.mouseToSvg(e, this.getParentSvg(),
      this.getInverseScreenCTM());
    this.zoom(position.x, position.y, delta);
  } else {
    // This is a regular mouse wheel event - scroll the workspace
    // First hide the WidgetDiv without animation
    // (mouse scroll makes field out of place with div)
    Blockly.WidgetDiv.hide(true);
    Blockly.DropDownDiv.hideWithoutAnimation();
    var x = this.scrollX - e.deltaX;
    var y = this.scrollY - e.deltaY;
    this.startDragMetrics = this.getMetrics();
    this.scroll(x, y);
  }
  e.preventDefault();
};

/**
 * Calculate the bounding box for the blocks on the workspace.
 *
 * @return {Object} Contains the position and size of the bounding box
 *   containing the blocks on the workspace.
 */
Blockly.WorkspaceSvg.prototype.getBlocksBoundingBox = function() {
  var topBlocks = this.getTopBlocks(false);
  // There are no blocks, return empty rectangle.
  if (!topBlocks.length) {
    return {x: 0, y: 0, width: 0, height: 0};
  }

  // Initialize boundary using the first block.
  var boundary = topBlocks[0].getBoundingRectangle();

  // Start at 1 since the 0th block was used for initialization
  for (var i = 1; i < topBlocks.length; i++) {
    var blockBoundary = topBlocks[i].getBoundingRectangle();
    if (blockBoundary.topLeft.x < boundary.topLeft.x) {
      boundary.topLeft.x = blockBoundary.topLeft.x;
    }
    if (blockBoundary.bottomRight.x > boundary.bottomRight.x) {
      boundary.bottomRight.x = blockBoundary.bottomRight.x;
    }
    if (blockBoundary.topLeft.y < boundary.topLeft.y) {
      boundary.topLeft.y = blockBoundary.topLeft.y;
    }
    if (blockBoundary.bottomRight.y > boundary.bottomRight.y) {
      boundary.bottomRight.y = blockBoundary.bottomRight.y;
    }
  }
  return {
    x: boundary.topLeft.x,
    y: boundary.topLeft.y,
    width: boundary.bottomRight.x - boundary.topLeft.x,
    height: boundary.bottomRight.y - boundary.topLeft.y
  };
};

/**
 * Clean up the workspace by ordering all the blocks in a column.
 */
Blockly.WorkspaceSvg.prototype.cleanUp = function() {
  Blockly.Events.setGroup(true);
  var topBlocks = this.getTopBlocks(true);
  var cursorY = 0;
  for (var i = 0, block; block = topBlocks[i]; i++) {
    var xy = block.getRelativeToSurfaceXY();
    block.moveBy(-xy.x, cursorY - xy.y);
    block.snapToGrid();
    cursorY = block.getRelativeToSurfaceXY().y +
        block.getHeightWidth().height + Blockly.BlockSvg.MIN_BLOCK_Y;
  }
  Blockly.Events.setGroup(false);
  // Fire an event to allow scrollbars to resize.
  this.resizeContents();
};

/**
 * Show the context menu for the workspace.
 * @param {!Event} e Mouse event.
 * @private
 */
Blockly.WorkspaceSvg.prototype.showContextMenu_ = function(e) {
  if (this.options.readOnly || this.isFlyout) {
    return;
  }
  var menuOptions = [];
  var topBlocks = this.getTopBlocks(true);
  var eventGroup = Blockly.utils.genUid();

  // Options to undo/redo previous action.
  var undoOption = {};
  undoOption.text = Blockly.Msg.UNDO;
  undoOption.enabled = this.undoStack_.length > 0;
  undoOption.callback = this.undo.bind(this, false);
  menuOptions.push(undoOption);
  var redoOption = {};
  redoOption.text = Blockly.Msg.REDO;
  redoOption.enabled = this.redoStack_.length > 0;
  redoOption.callback = this.undo.bind(this, true);
  menuOptions.push(redoOption);

  // Option to clean up blocks.
  if (this.scrollbar) {
    var cleanOption = {};
    cleanOption.text = Blockly.Msg.CLEAN_UP;
    cleanOption.enabled = topBlocks.length > 1;
    cleanOption.callback = this.cleanUp.bind(this);
    menuOptions.push(cleanOption);
  }

  // Add a little animation to collapsing and expanding.
  var DELAY = 10;
  if (this.options.collapse) {
    var hasCollapsedBlocks = false;
    var hasExpandedBlocks = false;
    for (var i = 0; i < topBlocks.length; i++) {
      var block = topBlocks[i];
      while (block) {
        if (block.isCollapsed()) {
          hasCollapsedBlocks = true;
        } else {
          hasExpandedBlocks = true;
        }
        block = block.getNextBlock();
      }
    }

    /**
     * Option to collapse or expand top blocks.
     * @param {boolean} shouldCollapse Whether a block should collapse.
     * @private
     */
    var toggleOption = function(shouldCollapse) {
      var ms = 0;
      for (var i = 0; i < topBlocks.length; i++) {
        var block = topBlocks[i];
        while (block) {
          setTimeout(block.setCollapsed.bind(block, shouldCollapse), ms);
          block = block.getNextBlock();
          ms += DELAY;
        }
      }
    };

    // Option to collapse top blocks.
    var collapseOption = {enabled: hasExpandedBlocks};
    collapseOption.text = Blockly.Msg.COLLAPSE_ALL;
    collapseOption.callback = function() {
      toggleOption(true);
    };
    menuOptions.push(collapseOption);

    // Option to expand top blocks.
    var expandOption = {enabled: hasCollapsedBlocks};
    expandOption.text = Blockly.Msg.EXPAND_ALL;
    expandOption.callback = function() {
      toggleOption(false);
    };
    menuOptions.push(expandOption);
  }

  // Option to delete all blocks.
  // Count the number of blocks that are deletable.
  var deleteList = [];
  function addDeletableBlocks(block) {
    if (block.isDeletable()) {
      deleteList = deleteList.concat(block.getDescendants());
    } else {
      var children = block.getChildren();
      for (var i = 0; i < children.length; i++) {
        addDeletableBlocks(children[i]);
      }
    }
  }
  for (var i = 0; i < topBlocks.length; i++) {
    addDeletableBlocks(topBlocks[i]);
  }
  // Scratch-specific: don't count shadow blocks in delete count
  var deleteCount = 0;
  for (var i = 0; i < deleteList.length; i++) {
    if (!deleteList[i].isShadow()) {
      deleteCount++;
    }
  }
  function deleteNext() {
    Blockly.Events.setGroup(eventGroup);
    var block = deleteList.shift();
    if (block) {
      if (block.workspace) {
        block.dispose(false, true);
        setTimeout(deleteNext, DELAY);
      } else {
        deleteNext();
      }
    }
    Blockly.Events.setGroup(false);
  }

  var deleteOption = {
    text: deleteCount == 1 ? Blockly.Msg.DELETE_BLOCK :
        Blockly.Msg.DELETE_X_BLOCKS.replace('%1', String(deleteCount)),
    enabled: deleteCount > 0,
    callback: function() {
      if (deleteList.length < 2 ) {
        deleteNext();
      } else {
        Blockly.confirm(Blockly.Msg.DELETE_ALL_BLOCKS.
            replace('%1', deleteList.length),
            function(ok) {
              if (ok) {
                deleteNext();
              }
            });
      }
    }
  };
  menuOptions.push(deleteOption);

  Blockly.ContextMenu.show(e, menuOptions, this.RTL);
};

/**
 * Load an audio file.  Cache it, ready for instantaneous playing.
 * @param {!Array.<string>} filenames List of file types in decreasing order of
 *   preference (i.e. increasing size).  E.g. ['media/go.mp3', 'media/go.wav']
 *   Filenames include path from Blockly's root.  File extensions matter.
 * @param {string} name Name of sound.
 * @private
 */
Blockly.WorkspaceSvg.prototype.loadAudio_ = function(filenames, name) {
  if (!filenames.length) {
    return;
  }
  try {
    var audioTest = new window['Audio']();
  } catch(e) {
    // No browser support for Audio.
    // IE can throw an error even if the Audio object exists.
    return;
  }
  var sound;
  for (var i = 0; i < filenames.length; i++) {
    var filename = filenames[i];
    var ext = filename.match(/\.(\w+)$/);
    if (ext && audioTest.canPlayType('audio/' + ext[1])) {
      // Found an audio format we can play.
      sound = new window['Audio'](filename);
      break;
    }
  }
  if (sound && sound.play) {
    this.SOUNDS_[name] = sound;
  }
};

/**
 * Preload all the audio files so that they play quickly when asked for.
 * @private
 */
Blockly.WorkspaceSvg.prototype.preloadAudio_ = function() {
  for (var name in this.SOUNDS_) {
    var sound = this.SOUNDS_[name];
    sound.volume = .01;
    sound.play();
    sound.pause();
    // iOS can only process one sound at a time.  Trying to load more than one
    // corrupts the earlier ones.  Just load one and leave the others uncached.
    if (goog.userAgent.IPAD || goog.userAgent.IPHONE) {
      break;
    }
  }
};

/**
 * Play a named sound at specified volume.  If volume is not specified,
 * use full volume (1).
 * @param {string} name Name of sound.
 * @param {number=} opt_volume Volume of sound (0-1).
 */
Blockly.WorkspaceSvg.prototype.playAudio = function(name, opt_volume) {
  // Send a UI event in case we wish to play the sound externally
  var event = new Blockly.Events.Ui(null, 'sound', null, name);
  event.workspaceId = this.id;
  Blockly.Events.fire(event);
  var sound = this.SOUNDS_[name];
  if (sound) {
    // Don't play one sound on top of another.
    var now = new Date;
    if (now - this.lastSound_ < Blockly.SOUND_LIMIT) {
      return;
    }
    this.lastSound_ = now;
    var mySound;
    var ie9 = goog.userAgent.DOCUMENT_MODE &&
              goog.userAgent.DOCUMENT_MODE === 9;
    if (ie9 || goog.userAgent.IPAD || goog.userAgent.ANDROID) {
      // Creating a new audio node causes lag in IE9, Android and iPad. Android
      // and IE9 refetch the file from the server, iPad uses a singleton audio
      // node which must be deleted and recreated for each new audio tag.
      mySound = sound;
    } else {
      mySound = sound.cloneNode();
    }
    mySound.volume = (opt_volume === undefined ? 1 : opt_volume);
    mySound.play();
  } else if (this.options.parentWorkspace) {
    // Maybe a workspace on a lower level knows about this sound.
    this.options.parentWorkspace.playAudio(name, opt_volume);
  }
};

/**
 * Modify the block tree on the existing toolbox.
 * @param {Node|string} tree DOM tree of blocks, or text representation of same.
 */
Blockly.WorkspaceSvg.prototype.updateToolbox = function(tree) {
  tree = Blockly.Options.parseToolboxTree(tree);
  if (!tree) {
    if (this.options.languageTree) {
      throw 'Can\'t nullify an existing toolbox.';
    }
    return;  // No change (null to null).
  }
  if (!this.options.languageTree) {
    throw 'Existing toolbox is null.  Can\'t create new toolbox.';
  }
  if (tree.getElementsByTagName('category').length) {
    if (!this.toolbox_) {
      throw 'Existing toolbox has no categories.  Can\'t change mode.';
    }
    this.options.languageTree = tree;
    this.toolbox_.populate_(tree);
    this.toolbox_.addColour_();
  } else {
    if (!this.flyout_) {
      throw 'Existing toolbox has categories.  Can\'t change mode.';
    }
    this.options.languageTree = tree;
    this.flyout_.show(tree.childNodes);
  }
};

/**
 * Mark this workspace as the currently focused main workspace.
 */
Blockly.WorkspaceSvg.prototype.markFocused = function() {
  if (this.options.parentWorkspace) {
    this.options.parentWorkspace.markFocused();
  } else {
    Blockly.mainWorkspace = this;
  }
};

/**
 * Zooming the blocks centered in (x, y) coordinate with zooming in or out.
 * @param {number} x X coordinate of center.
 * @param {number} y Y coordinate of center.
 * @param {number} amount Amount of zooming
 *                        (negative zooms out and positive zooms in).
 */
Blockly.WorkspaceSvg.prototype.zoom = function(x, y, amount) {
  var speed = this.options.zoomOptions.scaleSpeed;
  var metrics = this.getMetrics();
  var center = this.getParentSvg().createSVGPoint();
  center.x = x;
  center.y = y;
  center = center.matrixTransform(this.getCanvas().getCTM().inverse());
  x = center.x;
  y = center.y;
  var canvas = this.getCanvas();
  // Scale factor.
  var scaleChange = Math.pow(speed, amount);
  // Clamp scale within valid range.
  var newScale = this.scale * scaleChange;
  if (newScale > this.options.zoomOptions.maxScale) {
    scaleChange = this.options.zoomOptions.maxScale / this.scale;
  } else if (newScale < this.options.zoomOptions.minScale) {
    scaleChange = this.options.zoomOptions.minScale / this.scale;
  }
  if (this.scale == newScale) {
    return;  // No change in zoom.
  }
  if (this.scrollbar) {
    var matrix = canvas.getCTM()
        .translate(x * (1 - scaleChange), y * (1 - scaleChange))
        .scale(scaleChange);
    // newScale and matrix.a should be identical (within a rounding error).
    this.scrollX = matrix.e - metrics.absoluteLeft;
    this.scrollY = matrix.f - metrics.absoluteTop;
  }
  this.setScale(newScale);
  // Hide the WidgetDiv without animation (zoom makes field out of place with div)
  Blockly.WidgetDiv.hide(true);
  Blockly.DropDownDiv.hideWithoutAnimation();
};

/**
 * Zooming the blocks centered in the center of view with zooming in or out.
 * @param {number} type Type of zooming (-1 zooming out and 1 zooming in).
 */
Blockly.WorkspaceSvg.prototype.zoomCenter = function(type) {
  var metrics = this.getMetrics();
  var x = metrics.viewWidth / 2;
  var y = metrics.viewHeight / 2;
  this.zoom(x, y, type);
};

/**
 * Zoom the blocks to fit in the workspace if possible.
 */
Blockly.WorkspaceSvg.prototype.zoomToFit = function() {
  var metrics = this.getMetrics();
  var blocksBox = this.getBlocksBoundingBox();
  var blocksWidth = blocksBox.width;
  var blocksHeight = blocksBox.height;
  if (!blocksWidth) {
    return;  // Prevents zooming to infinity.
  }
  var workspaceWidth = metrics.viewWidth;
  var workspaceHeight = metrics.viewHeight;
  if (this.flyout_) {
    workspaceWidth -= this.flyout_.width_;
  }
  if (!this.scrollbar) {
    // Origin point of 0,0 is fixed, blocks will not scroll to center.
    blocksWidth += metrics.contentLeft;
    blocksHeight += metrics.contentTop;
  }
  var ratioX = workspaceWidth / blocksWidth;
  var ratioY = workspaceHeight / blocksHeight;
  this.setScale(Math.min(ratioX, ratioY));
  this.scrollCenter();
};

/**
 * Center the workspace.
 */
Blockly.WorkspaceSvg.prototype.scrollCenter = function() {
  if (!this.scrollbar) {
    // Can't center a non-scrolling workspace.
    return;
  }
  // Hide the WidgetDiv without animation (zoom makes field out of place with div)
  Blockly.WidgetDiv.hide(true);
  Blockly.DropDownDiv.hideWithoutAnimation();
  Blockly.hideChaff(false);
  var metrics = this.getMetrics();
  var x = (metrics.contentWidth - metrics.viewWidth) / 2;
  if (this.flyout_) {
    x -= this.flyout_.width_ / 2;
  }
  var y = (metrics.contentHeight - metrics.viewHeight) / 2;
  this.scrollbar.set(x, y);
};

/**
 * Set the workspace's zoom factor.
 * @param {number} newScale Zoom factor.
 */
Blockly.WorkspaceSvg.prototype.setScale = function(newScale) {
  if (this.options.zoomOptions.maxScale &&
      newScale > this.options.zoomOptions.maxScale) {
    newScale = this.options.zoomOptions.maxScale;
  } else if (this.options.zoomOptions.minScale &&
      newScale < this.options.zoomOptions.minScale) {
    newScale = this.options.zoomOptions.minScale;
  }
  this.scale = newScale;
  this.updateStackGlowScale_();
  this.updateGridPattern_();
  // Hide the WidgetDiv without animation (zoom makes field out of place with div)
  Blockly.WidgetDiv.hide(true);
  Blockly.DropDownDiv.hideWithoutAnimation();
  if (this.scrollbar) {
    this.scrollbar.resize();
  } else {
    this.translate(this.scrollX, this.scrollY);
  }
  Blockly.hideChaff(false);
  if (this.flyout_) {
    // No toolbox, resize flyout.
    this.flyout_.reflow();
  }
};

/**
 * Scroll the workspace by a specified amount, keeping in the bounds.
 * Be sure to set this.startDragMetrics with cached metrics before calling.
 * @param {number} x Target X to scroll to
 * @param {number} y Target Y to scroll to
 */
Blockly.WorkspaceSvg.prototype.scroll = function(x, y) {
  var metrics = this.startDragMetrics; // Cached values
  x = Math.min(x, -metrics.contentLeft);
  y = Math.min(y, -metrics.contentTop);
  x = Math.max(x, metrics.viewWidth - metrics.contentLeft -
               metrics.contentWidth);
  y = Math.max(y, metrics.viewHeight - metrics.contentTop -
               metrics.contentHeight);
   // When the workspace starts scrolling, hide the WidgetDiv without animation.
   // This is to prevent a dispoal animation from happening in the wrong location.
  Blockly.WidgetDiv.hide(true);
  Blockly.DropDownDiv.hideWithoutAnimation();
  // Move the scrollbars and the page will scroll automatically.
  this.scrollbar.set(-x - metrics.contentLeft,
                     -y - metrics.contentTop);
};

/**
 * Updates the grid pattern.
 * @private
 */
Blockly.WorkspaceSvg.prototype.updateGridPattern_ = function() {
  if (!this.options.gridPattern) {
    return;  // No grid.
  }
  // MSIE freaks if it sees a 0x0 pattern, so set empty patterns to 100x100.
  var safeSpacing = (this.options.gridOptions['spacing'] * this.scale) || 100;
  this.options.gridPattern.setAttribute('width', safeSpacing);
  this.options.gridPattern.setAttribute('height', safeSpacing);
  var half = Math.floor(this.options.gridOptions['spacing'] / 2) + 0.5;
  var start = half - this.options.gridOptions['length'] / 2;
  var end = half + this.options.gridOptions['length'] / 2;
  var line1 = this.options.gridPattern.firstChild;
  var line2 = line1 && line1.nextSibling;
  half *= this.scale;
  start *= this.scale;
  end *= this.scale;
  if (line1) {
    line1.setAttribute('stroke-width', this.scale);
    line1.setAttribute('x1', start);
    line1.setAttribute('y1', half);
    line1.setAttribute('x2', end);
    line1.setAttribute('y2', half);
  }
  if (line2) {
    line2.setAttribute('stroke-width', this.scale);
    line2.setAttribute('x1', half);
    line2.setAttribute('y1', start);
    line2.setAttribute('x2', half);
    line2.setAttribute('y2', end);
  }
};

/**
 * Update the workspace's stack glow radius to be proportional to scale.
 * Ensures that stack glows always appear to be a fixed size.
 */
Blockly.WorkspaceSvg.prototype.updateStackGlowScale_ = function() {
  // No such def in the flyout workspace.
  if (this.options.stackGlowBlur) {
    this.options.stackGlowBlur.setAttribute('stdDeviation',
      Blockly.STACK_GLOW_RADIUS / this.scale
    );
  }
};

/**
 * Return an object with all the metrics required to size scrollbars for a
 * top level workspace.  The following properties are computed:
 * .viewHeight: Height of the visible rectangle,
 * .viewWidth: Width of the visible rectangle,
 * .contentHeight: Height of the contents,
 * .contentWidth: Width of the content,
 * .viewTop: Offset of top edge of visible rectangle from parent,
 * .viewLeft: Offset of left edge of visible rectangle from parent,
 * .contentTop: Offset of the top-most content from the y=0 coordinate,
 * .contentLeft: Offset of the left-most content from the x=0 coordinate.
 * .absoluteTop: Top-edge of view.
 * .absoluteLeft: Left-edge of view.
 * .toolboxWidth: Width of toolbox, if it exists.  Otherwise zero.
 * .toolboxHeight: Height of toolbox, if it exists.  Otherwise zero.
 * .flyoutWidth: Width of the flyout if it is always open.  Otherwise zero.
 * .flyoutHeight: Height of flyout if it is always open.  Otherwise zero.
 * .toolboxPosition: Top, bottom, left or right.
 * @return {!Object} Contains size and position metrics of a top level
 *   workspace.
 * @private
 * @this Blockly.WorkspaceSvg
 */
Blockly.WorkspaceSvg.getTopLevelWorkspaceMetrics_ = function() {
  var svgSize = Blockly.svgSize(this.getParentSvg());
  if (this.toolbox_) {
    if (this.toolboxPosition == Blockly.TOOLBOX_AT_TOP ||
        this.toolboxPosition == Blockly.TOOLBOX_AT_BOTTOM) {
      svgSize.height -= this.toolbox_.getHeight();
    } else if (this.toolboxPosition == Blockly.TOOLBOX_AT_LEFT ||
        this.toolboxPosition == Blockly.TOOLBOX_AT_RIGHT) {
      svgSize.width -= this.toolbox_.getWidth();
    }
  }
  // Set the margin to match the flyout's margin so that the workspace does
  // not jump as blocks are added.
  var MARGIN = Blockly.Flyout.prototype.CORNER_RADIUS - 1;
  var viewWidth = svgSize.width - MARGIN;
  var viewHeight = svgSize.height - MARGIN;
  var blockBox = this.getBlocksBoundingBox();

  // Fix scale.
  var contentWidth = blockBox.width * this.scale;
  var contentHeight = blockBox.height * this.scale;
  var contentX = blockBox.x * this.scale;
  var contentY = blockBox.y * this.scale;
  if (this.scrollbar) {
    // Add a border around the content that is at least half a screenful wide.
    // Ensure border is wide enough that blocks can scroll over entire screen.
    var leftEdge = Math.min(contentX - viewWidth / 2,
                            contentX + contentWidth - viewWidth);
    var rightEdge = Math.max(contentX + contentWidth + viewWidth / 2,
                             contentX + viewWidth);
    var topEdge = Math.min(contentY - viewHeight / 2,
                           contentY + contentHeight - viewHeight);
    var bottomEdge = Math.max(contentY + contentHeight + viewHeight / 2,
                              contentY + viewHeight);
  } else {
    var leftEdge = blockBox.x;
    var rightEdge = leftEdge + blockBox.width;
    var topEdge = blockBox.y;
    var bottomEdge = topEdge + blockBox.height;
  }
  var absoluteLeft = 0;
  if (this.toolbox_ && this.toolboxPosition == Blockly.TOOLBOX_AT_LEFT) {
    absoluteLeft = this.toolbox_.getWidth();
  }
  var absoluteTop = 0;
  if (this.toolbox_ && this.toolboxPosition == Blockly.TOOLBOX_AT_TOP) {
    absoluteTop = this.toolbox_.getHeight();
  }

  var metrics = {
    viewHeight: svgSize.height,
    viewWidth: svgSize.width,
    contentHeight: bottomEdge - topEdge,
    contentWidth: rightEdge - leftEdge,
    viewTop: -this.scrollY,
    viewLeft: -this.scrollX,
    contentTop: topEdge,
    contentLeft: leftEdge,
    absoluteTop: absoluteTop,
    absoluteLeft: absoluteLeft,
    toolboxWidth: this.toolbox_ ? this.toolbox_.getWidth() : 0,
    toolboxHeight: this.toolbox_ ? this.toolbox_.getHeight() : 0,
    flyoutWidth: this.flyout_ ? this.flyout_.getWidth() : 0,
    flyoutHeight: this.flyout_ ? this.flyout_.getHeight() : 0,
    toolboxPosition: this.toolboxPosition
  };
  return metrics;
};

/**
 * Sets the X/Y translations of a top level workspace to match the scrollbars.
 * @param {!Object} xyRatio Contains an x and/or y property which is a float
 *     between 0 and 1 specifying the degree of scrolling.
 * @private
 * @this Blockly.WorkspaceSvg
 */
Blockly.WorkspaceSvg.setTopLevelWorkspaceMetrics_ = function(xyRatio) {
  if (!this.scrollbar) {
    throw 'Attempt to set top level workspace scroll without scrollbars.';
  }
  var metrics = this.getMetrics();
  if (goog.isNumber(xyRatio.x)) {
    this.scrollX = -metrics.contentWidth * xyRatio.x - metrics.contentLeft;
  }
  if (goog.isNumber(xyRatio.y)) {
    this.scrollY = -metrics.contentHeight * xyRatio.y - metrics.contentTop;
  }
  var x = this.scrollX + metrics.absoluteLeft;
  var y = this.scrollY + metrics.absoluteTop;
  this.translate(x, y);
  if (this.options.gridPattern) {
    this.options.gridPattern.setAttribute('x', x);
    this.options.gridPattern.setAttribute('y', y);
    if (goog.userAgent.IE || goog.userAgent.EDGE) {
      // IE/Edge doesn't notice that the x/y offsets have changed.
      // Force an update.
      this.updateGridPattern_();
    }
  }
};

/**
 * Update whether this workspace has resizes enabled.
 * If enabled, workspace will resize when appropriate.
 * If disabled, workspace will not resize until re-enabled.
 * Use to avoid resizing during a batch operation, for performance.
 * @param {boolean} enabled Whether resizes should be enabled.
 */
Blockly.WorkspaceSvg.prototype.setResizesEnabled = function(enabled) {
  var reenabled = (!this.resizesEnabled_ && enabled);
  this.resizesEnabled_ = enabled;
  if (reenabled) {
    // Newly enabled.  Trigger a resize.
    this.resizeContents();
  }
};

/**
 * Dispose of all blocks in workspace, with an optimization to prevent resizes.
 */
Blockly.WorkspaceSvg.prototype.clear = function() {
  this.setResizesEnabled(false);
  Blockly.WorkspaceSvg.superClass_.clear.call(this);
  this.setResizesEnabled(true);
};

/**
 * Register a callback function associated with a given key, for clicks on
 * buttons and labels in the flyout.
 * For instance, a button specified by the XML
 * <button text="create variable" callbackKey="CREATE_VARIABLE"></button>
 * should be matched by a call to
 * registerButtonCallback("CREATE_VARIABLE", yourCallbackFunction).
 * @param {string} key The name to use to look up this function.
 * @param {function(!Blockly.FlyoutButton)} func The function to call when the
 *     given button is clicked.
 */
Blockly.WorkspaceSvg.prototype.registerButtonCallback = function(key, func) {
  this.flyoutButtonCallbacks_[key] = func;
};

/**
 * Get the callback function associated with a given key, for clicks on buttons
 * and labels in the flyout.
 * @param {string} key The name to use to look up the function.
 * @return {function(!Blockly.FlyoutButton)} The function corresponding to the
 *     given key for this workspace.
 */
Blockly.WorkspaceSvg.prototype.getButtonCallback = function(key) {
  return this.flyoutButtonCallbacks_[key];
};

// Export symbols that would otherwise be renamed by Closure compiler.
Blockly.WorkspaceSvg.prototype['setVisible'] =
    Blockly.WorkspaceSvg.prototype.setVisible;
