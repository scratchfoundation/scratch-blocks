/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2013 Google Inc.
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
 * @fileoverview Angle input field.
 * @author fraser@google.com (Neil Fraser)
 */
"use strict";

import * as Blockly from "blockly/core";

class FieldAngle extends Blockly.FieldNumber {
  /**
   * Construct a FieldAngle from a JSON arg object.
   * @param {!Object} options A JSON object with options (angle).
   * @returns {!Blockly.FieldAngle} The new field instance.
   * @package
   * @nocollapse
   */
  fromJson(options) {
    return new FieldAngle(options["angle"]);
  }

  /**
   * Round angles to the nearest 15 degrees when using mouse.
   * Set to 0 to disable rounding.
   */
  ROUND = 15;

  /**
   * Half the width of protractor image.
   */
  HALF = 120 / 2;

  /* The following two settings work together to set the behaviour of the angle
   * picker.  While many combinations are possible, two modes are typical:
   * Math mode.
   *   0 deg is right, 90 is up.  This is the style used by protractors.
   *   CLOCKWISE = false;
   *   OFFSET = 0;
   * Compass mode.
   *   0 deg is up, 90 is right.  This is the style used by maps.
   *   CLOCKWISE = true;
   *   OFFSET = 90;
   */

  /**
   * Angle increases clockwise (true) or counterclockwise (false).
   */
  CLOCKWISE = true;

  /**
   * Offset the location of 0 degrees (and all angles) by a constant.
   * Usually either 0 (0 = right) or 90 (0 = up).
   */
  OFFSET = 90;

  /**
   * Maximum allowed angle before wrapping.
   * Usually either 360 (for 0 to 359.9) or 180 (for -179.9 to 180).
   */
  WRAP = 180;

  /**
   * Radius of drag handle
   */
  HANDLE_RADIUS = 10;

  /**
   * Width of drag handle arrow
   */
  ARROW_WIDTH = this.HANDLE_RADIUS;

  /**
   * Half the stroke-width used for the "glow" around the drag handle, rounded up to nearest whole pixel
   */

  HANDLE_GLOW_WIDTH = 3;

  /**
   * Radius of protractor circle.  Slightly smaller than protractor size since
   * otherwise SVG crops off half the border at the edges.
   */
  RADIUS = this.HALF - this.HANDLE_RADIUS - this.HANDLE_GLOW_WIDTH;

  /**
   * Radius of central dot circle.
   */
  CENTER_RADIUS = 2;

  /**
   * Path to the arrow svg icon.
   */
  ARROW_SVG_PATH = "icons/arrow.svg";

  /**
   * Clean up this FieldAngle, as well as the inherited FieldTextInput.
   * @return {!Function} Closure to call on destruction of the WidgetDiv.
   * @private
   */
  dispose() {
    super.dispose();
    this.gauge_ = null;
    if (this.mouseDownWrapper_) {
      Blockly.browserEvents.unbind(this.mouseDownWrapper_);
    }
    if (this.mouseUpWrapper_) {
      Blockly.browserEvents.unbind(this.mouseUpWrapper_);
    }
    if (this.mouseMoveWrapper_) {
      Blockly.browserEvents.unbind(this.mouseMoveWrapper_);
    }
  }

