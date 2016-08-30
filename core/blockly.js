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
 * @fileoverview Core JavaScript library for Blockly.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

// Top level object for Blockly.
goog.provide('Blockly');

goog.require('Blockly.BlockSvg.render');
goog.require('Blockly.DropDownDiv');
goog.require('Blockly.Events');
goog.require('Blockly.FieldAngle');
goog.require('Blockly.FieldCheckbox');
goog.require('Blockly.FieldColour');
// Date picker commented out since it increases footprint by 60%.
// Add it only if you need it.
//goog.require('Blockly.FieldDate');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldIconMenu');
goog.require('Blockly.FieldImage');
goog.require('Blockly.FieldTextInput');
goog.require('Blockly.FieldNumber');
goog.require('Blockly.FieldVariable');
goog.require('Blockly.Generator');
goog.require('Blockly.Msg');
goog.require('Blockly.Procedures');
goog.require('Blockly.Toolbox');
goog.require('Blockly.WidgetDiv');
goog.require('Blockly.WorkspaceSvg');
goog.require('Blockly.constants');
goog.require('Blockly.inject');
goog.require('Blockly.utils');
goog.require('goog.color');
goog.require('goog.userAgent');


// Turn off debugging when compiled.
/* eslint-disable no-unused-vars */
var CLOSURE_DEFINES = {'goog.DEBUG': false};
/* eslint-enable no-unused-vars */

/**
 * The main workspace most recently used.
 * Set by Blockly.WorkspaceSvg.prototype.markFocused
 * @type {Blockly.Workspace}
 */
Blockly.mainWorkspace = null;

/**
 * Currently selected block.
 * @type {Blockly.Block}
 */
Blockly.selected = null;

/**
 * Currently highlighted connection (during a drag).
 * @type {Blockly.Connection}
 * @private
 */
Blockly.highlightedConnection_ = null;

/**
 * Connection on dragged block that matches the highlighted connection.
 * @type {Blockly.Connection}
 * @private
 */
Blockly.localConnection_ = null;

/**
 * All of the connections on blocks that are currently being dragged.
 * @type {!Array.<!Blockly.Connection>}
 * @private
 */
Blockly.draggingConnections_ = [];

/**
 * Connection on the insertion marker block that matches
 * Blockly.localConnection_ on the dragged block.
 * @type {Blockly.Connection}
 * @private
 */
Blockly.insertionMarkerConnection_ = null;

/**
 * Grayed-out block that indicates to the user what will happen if they release
 * a drag immediately.
 * @type {Blockly.Block}
 * @private
 */
Blockly.insertionMarker_ = null;

/**
 * The block that will be replaced if the drag is released immediately.  Should
 * be visually highlighted to indicate this to the user.
 * @type {Blockly.Block}
 * @private
 */
Blockly.replacementMarker_ = null;

/**
 * Connection that was bumped out of the way by an insertion marker, and may
 * need to be put back as the drag continues.
 * @type {Blockly.Connection}
 * @private
 */
Blockly.bumpedConnection_ = null;

/**
 * Contents of the local clipboard.
 * @type {Element}
 * @private
 */
Blockly.clipboardXml_ = null;

/**
 * Source of the local clipboard.
 * @type {Blockly.WorkspaceSvg}
 * @private
 */
Blockly.clipboardSource_ = null;

/**
 * Is the mouse dragging a block?
 * DRAG_NONE - No drag operation.
 * DRAG_STICKY - Still inside the sticky DRAG_RADIUS.
 * DRAG_FREE - Freely draggable.
 * @private
 */
Blockly.dragMode_ = Blockly.DRAG_NONE;

/**
 * Wrapper function called when a touch mouseUp occurs during a drag operation.
 * @type {Array.<!Array>}
 * @private
 */
Blockly.onTouchUpWrapper_ = null;

/**
 * Convert a hue (HSV model) into an RGB hex triplet.
 * @param {number} hue Hue on a colour wheel (0-360).
 * @return {string} RGB code, e.g. '#5ba65b'.
 */
Blockly.hueToRgb = function(hue) {
  return goog.color.hsvToHex(hue, Blockly.HSV_SATURATION,
      Blockly.HSV_VALUE * 255);
};

/**
 * Returns the dimensions of the specified SVG image.
 * @param {!Element} svg SVG image.
 * @return {!Object} Contains width and height properties.
 */
Blockly.svgSize = function(svg) {
  return {width: svg.cachedWidth_,
          height: svg.cachedHeight_};
};

/**
 * Size the workspace when the contents change.  This also updates
 * scrollbars accordingly.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace to resize.
 */
Blockly.resizeSvgContents = function(workspace) {
  workspace.resizeContents();
};


/**
 * Size the SVG image to completely fill its container. Call this when the view
 * actually changes sizes (e.g. on a window resize/device orientation change).
 * See Blockly.resizeSvgContents to resize the workspace when the contents
 * change (e.g. when a block is added or removed).
 * Record the height/width of the SVG image.
 * @param {!Blockly.WorkspaceSvg} workspace Any workspace in the SVG.
 */
