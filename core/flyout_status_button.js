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
 * @fileoverview Class for a status button in the flyout.
 * @author ericr@media.mit.edu (Eric Rosenbaum)
 */
'use strict';

goog.provide('Blockly.FlyoutStatusButton');

goog.require('Blockly.FlyoutImageButton');

/**
 * Class for a status button in the flyout.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace in which to place this
 *     button.
 * @param {!Blockly.WorkspaceSvg} targetWorkspace The flyout's target workspace.
 * @param {!Element} xml The XML specifying the button.
 * @constructor
 */
Blockly.FlyoutStatusButton = function(workspace, targetWorkspace, xml) {
  Blockly.FlyoutStatusButton.superClass_.constructor.call(this, workspace, targetWorkspace, xml);

  this.extensionId = xml.getAttribute('extensionId');

  // Flyout status buttons have a fixed size.
  this.width = 25;
  this.height = 25;

  this.setStatus(Blockly.StatusButtonState.NOT_READY);
};
goog.inherits(Blockly.FlyoutStatusButton, Blockly.FlyoutImageButton);

/**
 * Set the image on the status button using a status string.
 * @param {string} status The status string.
 */
Blockly.FlyoutStatusButton.prototype.setStatus = function(status) {
  var basePath = Blockly.mainWorkspace.options.pathToMedia;
  if (status == Blockly.StatusButtonState.READY) {
    this.setImageSrc(basePath + 'status-ready.svg');
  }
  if (status == Blockly.StatusButtonState.NOT_READY) {
    this.setImageSrc(basePath + 'status-not-ready.svg');
  }
};
