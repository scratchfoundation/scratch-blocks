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
 * @fileoverview Utility methods.
 * These methods are not specific to Blockly, and could be factored out into
 * a JavaScript framework such as Closure.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.utils');

goog.require('goog.dom');
goog.require('goog.events.BrowserFeature');
goog.require('goog.math.Coordinate');
goog.require('goog.userAgent');


/**
 * Cached value for whether 3D is supported
 * @type {boolean}
 * @private
 */
Blockly.cache3dSupported_ = null;

/**
 * Add a CSS class to a element.
 * Similar to Closure's goog.dom.classes.add, except it handles SVG elements.
 * @param {!Element} element DOM element to add class to.
 * @param {string} className Name of class to add.
 * @private
 */
Blockly.addClass_ = function(element, className) {
  var classes = element.getAttribute('class') || '';
  if ((' ' + classes + ' ').indexOf(' ' + className + ' ') == -1) {
    if (classes) {
      classes += ' ';
    }
    element.setAttribute('class', classes + className);
  }
};

/**
 * Remove a CSS class from a element.
 * Similar to Closure's goog.dom.classes.remove, except it handles SVG elements.
 * @param {!Element} element DOM element to remove class from.
 * @param {string} className Name of class to remove.
 * @private
 */
Blockly.removeClass_ = function(element, className) {
  var classes = element.getAttribute('class');
  if ((' ' + classes + ' ').indexOf(' ' + className + ' ') != -1) {
    var classList = classes.split(/\s+/);
    for (var i = 0; i < classList.length; i++) {
      if (!classList[i] || classList[i] == className) {
        classList.splice(i, 1);
        i--;
      }
    }
    if (classList.length) {
      element.setAttribute('class', classList.join(' '));
    } else {
      element.removeAttribute('class');
    }
  }
};

/**
 * Checks if an element has the specified CSS class.
 * Similar to Closure's goog.dom.classes.has, except it handles SVG elements.
 * @param {!Element} element DOM element to check.
 * @param {string} className Name of class to check.
 * @return {boolean} True if class exists, false otherwise.
 * @private
 */
Blockly.hasClass_ = function(element, className) {
  var classes = element.getAttribute('class');
  return (' ' + classes + ' ').indexOf(' ' + className + ' ') != -1;
};

/**
 * Bind an event to a function call.
 * @param {!Node} node Node upon which to listen.
 * @param {string} name Event name to listen to (e.g. 'mousedown').
 * @param {Object} thisObject The value of 'this' in the function.
 * @param {!Function} func Function to call when event is triggered.
 * @return {!Array.<!Array>} Opaque data that can be passed to unbindEvent_.
 * @private
 */
Blockly.bindEvent_ = function(node, name, thisObject, func) {
  if (thisObject) {
    var wrapFunc = function(e) {
      func.call(thisObject, e);
    };
  } else {
    var wrapFunc = func;
  }
  node.addEventListener(name, wrapFunc, false);
  var bindData = [[node, name, wrapFunc]];
  // Add equivalent touch event.
  if (name in Blockly.bindEvent_.TOUCH_MAP) {
    wrapFunc = function(e) {
      // Punt on multitouch events.
      if (e.changedTouches.length == 1) {
        // Map the touch event's properties to the event.
        var touchPoint = e.changedTouches[0];
        e.clientX = touchPoint.clientX;
        e.clientY = touchPoint.clientY;
      }
      func.call(thisObject, e);
      // Stop the browser from scrolling/zooming the page.
      e.preventDefault();
    };
    for (var i = 0, eventName;
         eventName = Blockly.bindEvent_.TOUCH_MAP[name][i]; i++) {
      node.addEventListener(eventName, wrapFunc, false);
      bindData.push([node, eventName, wrapFunc]);
    }
  }
  return bindData;
};

/**
 * The TOUCH_MAP lookup dictionary specifies additional touch events to fire,
 * in conjunction with mouse events.
 * @type {Object}
 */
Blockly.bindEvent_.TOUCH_MAP = {};
if (goog.events.BrowserFeature.TOUCH_ENABLED) {
  Blockly.bindEvent_.TOUCH_MAP = {
    'mousedown': ['touchstart'],
    'mousemove': ['touchmove'],
    'mouseup': ['touchend', 'touchcancel']
  };
}

