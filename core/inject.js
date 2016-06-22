/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
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
 * @fileoverview Functions for injecting Blockly into a web page.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.inject');

goog.require('Blockly.Css');
goog.require('Blockly.Options');
goog.require('Blockly.WorkspaceSvg');
goog.require('Blockly.DragSurfaceSvg');
goog.require('Blockly.DropDownDiv');
goog.require('goog.dom');
goog.require('goog.ui.Component');
goog.require('goog.userAgent');

/**
 * Radius of stack glow, in px.
 * @type {number}
 * @const
 */
Blockly.STACK_GLOW_RADIUS = 1;

/**
 * Radius of replacement glow, in px.
 * @type {number}
 * @const
 */
Blockly.REPLACEMENT_GLOW_RADIUS = 2;

/**
 * Inject a Blockly editor into the specified container element (usually a div).
 * @param {!Element|string} container Containing element, or its ID,
 *     or a CSS selector.
 * @param {Object=} opt_options Optional dictionary of options.
 * @return {!Blockly.Workspace} Newly created main workspace.
 */
Blockly.inject = function(container, opt_options) {
  if (goog.isString(container)) {
    container = document.getElementById(container) ||
        document.querySelector(container);
  }
  // Verify that the container is in document.
  if (!goog.dom.contains(document, container)) {
    throw 'Error: container is not in current document.';
  }
  var options = new Blockly.Options(opt_options || {});

  // Add the relative wrapper. This is for positioning the drag surface exactly
  // on top of the blockly SVG. Without this, top positioning of the drag surface
  // is always off by a few pixels.
  var relativeWrapper = goog.dom.createDom('div', 'blocklyRelativeWrapper');
  container.appendChild(relativeWrapper);

  var svg = Blockly.createDom_(relativeWrapper, options);
  var dragSurface = new Blockly.DragSurfaceSvg(relativeWrapper);
  dragSurface.createDom();
  var workspace = Blockly.createMainWorkspace_(svg, options, dragSurface);
  Blockly.init_(workspace);
  workspace.markFocused();
  Blockly.bindEvent_(svg, 'focus', workspace, workspace.markFocused);
  Blockly.svgResize(workspace);
  return workspace;
};

/**
 * Create the SVG image.
 * @param {!Element} container Containing element.
 * @param {!Blockly.Options} options Dictionary of options.
 * @return {!Element} Newly created SVG image.
 * @private
 */
