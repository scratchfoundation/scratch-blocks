/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Google Inc.
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
 * @fileoverview Class for a button in the flyout.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.FlyoutButton');

goog.require('goog.dom');
goog.require('goog.math.Coordinate');


/**
 * Class for a button or label in the flyout. Labels behave the same as buttons,
 * but are styled differently.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace in which to place this
 *     button.
 * @param {!Blockly.WorkspaceSvg} targetWorkspace The flyout's target workspace.
 * @param {!Element} xml The XML specifying the label/button.
 * @param {boolean} isLabel Whether this button should be styled as a label.
 * @constructor
 */
Blockly.FlyoutButton = function(workspace, targetWorkspace, xml, isLabel) {

  this.init(workspace, targetWorkspace, xml, isLabel);

  /**
   * Function to call when this button is clicked.
   * @type {function(!Blockly.FlyoutButton)}
   * @private
   */
  this.callback_ = null;

  var callbackKey = xml.getAttribute('callbackKey');
  if (this.isLabel_ && callbackKey) {
    console.warn('Labels should not have callbacks. Label text: ' + this.text_);
  } else if (!this.isLabel_ &&
      !(callbackKey && targetWorkspace.getButtonCallback(callbackKey))) {
    console.warn('Buttons should have callbacks. Button text: ' + this.text_);
  } else {
    this.callback_ = targetWorkspace.getButtonCallback(callbackKey);
  }
};

/**
 * The margin around the text in the button.
 */
Blockly.FlyoutButton.MARGIN = 40;

/**
 * The width of the button's rect.
 * @type {number}
 */
Blockly.FlyoutButton.prototype.width = 0;

/**
 * The height of the button's rect.
 * @type {number}
 */
Blockly.FlyoutButton.prototype.height = 40; // Can't be computed like the width

/**
 * Opaque data that can be passed to Blockly.unbindEvent_.
 * @type {Array.<!Array>}
 * @private
 */
Blockly.FlyoutButton.prototype.onMouseUpWrapper_ = null;

/**
* Initialize the button or label. This is a helper function to so that the
* constructor can be overridden.
* @param {!Blockly.WorkspaceSvg} workspace The workspace in which to place this
*     button.
* @param {!Blockly.WorkspaceSvg} targetWorkspace The flyout's target workspace.
* @param {!Element} xml The XML specifying the label/button.
* @param {boolean} isLabel Whether this button should be styled as a label.
 */
Blockly.FlyoutButton.prototype.init = function(
    workspace, targetWorkspace, xml, isLabel) {

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
   * @type {string}
   * @private
   */
  this.text_ = xml.getAttribute('text');

  /**
   * @type {!goog.math.Coordinate}
   * @private
   */
  this.position_ = new goog.math.Coordinate(0, 0);

  /**
   * Whether this button should be styled as a label.
   * @type {boolean}
   * @private
   */
  this.isLabel_ = isLabel;

  /**
   * Whether this button is a label at the top of a category.
   * @type {boolean}
   * @private
   */
  this.isCategoryLabel_ = xml.getAttribute('category-label') === 'true';

  /**
   * If specified, a CSS class to add to this button.
   * @type {?string}
   * @private
   */
  this.cssClass_ = xml.getAttribute('web-class') || null;
};

/**
 * Create the button elements.
 * @return {!Element} The button's SVG group.
 */
Blockly.FlyoutButton.prototype.createDom = function() {
  var cssClass = this.isLabel_ ? 'blocklyFlyoutLabel' : 'blocklyFlyoutButton';
  if (this.cssClass_) {
    cssClass += ' ' + this.cssClass_;
  }

  this.svgGroup_ = Blockly.utils.createSvgElement('g', {'class': cssClass},
      this.workspace_.getCanvas());

  this.addTextSvg(this.isLabel_);

  this.mouseUpWrapper_ = Blockly.bindEventWithChecks_(this.svgGroup_, 'mouseup',
      this, this.onMouseUp_);
  return this.svgGroup_;
};

/**
 * Add the text element for the label or button.
 * @param {boolean} isLabel True if this is a label and not button.
 * @package
 */