/**
 * Unbind one or more events event from a function call.
 * @param {!Array.<!Array>} bindData Opaque data from bindEvent_.  This list is
 *     emptied during the course of calling this function.
 * @return {!Function} The function call.
 * @private
 */
Blockly.unbindEvent_ = function(bindData) {
  while (bindData.length) {
    var bindDatum = bindData.pop();
    var node = bindDatum[0];
    var name = bindDatum[1];
    var func = bindDatum[2];
    node.removeEventListener(name, func, false);
  }
  return func;
};

/**
 * Don't do anything for this event, just halt propagation.
 * @param {!Event} e An event.
 */
Blockly.noEvent = function(e) {
  // This event has been handled.  No need to bubble up to the document.
  e.preventDefault();
  e.stopPropagation();
};

/**
 * Is this event targeting a text input widget?
 * @param {!Event} e An event.
 * @return {boolean} True if text input.
 * @private
 */
Blockly.isTargetInput_ = function(e) {
  return e.target.type == 'textarea' || e.target.type == 'text' ||
         e.target.type == 'number' || e.target.type == 'email' ||
         e.target.type == 'password' || e.target.type == 'search' ||
         e.target.type == 'tel' || e.target.type == 'url' ||
         e.target.isContentEditable;
};

/**
 * Return the coordinates of the top-left corner of this element relative to
 * its parent.  Only for SVG elements and children (e.g. rect, g, path).
 * @param {!Element} element SVG element to find the coordinates of.
 * @return {!goog.math.Coordinate} Object with .x and .y properties.
 * @private
 */
Blockly.getRelativeXY_ = function(element) {
  var xy = new goog.math.Coordinate(0, 0);
  // First, check for x and y attributes.
  var x = element.getAttribute('x');
  if (x) {
    xy.x = parseInt(x, 10);
  }
  var y = element.getAttribute('y');
  if (y) {
    xy.y = parseInt(y, 10);
  }
  // Second, check for transform="translate(...)" attribute.
  var transform = element.getAttribute('transform');
  if (transform) {
    var transformComponents =
        transform.match(Blockly.getRelativeXY_.XY_REGEXP_);
    if (transformComponents) {
      xy.x += parseFloat(transformComponents[1]);
      if (transformComponents[3]) {
        xy.y += parseFloat(transformComponents[3]);
      }
    }
  }

  // Third, check for style="transform: translate3d(...)".
  var style = element.getAttribute('style');
  if (style && style.indexOf('translate3d') > -1) {
    var styleComponents = style.match(Blockly.getRelativeXY_.XY_3D_REGEXP_);
    if (styleComponents) {
      xy.x += parseFloat(styleComponents[1]);
      if (styleComponents[3]) {
        xy.y += parseFloat(styleComponents[3]);
      }
    }
  }

  return xy;
};

/**
 * Static regex to pull the x,y values out of an SVG translate() directive.
 * Note that Firefox and IE (9,10) return 'translate(12)' instead of
 * 'translate(12, 0)'.
 * Note that IE (9,10) returns 'translate(16 8)' instead of 'translate(16, 8)'.
 * Note that IE has been reported to return scientific notation (0.123456e-42).
 * @type {!RegExp}
 * @private
 */
Blockly.getRelativeXY_.XY_REGEXP_ =
    /translate\(\s*([-+\d.e]+)([ ,]\s*([-+\d.e]+)\s*\))?/;

/**
 * Static regex to pull the x,y,z values out of a translate3d() style property.
 * Accounts for same exceptions as XY_REGEXP_.
 * @type {!RegExp}
 * @private
 */
Blockly.getRelativeXY_.XY_3D_REGEXP_ =
  /transform:\s*translate3d\(\s*([-+\d.e]+)px([ ,]\s*([-+\d.e]+)\s*)px([ ,]\s*([-+\d.e]+)\s*)px\)?/;

