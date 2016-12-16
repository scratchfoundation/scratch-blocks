/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Massachusetts Institute of Technology
 * All rights reserved.
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
 * @fileoverview An SVG that floats on top of the workspace.
 * Blocks are moved into this SVG during a drag, improving performance.
 * The entire SVG is translated, so the blocks are never repainted during drag.
 * @author tmickel@mit.edu (Tim Mickel)
 */

'use strict';

goog.provide('Blockly.DragSurfaceSvg');

goog.require('Blockly.utils');
goog.require('Blockly.constants');
goog.require('Blockly.Colours');

goog.require('goog.asserts');
goog.require('goog.math.Coordinate');

/**
 * Class for a Drag Surface SVG.
 * @param {Element} container Containing element.
 * @constructor
 */
Blockly.DragSurfaceSvg = function(container) {
  this.container_ = container;
};

/**
 * The SVG drag surface. Set once by Blockly.DragSurfaceSvg.createDom.
 * @type {Element}
 * @private
 */
Blockly.DragSurfaceSvg.prototype.SVG_ = null;

/**
 * SVG group inside the drag surface. This is where blocks are moved to.
 * @type {Element}
 * @private
 */
Blockly.DragSurfaceSvg.prototype.dragGroup_ = null;

/**
 * Containing HTML element; parent of the workspace and the drag surface.
 * @type {Element}
 * @private
 */
Blockly.DragSurfaceSvg.prototype.container_ = null;

/**
 * Cached value for the scale of the drag surface.
 * Used to set/get the correct translation during and after a drag.
 * @type {Number}
 * @private
 */
Blockly.DragSurfaceSvg.prototype.scale_ = 1;

/**
 * ID for the drag shadow filter, set in createDom.
 * @type {string}
 * @private
 */
Blockly.DragSurfaceSvg.prototype.dragShadowFilterId_ = '';

/**
 * Standard deviation for gaussian blur on drag shadow, in px.
 * @type {number}
 * @const
 */
Blockly.DragSurfaceSvg.SHADOW_STD_DEVIATION = 6;

/**
 * Create the drag surface and inject it into the container.
 */
Blockly.DragSurfaceSvg.prototype.createDom = function() {
  if (this.SVG_) {
    return;  // Already created.
  }
  this.SVG_ = Blockly.createSvgElement('svg', {
    'xmlns': Blockly.SVG_NS,
    'xmlns:html': Blockly.HTML_NS,
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'version': '1.1',
    'class': 'blocklyDragSurface'
  }, this.container_);
  var defs = Blockly.createSvgElement('defs', {}, this.SVG_);
  this.dragShadowFilterId_ = this.createDropShadowDom_(defs);
  this.dragGroup_ = Blockly.createSvgElement('g', {}, this.SVG_);
  this.dragGroup_.setAttribute('filter', 'url(#' + this.dragShadowFilterId_ + ')');
};

/**
 * Create the SVG def for the drop shadow.
 * @param {Element} defs Defs element to insert the shadow filter definition
 * @return {string} ID for the filter element
 */
Blockly.DragSurfaceSvg.prototype.createDropShadowDom_ = function(defs) {
  // Adjust these width/height, x/y properties to prevent the shadow from clipping
  var dragShadowFilter = Blockly.createSvgElement('filter',
      {'id': 'blocklyDragShadowFilter', 'height': '140%', 'width': '140%', y: '-20%', x: '-20%'}, defs);
  Blockly.createSvgElement('feGaussianBlur',
      {'in': 'SourceAlpha', 'stdDeviation': Blockly.DragSurfaceSvg.SHADOW_STD_DEVIATION}, dragShadowFilter);
  var componentTransfer = Blockly.createSvgElement('feComponentTransfer', {'result': 'offsetBlur'}, dragShadowFilter);
  // Shadow opacity is specified in the adjustable colour library,
  // since the darkness of the shadow largely depends on the workspace colour.
  Blockly.createSvgElement('feFuncA',
      {'type': 'linear', 'slope': Blockly.Colours.dragShadowOpacity}, componentTransfer);
  Blockly.createSvgElement('feComposite',
      {'in': 'SourceGraphic', 'in2': 'offsetBlur', 'operator': 'over'}, dragShadowFilter);
  return dragShadowFilter.id;
};

