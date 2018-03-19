/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2013 Google Inc.
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
 * @fileoverview A div that floats on top of Blockly.  This singleton contains
 *     temporary HTML UI widgets that the user is currently interacting with.
 *     E.g. text input areas, colour pickers, context menus.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * @name Blockly.WidgetDiv
 * @namespace
 **/
goog.provide('Blockly.WidgetDiv');

goog.require('Blockly.Css');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.style');


/**
 * The HTML container.  Set once by Blockly.WidgetDiv.createDom.
 * @type {Element}
 */
Blockly.WidgetDiv.DIV = null;

/**
 * The object currently using this container.
 * @type {Object}
 * @private
 */
Blockly.WidgetDiv.owner_ = null;

/**
 * Optional cleanup function set by whichever object uses the widget.
 * This is called as soon as a dispose is desired. If the dispose should
 * be animated, the animation should start on the call of dispose_.
 * @type {Function}
 * @private
 */
Blockly.WidgetDiv.dispose_ = null;

/**
 * Optional function called at the end of a dispose animation.
 * Set by whichever object is using the widget.
 * @type {Function}
 * @private
 */
Blockly.WidgetDiv.disposeAnimationFinished_ = null;

/**
 * Timer ID for the dispose animation.
 * @type {number}
 * @private
 */
Blockly.WidgetDiv.disposeAnimationTimer_ = null;

/**
 * Length of time in seconds for the dispose animation.
 * @type {number}
 * @private
 */
Blockly.WidgetDiv.disposeAnimationTimerLength_ = 0;


/**
 * Create the widget div and inject it onto the page.
 */
Blockly.WidgetDiv.createDom = function() {
  if (Blockly.WidgetDiv.DIV) {
    return;  // Already created.
  }
  // Create an HTML container for popup overlays (e.g. editor widgets).
  Blockly.WidgetDiv.DIV =
      goog.dom.createDom(goog.dom.TagName.DIV, 'blocklyWidgetDiv');
  document.body.appendChild(Blockly.WidgetDiv.DIV);
};

/**
 * Initialize and display the widget div.  Close the old one if needed.
 * @param {!Object} newOwner The object that will be using this container.
 * @param {boolean} rtl Right-to-left (true) or left-to-right (false).
 * @param {Function=} opt_dispose Optional cleanup function to be run when the widget
 *   is closed. If the dispose is animated, this function must start the animation.
 * @param {Function=} opt_disposeAnimationFinished Optional cleanup function to be run
 *   when the widget is done animating and must disappear.
 * @param {number=} opt_disposeAnimationTimerLength Length of animation time in seconds
     if a dispose animation is provided.
 */
Blockly.WidgetDiv.show = function(newOwner, rtl, opt_dispose,
    opt_disposeAnimationFinished, opt_disposeAnimationTimerLength) {
  Blockly.WidgetDiv.hide();
  Blockly.WidgetDiv.owner_ = newOwner;
  Blockly.WidgetDiv.dispose_ = opt_dispose;
  Blockly.WidgetDiv.disposeAnimationFinished_ = opt_disposeAnimationFinished;
  Blockly.WidgetDiv.disposeAnimationTimerLength_ = opt_disposeAnimationTimerLength;
  // Temporarily move the widget to the top of the screen so that it does not
  // cause a scrollbar jump in Firefox when displayed.
  var xy = goog.style.getViewportPageOffset(document);
  Blockly.WidgetDiv.DIV.style.top = xy.y + 'px';
  Blockly.WidgetDiv.DIV.style.direction = rtl ? 'rtl' : 'ltr';
  Blockly.WidgetDiv.DIV.style.display = 'block';
};

/**
 * Destroy the widget and hide the div.
 * @param {boolean=} opt_noAnimate If set, animation will not be run for the hide.
 */