Blockly.FlyoutButton.prototype.addTextSvg = function(isLabel) {
  if (!isLabel) {
    // Shadow rectangle (light source does not mirror in RTL).
    var shadow = Blockly.utils.createSvgElement('rect',
        {
          'class': 'blocklyFlyoutButtonShadow',
          'rx': 4,
          'ry': 4,
          'x': 1,
          'y': 1
        },
        this.svgGroup_);
  }
  // Background rectangle.
  var rect = Blockly.utils.createSvgElement('rect',
      {
        'class': isLabel ?
            'blocklyFlyoutLabelBackground' : 'blocklyFlyoutButtonBackground',
        'rx': 4, 'ry': 4
      },
      this.svgGroup_);

  var svgText = Blockly.utils.createSvgElement('text',
      {
        'class': isLabel ? 'blocklyFlyoutLabelText' : 'blocklyText',
        'x': 0,
        'y': 0,
        'text-anchor': 'middle'
      },
      this.svgGroup_);
  svgText.textContent = Blockly.utils.replaceMessageReferences(this.text_);

  this.width = Blockly.Field.getCachedWidth(svgText);

  if (!isLabel) {
    this.width += 2 * Blockly.FlyoutButton.MARGIN;
    shadow.setAttribute('width', this.width);
    shadow.setAttribute('height', this.height);
  }

  rect.setAttribute('width', this.width);
  rect.setAttribute('height', this.height);

  svgText.setAttribute('text-anchor', 'middle');
  svgText.setAttribute('dominant-baseline', 'central');
  svgText.setAttribute('dy', goog.userAgent.EDGE_OR_IE ?
    Blockly.Field.IE_TEXT_OFFSET : '0');
  svgText.setAttribute('x', this.width / 2);
  svgText.setAttribute('y', this.height / 2);
};

/**
 * Correctly position the flyout button and make it visible.
 */
Blockly.FlyoutButton.prototype.show = function() {
  this.updateTransform_();
  this.svgGroup_.setAttribute('display', 'block');
};

/**
 * Update SVG attributes to match internal state.
 * @private
 */
Blockly.FlyoutButton.prototype.updateTransform_ = function() {
  this.svgGroup_.setAttribute('transform',
      'translate(' + this.position_.x + ',' + this.position_.y + ')');
};

/**
 * Move the button to the given x, y coordinates.
 * @param {number} x The new x coordinate.
 * @param {number} y The new y coordinate.
 */
Blockly.FlyoutButton.prototype.moveTo = function(x, y) {
  this.position_.x = x;
  this.position_.y = y;
  this.updateTransform_();
};

/**
 * Get the button's target workspace.
 * @return {!Blockly.WorkspaceSvg} The target workspace of the flyout where this
 *     button resides.
 */
Blockly.FlyoutButton.prototype.getTargetWorkspace = function() {
  return this.targetWorkspace_;
};

/**
 * Get whether this button is a label at the top of a category.
 * @return {boolean} True if it is a category label.
 * @package
 */
Blockly.FlyoutButton.prototype.getIsCategoryLabel = function() {
  return this.isCategoryLabel_;
};

/**
 * Get the text of this button.
 * @return {string} The text on the button.
 * @package
 */
Blockly.FlyoutButton.prototype.getText = function() {
  return this.text_;
};

/**
 * Get the position of this button.
 * @return {!goog.math.Coordinate} The button position.
 * @package
 */
Blockly.FlyoutButton.prototype.getPosition = function() {
  return this.position_;
};

/**
 * Dispose of this button.
 */
Blockly.FlyoutButton.prototype.dispose = function() {
  if (this.onMouseUpWrapper_) {
    Blockly.unbindEvent_(this.onMouseUpWrapper_);
  }
  if (this.svgGroup_) {
    goog.dom.removeNode(this.svgGroup_);
    this.svgGroup_ = null;
  }
  this.workspace_ = null;
  this.targetWorkspace_ = null;
};

/**
 * Do something when the button is clicked.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.FlyoutButton.prototype.onMouseUp_ = function(e) {
  var gesture = this.targetWorkspace_.getGesture(e);
  if (gesture) {
    gesture.cancel();
  }

  // Call the callback registered to this button.
  if (this.callback_) {
    this.callback_(this);
  }
};