/**
 * Set the SVG blocks on the drag surface's group and show the surface.
 * Only one block should be on the drag surface at a time.
 * @param {!Element} blocks Block or group of blocks to place on the drag surface
 */
Blockly.DragSurfaceSvg.prototype.setBlocksAndShow = function(blocks) {
  goog.asserts.assert(this.dragGroup_.childNodes.length == 0, 'Already dragging a block.');
  // appendChild removes the blocks from the previous parent
  this.dragGroup_.appendChild(blocks);
  this.SVG_.style.display = 'block';
};

/**
 * Translate and scale the entire drag surface group to keep in sync with the workspace.
 * @param {Number} x X translation
 * @param {Number} y Y translation
 * @param {Number} scale Scale of the group
 */
Blockly.DragSurfaceSvg.prototype.translateAndScaleGroup = function(x, y, scale) {
  var transform;
  this.scale_ = scale;
  // Force values to have two decimal points.
  // This is a work-around to prevent a bug in Safari, where numbers close to 0
  // are sometimes reported as something like "2.9842794901924208e-12".
  // That is incompatible with translate3d, causing bugs.
  x = x.toFixed(2);
  y = y.toFixed(2);
  if (Blockly.is3dSupported()) {
    transform = 'transform: translate3d(' + x + 'px, ' + y + 'px, 0px)' +
      'scale3d(' + scale + ',' + scale + ',' + scale + ')';
    this.dragGroup_.setAttribute('style', transform);
  } else {
    transform = 'translate(' + x + ', ' + y + ') scale(' + scale + ')';
    this.dragGroup_.setAttribute('transform', transform);
  }
};

/**
 * Translate the entire drag surface during a drag.
 * We translate the drag surface instead of the blocks inside the surface
 * so that the browser avoids repainting the SVG.
 * Because of this, the drag coordinates must be adjusted by scale.
 * @param {Number} x X translation for the entire surface
 * @param {Number} y Y translation for the entire surface
 */
Blockly.DragSurfaceSvg.prototype.translateSurface = function(x, y) {
  var transform;
  x *= this.scale_;
  y *= this.scale_;
  // Force values to have two decimal points.
  // This is a work-around to prevent a bug in Safari, where numbers close to 0
  // are sometimes reported as something like "2.9842794901924208e-12".
  // That is incompatible with translate3d, causing bugs.
  x = x.toFixed(2);
  y = y.toFixed(2);
  if (Blockly.is3dSupported()) {
    transform = 'transform: translate3d(' + x + 'px, ' + y + 'px, 0px); display: block;';
    this.SVG_.setAttribute('style', transform);
  } else {
    transform = 'translate(' + x + ', ' + y + ')';
    this.SVG_.setAttribute('transform', transform);
  }
};

/**
 * Reports the surface translation in scaled workspace coordinates.
 * Use this when finishing a drag to return blocks to the correct position.
 * @return {goog.math.Coordinate} Current translation of the surface
 */
Blockly.DragSurfaceSvg.prototype.getSurfaceTranslation = function() {
  var xy = Blockly.getRelativeXY_(this.SVG_);
  return new goog.math.Coordinate(xy.x / this.scale_, xy.y / this.scale_);
};

/**
 * Provide a reference to the drag group (primarily for BlockSvg.getRelativeToSurfaceXY).
 * @return {Element} Drag surface group element
 */
Blockly.DragSurfaceSvg.prototype.getGroup = function() {
  return this.dragGroup_;
};

/**
 * Get the current blocks on the drag surface, if any (primarily for BlockSvg.getRelativeToSurfaceXY).
 * @return {Element} Drag surface block DOM element
 */
Blockly.DragSurfaceSvg.prototype.getCurrentBlock = function() {
  return this.dragGroup_.childNodes[0];
};

/**
 * Clear the group and hide the surface; move the blocks off onto the provided element.
 * @param {!Element} newSurface Surface the dragging blocks should be moved to
 */
Blockly.DragSurfaceSvg.prototype.clearAndHide = function(newSurface) {
  // appendChild removes the node from this.dragGroup_
  newSurface.appendChild(this.getCurrentBlock());
  this.SVG_.style.display = 'none';
  goog.asserts.assert(this.dragGroup_.childNodes.length == 0, 'Drag group was not cleared.');
};