/**
 * Return the absolute coordinates of the top-left corner of this element,
 * scales that after canvas SVG element, if it's a descendant.
 * The origin (0,0) is the top-left corner of the Blockly SVG.
 * @param {!Element} element Element to find the coordinates of.
 * @param {!Blockly.Workspace} workspace Element must be in this workspace.
 * @return {!goog.math.Coordinate} Object with .x and .y properties.
 * @private
 */
Blockly.getSvgXY_ = function(element, workspace) {
  var x = 0;
  var y = 0;
  var scale = 1;
  if (goog.dom.contains(workspace.getCanvas(), element) ||
      goog.dom.contains(workspace.getBubbleCanvas(), element)) {
    // Before the SVG canvas, scale the coordinates.
    scale = workspace.scale;
  }
  do {
    // Loop through this block and every parent.
    var xy = Blockly.getRelativeXY_(element);
    if (element == workspace.getCanvas() ||
        element == workspace.getBubbleCanvas()) {
      // After the SVG canvas, don't scale the coordinates.
      scale = 1;
    }
    x += xy.x * scale;
    y += xy.y * scale;
    element = element.parentNode;
  } while (element && element != workspace.getParentSvg());
  return new goog.math.Coordinate(x, y);
};

/**
 * Check if 3D transforms are supported by adding an element
 * and attempting to set the property.
 * @return {boolean} true if 3D transforms are supported
 */
Blockly.is3dSupported = function() {
  if (Blockly.cache3dSupported_ !== null) {
    return Blockly.cache3dSupported_;
  }
  // CC-BY-SA Lorenzo Polidori
  // https://stackoverflow.com/questions/5661671/detecting-transform-translate3d-support
  if (!window.getComputedStyle) {
    return false;
  }

  var el = document.createElement('p'),
    has3d,
    transforms = {
      'webkitTransform': '-webkit-transform',
      'OTransform': '-o-transform',
      'msTransform': '-ms-transform',
      'MozTransform': '-moz-transform',
      'transform': 'transform'
    };

  // Add it to the body to get the computed style.
  document.body.insertBefore(el, null);

  for (var t in transforms) {
    if (el.style[t] !== undefined) {
      el.style[t] = 'translate3d(1px,1px,1px)';
      has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
    }
  }

  document.body.removeChild(el);
  Blockly.cache3dSupported_ = (has3d !== undefined && has3d.length > 0 && has3d !== "none");
  return Blockly.cache3dSupported_;
};

/**
 * Helper method for creating SVG elements.
 * @param {string} name Element's tag name.
 * @param {!Object} attrs Dictionary of attribute names and values.
 * @param {Element} parent Optional parent on which to append the element.
 * @param {Blockly.Workspace=} opt_workspace Optional workspace for access to
 *     context (scale...).
 * @return {!SVGElement} Newly created SVG element.
 */
Blockly.createSvgElement = function(name, attrs, parent, opt_workspace) {
  var e = /** @type {!SVGElement} */ (
      document.createElementNS(Blockly.SVG_NS, name));
  for (var key in attrs) {
    e.setAttribute(key, attrs[key]);
  }
  // IE defines a unique attribute "runtimeStyle", it is NOT applied to
  // elements created with createElementNS. However, Closure checks for IE
  // and assumes the presence of the attribute and crashes.
  if (document.body.runtimeStyle) {  // Indicates presence of IE-only attr.
    e.runtimeStyle = e.currentStyle = e.style;
  }
  if (parent) {
    parent.appendChild(e);
  }
  return e;
};

/**
 * Is this event a right-click?
 * @param {!Event} e Mouse event.
 * @return {boolean} True if right-click.
 */
Blockly.isRightButton = function(e) {
  if (e.ctrlKey && goog.userAgent.MAC) {
    // Control-clicking on Mac OS X is treated as a right-click.
    // WebKit on Mac OS X fails to change button to 2 (but Gecko does).
    return true;
  }
  return e.button == 2;
};

/**
 * Return the converted coordinates of the given mouse event.
 * The origin (0,0) is the top-left corner of the Blockly svg.
 * @param {!Event} e Mouse event.
 * @param {!Element} svg SVG element.
 * @param {SVGMatrix} matrix Inverted screen CTM to use.
 * @return {!Object} Object with .x and .y properties.
 */
