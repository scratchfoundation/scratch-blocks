/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2015 Google Inc.
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
 * @fileoverview Object representing a zoom icons.
 * @author carloslfu@gmail.com (Carlos Galarza)
 */
'use strict';

goog.provide('Blockly.ZoomControls');

goog.require('Blockly.Touch');
goog.require('goog.dom');


/**
 * Class for a zoom controls.
 * @param {!Blockly.Workspace} workspace The workspace to sit in.
 * @constructor
 */
Blockly.ZoomControls = function(workspace) {
  this.workspace_ = workspace;
};

/**
 * Zoom in icon path.
 * @type {string}
 * @private
 */
Blockly.ZoomControls.prototype.ZOOM_IN_PATH_ = 'zoom-in.svg';

/**
 * Zoom out icon path.
 * @type {string}
 * @private
 */
Blockly.ZoomControls.prototype.ZOOM_OUT_PATH_ = 'zoom-out.svg';

/**
 * Zoom reset icon path.
 * @type {string}
 * @private
 */
Blockly.ZoomControls.prototype.ZOOM_RESET_PATH_ = 'zoom-reset.svg';

/**
 * Width of the zoom controls.
 * @type {number}
 * @private
 */
Blockly.ZoomControls.prototype.WIDTH_ = 36;

/**
 * Height of the zoom controls.
 * @type {number}
 * @private
 */
Blockly.ZoomControls.prototype.HEIGHT_ = 124;

/**
 * Distance between each zoom control.
 * @type {number}
 * @private
 */
Blockly.ZoomControls.prototype.MARGIN_BETWEEN_ = 8;

/**
 * Distance between zoom controls and bottom edge of workspace.
 * @type {number}
 * @private
 */
Blockly.ZoomControls.prototype.MARGIN_BOTTOM_ = 12;

/**
 * Distance between zoom controls and right edge of workspace.
 * @type {number}
 * @private
 */
Blockly.ZoomControls.prototype.MARGIN_SIDE_ = 12;

/**
 * The SVG group containing the zoom controls.
 * @type {Element}
 * @private
 */
Blockly.ZoomControls.prototype.svgGroup_ = null;

/**
 * Left coordinate of the zoom controls.
 * @type {number}
 * @private
 */
Blockly.ZoomControls.prototype.left_ = 0;

/**
 * Top coordinate of the zoom controls.
 * @type {number}
 * @private
 */
Blockly.ZoomControls.prototype.top_ = 0;

/**
 * Create the zoom controls.
 * @return {!Element} The zoom controls SVG group.
 */
Blockly.ZoomControls.prototype.createDom = function() {
  this.svgGroup_ =
      Blockly.utils.createSvgElement('g', {'class': 'blocklyZoom'}, null);
  this.createZoomOutSvg_();
  this.createZoomInSvg_();
  this.createZoomResetSvg_();
  return this.svgGroup_;
};

/**
 * Initialize the zoom controls.
 * @param {number} bottom Distance from workspace bottom to bottom of controls.
 * @return {number} Distance from workspace bottom to the top of controls.
 */
Blockly.ZoomControls.prototype.init = function(bottom) {
  this.bottom_ = this.MARGIN_BOTTOM_ + bottom;
  return this.bottom_ + this.HEIGHT_;
};

/**
 * Dispose of this zoom controls.
 * Unlink from all DOM elements to prevent memory leaks.
 */
Blockly.ZoomControls.prototype.dispose = function() {
  if (this.svgGroup_) {
    goog.dom.removeNode(this.svgGroup_);
    this.svgGroup_ = null;
  }
  this.workspace_ = null;
};

/**
 * Move the zoom controls to the bottom-right corner.
 */
Blockly.ZoomControls.prototype.position = function() {
  var metrics = this.workspace_.getMetrics();
  if (!metrics) {
    // There are no metrics available (workspace is probably not visible).
    return;
  }
  if (this.workspace_.RTL) {
    this.left_ = this.MARGIN_SIDE_ + Blockly.Scrollbar.scrollbarThickness;
    if (metrics.toolboxPosition == Blockly.TOOLBOX_AT_LEFT) {
      this.left_ += metrics.flyoutWidth;
      if (this.workspace_.toolbox_) {
        this.left_ += metrics.absoluteLeft;
      }
    }
  } else {
    this.left_ = metrics.viewWidth + metrics.absoluteLeft -
        this.WIDTH_ - this.MARGIN_SIDE_ - Blockly.Scrollbar.scrollbarThickness;

    if (metrics.toolboxPosition == Blockly.TOOLBOX_AT_RIGHT) {
      this.left_ -= metrics.flyoutWidth;
    }
  }
  this.top_ = metrics.viewHeight + metrics.absoluteTop -
      this.HEIGHT_ - this.bottom_;
  if (metrics.toolboxPosition == Blockly.TOOLBOX_AT_BOTTOM) {
    this.top_ -= metrics.flyoutHeight;
  }
  this.svgGroup_.setAttribute('transform',
      'translate(' + this.left_ + ',' + this.top_ + ')');
};