Blockly.WidgetDiv.hide = function(opt_noAnimate) {
  if (Blockly.WidgetDiv.disposeAnimationTimer_) {
    // An animation timer is set already.
    // This happens when a previous widget was animating out,
    // but Blockly is hiding the widget to create a new one.
    // So, short-circuit the animation and clear the timer.
    window.clearTimeout(Blockly.WidgetDiv.disposeAnimationTimer_);
    Blockly.WidgetDiv.disposeAnimationFinished_ && Blockly.WidgetDiv.disposeAnimationFinished_();
    Blockly.WidgetDiv.disposeAnimationFinished_ = null;
    Blockly.WidgetDiv.disposeAnimationTimer_ = null;
    Blockly.WidgetDiv.owner_ = null;
    Blockly.WidgetDiv.hideAndClearDom_();
  } else if (Blockly.WidgetDiv.isVisible()) {
    // No animation timer set, but the widget is visible
    // Start animation out (or immediately hide)
    Blockly.WidgetDiv.dispose_ && Blockly.WidgetDiv.dispose_();
    Blockly.WidgetDiv.dispose_ = null;
    // If we want to animate out, set the appropriate timer for final dispose.
    if (Blockly.WidgetDiv.disposeAnimationFinished_ && !opt_noAnimate) {
      Blockly.WidgetDiv.disposeAnimationTimer_ = window.setTimeout(
          Blockly.WidgetDiv.hide, // Come back to hide and take the first branch.
          Blockly.WidgetDiv.disposeAnimationTimerLength_ * 1000
      );
    } else {
      // No timer provided (or no animation desired) - auto-hide the DOM now.
      Blockly.WidgetDiv.disposeAnimationFinished_ && Blockly.WidgetDiv.disposeAnimationFinished_();
      Blockly.WidgetDiv.disposeAnimationFinished_ = null;
      Blockly.WidgetDiv.owner_ = null;
      Blockly.WidgetDiv.hideAndClearDom_();
    }
  }
};

/**
 * Hide all DOM for the WidgetDiv, and clear its children.
 * @private
 */
Blockly.WidgetDiv.hideAndClearDom_ = function() {
  Blockly.WidgetDiv.DIV.style.display = 'none';
  Blockly.WidgetDiv.DIV.style.left = '';
  Blockly.WidgetDiv.DIV.style.top = '';
  Blockly.WidgetDiv.DIV.style.height = '';
  goog.dom.removeChildren(Blockly.WidgetDiv.DIV);
};

/**
 * Is the container visible?
 * @return {boolean} True if visible.
 */
Blockly.WidgetDiv.isVisible = function() {
  return !!Blockly.WidgetDiv.owner_;
};

/**
 * Destroy the widget and hide the div if it is being used by the specified
 *   object.
 * @param {!Object} oldOwner The object that was using this container.
 */
Blockly.WidgetDiv.hideIfOwner = function(oldOwner) {
  if (Blockly.WidgetDiv.owner_ == oldOwner) {
    Blockly.WidgetDiv.hide();
  }
};

/**
 * Position the widget at a given location.  Prevent the widget from going
 * offscreen top or left (right in RTL).
 * @param {number} anchorX Horizontal location (window coordinates, not body).
 * @param {number} anchorY Vertical location (window coordinates, not body).
 * @param {!goog.math.Size} windowSize Height/width of window.
 * @param {!goog.math.Coordinate} scrollOffset X/y of window scrollbars.
 * @param {boolean} rtl True if RTL, false if LTR.
 */
Blockly.WidgetDiv.position = function(anchorX, anchorY, windowSize,
    scrollOffset, rtl) {
  // Don't let the widget go above the top edge of the window.
  if (anchorY < scrollOffset.y) {
    anchorY = scrollOffset.y;
  }
  if (rtl) {
    // Don't let the widget go right of the right edge of the window.
    if (anchorX > windowSize.width + scrollOffset.x) {
      anchorX = windowSize.width + scrollOffset.x;
    }
  } else {
    // Don't let the widget go left of the left edge of the window.
    if (anchorX < scrollOffset.x) {
      anchorX = scrollOffset.x;
    }
  }
  Blockly.WidgetDiv.positionInternal_(anchorX, anchorY, windowSize.height);
};

