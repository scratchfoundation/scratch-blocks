/**
 * @fileoverview A div that floats on top of the workspace, for drop-down menus.
 * The drop-down can be kept inside the workspace, animate in/out, etc.
 * @author tmickel@mit.edu (Tim Mickel)
 */

'use strict';

goog.provide('Blockly.DropDownDiv');

goog.require('goog.dom');
goog.require('goog.style');

/**
 * Class for drop-down div.
 * @constructor
 */
Blockly.DropDownDiv = function() {
};

/**
 * The div element. Set once by Blockly.DragSurfaceSvg.createDom.
 * @type {Element}
 * @private
 */
Blockly.DropDownDiv.DIV_ = null;

/**
 * Drop-downs will appear within the box of this element if possible.
 * @type {Element}
 * @private
 */
Blockly.DropDownDiv.boundsElement_ = null;

/**
 * Arrow size in px. Should match the value in CSS (need to position pre-render).
 * @type {number}
 * @const
 */
Blockly.DropDownDiv.ARROW_SIZE = 16;

/**
 * Amount the arrow must be kept away from the edges of the div.
 * @type {number}
 * @constant
 */
Blockly.DropDownDiv.ARROW_HORIZONTAL_PADDING = 12;

/**
 * Amount drop-downs should be padded away from the source, in px.
 * @type {number}
 * @constant
 */
Blockly.DropDownDiv.PADDING_Y = 20;

/**
 * Length of animations in seconds.
 * @type {number}
 * @constant
 */
Blockly.FieldTextInput.ANIMATION_TIME = 0.25;

/**
 * Create and insert the DOM element for this div.
 * @param {Element} container Element that the div should be contained in.
 */
Blockly.DropDownDiv.createDom = function() {
  if (Blockly.DropDownDiv.DIV_) {
    return;  // Already created.
  }
  Blockly.DropDownDiv.DIV_ = goog.dom.createDom('div', 'blocklyDropDownDiv');
  document.body.appendChild(Blockly.DropDownDiv.DIV_);
  Blockly.DropDownDiv.content_ = goog.dom.createDom('div', 'blocklyDropDownContent');
  Blockly.DropDownDiv.DIV_.appendChild(Blockly.DropDownDiv.content_);
  Blockly.DropDownDiv.arrow_ = goog.dom.createDom('div', 'blocklyDropDownArrow');
  Blockly.DropDownDiv.DIV_.appendChild(Blockly.DropDownDiv.arrow_);
};

/**
 * Set an element to maintain bounds within. Drop-downs will appear
 * within the box of this element if possible.
 * @param {Element} boundsElement Element to bound drop-down to.
 */
Blockly.DropDownDiv.setBoundsElement = function(boundsElement) {
  Blockly.DropDownDiv.boundsElement_ = boundsElement;
};

/**
 * Provide the div for inserting things into the drop-down.
 * @return {Element} Div to populate with content
 */
Blockly.DropDownDiv.getContentDiv = function() {
  return Blockly.DropDownDiv.content_;
};

/**
 * Set the colour for the drop-down.
 * @param {string} backgroundColour Any CSS color for the background
 * @param {string} borderColour Any CSS color for the border
 */
Blockly.DropDownDiv.setColour = function(backgroundColour, borderColour) {
  Blockly.DropDownDiv.DIV_.style.backgroundColor = backgroundColour;
  Blockly.DropDownDiv.arrow_.style.backgroundColor = backgroundColour;
  Blockly.DropDownDiv.DIV_.style.borderColor = borderColour;
  Blockly.DropDownDiv.arrow_.style.borderColor = borderColour;
};

/**
 * Show and place the drop-down.
 * For descriptions of these points, see getPositionMetrics.
 * @param {number} x Desired origin point x, in absolute px
 * @param {number} y Desired origin point y, in absolute px
 * @param {number} secondaryX Second origin point x, in absolute px
 * @param {number} secondaryY Second origin point y, in absolute px
 */
Blockly.DropDownDiv.show = function(x, y, secondaryX, secondaryY) {
  var div = Blockly.DropDownDiv.DIV_;
  var metrics = Blockly.DropDownDiv.getPositionMetrics(x, y, secondaryX, secondaryY);
  // Update arrow
  Blockly.DropDownDiv.arrow_.style.transform = 'translate(' +
    metrics.arrowX + 'px,' + metrics.arrowY + 'px) rotate(45deg)';
  Blockly.DropDownDiv.arrow_.setAttribute('class',
    metrics.arrowAtTop ? 'blocklyDropDownArrow arrowTop' : 'blocklyDropDownArrow arrowBottom');
  // First apply initial translation
  div.style.transform = 'translate(' + metrics.initialX + 'px,' + metrics.initialY + 'px)';
  // Show the div
  div.style.display = 'block';
  // Add transition and apply final translate after a cycle.
  setTimeout(function() {
    div.style.transition = 'transform ' + Blockly.FieldTextInput.ANIMATION_TIME + 's';
    div.style.transform = 'translate(' + metrics.finalX + 'px,' + metrics.finalY + 'px)';
  }, 1);
};

