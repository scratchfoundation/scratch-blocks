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
 * Amount the drag surface should grow the blocks on a drag, relative to 1.
 * @type {Number}
 * @const
 */
Blockly.DragSurfaceSvg.scaleOnDrag = 1.1;

/**
 * Length of time for the blocks to grow on a drag, in seconds.
 * @type {Number}
 * @const
 */
Blockly.DragSurfaceSvg.growAnimationTime = 0.1;

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
 * Wrapper element for applying the scale effect with a transition.
 * @type {Element}
 * @private
 */
Blockly.DragSurfaceSvg.prototype.scaleWrapper_ = null;

/**
 * Cached value for the scale of the drag surface.
 * Used to set/get the correct translation during and after a drag.
 * @type {Number}
 * @private
 */
Blockly.DragSurfaceSvg.prototype.scale_ = 1;

/**
 * Stored X value for the transform origin of the drag surface.
 * Used to adjust the origin as we drag.
 * @type {Number}
 * @private
 */
Blockly.DragSurfaceSvg.prototype.transformOriginX_ = 0;

/**
 * Stored Y value for the transform origin of the drag surface.
 * Used to adjust the origin as we drag.
 * @type {Number}
 * @private
 */
Blockly.DragSurfaceSvg.prototype.transformOriginY_ = 0;

 /**
  * Create the drag surface and inject it into the container.
  */
Blockly.DragSurfaceSvg.prototype.createDom = function () {
  if (this.SVG_) {
    return;  // Already created.
  }
  this.scaleWrapper_ = document.createElement('div');
  this.scaleWrapper_.style.transition = 'transform ' + Blockly.DragSurfaceSvg.growAnimationTime + 's';
  this.scaleWrapper_.setAttribute('class', 'blocklyDragSurface');
  this.container_.appendChild(this.scaleWrapper_);
  this.SVG_ = Blockly.createSvgElement('svg', {
    'xmlns': Blockly.SVG_NS,
    'xmlns:html': Blockly.HTML_NS,
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'version': '1.1',
    'class': 'blocklyDragSurfaceSvg'
  }, this.scaleWrapper_);
  Blockly.createSvgElement('defs', {}, this.SVG_);
  this.dragGroup_ = Blockly.createSvgElement('g', {}, this.SVG_);
};

 /**
  * Set the SVG blocks on the drag surface's group and show the surface.
  * Only one block should be on the drag surface at a time.
  * @param {!Element} blocks Block or group of blocks to place on the drag surface
  * @param {Number} transformOriginX X origin of the growth scale in px
  * @param {Number} transformOriginY Y origin of the growth scale in px
  */
Blockly.DragSurfaceSvg.prototype.setBlocksAndShow = function (blocks, transformOriginX, transformOriginY) {
  goog.asserts.assert(this.dragGroup_.childNodes.length == 0, 'Already dragging a block.');
  // appendChild removes the blocks from the previous parent
  this.dragGroup_.appendChild(blocks);
  this.scaleWrapper_.style.display = 'block';
  // Animate a growth
  // Store the origin point as we need to adjust it as we drag
  this.transformOriginX_ = transformOriginX;
  this.transformOriginY_ = transformOriginY;
  this.scaleWrapper_.style.transformOrigin = this.transformOriginX_ + 'px ' + this.transformOriginY_ + 'px 0px';
  // Apply transform after a cycle to allow display: block to take effect first.
  // If the transform is applied while the element is invisible, no animation happens.
  setTimeout(function() {
    this.scaleWrapper_.style.transform = 'scale(' +
      Blockly.DragSurfaceSvg.scaleOnDrag + ',' + Blockly.DragSurfaceSvg.scaleOnDrag + ')';
  }.bind(this), 0);
};

/**
 * Translate and scale the entire drag surface group to keep in sync with the workspace.
 * @param {Number} x X translation
 * @param {Number} y Y translation
 * @param {Number} scale Scale of the group
 */
Blockly.DragSurfaceSvg.prototype.translateAndScaleGroup = function (x, y, scale) {
  var transform;
  this.scale_ = scale;
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

  var originX = this.transformOriginX_ + x;
  var originY = this.transformOriginY_ + y;
  this.scaleWrapper_.style.transformOrigin = originX + 'px ' + originY + 'px 0px';

  if (Blockly.is3dSupported()) {
    transform = 'transform: translate3d(' + x + 'px, ' + y + 'px, 0px); display: block;';
    this.SVG_.setAttribute('style', transform);
  } else {
    transform = 'translate(' + x + ', ' + y + '); display: block;';
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
Blockly.DragSurfaceSvg.prototype.getGroup = function () {
  return this.dragGroup_;
};

/**
 * Get the current blocks on the drag surface, if any (primarily for BlockSvg.getRelativeToSurfaceXY).
 * @return {Element} Drag surface block DOM element
 */
Blockly.DragSurfaceSvg.prototype.getCurrentBlock = function () {
  return this.dragGroup_.childNodes[0];
};

 /**
  * Clear the group and hide the surface; move the blocks off onto the provided element.
  * @param {!Element} newSurface Surface the dragging blocks should be moved to
  */
Blockly.DragSurfaceSvg.prototype.clearAndHide = function (newSurface) {
  // appendChild removes the node from this.dragGroup_
  newSurface.appendChild(this.getCurrentBlock());
  this.scaleWrapper_.style.display = 'none';
  goog.asserts.assert(this.dragGroup_.childNodes.length == 0, 'Drag group was not cleared.');
  this.scaleWrapper_.style.transform = '';
};
