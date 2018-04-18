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
 * @fileoverview Methods animating a block on connection and disconnection.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.BlockAnimations');


/**
 * Play some UI effects (sound, animation) when disposing of a block.
 * @param {!Blockly.BlockSvg} block The block being disposed of.
 * @package
 */
Blockly.BlockAnimations.disposeUiEffect = function(block) {
  var workspace = block.workspace;
  var svgGroup = block.getSvgRoot();
  workspace.getAudioManager().play('delete');

  var xy = workspace.getSvgXY(svgGroup);
  // Deeply clone the current block.
  var clone = svgGroup.cloneNode(true);
  clone.translateX_ = xy.x;
  clone.translateY_ = xy.y;
  clone.setAttribute('transform', 'translate(' + xy.x + ',' + xy.y + ')');
  workspace.getParentSvg().appendChild(clone);
  clone.bBox_ = clone.getBBox();
  // Start the animation.
  Blockly.BlockAnimations.disposeUiStep_(clone, workspace.RTL, new Date,
      workspace.scale);
};

/**
 * Animate a cloned block and eventually dispose of it.
 * This is a class method, not an instance method since the original block has
 * been destroyed and is no longer accessible.
 * @param {!Element} clone SVG element to animate and dispose of.
 * @param {boolean} rtl True if RTL, false if LTR.
 * @param {!Date} start Date of animation's start.
 * @param {number} workspaceScale Scale of workspace.
 * @private
 */
Blockly.BlockAnimations.disposeUiStep_ = function(clone, rtl, start,
    workspaceScale) {
  var ms = new Date - start;
  var percent = ms / 150;
  if (percent > 1) {
    goog.dom.removeNode(clone);
  } else {
    var x = clone.translateX_ +
        (rtl ? -1 : 1) * clone.bBox_.width * workspaceScale / 2 * percent;
    var y = clone.translateY_ + clone.bBox_.height * workspaceScale * percent;
    var scale = (1 - percent) * workspaceScale;
    clone.setAttribute('transform', 'translate(' + x + ',' + y + ')' +
        ' scale(' + scale + ')');
    setTimeout(Blockly.BlockAnimations.disposeUiStep_, 10, clone, rtl, start,
        workspaceScale);
  }
};

/**
 * Play some UI effects (sound, ripple) after a connection has been established.
 * @param {!Blockly.BlockSvg} block The block being connected.
 * @package
 */
Blockly.BlockAnimations.connectionUiEffect = function(block) {
  block.workspace.getAudioManager().play('click');
};

/**
 * Play some UI effects (sound, animation) when disconnecting a block.
 * No-op in scratch-blocks, which has no disconnect animation.
 * @param {!Blockly.BlockSvg} _block The block being disconnected.
 * @package
 */
Blockly.BlockAnimations.disconnectUiEffect = function(
    /* eslint-disable no-unused-vars */ _block
    /* eslint-enable no-unused-vars */) {
};

/**
 * Stop the disconnect UI animation immediately.
 * No-op in scratch-blocks, which has no disconnect animation.
 * @package
 */
Blockly.BlockAnimations.disconnectUiStop = function() {
};