Blockly.createDom_ = function(container, options) {
  // Sadly browsers (Chrome vs Firefox) are currently inconsistent in laying
  // out content in RTL mode.  Therefore Blockly forces the use of LTR,
  // then manually positions content in RTL as needed.
  container.setAttribute('dir', 'LTR');
  // Closure can be trusted to create HTML widgets with the proper direction.
  goog.ui.Component.setDefaultRightToLeft(options.RTL);

  // Load CSS.
  Blockly.Css.inject(options.hasCss, options.pathToMedia);

  // Build the SVG DOM.
  var svg = Blockly.createSvgElement('svg', {
    'xmlns': 'http://www.w3.org/2000/svg',
    'xmlns:html': 'http://www.w3.org/1999/xhtml',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'version': '1.1',
    'class': 'blocklySvg'
  }, container);
  var defs = Blockly.createSvgElement('defs', {}, svg);
  var rnd = String(Math.random()).substring(2);

  // Using a dilate distorts the block shape.
  // Instead use a gaussian blur, and then set all alpha to 1 with a transfer.
  var stackGlowFilter = Blockly.createSvgElement('filter',
      {'id': 'blocklyStackGlowFilter',
        'height': '160%', 'width': '180%', y: '-30%', x: '-40%'}, defs);
  Blockly.createSvgElement('feGaussianBlur',
      {'in': 'SourceGraphic',
      'stdDeviation': Blockly.STACK_GLOW_RADIUS}, stackGlowFilter);
  // Set all gaussian blur pixels to 1 opacity before applying flood
  var componentTransfer = Blockly.createSvgElement('feComponentTransfer', {'result': 'outBlur'}, stackGlowFilter);
  Blockly.createSvgElement('feFuncA',
      {'type': 'table', 'tableValues': '0' + ' 1'.repeat(16)}, componentTransfer);
  // Color the highlight
  Blockly.createSvgElement('feFlood',
      {'flood-color': Blockly.Colours.stackGlow,
       'flood-opacity': Blockly.Colours.stackGlowOpacity, 'result': 'outColor'}, stackGlowFilter);
  Blockly.createSvgElement('feComposite',
      {'in': 'outColor', 'in2': 'outBlur',
       'operator': 'in', 'result': 'outGlow'}, stackGlowFilter);
  Blockly.createSvgElement('feComposite',
      {'in': 'SourceGraphic', 'in2': 'outGlow', 'operator': 'over'}, stackGlowFilter);

  // Filter for replacement marker
  var replacementGlowFilter = Blockly.createSvgElement('filter',
      {'id': 'blocklyReplacementGlowFilter',
        'height': '160%', 'width': '180%', y: '-30%', x: '-40%'}, defs);
  Blockly.createSvgElement('feGaussianBlur',
      {'in': 'SourceGraphic',
      'stdDeviation': Blockly.REPLACEMENT_GLOW_RADIUS}, replacementGlowFilter);
  // Set all gaussian blur pixels to 1 opacity before applying flood
  var componentTransfer = Blockly.createSvgElement('feComponentTransfer', {'result': 'outBlur'}, replacementGlowFilter);
  Blockly.createSvgElement('feFuncA',
      {'type': 'table', 'tableValues': '0' + ' 1'.repeat(16)}, componentTransfer);
  // Color the highlight
  Blockly.createSvgElement('feFlood',
      {'flood-color': Blockly.Colours.replacementGlow,
       'flood-opacity': Blockly.Colours.replacementGlowOpacity, 'result': 'outColor'}, replacementGlowFilter);
  Blockly.createSvgElement('feComposite',
      {'in': 'outColor', 'in2': 'outBlur',
       'operator': 'in', 'result': 'outGlow'}, replacementGlowFilter);
  Blockly.createSvgElement('feComposite',
      {'in': 'SourceGraphic', 'in2': 'outGlow', 'operator': 'over'}, replacementGlowFilter);

  var disabledPattern = Blockly.createSvgElement('pattern',
      {'id': 'blocklyDisabledPattern' + rnd,
       'patternUnits': 'userSpaceOnUse',
       'width': 10, 'height': 10}, defs);
  Blockly.createSvgElement('rect',
      {'width': 10, 'height': 10, 'fill': '#aaa'}, disabledPattern);
  Blockly.createSvgElement('path',
      {'d': 'M 0 0 L 10 10 M 10 0 L 0 10', 'stroke': '#cc0'}, disabledPattern);
  options.disabledPatternId = disabledPattern.id;

  var gridPattern = Blockly.createSvgElement('pattern',
      {'id': 'blocklyGridPattern' + rnd,
       'patternUnits': 'userSpaceOnUse'}, defs);
  if (options.gridOptions['length'] > 0 && options.gridOptions['spacing'] > 0) {
    Blockly.createSvgElement('line',
        {'stroke': options.gridOptions['colour']},
        gridPattern);
    if (options.gridOptions['length'] > 1) {
      Blockly.createSvgElement('line',
          {'stroke': options.gridOptions['colour']},
          gridPattern);
    }
    // x1, y1, x1, x2 properties will be set later in updateGridPattern_.
  }
  options.gridPattern = gridPattern;
  return svg;
};

/**
 * Create a main workspace and add it to the SVG.
 * @param {!Element} svg SVG element with pattern defined.
 * @param {!Blockly.Options} options Dictionary of options.
 * @param {!Blockly.DragSurfaceSvg} dragSurface Drag surface SVG for the workspace.
 * @return {!Blockly.Workspace} Newly created main workspace.
 * @private
 */
