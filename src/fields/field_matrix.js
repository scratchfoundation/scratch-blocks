/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Massachusetts Institute of Technology
 * All rights reserved.
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
 * @fileoverview 5x5 matrix input field.
 * Displays an editable 5x5 matrix for controlling LED arrays.
 * @author khanning@gmail.com (Kreg Hanning)
 */
import * as Blockly from "blockly/core";

/**
 * Class for a matrix field.
 * @param {number} matrix The default matrix value represented by a 25-bit integer.
 * @extends {Blockly.Field}
 * @constructor
 */
class FieldMatrix extends Blockly.Field {
  originalStyle;

  constructor(matrix) {
    super(matrix);
    /**
     * Array of SVGElement<rect> for matrix thumbnail image on block field.
     * @type {!Array<SVGElement>}
     * @private
     */
    this.ledThumbNodes_ = [];
    /**
     * Array of SVGElement<rect> for matrix editor in dropdown menu.
     * @type {!Array<SVGElement>}
     * @private
     */
    this.ledButtons_ = [];
    /**
     * SVGElement for LED matrix in editor.
     * @type {?SVGElement}
     * @private
     */
    this.matrixStage_ = null;
    /**
     * SVG image for dropdown arrow.
     * @type {?SVGElement}
     * @private
     */
    this.arrow_ = null;
    /**
     * String indicating matrix paint style.
     * value can be [null, 'fill', 'clear'].
     * @type {?String}
     * @private
     */
    this.paintStyle_ = null;
    /**
     * Touch event wrapper.
     * Runs when the field is selected.
     * @type {!Array}
     * @private
     */
    this.mouseDownWrapper_ = null;
    /**
     * Touch event wrapper.
     * Runs when the clear button editor button is selected.
     * @type {!Array}
     * @private
     */
    this.clearButtonWrapper_ = null;
    /**
     * Touch event wrapper.
     * Runs when the fill button editor button is selected.
     * @type {!Array}
     * @private
     */
    this.fillButtonWrapper_ = null;
    /**
     * Touch event wrapper.
     * Runs when the matrix editor is touched.
     * @type {!Array}
     * @private
     */
    this.matrixTouchWrapper_ = null;
    /**
     * Touch event wrapper.
     * Runs when the matrix editor touch event moves.
     * @type {!Array}
     * @private
     */
    this.matrixMoveWrapper_ = null;
    /**
     * Touch event wrapper.
     * Runs when the matrix editor is released.
     * @type {!Array}
     * @private
     */
    this.matrixReleaseWrapper_ = null;

    this.SERIALIZABLE = true;
  }

  /**
   * Construct a FieldMatrix from a JSON arg object.
   * @param {!Object} options A JSON object with options (matrix).
   * @returns {!Blockly.FieldMatrix} The new field instance.
   * @package
   * @nocollapse
   */
  static fromJson(options) {
    return new FieldMatrix(options["matrix"]);
  }

  /**
   * Fixed size of the matrix thumbnail in the input field, in px.
   * @type {number}
   * @const
   */
  static THUMBNAIL_SIZE = 26;

  /**
   * Fixed size of each matrix thumbnail node, in px.
   * @type {number}
   * @const
   */
  static THUMBNAIL_NODE_SIZE = 4;

  /**
   * Fixed size of each matrix thumbnail node, in px.
   * @type {number}
   * @const
   */
  static THUMBNAIL_NODE_PAD = 1;

  /**
   * Fixed size of arrow icon in drop down menu, in px.
   * @type {number}
   * @const
   */
  static ARROW_SIZE = 12;

  /**
   * Fixed size of each button inside the 5x5 matrix, in px.
   * @type {number}
   * @const
   */
  static MATRIX_NODE_SIZE = 18;

  /**
   * Fixed corner radius for 5x5 matrix buttons, in px.
   * @type {number}
   * @const
   */
  static MATRIX_NODE_RADIUS = 4;

  /**
   * Fixed padding for 5x5 matrix buttons, in px.
   * @type {number}
   * @const
   */
  static MATRIX_NODE_PAD = 5;

  /**
   * String with 25 '0' chars.
   * Used for clearing a matrix or filling an LED node array.
   * @type {string}
   * @const
   */
  static ZEROS = "0000000000000000000000000";

  /**
   * String with 25 '1' chars.
   * Used for filling a matrix.
   * @type {string}
   * @const
   */
  static ONES = "1111111111111111111111111";

