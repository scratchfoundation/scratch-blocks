import * as Blockly from "blockly";
import { ContinuousFlyout } from "@blockly/continuous-toolbox";

export class CheckableContinuousFlyout extends ContinuousFlyout {
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
    CheckableContinuousFlyout.CHECKBOX_SIZE / 4 +
    " " +
    CheckableContinuousFlyout.CHECKBOX_SIZE / 2 +
    "L" +
    (5 * CheckableContinuousFlyout.CHECKBOX_SIZE) / 12 +
    " " +
    (2 * CheckableContinuousFlyout.CHECKBOX_SIZE) / 3 +
    "L" +
    (3 * CheckableContinuousFlyout.CHECKBOX_SIZE) / 4 +
    " " +
    CheckableContinuousFlyout.CHECKBOX_SIZE / 3;

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
  static CHECKBOX_MARGIN = ContinuousFlyout.prototype.MARGIN;

  /**
   * Total additional width of a row that contains a checkbox.
   * @type {number}
   * @const
   */
  static CHECKBOX_SPACE_X =
    CheckableContinuousFlyout.CHECKBOX_SIZE +
    2 * CheckableContinuousFlyout.CHECKBOX_MARGIN;

  constructor(workspaceOptions) {
    super(workspaceOptions);
    this.tabWidth_ = -2;
    this.MARGIN = 12;
    this.GAP_Y = 12;
    CheckableContinuousFlyout.CHECKBOX_MARGIN = this.MARGIN;

    /**
     * Map of checkboxes that correspond to monitored blocks.
     * Each element is an object containing the SVG for the checkbox, a boolean
     * for its checked state, and the block the checkbox is associated with.
     * @type {!Object.<string, !Object>}
     * @private
     */
    this.checkboxes_ = new Map();
  }

  initFlyoutButton_(button, x, y) {
    if (button.isLabel()) {
      button.height = 40;
    }
    super.initFlyoutButton_(button, x, y);
  }

  show(flyoutDef) {
    this.clearOldCheckboxes();
    super.show(flyoutDef);
  }

  serializeBlock(block) {
    const json = super.serializeBlock(block);
    // Delete the serialized block's ID so that a new one is generated when it is
    // placed on the workspace. Otherwise, the block on the workspace may be
    // indistinguishable from the one in the flyout, which can cause reporter blocks
    // to have their value dropdown shown in the wrong place.
    delete json.id;
    return json;
  }

  clearOldCheckboxes() {
    for (const checkbox of this.checkboxes_.values()) {
      checkbox.svgRoot.remove();
    }
    this.checkboxes_.clear();
  }

  addBlockListeners_(root, block, rect) {
    if (block.checkboxInFlyout) {
      const coordinates = block.getRelativeToSurfaceXY();
      const checkbox = this.createCheckbox_(
        block,
        coordinates.x,
        coordinates.y,
        block.getHeightWidth()
      );
      let moveX = coordinates.x;
      if (this.RTL) {
        moveX -=
          CheckableContinuousFlyout.CHECKBOX_SIZE +
          CheckableContinuousFlyout.CHECKBOX_MARGIN;
      } else {
        moveX +=
          CheckableContinuousFlyout.CHECKBOX_SIZE +
          CheckableContinuousFlyout.CHECKBOX_MARGIN;
      }
      block.moveBy(moveX, 0);
      this.listeners.push(
        Blockly.browserEvents.bind(
          checkbox.svgRoot,
          "mousedown",
          null,
          this.checkboxClicked_(checkbox)
        )
      );
    }
    super.addBlockListeners_(root, block, rect);
  }

  /**
   * Respond to a click on a checkbox in the flyout.
   * @param {!Object} checkboxObj An object containing the svg element of the
   *    checkbox, a boolean for the state of the checkbox, and the block the
   *    checkbox is associated with.
   * @return {!Function} Function to call when checkbox is clicked.
   * @private
   */
  checkboxClicked_(checkboxObj) {
    return function (e) {
      this.setCheckboxState(checkboxObj.block.id, !checkboxObj.clicked);
      // This event has been handled.  No need to bubble up to the document.
      e.stopPropagation();
      e.preventDefault();
    }.bind(this);
  }

