/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
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
 * @fileoverview Class for a button in the flyout that displays an image.
 * @author ericr@media.mit.edu (Eric Rosenbaum)
 */
'use strict';

goog.provide('Blockly.FlyoutImageButton');

goog.require('Blockly.FlyoutButton');

/**
 * Class for a button in the flyout that displays an image.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace in which to place this
 *     button.
 * @param {!Blockly.WorkspaceSvg} targetWorkspace The flyout's target workspace.
 * @param {!Element} xml The XML specifying the button.
 * @constructor
 */
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

  /**
   * The URL of the image to display on the button.
   * @type {string}
   * @private
   */
  this.imageSrc_ = xml.getAttribute('imageSrc');

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

  if (this.imageSrc_) {
    /** @type {SVGElement} */
    this.imageElement_ = Blockly.utils.createSvgElement(
        'image',
        {
          'height': this.height + 'px',
          'width': this.width + 'px'
        },
        this.svgGroup_);
    this.setImageSrc(this.imageSrc_);
  }

  this.width += 2 * Blockly.FlyoutButton.MARGIN;

  this.mouseUpWrapper_ = Blockly.bindEventWithChecks_(this.svgGroup_, 'mouseup',
      this, this.onMouseUp_);
  return this.svgGroup_;
};

/**
 * Set the source URL of the image for the button.
 * @param {?string} src New source.
 * @package
 */
Blockly.FlyoutImageButton.prototype.setImageSrc = function(src) {
  if (src === null) {
    // No change if null.
    return;
  }
  this.imageSrc_ = src;
  if (this.imageElement_) {
    this.imageElement_.setAttributeNS('http://www.w3.org/1999/xlink',
        'xlink:href', this.imageSrc_ || '');
  }
};