  /**
   * Called when the field is placed on a block.
   * @param {Block} block The owning block.
   */
  initView() {
    // Build the DOM.
    this.updateSize_();
    const dropdownArrowPadding = this.getConstants().GRID_UNIT * 2;
    var thumbX = dropdownArrowPadding / 2;
    var thumbY = (this.size_.height - FieldMatrix.THUMBNAIL_SIZE) / 2;
    var thumbnail = Blockly.utils.dom.createSvgElement(
      "g",
      {
        transform: "translate(" + thumbX + ", " + thumbY + ")",
        "pointer-events": "bounding-box",
        cursor: "pointer",
      },
      this.fieldGroup_
    );
    this.ledThumbNodes_ = [];
    var nodeSize = FieldMatrix.THUMBNAIL_NODE_SIZE;
    var nodePad = FieldMatrix.THUMBNAIL_NODE_PAD;
    for (var i = 0; i < 5; i++) {
      for (var n = 0; n < 5; n++) {
        var attr = {
          x: (nodeSize + nodePad) * n + nodePad,
          y: (nodeSize + nodePad) * i + nodePad,
          width: nodeSize,
          height: nodeSize,
          rx: nodePad,
          ry: nodePad,
        };
        this.ledThumbNodes_.push(
          Blockly.utils.dom.createSvgElement("rect", attr, thumbnail)
        );
      }
      thumbnail.style.cursor = "default";
      this.updateMatrix_();
    }

    if (!this.arrow_) {
      var arrowX = FieldMatrix.THUMBNAIL_SIZE + dropdownArrowPadding * 1.5;
      var arrowY = (this.size_.height - FieldMatrix.ARROW_SIZE) / 2;
      this.arrow_ = Blockly.utils.dom.createSvgElement(
        "image",
        {
          height: FieldMatrix.ARROW_SIZE + "px",
          width: FieldMatrix.ARROW_SIZE + "px",
          transform: "translate(" + arrowX + ", " + arrowY + ")",
        },
        this.fieldGroup_
      );
      this.arrow_.setAttributeNS(
        "http://www.w3.org/1999/xlink",
        "xlink:href",
        Blockly.getMainWorkspace().options.pathToMedia + "dropdown-arrow.svg"
      );
      this.arrow_.style.cursor = "default";
    }
  }

  doClassValidation_(matrix) {
    return matrix
      ? matrix + FieldMatrix.ZEROS.substr(0, 25 - matrix.length)
      : matrix;
  }

  doValueUpdate_(newValue) {
    super.doValueUpdate_(newValue);
    if (newValue) {
      this.updateMatrix_();
    }
  }

  /**
   * Show the drop-down menu for editing this field.
   * @private
   */
  showEditor_() {
    var div = Blockly.DropDownDiv.getContentDiv();
    // Build the SVG DOM.
    var matrixSize =
      FieldMatrix.MATRIX_NODE_SIZE * 5 + FieldMatrix.MATRIX_NODE_PAD * 6;
    this.matrixStage_ = Blockly.utils.dom.createSvgElement(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        "xmlns:html": "http://www.w3.org/1999/xhtml",
        "xmlns:xlink": "http://www.w3.org/1999/xlink",
        version: "1.1",
        height: matrixSize + "px",
        width: matrixSize + "px",
      },
      div
    );
    // Create the 5x5 matrix
    this.ledButtons_ = [];
    for (var i = 0; i < 5; i++) {
      for (var n = 0; n < 5; n++) {
        var x =
          FieldMatrix.MATRIX_NODE_SIZE * n +
          FieldMatrix.MATRIX_NODE_PAD * (n + 1);
        var y =
          FieldMatrix.MATRIX_NODE_SIZE * i +
          FieldMatrix.MATRIX_NODE_PAD * (i + 1);
        var attr = {
          x: x + "px",
          y: y + "px",
          width: FieldMatrix.MATRIX_NODE_SIZE,
          height: FieldMatrix.MATRIX_NODE_SIZE,
          rx: FieldMatrix.MATRIX_NODE_RADIUS,
          ry: FieldMatrix.MATRIX_NODE_RADIUS,
        };
        var led = Blockly.utils.dom.createSvgElement(
          "rect",
          attr,
          this.matrixStage_
        );
        this.matrixStage_.appendChild(led);
        this.ledButtons_.push(led);
      }
    }
    // Div for lower button menu
    var buttonDiv = document.createElement("div");
    // Button to clear matrix
    var clearButtonDiv = document.createElement("div");
    clearButtonDiv.className = "scratchMatrixButtonDiv";
    var clearButton = this.createButton_(
      this.sourceBlock_.getColourSecondary()
    );
    clearButtonDiv.appendChild(clearButton);
    // Button to fill matrix
    var fillButtonDiv = document.createElement("div");
    fillButtonDiv.className = "scratchMatrixButtonDiv";
    var fillButton = this.createButton_("#FFFFFF");
    fillButtonDiv.appendChild(fillButton);