Blockly.mouseToSvg = function(e, svg, matrix) {
  var svgPoint = svg.createSVGPoint();
  svgPoint.x = e.clientX;
  svgPoint.y = e.clientY;

  if (!matrix) {
    matrix = svg.getScreenCTM().inverse();
  }
  return svgPoint.matrixTransform(matrix);
};

/**
 * Given an array of strings, return the length of the shortest one.
 * @param {!Array.<string>} array Array of strings.
 * @return {number} Length of shortest string.
 */
Blockly.shortestStringLength = function(array) {
  if (!array.length) {
    return 0;
  }
  var len = array[0].length;
  for (var i = 1; i < array.length; i++) {
    len = Math.min(len, array[i].length);
  }
  return len;
};

/**
 * Given an array of strings, return the length of the common prefix.
 * Words may not be split.  Any space after a word is included in the length.
 * @param {!Array.<string>} array Array of strings.
 * @param {number=} opt_shortest Length of shortest string.
 * @return {number} Length of common prefix.
 */
Blockly.commonWordPrefix = function(array, opt_shortest) {
  if (!array.length) {
    return 0;
  } else if (array.length == 1) {
    return array[0].length;
  }
  var wordPrefix = 0;
  var max = opt_shortest || Blockly.shortestStringLength(array);
  for (var len = 0; len < max; len++) {
    var letter = array[0][len];
    for (var i = 1; i < array.length; i++) {
      if (letter != array[i][len]) {
        return wordPrefix;
      }
    }
    if (letter == ' ') {
      wordPrefix = len + 1;
    }
  }
  for (var i = 1; i < array.length; i++) {
    var letter = array[i][len];
    if (letter && letter != ' ') {
      return wordPrefix;
    }
  }
  return max;
};

/**
 * Given an array of strings, return the length of the common suffix.
 * Words may not be split.  Any space after a word is included in the length.
 * @param {!Array.<string>} array Array of strings.
 * @param {number=} opt_shortest Length of shortest string.
 * @return {number} Length of common suffix.
 */
Blockly.commonWordSuffix = function(array, opt_shortest) {
  if (!array.length) {
    return 0;
  } else if (array.length == 1) {
    return array[0].length;
  }
  var wordPrefix = 0;
  var max = opt_shortest || Blockly.shortestStringLength(array);
  for (var len = 0; len < max; len++) {
    var letter = array[0].substr(-len - 1, 1);
    for (var i = 1; i < array.length; i++) {
      if (letter != array[i].substr(-len - 1, 1)) {
        return wordPrefix;
      }
    }
    if (letter == ' ') {
      wordPrefix = len + 1;
    }
  }
  for (var i = 1; i < array.length; i++) {
    var letter = array[i].charAt(array[i].length - len - 1);
    if (letter && letter != ' ') {
      return wordPrefix;
    }
  }
  return max;
};

/**
 * Is the given string a number (includes negative and decimals).
 * @param {string} str Input string.
 * @return {boolean} True if number, false otherwise.
 */
Blockly.isNumber = function(str) {
  return !!str.match(/^\s*-?\d+(\.\d+)?\s*$/);
};

/**
 * Parse a string with any number of interpolation tokens (%1, %2, ...).
 * '%' characters may be self-escaped (%%).
 * @param {string} message Text containing interpolation tokens.
 * @return {!Array.<string|number>} Array of strings and numbers.
 */
Blockly.utils.tokenizeInterpolation = function(message) {
  var tokens = [];
  var chars = message.split('');
  chars.push('');  // End marker.
  // Parse the message with a finite state machine.
  // 0 - Base case.
  // 1 - % found.
  // 2 - Digit found.
  var state = 0;
  var buffer = [];
  var number = null;
  for (var i = 0; i < chars.length; i++) {
    var c = chars[i];
    if (state == 0) {
      if (c == '%') {
        state = 1;  // Start escape.
      } else {
        buffer.push(c);  // Regular char.
      }
    } else if (state == 1) {
      if (c == '%') {
        buffer.push(c);  // Escaped %: %%
        state = 0;
      } else if ('0' <= c && c <= '9') {
        state = 2;
        number = c;
        var text = buffer.join('');
        if (text) {
          tokens.push(text);
        }
        buffer.length = 0;
      } else {
        buffer.push('%', c);  // Not an escape: %a
        state = 0;
      }
    } else if (state == 2) {
      if ('0' <= c && c <= '9') {
        number += c;  // Multi-digit number.
      } else {
        tokens.push(parseInt(number, 10));
        i--;  // Parse this char again.
        state = 0;
      }
    }
  }
  var text = buffer.join('');
  if (text) {
    tokens.push(text);
  }
  return tokens;
};