/**
 * Create the zoom in icon and its event handler.
 * The Scratch Blocks implementation of this function is different from the
 * Blockly implementation.
 * @private
 */
Blockly.ZoomControls.prototype.createZoomOutSvg_ = function() {
  /* This markup will be generated and added to the "blocklyZoom" group:
    <image width="36" height="36" y="44" xlink:href="../media/zoom-out.svg">
    </image>
  */
  var ws = this.workspace_;
  /**
   * Zoom out control.
   * @type {SVGElement}
   */
  var zoomoutSvg = Blockly.utils.createSvgElement(
      'image',
      {
        'width': this.WIDTH_,
        'height': this.WIDTH_,
        'y': (this.WIDTH_ * 1) + (this.MARGIN_BETWEEN_ * 1)
      },
      this.svgGroup_
  );
  zoomoutSvg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
      ws.options.pathToMedia + this.ZOOM_OUT_PATH_);
  // Attach listener.
  Blockly.bindEventWithChecks_(zoomoutSvg, 'mousedown', null, function(e) {
    ws.markFocused();
    ws.zoomCenter(-1);
    Blockly.Touch.clearTouchIdentifier();  // Don't block future drags.
    e.stopPropagation();  // Don't start a workspace scroll.
    e.preventDefault();  // Stop double-clicking from selecting text.
  });
};

/**
 * Create the zoom out icon and its event handler.
 * The Scratch Blocks implementation of this function is different from the
 * Blockly implementation.
 * @private
 */
Blockly.ZoomControls.prototype.createZoomInSvg_ = function() {
  /* This markup will be generated and added to the "blocklyZoom" group:
    <image width="36" height="36" y="0" xlink:href="../media/zoom-in.svg">
    </image>
  */
  var ws = this.workspace_;
  /**
   * Zoom in control.
   * @type {SVGElement}
   */
  var zoominSvg = Blockly.utils.createSvgElement(
      'image',
      {
        'width': this.WIDTH_,
        'height': this.WIDTH_,
        'y': 0
      },
      this.svgGroup_
  );
  zoominSvg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
      ws.options.pathToMedia + this.ZOOM_IN_PATH_);

  // Attach listener.
  Blockly.bindEventWithChecks_(zoominSvg, 'mousedown', null, function(e) {
    ws.markFocused();
    ws.zoomCenter(1);
    Blockly.Touch.clearTouchIdentifier();  // Don't block future drags.
    e.stopPropagation();  // Don't start a workspace scroll.
    e.preventDefault();  // Stop double-clicking from selecting text.
  });
};

/**
 * Create the zoom reset icon and its event handler.
 * The Scratch Blocks implementation of this function is different from the
 * Blockly implementation.
 * @private
 */
Blockly.ZoomControls.prototype.createZoomResetSvg_ = function() {
  /* This markup will be generated and added to the "blocklyZoom" group:
    <image width="36" height="36" y="88" xlink:href="../media/zoom-reset.svg">
    </image>
  */
  var ws = this.workspace_;

  /**
   * Zoom reset control.
   * @type {SVGElement}
   */
  var zoomresetSvg = Blockly.utils.createSvgElement(
      'image',
      {
        'width': this.WIDTH_,
        'height': this.WIDTH_,
        'y': (this.WIDTH_ * 2) + (this.MARGIN_BETWEEN_ * 2)
      },
      this.svgGroup_
  );
  zoomresetSvg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
      ws.options.pathToMedia + this.ZOOM_RESET_PATH_);

  // Attach event listeners.
  Blockly.bindEventWithChecks_(zoomresetSvg, 'mousedown', null, function(e) {
    ws.markFocused();
    ws.setScale(ws.options.zoomOptions.startScale);
    ws.scrollCenter();
    Blockly.Touch.clearTouchIdentifier();  // Don't block future drags.
    e.stopPropagation();  // Don't start a workspace scroll.
    e.preventDefault();  // Stop double-clicking from selecting text.
  });
};
