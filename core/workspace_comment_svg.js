/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2017 Google Inc.
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
 * @fileoverview Object representing a code comment on a rendered workspace.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.WorkspaceCommentSvg');

goog.require('Blockly.Events.CommentCreate');
goog.require('Blockly.Events.CommentDelete');
goog.require('Blockly.Events.CommentMove');
goog.require('Blockly.WorkspaceComment');


/**
 * Class for a workspace comment's SVG representation.
 * @param {!Blockly.Workspace} workspace The block's workspace.
 * @param {string} content The content of this workspace comment.
 * @param {number} height Height of the comment.
 * @param {number} width Width of the comment.
 * @param {boolean} minimized Whether this comment is minimized.
 * @param {string=} opt_id Optional ID.  Use this ID if provided, otherwise
 *     create a new ID.
 * @extends {Blockly.WorkspaceComment}
 * @constructor
 */
Blockly.WorkspaceCommentSvg = function(workspace, content, height, width, minimized,
    opt_id) {
  // Create core elements for the block.
  /**
   * @type {SVGElement}
   * @private
   */
  this.svgGroup_ = Blockly.utils.createSvgElement(
      'g', {}, null);
  this.svgGroup_.translate_ = '';

  this.svgRect_ = Blockly.utils.createSvgElement(
      'rect',
      {
        'class': 'scratchCommentRect scratchWorkspaceCommentBorder',
        'x': 0,
        'y': 0,
        'rx': 4 * Blockly.WorkspaceCommentSvg.BORDER_WIDTH,
        'ry': 4 * Blockly.WorkspaceCommentSvg.BORDER_WIDTH
      });
  this.svgGroup_.appendChild(this.svgRect_);


  /**
   * Whether the comment is rendered onscreen and is a part of the DOM.
   * @type {boolean}
   * @private
   */
  this.rendered_ = false;

  /**
   * Whether to move the comment to the drag surface when it is dragged.
   * True if it should move, false if it should be translated directly.
   * @type {boolean}
   * @private
   */
  this.useDragSurface_ =
      Blockly.utils.is3dSupported() && !!workspace.blockDragSurface_;

  Blockly.WorkspaceCommentSvg.superClass_.constructor.call(this,
      workspace, content, height, width, minimized, opt_id);

  this.render();
}; goog.inherits(Blockly.WorkspaceCommentSvg, Blockly.WorkspaceComment);

/**
 * The width and height to use to size a workspace comment when it is first
 * added, before it has been edited by the user.
 * @type {number}
 * @package
 */
Blockly.WorkspaceCommentSvg.DEFAULT_SIZE = 200;

/**
 * Dispose of this comment.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.dispose = function() {
  if (!this.workspace) {
    // The comment has already been deleted.
    return;
  }
  // If this comment is being deleted, unlink the mouse events.
  if (Blockly.selected == this) {
    this.unselect();
    this.workspace.cancelCurrentGesture();
  }

  if (Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.CommentDelete(this));
  }

  goog.dom.removeNode(this.svgGroup_);
  // Sever JavaScript to DOM connections.
  this.svgGroup_ = null;
  this.svgRect_ = null;
  // Dispose of any rendered components
  this.disposeInternal_();

  Blockly.Events.disable();
  Blockly.WorkspaceCommentSvg.superClass_.dispose.call(this);
  Blockly.Events.enable();
};

/**
 * Create and initialize the SVG representation of a workspace comment.
 * May be called more than once.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.initSvg = function() {
  goog.asserts.assert(this.workspace.rendered, 'Workspace is headless.');
  if (!this.workspace.options.readOnly && !this.eventsInit_) {
    Blockly.bindEventWithChecks_(
        this.svgRectTarget_, 'mousedown', this, this.pathMouseDown_);
    Blockly.bindEventWithChecks_(
        this.svgHandleTarget_, 'mousedown', this, this.pathMouseDown_);
  }
  this.eventsInit_ = true;

  this.updateMovable();
  if (!this.getSvgRoot().parentNode) {
    this.workspace.getBubbleCanvas().appendChild(this.getSvgRoot());
  }
};

/**
 * Handle a mouse-down on an SVG comment.
 * @param {!Event} e Mouse down event or touch start event.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.pathMouseDown_ = function(e) {
  var gesture = this.workspace.getGesture(e);
  if (gesture) {
    gesture.handleBubbleStart(e, this);
  }
};

/**
 * Show the context menu for this workspace comment.
 * @param {!Event} e Mouse event.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.showContextMenu_ = function(e) {
  if (this.workspace.options.readOnly) {
    return;
  }
  // Save the current workspace comment in a variable for use in closures.
  var comment = this;
  var menuOptions = [];

  if (this.isDeletable() && this.isMovable()) {
    menuOptions.push(Blockly.ContextMenu.commentDuplicateOption(comment, e));
    menuOptions.push(Blockly.ContextMenu.commentDeleteOption(comment));
  }

  Blockly.ContextMenu.show(e, menuOptions, this.RTL);
};

/**
 * Select this comment.  Highlight it visually.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.select = function() {
  if (Blockly.selected == this) {
    return;
  }
  var oldId = null;
  if (Blockly.selected) {
    oldId = Blockly.selected.id;
    // Unselect any previously selected block or comment.
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
 * Unselect this comment.  Remove its highlighting.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.unselect = function() {
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
 * Select this comment.  Highlight it visually.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.addSelect = function() {
  Blockly.utils.addClass(
      /** @type {!Element} */ (this.svgGroup_), 'blocklySelected');
  this.setFocus();
};

