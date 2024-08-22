/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2017 Massachusetts Institute of Technology
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
 * @fileoverview Vertical separator field. Draws a vertical line.
 * @author ericr@media.mit.edu (Eric Rosenbaum)
 */
import * as Blockly from "blockly/core";

/**
 * Class for a vertical separator line.
 * @extends {Blockly.Field}
 * @constructor
 */
class FieldVerticalSeparator extends Blockly.Field {
  constructor() {
    super(Blockly.Field.SKIP_SETUP);
    /**
     * Editable fields are saved by the XML renderer, non-editable fields are not.
     */
    this.EDITABLE = false;
  }

  /**
   * Construct a FieldVerticalSeparator from a JSON arg object.
   * @param {!Object} _element A JSON object with options (unused, but passed in
   *     by Field.fromJson).
   * @returns {!Blockly.FieldVerticalSeparator} The new field instance.
   * @package
   * @nocollapse
   */
  static fromJson = function (
    /* eslint-disable no-unused-vars */ _element
    /* eslint-enable no-unused-vars */
  ) {
    return new FieldVerticalSeparator();
  };

  /**
   * Install this field on a block.
   */
  initView() {
    const height = 10 * this.getConstants().GRID_UNIT;
    this.size_ = new Blockly.utils.Size(1, height);

    /** @type {SVGElement} */
    this.lineElement_ = Blockly.utils.dom.createSvgElement(
      "line",
      {
        stroke: this.sourceBlock_.getColourSecondary(),
        "stroke-linecap": "round",
        x1: 0,
        y1: 0,
        x2: 0,
        y2: height,
      },
      this.fieldGroup_
    );
  }

  /**
   * Set the height of the line element, without adjusting the field's height.
   * This allows the line's height to be changed without causing it to be
   * centered with the new height (needed for correct rendering of hat blocks).
   * @param {number} newHeight the new height for the line.
   * @package
   */
  setLineHeight(newHeight) {
    this.lineElement_.setAttribute("y2", newHeight);
  }

  /**
   * Get the value of this field. A no-op in this case.
   * @return {string} null.
   * @override
   */
  getValue() {
    return null;
  }

  getText() {
    return "";
  }

  /**
   * Set the value of this field. A no-op in this case.
   * @param {?string} src New value.
   * @override
   */
  setValue(
    /* eslint-disable no-unused-vars */ src
    /* eslint-enable no-unused-vars */
  ) {
    return;
  }

  /**
   * Separator lines are fixed width, no need to render.
   * @private
   */
  render_() {
    // NOP
  }

  /**
   * Separator lines are fixed width, no need to update.
   * @private
   */
  updateWidth() {
    // NOP
  }
}

Blockly.fieldRegistry.register(
  "field_vertical_separator",
  FieldVerticalSeparator
);