/**
 * Generate a unique ID.  This should be globally unique.
 * 87 characters ^ 20 length > 128 bits (better than a UUID).
 * @return {string} A globally unique ID string.
 */
Blockly.genUid = function() {
  var length = 20;
  var soupLength = Blockly.genUid.soup_.length;
  var id = [];
  for (var i = 0; i < length; i++) {
    id[i] = Blockly.genUid.soup_.charAt(Math.random() * soupLength);
  }
  return id.join('');
};

/**
 * Legal characters for the unique ID.
 * Should be all on a US keyboard.  No XML special characters or control codes.
 * Removed $ due to issue 251.
 * @private
 */
Blockly.genUid.soup_ = '!#%()*+,-./:;=?@[]^_`{|}~' +
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Wrap text to the specified width.
 * @param {string} text Text to wrap.
 * @param {number} limit Width to wrap each line.
 * @return {string} Wrapped text.
 */
Blockly.utils.wrap = function(text, limit) {
  var lines = text.split('\n');
  for (var i = 0; i < lines.length; i++) {
    lines[i] = Blockly.utils.wrap_line_(lines[i], limit);
  }
  return lines.join('\n');
};

/**
 * Wrap single line of text to the specified width.
 * @param {string} text Text to wrap.
 * @param {number} limit Width to wrap each line.
 * @return {string} Wrapped text.
 * @private
 */
Blockly.utils.wrap_line_ = function(text, limit) {
  if (text.length <= limit) {
    // Short text, no need to wrap.
    return text;
  }
  // Split the text into words.
  var words = text.trim().split(/\s+/);
  // Set limit to be the length of the largest word.
  for (var i = 0; i < words.length; i++) {
    if (words[i].length > limit) {
      limit = words[i].length;
    }
  }

  var lastScore;
  var score = -Infinity;
  var lastText;
  var lineCount = 1;
  do {
    lastScore = score;
    lastText = text;
    // Create a list of booleans representing if a space (false) or
    // a break (true) appears after each word.
    var wordBreaks = [];
    // Seed the list with evenly spaced linebreaks.
    var steps = words.length / lineCount;
    var insertedBreaks = 1;
    for (var i = 0; i < words.length - 1; i++) {
      if (insertedBreaks < (i + 1.5) / steps) {
        insertedBreaks++;
        wordBreaks[i] = true;
      } else {
        wordBreaks[i] = false;
      }
    }
    wordBreaks = Blockly.utils.wrapMutate_(words, wordBreaks, limit);
    score = Blockly.utils.wrapScore_(words, wordBreaks, limit);
    text = Blockly.utils.wrapToText_(words, wordBreaks);
    lineCount++;
  } while (score > lastScore);
  return lastText;
};

/**
 * Compute a score for how good the wrapping is.
 * @param {!Array.<string>} words Array of each word.
 * @param {!Array.<boolean>} wordBreaks Array of line breaks.
 * @param {number} limit Width to wrap each line.
 * @return {number} Larger the better.
 * @private
 */