/**
 * Unselect this comment.  Remove its highlighting.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.removeSelect = function() {
  Blockly.utils.removeClass(
      /** @type {!Element} */ (this.svgGroup_), 'blocklySelected');
  this.blurFocus();
};

/**
 * Focus this comment.  Highlight it visually.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.addFocus = function() {
  Blockly.utils.addClass(
      /** @type {!Element} */ (this.svgGroup_), 'blocklyFocused');
};

/**
 * Unfocus this comment.  Remove its highlighting.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.removeFocus = function() {
  Blockly.utils.removeClass(
      /** @type {!Element} */ (this.svgGroup_), 'blocklyFocused');
};

/**
 * Return the coordinates of the top-left corner of this comment relative to the
 * drawing surface's origin (0,0), in workspace units.
 * If the comment is on the workspace, (0, 0) is the origin of the workspace
 * coordinate system.
 * This does not change with workspace scale.
 * @return {!goog.math.Coordinate} Object with .x and .y properties in
 *     workspace coordinates.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.getRelativeToSurfaceXY = function() {
  var x = 0;
  var y = 0;

  var dragSurfaceGroup = this.useDragSurface_ ?
      this.workspace.blockDragSurface_.getGroup() : null;

  var element = this.getSvgRoot();
  if (element) {
    do {
      // Loop through this comment and every parent.
      var xy = Blockly.utils.getRelativeXY(element);
      x += xy.x;
      y += xy.y;
      // If this element is the current element on the drag surface, include
      // the translation of the drag surface itself.
      if (this.useDragSurface_ &&
          this.workspace.blockDragSurface_.getCurrentBlock() == element) {
        var surfaceTranslation =
            this.workspace.blockDragSurface_.getSurfaceTranslation();
        x += surfaceTranslation.x;
        y += surfaceTranslation.y;
      }
      element = element.parentNode;
    } while (element && element != this.workspace.getBubbleCanvas() &&
        element != dragSurfaceGroup);
  }
  this.xy_ = new goog.math.Coordinate(x, y);
  return this.xy_;
};

/**
 * Move a comment by a relative offset.
 * @param {number} dx Horizontal offset, in workspace units.
 * @param {number} dy Vertical offset, in workspace units.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.moveBy = function(dx, dy) {
  var event = new Blockly.Events.CommentMove(this);
  // TODO: Do I need to look up the relative to surface XY position here?
  var xy = this.getRelativeToSurfaceXY();
  this.translate(xy.x + dx, xy.y + dy);
  event.recordNew();
  Blockly.Events.fire(event);
  this.workspace.resizeContents();
};

/**
 * Transforms a comment by setting the translation on the transform attribute
 * of the block's SVG.
 * @param {number} x The x coordinate of the translation in workspace units.
 * @param {number} y The y coordinate of the translation in workspace units.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.translate = function(x, y) {
  this.xy_ = new goog.math.Coordinate(x, y);
  this.getSvgRoot().setAttribute('transform',
      'translate(' + x + ',' + y + ')');
};

/**
 * Move this comment to its workspace's drag surface, accounting for positioning.
 * Generally should be called at the same time as setDragging(true).
 * Does nothing if useDragSurface_ is false.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.moveToDragSurface_ = function() {
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
 * Move this comment back to the workspace block canvas.
 * Generally should be called at the same time as setDragging(false).
 * Does nothing if useDragSurface_ is false.
 * @param {!goog.math.Coordinate} newXY The position the comment should take on
 *     on the workspace canvas, in workspace coordinates.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.moveOffDragSurface_ = function(newXY) {
  if (!this.useDragSurface_) {
    return;
  }
  // Translate to current position, turning off 3d.
  this.translate(newXY.x, newXY.y);
  this.workspace.blockDragSurface_.clearAndHide(this.workspace.getCanvas());
};

/**
 * Move this comment during a drag, taking into account whether we are using a
 * drag surface to translate blocks.
 * @param {?Blockly.BlockDragSurfaceSvg} dragSurface The surface that carries
 *     rendered items during a drag, or null if no drag surface is in use.
 * @param {!goog.math.Coordinate} newLoc The location to translate to, in
 *     workspace coordinates.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.moveDuringDrag = function(dragSurface, newLoc) {
  if (dragSurface) {
    dragSurface.translateSurface(newLoc.x, newLoc.y);
  } else {
    this.svgGroup_.translate_ = 'translate(' + newLoc.x + ',' + newLoc.y + ')';
    this.svgGroup_.setAttribute('transform',
        this.svgGroup_.translate_ + this.svgGroup_.skew_);
  }
};

/**
 * Move the bubble group to the specified location in workspace coordinates.
 * @param {number} x The x position to move to.
 * @param {number} y The y position to move to.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.moveTo = function(x, y) {
  this.translate(x, y);
};

/**
 * Clear the comment of transform="..." attributes.
 * Used when the comment is switching from 3d to 2d transform or vice versa.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.clearTransformAttributes_ = function() {
  Blockly.utils.removeAttribute(this.getSvgRoot(), 'transform');
};

/**
 * Return the rendered size of the comment or the stored size if the comment is
 * not rendered. This differs from getHeightWidth in the behavior of rendered
 * minimized comments. This function reports the actual size of the minimized
 * comment instead of the full sized comment height/width.
 * @return {!{height: number, width: number}} Object with height and width
 *    properties in workspace units.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.getBubbleSize = function() {
  if (this.rendered_) {
    return {
      width: parseInt(this.svgRect_.getAttribute('width')),
      height: parseInt(this.svgRect_.getAttribute('height'))
    };
  } else {
    this.getHeightWidth();
  }
};

/**
 * Returns the coordinates of a bounding box describing the dimensions of this
 * comment.
 * Coordinate system: workspace coordinates.
 * @return {!{topLeft: goog.math.Coordinate, bottomRight: goog.math.Coordinate}}
 *    Object with top left and bottom right coordinates of the bounding box.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.getBoundingRectangle = function() {
  var blockXY = this.getRelativeToSurfaceXY();
  var commentBounds = this.getHeightWidth();
  var topLeft;
  var bottomRight;
  if (this.RTL) {
    topLeft = new goog.math.Coordinate(blockXY.x - (commentBounds.width),
        blockXY.y);
    // Add the width of the tab/puzzle piece knob to the x coordinate
    // since X is the corner of the rectangle, not the whole puzzle piece.
    bottomRight = new goog.math.Coordinate(blockXY.x,
        blockXY.y + commentBounds.height);
  } else {
    // Subtract the width of the tab/puzzle piece knob to the x coordinate
    // since X is the corner of the rectangle, not the whole puzzle piece.
    topLeft = new goog.math.Coordinate(blockXY.x, blockXY.y);
    bottomRight = new goog.math.Coordinate(blockXY.x + commentBounds.width,
        blockXY.y + commentBounds.height);
  }
  return {topLeft: topLeft, bottomRight: bottomRight};
};

/**
 * Add or remove the UI indicating if this comment is movable or not.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.updateMovable = function() {
  if (this.isMovable()) {
    Blockly.utils.addClass(
        /** @type {!Element} */ (this.svgGroup_), 'blocklyDraggable');
  } else {
    Blockly.utils.removeClass(
        /** @type {!Element} */ (this.svgGroup_), 'blocklyDraggable');
  }
};

