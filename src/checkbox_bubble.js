/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from "blockly/core";

/**
 * A checkbox shown next to reporter blocks in the flyout.
 * @implements {Blockly.IBubble}
 * @implements {Blockly.IRenderedElement}
 */
export class CheckboxBubble {
  /**
   * Size of a checkbox next to a variable reporter.
   * @type {number}
   * @const
   */
  static CHECKBOX_SIZE = 25;

  /**
   * Amount of touchable padding around reporter checkboxes.
   * @type {number}
   * @const
   */
  static CHECKBOX_TOUCH_PADDING = 12;

  /**
   * SVG path data for checkmark in checkbox.
   * @type {string}
   * @const
   */
  static CHECKMARK_PATH =
    "M" +
    CheckboxBubble.CHECKBOX_SIZE / 4 +
    " " +
    CheckboxBubble.CHECKBOX_SIZE / 2 +
    "L" +
    (5 * CheckboxBubble.CHECKBOX_SIZE) / 12 +
    " " +
    (2 * CheckboxBubble.CHECKBOX_SIZE) / 3 +
    "L" +
    (3 * CheckboxBubble.CHECKBOX_SIZE) / 4 +
    " " +
    CheckboxBubble.CHECKBOX_SIZE / 3;

  /**
   * Size of the checkbox corner radius
   * @type {number}
   * @const
   */
  static CHECKBOX_CORNER_RADIUS = 5;

  /**
   * @type {number}
   * @const
   */
  static CHECKBOX_MARGIN = 12;

  /**
   * Total additional width of a row that contains a checkbox.
   * @type {number}
   * @const
   */
  static CHECKBOX_SPACE_X =
    CheckboxBubble.CHECKBOX_SIZE + 2 * CheckboxBubble.CHECKBOX_MARGIN;

  /**
   * Root SVG element for this bubble.
   * @type {!SVGGElement}
   */
  svgRoot;

  /**
   * Identifier for click handler, to allow unregistering during disposal.
   * @type {!Blockly.browserEvents.Data}
   */
  clickListener;

  /**
   * Whether or not this bubble is displayed as checked. Note that the source of
   * truth is the Scratch VM.
   * @type {boolean}
   */
  checked = false;

  /**
   * The location of this bubble in workspace coordinates.
   * @type {!Blockly.utils.Coordinate}
   */
  location = new Blockly.utils.Coordinate(0, 0);

  /**
   * Creates a new flyout checkbox bubble.
   *
   * @param {!Blockly.BlockSvg} sourceBlock The block this bubble should be
   *     associated with.
   */
  constructor(sourceBlock) {
    this.sourceBlock = sourceBlock;
    this.svgRoot = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.G,
      {},
      this.sourceBlock.workspace.getBubbleCanvas()
    );

    const touchMargin = CheckboxBubble.CHECKBOX_TOUCH_PADDING;
    const checkboxGroup = Blockly.utils.dom.createSvgElement(
      "g",
      {
        fill: "transparent",
      },
      null
    );
    Blockly.utils.dom.createSvgElement(
      "rect",
      {
        class: "blocklyFlyoutCheckbox",
        height: CheckboxBubble.CHECKBOX_SIZE,
        width: CheckboxBubble.CHECKBOX_SIZE,
        rx: CheckboxBubble.CHECKBOX_CORNER_RADIUS,
        ry: CheckboxBubble.CHECKBOX_CORNER_RADIUS,
      },
      checkboxGroup
    );
    Blockly.utils.dom.createSvgElement(
      "path",
      {
        class: "blocklyFlyoutCheckboxPath",
        d: CheckboxBubble.CHECKMARK_PATH,
      },
      checkboxGroup
    );
    Blockly.utils.dom.createSvgElement(
      "rect",
      {
        class: "blocklyTouchTargetBackground",
        x: -touchMargin + "px",
        y: -touchMargin + "px",
        height: CheckboxBubble.CHECKBOX_SIZE + 2 * touchMargin,
        width: CheckboxBubble.CHECKBOX_SIZE + 2 * touchMargin,
      },
      checkboxGroup
    );
    this.setChecked(this.isChecked(this.sourceBlock.id));

    this.svgRoot.prepend(checkboxGroup);

    this.clickListener = Blockly.browserEvents.bind(
      this.svgRoot,
      "mousedown",
      null,
      (event) => {
        this.setChecked(!this.checked);
        event.stopPropagation();
        event.preventDefault();
      }
    );
    this.updateLocation();
  }

  /**
   * Sets whether or not this bubble should be displayed in the checked state.
   *
   * @param {boolean} checked True if this bubble should be checked.
   */
  setChecked(checked) {
    if (checked === this.checked) return;

    this.checked = checked;
    if (this.checked) {
      Blockly.utils.dom.addClass(this.svgRoot, "checked");
    } else {
      Blockly.utils.dom.removeClass(this.svgRoot, "checked");
    }

    Blockly.Events.fire(
      new Blockly.Events.BlockChange(
        this.sourceBlock,
        "checkbox",
        null,
        !this.checked,
        this.checked
      )
    );
  }

  /**
   * Returns whether or not the specified block has its checkbox checked.
   *
   * This method is patched by scratch-gui to query the VM state.
   *
   * @param {string} blockId The ID of the block in question.
   * @returns {boolean} True if the block's checkbox should be checked.
   */
  isChecked(blockId) {
    return false;
  }

  /**
   * Returns whether this bubble is movable by the user.
   *
   * @returns {boolean} Always returns false.
   */
  isMovable() {
    return false;
  }

  /**
   * Returns the root SVG element for this bubble.
   *
   * @returns {!SVGGElement} The root SVG element.
   */
  getSvgRoot() {
    return this.svgRoot;
  }

  /**
   * Recalculates this bubble's location, keeping it adjacent to its block.
   */
  updateLocation() {
    const blockLocation = this.sourceBlock.getRelativeToSurfaceXY();
    const blockBounds = this.sourceBlock.getHeightWidth();
    const x = this.sourceBlock.workspace.RTL
      ? blockLocation.x + blockBounds.width + CheckboxBubble.CHECKBOX_MARGIN
      : blockLocation.x -
        CheckboxBubble.CHECKBOX_MARGIN -
        CheckboxBubble.CHECKBOX_SIZE;
    const y =
      blockLocation.y + (blockBounds.height - CheckboxBubble.CHECKBOX_SIZE) / 2;
    this.moveTo(x, y);
  }

  /**
   * Moves this bubble to the specified location.
   *
   * @param {number} x The location on the X axis to move to.
   * @param {number} y The location on the Y axis to move to.
   */
  moveTo(x, y) {
    this.location.x = x;
    this.location.y = y;
    this.svgRoot.setAttribute("transform", `translate(${x}, ${y})`);
  }

  /**
   * Returns this bubble's location in workspace coordinates.
   *
   * @returns {!Blockly.utils.Coordinate} The bubble's location.
   */
  getRelativeToSurfaceXY() {
    return this.location;
  }

  /**
   * Disposes of this checkbox bubble.
   */
  dispose() {
    Blockly.utils.dom.removeNode(this.svgRoot);
    Blockly.browserEvents.unbind(this.clickListener);
  }

  // These methods are required by the interfaces, but intentionally have no
  // implementation, largely because this bubble's location is fixed relative
  // to its block and is not draggable by the user.
  showContextMenu() {}

  setDragging(dragging) {}

  startDrag(event) {}

  drag(newLocation, event) {}

  moveDuringDrag(newLocation) {}

  endDrag() {}

  revertDrag() {}

  setDeleteStyle(enable) {}
}