Blockly.utils.wrapScore_ = function(words, wordBreaks, limit) {
  // If this function becomes a performance liability, add caching.
  // Compute the length of each line.
  var lineLengths = [0];
  var linePunctuation = [];
  for (var i = 0; i < words.length; i++) {
    lineLengths[lineLengths.length - 1] += words[i].length;
    if (wordBreaks[i] === true) {
      lineLengths.push(0);
      linePunctuation.push(words[i].charAt(words[i].length - 1));
    } else if (wordBreaks[i] === false) {
      lineLengths[lineLengths.length - 1]++;
    }
  }
  var maxLength = Math.max.apply(Math, lineLengths);

  var score = 0;
  for (var i = 0; i < lineLengths.length; i++) {
    // Optimize for width.
    // -2 points per char over limit (scaled to the power of 1.5).
    score -= Math.pow(Math.abs(limit - lineLengths[i]), 1.5) * 2;
    // Optimize for even lines.
    // -1 point per char smaller than max (scaled to the power of 1.5).
    score -= Math.pow(maxLength - lineLengths[i], 1.5);
    // Optimize for structure.
    // Add score to line endings after punctuation.
    if ('.?!'.indexOf(linePunctuation[i]) != -1) {
      score += limit / 3;
    } else if (',;)]}'.indexOf(linePunctuation[i]) != -1) {
      score += limit / 4;
    }
  }
  // All else being equal, the last line should not be longer than the
  // previous line.  For example, this looks wrong:
  // aaa bbb
  // ccc ddd eee
  if (lineLengths.length > 1 && lineLengths[lineLengths.length - 1] <=
      lineLengths[lineLengths.length - 2]) {
    score += 0.5;
  }
  return score;
};

/**
 * Mutate the array of line break locations until an optimal solution is found.
 * No line breaks are added or deleted, they are simply moved around.
 * @param {!Array.<string>} words Array of each word.
 * @param {!Array.<boolean>} wordBreaks Array of line breaks.
 * @param {number} limit Width to wrap each line.
 * @return {!Array.<boolean>} New array of optimal line breaks.
 * @private
 */
Blockly.utils.wrapMutate_ = function(words, wordBreaks, limit) {
  var bestScore = Blockly.utils.wrapScore_(words, wordBreaks, limit);
  var bestBreaks;
  // Try shifting every line break forward or backward.
  for (var i = 0; i < wordBreaks.length - 1; i++) {
    if (wordBreaks[i] == wordBreaks[i + 1]) {
      continue;
    }
    var mutatedWordBreaks = [].concat(wordBreaks);
    mutatedWordBreaks[i] = !mutatedWordBreaks[i];
    mutatedWordBreaks[i + 1] = !mutatedWordBreaks[i + 1];
    var mutatedScore =
        Blockly.utils.wrapScore_(words, mutatedWordBreaks, limit);
    if (mutatedScore > bestScore) {
      bestScore = mutatedScore;
      bestBreaks = mutatedWordBreaks;
    }
  }
  if (bestBreaks) {
    // Found an improvement.  See if it may be improved further.
    return Blockly.utils.wrapMutate_(words, bestBreaks, limit);
  }
  // No improvements found.  Done.
  return wordBreaks;
};

/**
 * Reassemble the array of words into text, with the specified line breaks.
 * @param {!Array.<string>} words Array of each word.
 * @param {!Array.<boolean>} wordBreaks Array of line breaks.
 * @return {string} Plain text.
 * @private
 */
Blockly.utils.wrapToText_ = function(words, wordBreaks) {
  var text = [];
  for (var i = 0; i < words.length; i++) {
    text.push(words[i]);
    if (wordBreaks[i] !== undefined) {
      text.push(wordBreaks[i] ? '\n' : ' ');
    }
  }
  return text.join('');
};

/**
 * Measure some text using a canvas in-memory.
 * @param {string} fontSize E.g., '10pt'
 * @param {string} fontFamily E.g., 'Arial'
 * @param {string} fontWeight E.g., '600'
 * @param {string} text The actual text to measure
 * @return {number} Width of the text in px.
 */
Blockly.measureText = function(fontSize, fontFamily, fontWeight, text) {
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  context.font = fontWeight + ' ' + fontSize + ' ' + fontFamily;
  return context.measureText(text).width;
};

/**
 * Encode a string's HTML entities.
 * E.g., <a> -> &lt;a&gt;
 * @param {!string} rawStr Unencoded raw string to encode.
 * @return {string} String with HTML entities encoded.
 */
Blockly.encodeEntities = function(rawStr) {
  // CC-BY-SA https://stackoverflow.com/questions/18749591/encode-html-entities-in-javascript
  return rawStr.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
    return '&#' + i.charCodeAt(0) + ';';
  });
};
