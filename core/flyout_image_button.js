'use strict';

goog.provide('Blockly.FlyoutImageButton');

goog.require('Blockly.FlyoutButton');
goog.require('goog.dom');
goog.require('goog.math.Coordinate');

Blockly.FlyoutImageButton = function(workspace, targetWorkspace, xml) {
  /**
   * @type {!Blockly.WorkspaceSvg}
   * @private
   */
  this.workspace_ = workspace;

  /**
   * @type {!Blockly.Workspace}
   * @private
   */
  this.targetWorkspace_ = targetWorkspace;

  /**
   * @type {!goog.math.Coordinate}
   * @private
   */
  this.position_ = new goog.math.Coordinate(0, 0);

  this.imageSrc = xml.getAttribute('imageSrc');

  this.height_ = 0;
  this.width_ = 0;

  /**
   * Function to call when this button is clicked.
   * @type {function(!Blockly.FlyoutButton)}
   * @private
   */
  this.callback_ = null;
  var callbackKey = xml.getAttribute('callbackKey');
  if (callbackKey) {
    this.callback_ = targetWorkspace.getButtonCallback(callbackKey);
  }
};
goog.inherits(Blockly.FlyoutImageButton, Blockly.FlyoutButton);

/**
 * Create the button elements.
 * @return {!Element} The button's SVG group.
 */
Blockly.FlyoutImageButton.prototype.createDom = function() {
  var cssClass = 'blocklyFlyoutButton';

  this.svgGroup_ = Blockly.utils.createSvgElement('g', {'class': cssClass},
      this.workspace_.getCanvas());

  /** @type {SVGElement} */
  this.imageElement_ = Blockly.utils.createSvgElement(
      'image',
      {
        'height': this.height_ + 'px',
        'width': this.width_ + 'px'
      },
      this.svgGroup_);
  this.setImageSrc(this.imageSrc);

  this.width += 2 * Blockly.FlyoutButton.MARGIN;

  this.mouseUpWrapper_ = Blockly.bindEventWithChecks_(this.svgGroup_, 'mouseup',
      this, this.onMouseUp_);
  return this.svgGroup_;
};

/**
 * Set the source URL of this image.
 * @param {?string} src New source.
 * @override
 */
Blockly.FlyoutImageButton.prototype.setImageSrc = function(src) {
  if (src === null) {
    // No change if null.
    return;
  }
  if (this.imageElement_) {
    this.imageElement_.setAttributeNS('http://www.w3.org/1999/xlink',
        'xlink:href', src || '');
  }
};