  /**
   * Show the inline free-text editor on top of the text.
   * @private
   */
  showEditor_(event) {
    super.showEditor_(event);
    // If there is an existing drop-down someone else owns, hide it immediately and clear it.
    Blockly.DropDownDiv.hideWithoutAnimation();
    Blockly.DropDownDiv.clearContent();
    var div = Blockly.DropDownDiv.getContentDiv();
    // Build the SVG DOM.
    var svg = Blockly.utils.dom.createSvgElement(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        "xmlns:html": "http://www.w3.org/1999/xhtml",
        "xmlns:xlink": "http://www.w3.org/1999/xlink",
        version: "1.1",
        height: this.HALF * 2 + "px",
        width: this.HALF * 2 + "px",
      },
      div
    );
    Blockly.utils.dom.createSvgElement(
      "circle",
      {
        cx: this.HALF,
        cy: this.HALF,
        r: this.RADIUS,
        class: "blocklyAngleCircle",
      },
      svg
    );
    this.gauge_ = Blockly.utils.dom.createSvgElement(
      "path",
      { class: "blocklyAngleGauge" },
      svg
    );
    // The moving line, x2 and y2 are set in updateGraph_
    this.line_ = Blockly.utils.dom.createSvgElement(
      "line",
      {
        x1: this.HALF,
        y1: this.HALF,
        class: "blocklyAngleLine",
      },
      svg
    );
    // The fixed vertical line at the offset
    var offsetRadians = (Math.PI * this.OFFSET) / 180;
    Blockly.utils.dom.createSvgElement(
      "line",
      {
        x1: this.HALF,
        y1: this.HALF,
        x2: this.HALF + this.RADIUS * Math.cos(offsetRadians),
        y2: this.HALF - this.RADIUS * Math.sin(offsetRadians),
        class: "blocklyAngleLine",
      },
      svg
    );
    // Draw markers around the edge.
    for (var angle = 0; angle < 360; angle += 15) {
      Blockly.utils.dom.createSvgElement(
        "line",
        {
          x1: this.HALF + this.RADIUS - 13,
          y1: this.HALF,
          x2: this.HALF + this.RADIUS - 7,
          y2: this.HALF,
          class: "blocklyAngleMarks",
          transform:
            "rotate(" + angle + "," + this.HALF + "," + this.HALF + ")",
        },
        svg
      );
    }
    // Center point
    Blockly.utils.dom.createSvgElement(
      "circle",
      {
        cx: this.HALF,
        cy: this.HALF,
        r: this.CENTER_RADIUS,
        class: "blocklyAngleCenterPoint",
      },
      svg
    );
    // Handle group: a circle and the arrow image
    this.handle_ = Blockly.utils.dom.createSvgElement("g", {}, svg);
    Blockly.utils.dom.createSvgElement(
      "circle",
      {
        cx: 0,
        cy: 0,
        r: this.HANDLE_RADIUS,
        class: "blocklyAngleDragHandle",
      },
      this.handle_
    );
    this.arrowSvg_ = Blockly.utils.dom.createSvgElement(
      "image",
      {
        width: this.ARROW_WIDTH,
        height: this.ARROW_WIDTH,
        x: -this.ARROW_WIDTH / 2,
        y: -this.ARROW_WIDTH / 2,
        class: "blocklyAngleDragArrow",
      },
      this.handle_
    );
    this.arrowSvg_.setAttributeNS(
      "http://www.w3.org/1999/xlink",
      "xlink:href",
      Blockly.getMainWorkspace().options.pathToMedia + this.ARROW_SVG_PATH
    );

    Blockly.DropDownDiv.setColour(
      this.getSourceBlock().getParent().getColour(),
      this.getSourceBlock().getColourTertiary()
    );
    Blockly.DropDownDiv.showPositionedByBlock(this, this.getSourceBlock());

    this.mouseDownWrapper_ = Blockly.browserEvents.bind(
      this.handle_,
      "mousedown",
      this,
      this.onMouseDown
    );

