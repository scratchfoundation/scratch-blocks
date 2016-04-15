/**
 * @fileoverview A div that floats on top of the workspace, for drop-down menus.
 * The drop-down can be kept inside the workspace, animate in/out, etc.
 * @author tmickel@mit.edu (Tim Mickel)
 */

'use strict';

goog.provide('Blockly.DropDownDiv');

goog.require('goog.dom');

/**
 * Class for drop-down div.
 * @constructor
 */
Blockly.DropDownDiv = function() {
};

/**
 * Containing parent element. Set once by Blockly.DragSurfaceSvg.createDom
 * @type {Element}
 * @private
 */
Blockly.DropDownDiv.prototype.container_ = null;

/**
 * The div element. Set once by Blockly.DragSurfaceSvg.createDom.
 * @type {Element}
 * @private
 */
Blockly.DropDownDiv.prototype.DIV_ = null;

/**
 * Drop-downs will appear within the box of this element if possible.
 * @type {Element}
 * @private
 */
Blockly.DropDownDiv.prototype.boundsElement_ = null;

/**
 * Create and insert the DOM element for this div.
 * @param {Element} container Element that the div should be contained in.
 */
Blockly.DropDownDiv.prototype.createDom = function(container) {
  if (this.DIV_) {
    return;  // Already created.
  }
  this.DIV_ = goog.dom.createDom('div', 'blocklyDropDownDiv');
  container.appendChild(this.DIV_);
  this.content_ = goog.dom.createDom('div', 'blocklyDropDownContent');
  this.DIV_.appendChild(this.content);
};

/**
 * Set an element to maintain bounds within. Drop-downs will appear
 * within the box of this element if possible.
 * @param {Element} boundsElement Element to bound drop-down to.
 */
Blockly.DropDownDiv.prototype.setBoundsElement = function(boundsElement) {
  this.boundsElement_ = boundsElement;
};

/**
 * Provide the div for inserting things into the drop-down.
 * @return {Element} Div to populate with content
 */
Blockly.DropDownDiv.prototype.getContentDiv = function() {
  return this.content_;
};

/**
 * Place the drop-down, maintaining bounds.
 * The drop-down is placed with the "origin point" (x, y) - i.e.,
 * the arrow will point at this origin and box will flow under it.
 * If we can't maintain the container bounds at this point, fall-back to the
 * secondary point and flow up instead.
 * @param {number} x Desired origin point x, in absolute px
 * @param {number} y Desired origin point y, in absolute px
 * @param {number} secondaryX Second origin point x, in absolute px
 * @param {number} secondaryY Second origin point y, in absolute px
 */
Blockly.DropDownDiv.prototype.place = function(x, y) {
  this.DIV_.top = x + 'px';
  this.DIV_.left = y + 'px';
};

/**
 * Create and insert the DOM element for this div.
 */
Blockly.DropDownDiv.prototype.destroy = function() {
  this.container_.removeChild(this.DIV_);
  this.DIV_ = null;
};