Blockly.svgResize = function(workspace) {
  var mainWorkspace = workspace;
  while (mainWorkspace.options.parentWorkspace) {
    mainWorkspace = mainWorkspace.options.parentWorkspace;
  }
  var svg = mainWorkspace.getParentSvg();
  var div = svg.parentNode;
  if (!div) {
    // Workspace deleted, or something.
    return;
  }
  var width = div.offsetWidth;
  var height = div.offsetHeight;
  if (svg.cachedWidth_ != width) {
    svg.setAttribute('width', width + 'px');
    svg.cachedWidth_ = width;
  }
  if (svg.cachedHeight_ != height) {
    svg.setAttribute('height', height + 'px');
    svg.cachedHeight_ = height;
  }
  mainWorkspace.resize();
};

/**
 * Handle a mouse-up anywhere on the page.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.onMouseUp_ = function(/*e*/) {
  var workspace = Blockly.getMainWorkspace();
  Blockly.Css.setCursor(Blockly.Css.Cursor.OPEN);
  workspace.dragMode_ = Blockly.DRAG_NONE;
  // Unbind the touch event if it exists.
  if (Blockly.onTouchUpWrapper_) {
    Blockly.unbindEvent_(Blockly.onTouchUpWrapper_);
    Blockly.onTouchUpWrapper_ = null;
  }
  if (Blockly.onMouseMoveWrapper_) {
    Blockly.unbindEvent_(Blockly.onMouseMoveWrapper_);
    Blockly.onMouseMoveWrapper_ = null;
  }
};

/**
 * Handle a mouse-move on SVG drawing surface.
 * @param {!Event} e Mouse move event.
 * @private
 */
Blockly.onMouseMove_ = function(e) {
  if (e.touches && e.touches.length >= 2) {
    return;  // Multi-touch gestures won't have e.clientX.
  }
  var workspace = Blockly.getMainWorkspace();
  if (workspace.dragMode_ != Blockly.DRAG_NONE) {
    var dx = e.clientX - workspace.startDragMouseX;
    var dy = e.clientY - workspace.startDragMouseY;
    var x = workspace.startScrollX + dx;
    var y = workspace.startScrollY + dy;
    workspace.scroll(x, y);
    // Cancel the long-press if the drag has moved too far.
    if (Math.sqrt(dx * dx + dy * dy) > Blockly.DRAG_RADIUS) {
      Blockly.longStop_();
      workspace.dragMode_ = Blockly.DRAG_FREE;
    }
    e.stopPropagation();
    e.preventDefault();
  }
};

/**
 * Handle a key-down on SVG drawing surface.
 * @param {!Event} e Key down event.
 * @private
 */
Blockly.onKeyDown_ = function(e) {
  if (Blockly.mainWorkspace.options.readOnly || Blockly.isTargetInput_(e)) {
    // No key actions on readonly workspaces.
    // When focused on an HTML text input widget, don't trap any keys.
    return;
  }
  if (e.keyCode == 27) {
    // Pressing esc closes the context menu and any drop-down
    Blockly.hideChaff();
    Blockly.DropDownDiv.hide();
  } else if (e.keyCode == 8 || e.keyCode == 46) {
    // Delete or backspace.
    // Stop the browser from going back to the previous page.
    e.preventDefault();
  } else if (e.altKey || e.ctrlKey || e.metaKey) {
    if (Blockly.selected &&
        Blockly.selected.isDeletable() && Blockly.selected.isMovable()) {
      if (e.keyCode == 67) {
        // 'c' for copy.
        Blockly.hideChaff();
        Blockly.copy_(Blockly.selected);
      } else if (e.keyCode == 88) {
        // 'x' for cut.
        Blockly.copy_(Blockly.selected);
        Blockly.hideChaff();
        var heal = Blockly.dragMode_ != Blockly.DRAG_FREE;
        Blockly.selected.dispose(heal, true);
        if (Blockly.highlightedConnection_) {
          Blockly.highlightedConnection_.unhighlight();
          Blockly.highlightedConnection_ = null;
        }
      }
    }
    if (e.keyCode == 86) {
      // 'v' for paste.
      if (Blockly.clipboardXml_) {
        Blockly.Events.setGroup(true);
        Blockly.clipboardSource_.paste(Blockly.clipboardXml_);
        Blockly.Events.setGroup(false);
      }
    } else if (e.keyCode == 90) {
      // 'z' for undo 'Z' is for redo.
      Blockly.hideChaff();
      Blockly.mainWorkspace.undo(e.shiftKey);
    }
  }
};

/**
 * Stop binding to the global mouseup and mousemove events.
 * @private
 */
Blockly.terminateDrag_ = function() {
  Blockly.BlockSvg.terminateDrag();
  Blockly.Flyout.terminateDrag_();
};

/**
 * PID of queued long-press task.
 * @private
 */
Blockly.longPid_ = 0;