Blockly.createMainWorkspace_ = function(svg, options, dragSurface) {
  options.parentWorkspace = null;
  options.getMetrics = Blockly.getMainWorkspaceMetrics_;
  options.setMetrics = Blockly.setMainWorkspaceMetrics_;
  var mainWorkspace = new Blockly.WorkspaceSvg(options, dragSurface);
  mainWorkspace.scale = options.zoomOptions.startScale;
  svg.appendChild(mainWorkspace.createDom('blocklyMainBackground'));
  // A null translation will also apply the correct initial scale.
  mainWorkspace.translate(0, 0);
  mainWorkspace.markFocused();

  if (!options.readOnly && !options.hasScrollbars) {
    var workspaceChanged = function() {
      if (Blockly.dragMode_ == Blockly.DRAG_NONE) {
        var metrics = mainWorkspace.getMetrics();
        var edgeLeft = metrics.viewLeft + metrics.absoluteLeft;
        var edgeTop = metrics.viewTop + metrics.absoluteTop;
        if (metrics.contentTop < edgeTop ||
            metrics.contentTop + metrics.contentHeight >
            metrics.viewHeight + edgeTop ||
            metrics.contentLeft <
                (options.RTL ? metrics.viewLeft : edgeLeft) ||
            metrics.contentLeft + metrics.contentWidth > (options.RTL ?
                metrics.viewWidth : metrics.viewWidth + edgeLeft)) {
          // One or more blocks may be out of bounds.  Bump them back in.
          var MARGIN = 25;
          var blocks = mainWorkspace.getTopBlocks(false);
          for (var b = 0, block; block = blocks[b]; b++) {
            var blockXY = block.getRelativeToSurfaceXY();
            var blockHW = block.getHeightWidth();
            // Bump any block that's above the top back inside.
            var overflowTop = edgeTop + MARGIN - blockHW.height - blockXY.y;
            if (overflowTop > 0) {
              block.moveBy(0, overflowTop);
            }
            // Bump any block that's below the bottom back inside.
            var overflowBottom =
                edgeTop + metrics.viewHeight - MARGIN - blockXY.y;
            if (overflowBottom < 0) {
              block.moveBy(0, overflowBottom);
            }
            // Bump any block that's off the left back inside.
            var overflowLeft = MARGIN + edgeLeft -
                blockXY.x - (options.RTL ? 0 : blockHW.width);
            if (overflowLeft > 0) {
              block.moveBy(overflowLeft, 0);
            }
            // Bump any block that's off the right back inside.
            var overflowRight = edgeLeft + metrics.viewWidth - MARGIN -
                blockXY.x + (options.RTL ? blockHW.width : 0);
            if (overflowRight < 0) {
              block.moveBy(overflowRight, 0);
            }
          }
        }
      }
    };
    mainWorkspace.addChangeListener(workspaceChanged);
  }
  // The SVG is now fully assembled.
  Blockly.svgResize(mainWorkspace);
  Blockly.WidgetDiv.createDom();
  Blockly.DropDownDiv.createDom();
  Blockly.Tooltip.createDom();
  return mainWorkspace;
};

/**
 * Initialize Blockly with various handlers.
 * @param {!Blockly.Workspace} mainWorkspace Newly created main workspace.
 * @private
 */