/**
 * Set the widget div's position and height.  This function does nothing clever:
 * it will not ensure that your widget div ends up in the visible window.
 * @param {number} x Horizontal location (window coordinates, not body).
 * @param {number} y Vertical location (window coordinates, not body).
 * @param {number} height The height of the widget div (pixels).
 * @private
 */
Blockly.WidgetDiv.positionInternal_ = function(x, y, height) {
  Blockly.WidgetDiv.DIV.style.left = x + 'px';
  Blockly.WidgetDiv.DIV.style.top = y + 'px';
  Blockly.WidgetDiv.DIV.style.height = height + 'px';
};

/**
 * Position the widget div based on an anchor rectangle.
 * The widget should be placed adjacent to but not overlapping the anchor
 * rectangle.  The preferred position is directly below and aligned to the left
 * (ltr) or right (rtl) side of the anchor.
 * @param {!Object} viewportBBox The bounding rectangle of the current viewport,
 *     in window coordinates.
 * @param {!Object} anchorBBox The bounding rectangle of the anchor, in window
 *     coordinates.
 * @param {!goog.math.Size} widgetSize The size of the widget that is inside the
 *     widget div, in window coordinates.
 * @param {boolean} rtl Whether the workspace is in RTL mode.  This determines
 *     horizontal alignment.
 * @package
 */
Blockly.WidgetDiv.positionWithAnchor = function(viewportBBox, anchorBBox,
    widgetSize, rtl) {
  var y = Blockly.WidgetDiv.calculateY_(viewportBBox, anchorBBox, widgetSize);
  var x = Blockly.WidgetDiv.calculateX_(viewportBBox, anchorBBox, widgetSize,
      rtl);

  Blockly.WidgetDiv.positionInternal_(x, y, widgetSize.height);
};

/**
 * Calculate an x position (in window coordinates) such that the widget will not
 * be offscreen on the right or left.
 * @param {!Object} viewportBBox The bounding rectangle of the current viewport,
 *     in window coordinates.
 * @param {!Object} anchorBBox The bounding rectangle of the anchor, in window
 *     coordinates.
 * @param {goog.math.Size} widgetSize The dimensions of the widget inside the
 *     widget div.
 * @param {boolean} rtl Whether the Blockly workspace is in RTL mode.
 * @return {number} A valid x-coordinate for the top left corner of the widget
 *     div, in window coordinates.
 * @private
 */
Blockly.WidgetDiv.calculateX_ = function(viewportBBox, anchorBBox, widgetSize,
    rtl) {
  if (rtl) {
    // Try to align the right side of the field and the right side of the widget.
    var widgetLeft = anchorBBox.right - widgetSize.width;
    // Don't go offscreen left.
    var x = Math.max(widgetLeft, viewportBBox.left);
    // But really don't go offscreen right:
    return Math.min(x, viewportBBox.right - widgetSize.width);
  } else {
    // Try to align the left side of the field and the left side of the widget.
    // Don't go offscreen right.
    var x = Math.min(anchorBBox.left,
        viewportBBox.right - widgetSize.width);
    // But left is more important, because that's where the text is.
    return Math.max(x, viewportBBox.left);
  }
};

/**
 * Calculate a y position (in window coordinates) such that the widget will not
 * be offscreen on the top or bottom.
 * @param {!Object} viewportBBox The bounding rectangle of the current viewport,
 *     in window coordinates.
 * @param {!Object} anchorBBox The bounding rectangle of the anchor, in window
 *     coordinates.
 * @param {goog.math.Size} widgetSize The dimensions of the widget inside the
 *     widget div.
 * @return {number} A valid y-coordinate for the top left corner of the widget
 *     div, in window coordinates.
 * @private
 */
Blockly.WidgetDiv.calculateY_ = function(viewportBBox, anchorBBox, widgetSize) {
  // Flip the widget vertically if off the bottom.
  if (anchorBBox.bottom + widgetSize.height >=
      viewportBBox.bottom) {
    // The bottom of the widget is at the top of the field.
    return anchorBBox.top - widgetSize.height;
    // The widget could go off the top of the window, but it would also go off
    // the bottom.  The window is just too small.
  } else {
    // The top of the widget is at the bottom of the field.
    return anchorBBox.bottom;
  }
};