    this.updateGraph_();
  }

  /**
   * Set the angle to match the mouse's position.
   * @param {!Event} e Mouse move event.
   */
  onMouseDown() {
    this.mouseMoveWrapper_ = Blockly.browserEvents.bind(
      document.body,
      "mousemove",
      this,
      this.onMouseMove
    );
    this.mouseUpWrapper_ = Blockly.browserEvents.bind(
      document.body,
      "mouseup",
      this,
      this.onMouseUp
    );
  }

  /**
   * Set the angle to match the mouse's position.
   * @param {!Event} e Mouse move event.
   */
  onMouseUp() {
    Blockly.browserEvents.unbind(this.mouseMoveWrapper_);
    Blockly.browserEvents.unbind(this.mouseUpWrapper_);
  }

  /**
   * Set the angle to match the mouse's position.
   * @param {!Event} e Mouse move event.
   */
  onMouseMove(e) {
    e.preventDefault();
    var bBox = this.gauge_.ownerSVGElement.getBoundingClientRect();
    var dx = e.clientX - bBox.left - this.HALF;
    var dy = e.clientY - bBox.top - this.HALF;
    var angle = Math.atan(-dy / dx);
    if (isNaN(angle)) {
      // This shouldn't happen, but let's not let this error propagate further.
      return;
    }
    angle = this.toDegrees(angle);
    // 0: East, 90: North, 180: West, 270: South.
    if (dx < 0) {
      angle += 180;
    } else if (dy > 0) {
      angle += 360;
    }
    if (this.CLOCKWISE) {
      angle = this.OFFSET + 360 - angle;
    } else {
      angle -= this.OFFSET;
    }
    if (this.ROUND) {
      angle = Math.round(angle / this.ROUND) * this.ROUND;
    }
    this.setValue(angle);
    this.setEditorValue_(this.getValue());
    this.resizeEditor_();
  }

  /**
   * Redraw the graph with the current angle.
   * @private
   */
  updateGraph_() {
    if (!this.gauge_) {
      return;
    }
    var angleDegrees = (this.getValue() % 360) + this.OFFSET;
    var angleRadians = this.toRadians(angleDegrees);
    var path = ["M ", this.HALF, ",", this.HALF];
    var x2 = this.HALF;
    var y2 = this.HALF;
    if (!isNaN(angleRadians)) {
      var angle1 = this.toRadians(this.OFFSET);
      var x1 = Math.cos(angle1) * this.RADIUS;
      var y1 = Math.sin(angle1) * -this.RADIUS;
      if (this.CLOCKWISE) {
        angleRadians = 2 * angle1 - angleRadians;
      }
      x2 += Math.cos(angleRadians) * this.RADIUS;
      y2 -= Math.sin(angleRadians) * this.RADIUS;
      // Use large arc only if input value is greater than wrap
      var largeFlag = Math.abs(angleDegrees - this.OFFSET) > 180 ? 1 : 0;
      var sweepFlag = Number(this.CLOCKWISE);
      if (angleDegrees < this.OFFSET) {
        sweepFlag = 1 - sweepFlag; // Sweep opposite direction if less than the offset
      }
      path.push(
        " l ",
        x1,
        ",",
        y1,
        " A ",
        this.RADIUS,
        ",",
        this.RADIUS,
        " 0 ",
        largeFlag,
        " ",
        sweepFlag,
        " ",
        x2,
        ",",
        y2,
        " z"
      );

      // Image rotation needs to be set in degrees
      if (this.CLOCKWISE) {
        var imageRotation = angleDegrees + 2 * this.OFFSET;
      } else {
        var imageRotation = -angleDegrees;
      }
      this.arrowSvg_.setAttribute("transform", "rotate(" + imageRotation + ")");
    }
    this.gauge_.setAttribute("d", path.join(""));
    this.line_.setAttribute("x2", x2);
    this.line_.setAttribute("y2", y2);
    this.handle_.setAttribute("transform", "translate(" + x2 + "," + y2 + ")");
  }

  /**
   * Ensure that only an angle may be entered.
   * @param {string} text The user's text.
   * @return {?string} A string representing a valid angle, or null if invalid.
   */
  doClassValidation_(text) {
    if (text === null) {
      return null;
    }
    var n = parseFloat(text || 0);
    if (isNaN(n)) {
      return null;
    }
    n = n % 360;
    if (n < 0) {
      n += 360;
    }
    if (n > this.WRAP) {
      n -= 360;
    }
    return Number(n);
  }

  doValueUpdate_(newValue) {
    super.doValueUpdate_(newValue);
    this.updateGraph_();
  }

  toDegrees(radians) {
    return (radians * 180) / Math.PI;
  }

  toRadians(degrees) {
    return (degrees * Math.PI) / 180;
  }
}

/**
 * Register the field and any dependencies.
 */
export function registerFieldAngle() {
  Blockly.fieldRegistry.register("field_angle", FieldAngle);
}