/**
 * Context menus on touch devices are activated using a long-press.
 * Unfortunately the contextmenu touch event is currently (2015) only suported
 * by Chrome.  This function is fired on any touchstart event, queues a task,
 * which after about a second opens the context menu.  The tasks is killed
 * if the touch event terminates early.
 * @param {!Event} e Touch start event.
 * @param {!Blockly.Block|!Blockly.WorkspaceSvg} uiObject The block or workspace
 *   under the touchstart event.
 * @private
 */
Blockly.longStart_ = function(e, uiObject) {
  Blockly.longStop_();
  Blockly.longPid_ = setTimeout(function() {
    e.button = 2;  // Simulate a right button click.
    uiObject.onMouseDown_(e);
  }, Blockly.LONGPRESS);
};

/**
 * Nope, that's not a long-press.  Either touchend or touchcancel was fired,
 * or a drag hath begun.  Kill the queued long-press task.
 * @private
 */
Blockly.longStop_ = function() {
  if (Blockly.longPid_) {
    clearTimeout(Blockly.longPid_);
    Blockly.longPid_ = 0;
  }
};

/**
 * Copy a block onto the local clipboard.
 * @param {!Blockly.Block} block Block to be copied.
 * @private
 */
Blockly.copy_ = function(block) {
  var xmlBlock = Blockly.Xml.blockToDom(block);
  if (Blockly.dragMode_ != Blockly.DRAG_FREE) {
    Blockly.Xml.deleteNext(xmlBlock);
  }
  // Encode start position in XML.
  var xy = block.getRelativeToSurfaceXY();
  xmlBlock.setAttribute('x', block.RTL ? -xy.x : xy.x);
  xmlBlock.setAttribute('y', xy.y);
  Blockly.clipboardXml_ = xmlBlock;
  Blockly.clipboardSource_ = block.workspace;
};

/**
 * Duplicate this block and its children.
 * @param {!Blockly.Block} block Block to be copied.
 * @private
 */
Blockly.duplicate_ = function(block) {
  // Save the clipboard.
  var clipboardXml = Blockly.clipboardXml_;
  var clipboardSource = Blockly.clipboardSource_;

  // Create a duplicate via a copy/paste operation.
  Blockly.copy_(block);
  block.workspace.paste(Blockly.clipboardXml_);

  // Restore the clipboard.
  Blockly.clipboardXml_ = clipboardXml;
  Blockly.clipboardSource_ = clipboardSource;
};

/**
 * Cancel the native context menu, unless the focus is on an HTML input widget.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.onContextMenu_ = function(e) {
  if (!Blockly.isTargetInput_(e)) {
    // When focused on an HTML text input widget, don't cancel the context menu.
    e.preventDefault();
  }
};

/**
 * Close tooltips, context menus, dropdown selections, etc.
 * @param {boolean=} opt_allowToolbox If true, don't close the toolbox.
 */
Blockly.hideChaff = function(opt_allowToolbox) {
  Blockly.Tooltip.hide();
  Blockly.WidgetDiv.hide();
  if (!opt_allowToolbox) {
    var workspace = Blockly.getMainWorkspace();
    if (workspace.toolbox_ &&
        workspace.toolbox_.flyout_ &&
        workspace.toolbox_.flyout_.autoClose) {
      workspace.toolbox_.clearSelection();
    }
  }
};

/**
 * Return an object with all the metrics required to size scrollbars for the
 * main workspace.  The following properties are computed:
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
 * @return {Object} Contains size and position metrics of main workspace.
 * @private
 * @this Blockly.WorkspaceSvg
 */
Blockly.getMainWorkspaceMetrics_ = function() {
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
 * Sets the X/Y translations of the main workspace to match the scrollbars.
 * @param {!Object} xyRatio Contains an x and/or y property which is a float
 *     between 0 and 1 specifying the degree of scrolling.
 * @private
 * @this Blockly.WorkspaceSvg
 */
Blockly.setMainWorkspaceMetrics_ = function(xyRatio) {
  if (!this.scrollbar) {
    throw 'Attempt to set main workspace scroll without scrollbars.';
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
    if (goog.userAgent.IE) {
      // IE doesn't notice that the x/y offsets have changed.  Force an update.
      this.updateGridPattern_();
    }
  }
};

/**
 * Returns the main workspace.  Returns the last used main workspace (based on
 * focus).  Try not to use this function, particularly if there are multiple
 * Blockly instances on a page.
 * @return {!Blockly.Workspace} The main workspace.
 */
Blockly.getMainWorkspace = function() {
  return Blockly.mainWorkspace;
};

// IE9 does not have a console.  Create a stub to stop errors.
if (!goog.global['console']) {
  goog.global['console'] = {
    'log': function() {},
    'warn': function() {}
  };
}

// Export symbols that would otherwise be renamed by Closure compiler.
if (!goog.global['Blockly']) {
  goog.global['Blockly'] = {};
}
goog.global['Blockly']['getMainWorkspace'] = Blockly.getMainWorkspace;