/**
 * Position the dropdown and the arrow, maintaining bounds.
 * The drop-down is placed with the "origin point" (x, y) - i.e.,
 * the arrow will point at this origin and box will flow under it.
 * If we can't maintain the container bounds at this point, fall-back to the
 * secondary point and flow up instead.
 * @param {number} x Desired origin point x, in absolute px
 * @param {number} y Desired origin point y, in absolute px
 * @param {number} secondaryX Second origin point x, in absolute px
 * @param {number} secondaryY Second origin point y, in absolute px
 * @returns {Object} Various final metrics, including rendered positions for dropdown and arrow.
 */
Blockly.DropDownDiv.getPositionMetrics = function(x, y, secondaryX, secondaryY) {
  var div = Blockly.DropDownDiv.DIV_;
  var boundPosition = goog.style.getClientPosition(Blockly.DropDownDiv.boundsElement_);
  var boundSize = goog.style.getSize(Blockly.DropDownDiv.boundsElement_);
  var divSize = goog.style.getSize(div);

  // First decide if we will render at primary or secondary position
  // i.e., above or below
  var renderX, renderY, renderedSecondary;
  if (y + divSize.height > boundPosition.y + boundSize.height) {
    // We can't fit below in terms of y. Can we fit above?
    if (secondaryY - divSize.height < boundPosition.y) {
      // We also can't fit above, so just render primary
      renderX = x;
      renderY = y + Blockly.DropDownDiv.PADDING_Y;
      renderedSecondary = false;
    } else {
      // We can fit above, render secondary
      renderX = secondaryX;
      renderY = secondaryY - divSize.height - Blockly.DropDownDiv.PADDING_Y;
      renderedSecondary = true;
    }
  } else {
    // We can fit below, render primary
    renderX = x;
    renderY = y + Blockly.DropDownDiv.PADDING_Y;
    renderedSecondary = false;
  }
  // Calculate arrow X
  // This should be renderX, unless that's off the bounds, minus size of the arrow
  var arrowX = renderX - Blockly.DropDownDiv.ARROW_SIZE / 2;
  arrowX = Math.max(boundPosition.x, Math.min(arrowX, boundPosition.x + boundSize.width));

  // Calculate arrow Y. If we rendered secondary, add on bottom.
  // Some extra pixels for the border
  var arrowY = (renderedSecondary) ? divSize.height - 1 : 0;
  arrowY -= Blockly.DropDownDiv.ARROW_SIZE / 2 + 1;

  // Attempt to center X around div
  var centerX = divSize.width / 2;
  renderX -= centerX;
  // Fit in container in X
  renderX = Math.max(
    boundPosition.x,
    Math.min(renderX, boundPosition.x + boundSize.width - divSize.width)
  );
  // After we've finished caclulating renderX, adjust the arrow by it (absolute positioning)
  arrowX -= renderX;

  // Keep the arrow in bounds of padding
  arrowX = Math.max(
    Blockly.DropDownDiv.ARROW_HORIZONTAL_PADDING,
    Math.min(arrowX, divSize.width - Blockly.DropDownDiv.ARROW_HORIZONTAL_PADDING - Blockly.DropDownDiv.ARROW_SIZE)
  );

  // Initial position calculated without any padding to provide animation
  var initialX, initialY;
  if (renderedSecondary) {
    initialX = renderX;
    initialY = secondaryY - divSize.height; // No padding on Y
  } else {
    initialX = renderX;
    initialY = y; // No padding on Y
  }

  return {
    initialX: initialX,
    initialY : initialY,
    finalX: renderX,
    finalY: renderY,
    arrowX: arrowX,
    arrowY: arrowY,
    arrowAtTop: !renderedSecondary
  };
};

/**
 * Hide the menu, triggering animation
 */
Blockly.DropDownDiv.hide = function() {
  Blockly.DropDownDiv.DIV_.style.transition = '';
  Blockly.DropDownDiv.DIV_.style.transform = '';
  Blockly.DropDownDiv.DIV_.style.display = 'none';
};