    buttonDiv.appendChild(clearButtonDiv);
    buttonDiv.appendChild(fillButtonDiv);
    div.appendChild(buttonDiv);

    Blockly.DropDownDiv.setColour(
      this.sourceBlock_.getColour(),
      this.sourceBlock_.getColourTertiary()
    );
    Blockly.DropDownDiv.showPositionedByBlock(
      this,
      this.sourceBlock_,
      this.dropdownDispose_.bind(this)
    );

    this.matrixTouchWrapper_ = Blockly.browserEvents.bind(
      this.matrixStage_,
      "mousedown",
      this,
      this.onMouseDown
    );
    this.clearButtonWrapper_ = Blockly.browserEvents.bind(
      clearButton,
      "click",
      this,
      this.clearMatrix_
    );
    this.fillButtonWrapper_ = Blockly.browserEvents.bind(
      fillButton,
      "click",
      this,
      this.fillMatrix_
    );

    const sourceBlock = this.getSourceBlock();
    const style = sourceBlock.style;
    if (sourceBlock.isShadow()) {
      this.originalStyle = sourceBlock.getStyleName();
      sourceBlock.setStyle(`${this.originalStyle}_selected`);
    } else if (this.borderRect_) {
      this.borderRect_.setAttribute(
        "fill",
        style.colourQuaternary ?? style.colourTertiary
      );
    }