/**
 * Set whether this comment is movable or not.
 * @param {boolean} movable True if movable.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.setMovable = function(movable) {
  Blockly.WorkspaceCommentSvg.superClass_.setMovable.call(this, movable);
  this.updateMovable();
};

/**
 * Recursively adds or removes the dragging class to this node and its children.
 * @param {boolean} adding True if adding, false if removing.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.setDragging = function(adding) {
  if (adding) {
    var group = this.getSvgRoot();
    group.translate_ = '';
    group.skew_ = '';
    Blockly.utils.addClass(
        /** @type {!Element} */ (this.svgGroup_), 'blocklyDragging');
  } else {
    Blockly.utils.removeClass(
        /** @type {!Element} */ (this.svgGroup_), 'blocklyDragging');
  }
};

/**
 * Return the root node of the SVG or null if none exists.
 * @return {Element} The root SVG node (probably a group).
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.getSvgRoot = function() {
  return this.svgGroup_;
};

/**
 * Returns this comment's text.
 * @return {string} Comment text.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.getText = function() {
  return this.textarea_ ? this.textarea_.value : this.content_;
};

/**
 * Set this comment's text.
 * @param {string} text Comment text.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.setText = function(text) {
  Blockly.WorkspaceCommentSvg.superClass_.setText.call(this, text);
  if (this.textarea_) {
    this.textarea_.value = text;
  }
};

/**
 * Update the cursor over this comment by adding or removing a class.
 * @param {boolean} enable True if the delete cursor should be shown, false
 *     otherwise.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.setDeleteStyle = function(enable) {
  if (enable) {
    Blockly.utils.addClass(
        /** @type {!Element} */ (this.svgGroup_), 'blocklyDraggingDelete');
  } else {
    Blockly.utils.removeClass(
        /** @type {!Element} */ (this.svgGroup_), 'blocklyDraggingDelete');
  }
};