Blockly.init_ = function(mainWorkspace) {
  var options = mainWorkspace.options;
  var svg = mainWorkspace.getParentSvg();

  // Supress the browser's context menu.
  Blockly.bindEvent_(svg, 'contextmenu', null,
      function(e) {
        if (!Blockly.isTargetInput_(e)) {
          e.preventDefault();
        }
      });

  var workspaceResizeHandler = Blockly.bindEvent_(window, 'resize', null,
       function() {
         Blockly.hideChaff(true);
         Blockly.svgResize(mainWorkspace);
       });
  mainWorkspace.setResizeHandlerWrapper(workspaceResizeHandler);

  Blockly.inject.bindDocumentEvents_();

  if (options.languageTree) {
    if (mainWorkspace.toolbox_) {
      mainWorkspace.toolbox_.init(mainWorkspace);
    } else if (mainWorkspace.flyout_) {
      // Build a fixed flyout with the root blocks.
      mainWorkspace.flyout_.init(mainWorkspace);
      mainWorkspace.flyout_.show(options.languageTree.childNodes);
      mainWorkspace.flyout_.scrollToStart();
      // Translate the workspace to avoid the fixed flyout.
      if (options.horizontalLayout) {
        mainWorkspace.scrollY = mainWorkspace.flyout_.height_;
        if (options.toolboxPosition == Blockly.TOOLBOX_AT_BOTTOM) {
          mainWorkspace.scrollY *= -1;
        }
      } else {
        mainWorkspace.scrollX = mainWorkspace.flyout_.width_;
        if (options.toolboxPosition == Blockly.TOOLBOX_AT_RIGHT) {
          mainWorkspace.scrollX *= -1;
        }
      }
      mainWorkspace.translate(mainWorkspace.scrollX, mainWorkspace.scrollY);
    }
  }

  if (options.hasScrollbars) {
    mainWorkspace.scrollbar = new Blockly.ScrollbarPair(mainWorkspace);
    mainWorkspace.scrollbar.resize();
  }

  // Load the sounds.
  if (options.hasSounds) {
    mainWorkspace.loadAudio_(
        [options.pathToMedia + 'click.wav'], 'click');
    mainWorkspace.loadAudio_(
        [options.pathToMedia + 'delete.wav'], 'delete');

    // Bind temporary hooks that preload the sounds.
    var soundBinds = [];
    var unbindSounds = function() {
      while (soundBinds.length) {
        Blockly.unbindEvent_(soundBinds.pop());
      }
      mainWorkspace.preloadAudio_();
    };
    // Android ignores any sound not loaded as a result of a user action.
    soundBinds.push(
        Blockly.bindEvent_(document, 'mousemove', null, unbindSounds));
    soundBinds.push(
        Blockly.bindEvent_(document, 'touchstart', null, unbindSounds));
  }
};

/**
 * Bind document events, but only once.  Destroying and reinjecting Blockly
 * should not bind again.
 * Bind events for scrolling the workspace.
 * Most of these events should be bound to the SVG's surface.
 * However, 'mouseup' has to be on the whole document so that a block dragged
 * out of bounds and released will know that it has been released.
 * Also, 'keydown' has to be on the whole document since the browser doesn't
 * understand a concept of focus on the SVG image.
 * @private
 */
Blockly.inject.bindDocumentEvents_ = function() {
  if (!Blockly.documentEventsBound_) {
    Blockly.bindEvent_(document, 'keydown', null, Blockly.onKeyDown_);
    Blockly.bindEvent_(document, 'touchend', null, Blockly.longStop_);
    Blockly.bindEvent_(document, 'touchcancel', null, Blockly.longStop_);
    // Don't use bindEvent_ for document's mouseup since that would create a
    // corresponding touch handler that would squeltch the ability to interact
    // with non-Blockly elements.
    document.addEventListener('mouseup', Blockly.onMouseUp_, false);
    // Some iPad versions don't fire resize after portrait to landscape change.
    if (goog.userAgent.IPAD) {
      Blockly.bindEvent_(window, 'orientationchange', document, function() {
        // TODO(#397): Fix for multiple blockly workspaces.
        Blockly.svgResize(Blockly.getMainWorkspace());
      });
    }
  }
  Blockly.documentEventsBound_ = true;
};

/**
 * Modify the block tree on the existing toolbox.
 * @param {Node|string} tree DOM tree of blocks, or text representation of same.
 */
Blockly.updateToolbox = function(tree) {
  console.warn('Deprecated call to Blockly.updateToolbox, ' +
               'use workspace.updateToolbox instead.');
  Blockly.getMainWorkspace().updateToolbox(tree);
};