    // Update the matrix for the current value
    this.updateMatrix_();
  }

  dropdownDispose_() {
    const sourceBlock = this.getSourceBlock();
    if (sourceBlock.isShadow()) {
      sourceBlock.setStyle(this.originalStyle);
    }
  }

  /**
   * Make an svg object that resembles a 3x3 matrix to be used as a button.
   * @param {string} fill The color to fill the matrix nodes.
   * @return {SvgElement} The button svg element.
   */
  createButton_(fill) {
    var button = Blockly.utils.dom.createSvgElement("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      "xmlns:html": "http://www.w3.org/1999/xhtml",
      "xmlns:xlink": "http://www.w3.org/1999/xlink",
      version: "1.1",
      height: FieldMatrix.MATRIX_NODE_SIZE + "px",
      width: FieldMatrix.MATRIX_NODE_SIZE + "px",
    });
    var nodeSize = FieldMatrix.MATRIX_NODE_SIZE / 4;
    var nodePad = FieldMatrix.MATRIX_NODE_SIZE / 16;
    for (var i = 0; i < 3; i++) {
      for (var n = 0; n < 3; n++) {
        Blockly.utils.dom.createSvgElement(
          "rect",
          {
            x: (nodeSize + nodePad) * n + nodePad,
            y: (nodeSize + nodePad) * i + nodePad,
            width: nodeSize,
            height: nodeSize,
            rx: nodePad,
            ry: nodePad,
            fill: fill,
          },
          button
        );
      }
    }
    return button;
  }

  /**
   * Redraw the matrix with the current value.
   * @private
   */
  updateMatrix_() {
    const matrix = this.getValue();
    for (var i = 0; i < matrix.length; i++) {
      if (matrix[i] === "0") {
        this.fillMatrixNode_(
          this.ledButtons_,
          i,
          this.sourceBlock_.getColourSecondary()
        );
        this.fillMatrixNode_(
          this.ledThumbNodes_,
          i,
          this.sourceBlock_.getColour()
        );
      } else {
        this.fillMatrixNode_(this.ledButtons_, i, "#FFFFFF");
        this.fillMatrixNode_(this.ledThumbNodes_, i, "#FFFFFF");
      }
    }
  }

  /**
   * Clear the matrix.
   * @param {!Event} e Mouse event.
   */
  clearMatrix_(e) {
    if (e.button != 0) return;
    this.setValue(FieldMatrix.ZEROS);
  }

  /**
   * Fill the matrix.
   * @param {!Event} e Mouse event.
   */
  fillMatrix_(e) {
    if (e.button != 0) return;
    this.setValue(FieldMatrix.ONES);
  }

  /**
   * Fill matrix node with specified colour.
   * @param {!Array<SVGElement>} node The array of matrix nodes.
   * @param {!number} index The index of the matrix node.
   * @param {!string} fill The fill colour in '#rrggbb' format.
   */
  fillMatrixNode_(node, index, fill) {
    if (!node || !node[index] || !fill) return;
    node[index].setAttribute("fill", fill);
  }

  setLEDNode_(led, state) {
    if (led < 0 || led > 24) return;
    const oldMatrix = this.getValue();
    const newMatrix =
      oldMatrix.substr(0, led) + state + oldMatrix.substr(led + 1);
    this.setValue(newMatrix);
  }

  fillLEDNode_(led) {
    if (led < 0 || led > 24) return;
    this.setLEDNode_(led, "1");
  }

  clearLEDNode_(led) {
    if (led < 0 || led > 24) return;
    this.setLEDNode_(led, "0");
  }

  toggleLEDNode_(led) {
    if (led < 0 || led > 24) return;
    if (this.getValue().charAt(led) === "0") {
      this.setLEDNode_(led, "1");
    } else {
      this.setLEDNode_(led, "0");
    }
  }

  /**
   * Toggle matrix nodes on and off.
   * @param {!Event} e Mouse event.
   */
  onMouseDown(e) {
    this.matrixMoveWrapper_ = Blockly.browserEvents.bind(
      document.body,
      "mousemove",
      this,
      this.onMouseMove
    );
    this.matrixReleaseWrapper_ = Blockly.browserEvents.bind(
      document.body,
      "mouseup",
      this,
      this.onMouseUp
    );
    var ledHit = this.checkForLED_(e);
    if (ledHit > -1) {
      if (this.getValue().charAt(ledHit) === "0") {
        this.paintStyle_ = "fill";
      } else {
        this.paintStyle_ = "clear";
      }
      this.toggleLEDNode_(ledHit);
      this.updateMatrix_();
    } else {
      this.paintStyle_ = null;
    }
  }

  /**
   * Unbind mouse move event and clear the paint style.
   * @param {!Event} e Mouse move event.
   */
  onMouseUp() {
    Blockly.browserEvents.unbind(this.matrixMoveWrapper_);
    this.matrixMoveWrapper_ = null;
    Blockly.browserEvents.unbind(this.matrixReleaseWrapper_);
    this.matrixReleaseWrapper_ = null;
    this.paintStyle_ = null;
  }

  /**
   * Toggle matrix nodes on and off by dragging mouse.
   * @param {!Event} e Mouse move event.
   */
  onMouseMove(e) {
    e.preventDefault();
    if (this.paintStyle_) {
      var led = this.checkForLED_(e);
      if (led < 0) return;
      if (this.paintStyle_ === "clear") {
        this.clearLEDNode_(led);
      } else if (this.paintStyle_ === "fill") {
        this.fillLEDNode_(led);
      }
    }
  }

  /**
   * Check if mouse coordinates collide with a matrix node.
   * @param {!Event} e Mouse move event.
   * @return {number} The matching matrix node or -1 for none.
   */
  checkForLED_(e) {
    var bBox = this.matrixStage_.getBoundingClientRect();
    var nodeSize = FieldMatrix.MATRIX_NODE_SIZE;
    var nodePad = FieldMatrix.MATRIX_NODE_PAD;
    var dx = e.clientX - bBox.left;
    var dy = e.clientY - bBox.top;
    var min = nodePad / 2;
    var max = bBox.width - nodePad / 2;
    if (dx < min || dx > max || dy < min || dy > max) {
      return -1;
    }
    var xDiv = Math.trunc((dx - nodePad / 2) / (nodeSize + nodePad));
    var yDiv = Math.trunc((dy - nodePad / 2) / (nodeSize + nodePad));
    return xDiv + yDiv * nodePad;
  }

  /**
   * Clean up this FieldMatrix, as well as the inherited Field.
   * @return {!Function} Closure to call on destruction of the WidgetDiv.
   * @private
   */
  dispose() {
    super.dispose();
    this.matrixStage_ = null;
    if (this.mouseDownWrapper_) {
      Blockly.browserEvents.unbind(this.mouseDownWrapper_);
    }
    if (this.matrixTouchWrapper_) {
      Blockly.browserEvents.unbind(this.matrixTouchWrapper_);
    }
    if (this.matrixReleaseWrapper_) {
      Blockly.browserEvents.unbind(this.matrixReleaseWrapper_);
    }
    if (this.matrixMoveWrapper_) {
      Blockly.browserEvents.unbind(this.matrixMoveWrapper_);
    }
    if (this.clearButtonWrapper_) {
      Blockly.browserEvents.unbind(this.clearButtonWrapper_);
    }
    if (this.fillButtonWrapper_) {
      Blockly.browserEvents.unbind(this.fillButtonWrapper_);
    }
  }

  updateSize_(margin) {
    const constants = this.getConstants();
    let totalHeight = constants.FIELD_TEXT_HEIGHT;

    this.size_.height = totalHeight;
    this.size_.width =
      FieldMatrix.THUMBNAIL_SIZE +
      FieldMatrix.ARROW_SIZE +
      constants.GRID_UNIT * 2 * 1.5;

    this.positionBorderRect_();
  }

  getClickTarget_() {
    return this.sourceBlock_.getSvgRoot();
  }
}

/**
 * Register the field and any dependencies.
 */
export function registerFieldMatrix() {
  Blockly.fieldRegistry.register("field_matrix", FieldMatrix);
}
