/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
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
 * @fileoverview Object representing a warning.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Warning');

goog.require('Blockly.Bubble');
goog.require('Blockly.Icon');


/**
 * Class for a warning.
 * @param {!Blockly.Block} block The block associated with this warning.
 * @extends {Blockly.Icon}
 * @constructor
 */
Blockly.Warning = function(block) {
  Blockly.Warning.superClass_.constructor.call(this, block);
  this.createIcon();
  // The text_ object can contain multiple warnings.
  this.text_ = {};
};
goog.inherits(Blockly.Warning, Blockly.Icon);

/**
 * Does this icon get hidden when the block is collapsed.
 */
Blockly.Warning.prototype.collapseHidden = false;

/**
 * Draw the warning icon.
 * @param {!Element} group The icon group.
 * @private
 */
Blockly.Warning.prototype.drawIcon_ = function(group) {
  // Triangle with rounded corners.
  Blockly.createSvgElement('path',
      {'class': 'blocklyIconShape',
       'd': 'M2,15Q-1,15 0.5,12L6.5,1.7Q8,-1 9.5,1.7L15.5,12Q17,15 14,15z'},
       group);
  // Can't use a real '!' text character since different browsers and operating
  // systems render it differently.
  // Body of exclamation point.
  Blockly.createSvgElement('path',
      {'class': 'blocklyIconSymbol',
       'd': 'm7,4.8v3.16l0.27,2.27h1.46l0.27,-2.27v-3.16z'},
       group);
  // Dot of exclamation point.
  Blockly.createSvgElement('rect',
      {'class': 'blocklyIconSymbol',
       'x': '7', 'y': '11', 'height': '2', 'width': '2'},
       group);
};

/**
 * Create the text for the warning's bubble.
 * @param {string} text The text to display.
 * @return {!SVGTextElement} The top-level node of the text.
 * @private
 */
Blockly.Warning.textToDom_ = function(text) {
  var paragraph = /** @type {!SVGTextElement} */ (
      Blockly.createSvgElement('text',
          {'class': 'blocklyText blocklyBubbleText',
           'y': Blockly.Bubble.BORDER_WIDTH},
          null));
  var lines = text.split('\n');
  for (var i = 0; i < lines.length; i++) {
    var tspanElement = Blockly.createSvgElement('tspan',
        {'dy': '1em', 'x': Blockly.Bubble.BORDER_WIDTH}, paragraph);
    var textNode = document.createTextNode(lines[i]);
    tspanElement.appendChild(textNode);
  }
  return paragraph;
};

/**
 * Show or hide the warning bubble.
 * @param {boolean} visible True if the bubble should be visible.
 */
Blockly.Warning.prototype.setVisible = function(visible) {
  if (visible == this.isVisible()) {
    // No change.
    return;
  }
  Blockly.Events.fire(
      new Blockly.Events.Ui(this.block_, 'warningOpen', !visible, visible));
  if (visible) {
    // Create the bubble to display all warnings.
    var paragraph = Blockly.Warning.textToDom_(this.getText());
    this.bubble_ = new Blockly.Bubble(
        /** @type {!Blockly.Workspace} */ (this.block_.workspace),
        paragraph, this.block_.svgPath_,
        this.iconX_, this.iconY_, null, null);
    if (this.block_.RTL) {
      // Right-align the paragraph.
      // This cannot be done until the bubble is rendered on screen.
      var maxWidth = paragraph.getBBox().width;
      for (var i = 0, textElement; textElement = paragraph.childNodes[i]; i++) {
        textElement.setAttribute('text-anchor', 'end');
        textElement.setAttribute('x', maxWidth + Blockly.Bubble.BORDER_WIDTH);
      }
    }
    this.updateColour();
    // Bump the warning into the right location.
    var size = this.bubble_.getBubbleSize();
    this.bubble_.setBubbleSize(size.width, size.height);
  } else {
    // Dispose of the bubble.
    this.bubble_.dispose();
    this.bubble_ = null;
    this.body_ = null;
  }
};

/**
 * Bring the warning to the top of the stack when clicked on.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.Warning.prototype.bodyFocus_ = function(e) {
  this.bubble_.promote_();
};

/**
 * Set this warning's text.
 * @param {string} text Warning text (or '' to delete).
 * @param {string} id An ID for this text entry to be able to maintain
 *     multiple warnings.
 */
Blockly.Warning.prototype.setText = function(text, id) {
  if (this.text_[id] == text) {
    return;
  }
  if (text) {
    this.text_[id] = text;
  } else {
    delete this.text_[id];
  }
  if (this.isVisible()) {
    this.setVisible(false);
    this.setVisible(true);
  }
};

/**
 * Get this warning's texts.
 * @return {string} All texts concatenated into one string.
 */
Blockly.Warning.prototype.getText = function() {
  var allWarnings = [];
  for (var id in this.text_) {
    allWarnings.push(this.text_[id]);
  }
  return allWarnings.join('\n');
};

/**
 * Dispose of this warning.
 */
Blockly.Warning.prototype.dispose = function() {
  this.block_.warning = null;
  Blockly.Icon.prototype.dispose.call(this);
};