  /**
   * Create and place a checkbox corresponding to the given block.
   * @param {!Blockly.Block} block The block to associate the checkbox to.
   * @param {number} cursorX The x position of the cursor during this layout pass.
   * @param {number} cursorY The y position of the cursor during this layout pass.
   * @param {!{height: number, width: number}} blockHW The height and width of the
   *     block.
   * @private
   */
  createCheckbox_(block, cursorX, cursorY, blockHW) {
    var checkboxState = this.getCheckboxState(block.id);
    var svgRoot = block.getSvgRoot();
    var extraSpace =
      CheckableContinuousFlyout.CHECKBOX_SIZE +
      CheckableContinuousFlyout.CHECKBOX_MARGIN;
    var xOffset = this.RTL
      ? this.getWidth() / this.workspace_.scale - extraSpace
      : cursorX;
    var yOffset =
      cursorY +
      blockHW.height / 2 -
      CheckableContinuousFlyout.CHECKBOX_SIZE / 2;
    var touchMargin = CheckableContinuousFlyout.CHECKBOX_TOUCH_PADDING;
    var checkboxGroup = Blockly.utils.dom.createSvgElement(
      "g",
      {
        transform: `translate(${xOffset}, ${yOffset})`,
        fill: "transparent",
      },
      null
    );
    Blockly.utils.dom.createSvgElement(
      "rect",
      {
        class: "blocklyFlyoutCheckbox",
        height: CheckableContinuousFlyout.CHECKBOX_SIZE,
        width: CheckableContinuousFlyout.CHECKBOX_SIZE,
        rx: CheckableContinuousFlyout.CHECKBOX_CORNER_RADIUS,
        ry: CheckableContinuousFlyout.CHECKBOX_CORNER_RADIUS,
      },
      checkboxGroup
    );
    Blockly.utils.dom.createSvgElement(
      "path",
      {
        class: "blocklyFlyoutCheckboxPath",
        d: CheckableContinuousFlyout.CHECKMARK_PATH,
      },
      checkboxGroup
    );
    Blockly.utils.dom.createSvgElement(
      "rect",
      {
        class: "blocklyTouchTargetBackground",
        x: -touchMargin + "px",
        y: -touchMargin + "px",
        height: CheckableContinuousFlyout.CHECKBOX_SIZE + 2 * touchMargin,
        width: CheckableContinuousFlyout.CHECKBOX_SIZE + 2 * touchMargin,
      },
      checkboxGroup
    );
    var checkboxObj = {
      svgRoot: checkboxGroup,
      clicked: checkboxState,
      block: block,
    };

    if (checkboxState) {
      Blockly.utils.dom.addClass(checkboxObj.svgRoot, "checked");
    }

    this.workspace_.getCanvas().insertBefore(checkboxGroup, svgRoot);
    this.checkboxes_.set(block.id, checkboxObj);
    return checkboxObj;
  }

  /**
   * Set the state of a checkbox by block ID.
   * @param {string} blockId ID of the block whose checkbox should be set
   * @param {boolean} value Value to set the checkbox to.
   * @public
   */
  setCheckboxState(blockId, value) {
    var checkboxObj = this.checkboxes_.get(blockId);
    if (!checkboxObj || checkboxObj.clicked === value) {
      return;
    }

    var oldValue = checkboxObj.clicked;
    checkboxObj.clicked = value;

    if (checkboxObj.clicked) {
      Blockly.utils.dom.addClass(checkboxObj.svgRoot, "checked");
    } else {
      Blockly.utils.dom.removeClass(checkboxObj.svgRoot, "checked");
    }

    Blockly.Events.fire(
      new Blockly.Events.BlockChange(
        checkboxObj.block,
        "checkbox",
        null,
        oldValue,
        value
      )
    );
  }

  /**
   * Gets the checkbox state for a block
   * @param {string} blockId The ID of the block in question.
   * @return {boolean} Whether the block is checked.
   * @public
   */
  getCheckboxState() {
    // Patched by scratch-gui in src/lib/blocks.js.
    return false;
  }

  getFlyoutScale() {
    return 0.675;
  }

  blockIsRecyclable_(block) {
    const recyclable = super.blockIsRecyclable_(block);
    // Exclude blocks with output connections, because they are able to report their current
    // value in a popover and recycling them interacts poorly with the VM's maintenance of its
    // state.
    return recyclable && !block.outputConnection;
  }
}
