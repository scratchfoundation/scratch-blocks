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
 * @fileoverview Touch handling for Blockly.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

/**
 * @name Blockly.Touch
 * @namespace
 **/
goog.provide('Blockly.Touch');

goog.require('goog.events');
goog.require('goog.events.BrowserFeature');
goog.require('goog.string');

/**
 * Which touch events are we currently paying attention to?
 * @type {DOMString}
 * @private
 */
Blockly.Touch.touchIdentifier_ = null;

/**
 * The TOUCH_MAP lookup dictionary specifies additional touch events to fire,
 * in conjunction with mouse events.
 * @type {Object}
 */
Blockly.Touch.TOUCH_MAP = {};
if (goog.events.BrowserFeature.TOUCH_ENABLED) {
  Blockly.Touch.TOUCH_MAP = {
    'mousedown': ['touchstart'],
    'mousemove': ['touchmove'],
    'mouseup': ['touchend', 'touchcancel']
  };
}

/**
 * PID of queued long-press task.
 * @private
 */
Blockly.longPid_ = 0;

/**
 * Context menus on touch devices are activated using a long-press.
 * Unfortunately the contextmenu touch event is currently (2015) only suported
 * by Chrome.  This function is fired on any touchstart event, queues a task,
 * which after about a second opens the context menu.  The tasks is killed
 * if the touch event terminates early.
 * @param {!Event} e Touch start event.
 * @param {Blockly.Gesture} gesture The gesture that triggered this longStart.
 * @private
 */
Blockly.longStart_ = function(e, gesture) {
  Blockly.longStop_();
  // Punt on multitouch events.
  if (e.changedTouches.length != 1) {
    return;
  }
  Blockly.longPid_ = setTimeout(function() {
    e.button = 2;  // Simulate a right button click.
    // e was a touch event.  It needs to pretend to be a mouse event.
    e.clientX = e.changedTouches[0].clientX;
    e.clientY = e.changedTouches[0].clientY;

    // Let the gesture route the right-click correctly.
    if (gesture) {
      gesture.handleRightClick(e);
    }
  }, Blockly.LONGPRESS);
};

/**
 * Nope, that's not a long-press.  Either touchend or touchcancel was fired,
 * or a drag hath begun.  Kill the queued long-press task.
 * @private
 */
Blockly.longStop_ = function() {
  if (Blockly.longPid_) {
    clearTimeout(Blockly.longPid_);
    Blockly.longPid_ = 0;
  }
};

/**
 * Clear the touch identifier that tracks which touch stream to pay attention
 * to.  This ends the current drag/gesture and allows other pointers to be
 * captured.
 */
Blockly.Touch.clearTouchIdentifier = function() {
  Blockly.Touch.touchIdentifier_ = null;
};

/**
 * Decide whether Blockly should handle or ignore this event.
 * Mouse and touch events require special checks because we only want to deal
 * with one touch stream at a time.  All other events should always be handled.
 * @param {!Event} e The event to check.
 * @return {boolean} True if this event should be passed through to the
 *     registered handler; false if it should be blocked.
 */
Blockly.Touch.shouldHandleEvent = function(e) {
  return !Blockly.Touch.isMouseOrTouchEvent(e) ||
      Blockly.Touch.checkTouchIdentifier(e);
};

/**
 * Get the touch identifier from the given event.  If it was a mouse event, the
 * identifier is the string 'mouse'.
 * @param {!Event} e Mouse event or touch event.
 * @return {string} The touch identifier from the first changed touch, if
 *     defined.  Otherwise 'mouse'.
 */
Blockly.Touch.getTouchIdentifierFromEvent = function(e) {
  return (e.changedTouches && e.changedTouches[0] &&
      e.changedTouches[0].identifier != undefined &&
      e.changedTouches[0].identifier != null) ?
      e.changedTouches[0].identifier : 'mouse';
};

/**
 * Check whether the touch identifier on the event matches the current saved
 * identifier.  If there is no identifier, that means it's a mouse event and
 * we'll use the identifier "mouse".  This means we won't deal well with
 * multiple mice being used at the same time.  That seems okay.
 * If the current identifier was unset, save the identifier from the
 * event.  This starts a drag/gesture, during which touch events with other
 * identifiers will be silently ignored.
 * @param {!Event} e Mouse event or touch event.
 * @return {boolean} Whether the identifier on the event matches the current
 *     saved identifier.
 */
Blockly.Touch.checkTouchIdentifier = function(e) {
  var identifier = Blockly.Touch.getTouchIdentifierFromEvent(e);

  // if (Blockly.touchIdentifier_ )is insufficient because android touch
  // identifiers may be zero.
  if (Blockly.Touch.touchIdentifier_ != undefined &&
      Blockly.Touch.touchIdentifier_ != null) {
    // We're already tracking some touch/mouse event.  Is this from the same
    // source?
    return Blockly.Touch.touchIdentifier_ == identifier;
  }
  if (e.type == 'mousedown' || e.type == 'touchstart') {
    // No identifier set yet, and this is the start of a drag.  Set it and
    // return.
    Blockly.Touch.touchIdentifier_ = identifier;
    return true;
  }
  // There was no identifier yet, but this wasn't a start event so we're going
  // to ignore it.  This probably means that another drag finished while this
  // pointer was down.
  return false;
};

/**
 * Set an event's clientX and clientY from its first changed touch.  Use this to
 * make a touch event work in a mouse event handler.
 * @param {!Event} e A touch event.
 */
Blockly.Touch.setClientFromTouch = function(e) {
  if (goog.string.startsWith(e.type, 'touch')) {
    // Map the touch event's properties to the event.
    var touchPoint = e.changedTouches[0];
    e.clientX = touchPoint.clientX;
    e.clientY = touchPoint.clientY;
  }
};

/**
 * Check whether a given event is a mouse or touch event.
 * @param {!Event} e An event.
 * @return {boolean} true if it is a mouse or touch event; false otherwise.
 */
Blockly.Touch.isMouseOrTouchEvent = function(e) {
  return goog.string.startsWith(e.type, 'touch') ||
      goog.string.startsWith(e.type, 'mouse');
};

/**
 * Split an event into an array of events, one per changed touch or mouse
 * point.
 * @param {!Event} e A mouse event or a touch event with one or more changed
 * touches.
 * @return {!Array.<!Event>} An array of mouse or touch events.  Each touch
 *     event will have exactly one changed touch.
 */
Blockly.Touch.splitEventByTouches = function(e) {
  var events = [];
  if (e.changedTouches) {
    for (var i = 0; i < e.changedTouches.length; i++) {
      var newEvent = {
        type: e.type,
        changedTouches: [e.changedTouches[i]],
        target: e.target,
        stopPropagation: function(){ e.stopPropagation(); },
        preventDefault: function(){ e.preventDefault(); }
      };
      events[i] = newEvent;
    }
  } else {
    events.push(e);
  }
  return events;
};