Blockly.WorkspaceCommentSvg.prototype.setAutoLayout = function() {
  // NOP for compatibility with the bubble dragger.
};

/**
 * Decode an XML comment tag and create a rendered comment on the workspace.
 * @param {!Element} xmlComment XML comment element.
 * @param {!Blockly.Workspace} workspace The workspace.
 * @param {number=} opt_wsWidth The width of the workspace, which is used to
 *     position comments correctly in RTL.
 * @return {!Blockly.WorkspaceCommentSvg} The created workspace comment.
 * @package
 */
Blockly.WorkspaceCommentSvg.fromXml = function(xmlComment, workspace,
    opt_wsWidth) {
  Blockly.Events.disable();
  try {
    var info = Blockly.WorkspaceComment.parseAttributes(xmlComment);

    var comment = new Blockly.WorkspaceCommentSvg(workspace,
        info.content, info.h, info.w, info.minimized, info.id);
    if (workspace.rendered) {
      comment.initSvg();
      comment.render(false);
    }
    // Position the comment correctly, taking into account the width of a
    // rendered RTL workspace.
    if (!isNaN(info.x) && !isNaN(info.y)) {
      if (workspace.RTL) {
        var wsWidth = opt_wsWidth || workspace.getWidth();
        comment.moveBy(wsWidth - info.x, info.y);
      } else {
        comment.moveBy(info.x, info.y);
      }
    }
  } finally {
    Blockly.Events.enable();
  }
  Blockly.WorkspaceComment.fireCreateEvent(comment);

  return comment;
};

/**
 * Encode a comment subtree as XML with XY coordinates.
 * @param {boolean=} opt_noId True if the encoder should skip the comment id.
 * @return {!Element} Tree of XML elements.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.toXmlWithXY = function(opt_noId) {
  var width;  // Not used in LTR.
  if (this.workspace.RTL) {
    // Here be performance dragons: This calls getMetrics().
    width = this.workspace.getWidth();
  }
  var element = this.toXml(opt_noId);
  var xy = this.getRelativeToSurfaceXY();
  element.setAttribute('x',
      Math.round(this.workspace.RTL ? width - xy.x : xy.x));
  element.setAttribute('y', Math.round(xy.y));
  element.setAttribute('h', this.getHeight());
  element.setAttribute('w', this.getWidth());
  return element;
};
