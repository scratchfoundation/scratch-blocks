/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from "blockly/core";
import { ContinuousFlyout } from "@blockly/continuous-toolbox";
import { RecyclableBlockFlyoutInflater } from "./recyclable_block_flyout_inflater.js";
import { StatusIndicatorLabel } from "./status_indicator_label.js";

export class CheckableContinuousFlyout extends ContinuousFlyout {
  /**
   * Creates a new CheckableContinuousFlyout.
   *
   * @param {!Blockly.Options} workspaceOptions Configuration options for the
   *     flyout workspace.
   */
  constructor(workspaceOptions) {
    workspaceOptions.modalInputs = false;
    super(workspaceOptions);
    this.tabWidth_ = -2;
    this.MARGIN = 12;
    this.GAP_Y = 12;
  }

  /**
   * Displays the given contents in the flyout.
   *
   * @param {!Object} flyoutDef The new contents to show in the flyout.
   */
  show(flyoutDef) {
    super.show(flyoutDef);
    const inflater = this.getInflaterForType("block");
    if (inflater instanceof RecyclableBlockFlyoutInflater) {
      inflater.emptyRecycledBlocks();
    }
  }

  /**
   * Serializes a block to JSON in order to copy it to the main workspace.
   *
   * @param {!Blockly.BlockSvg} block The block to serialize.
   * @returns {!Object} A JSON representation of the block.
   */
  serializeBlock(block) {
    const json = super.serializeBlock(block);
    // Delete the serialized block's ID so that a new one is generated when it is
    // placed on the workspace. Otherwise, the block on the workspace may be
    // indistinguishable from the one in the flyout, which can cause reporter blocks
    // to have their value dropdown shown in the wrong place.
    delete json.id;
    return json;
  }

  /**
   * Set the state of a checkbox by block ID.
   * @param {string} blockId ID of the block whose checkbox should be set
   * @param {boolean} value Value to set the checkbox to.
   * @public
   */
  setCheckboxState(blockId, value) {
    this.getWorkspace()
      .getBlockById(blockId)
      ?.getIcon("checkbox")
      ?.setChecked(value);
  }

  getFlyoutScale() {
    return 0.675;
  }

  getWidth() {
    return 250;
  }

  /**
   * Sets whether or not block recycling is enabled in the flyout.
   *
   * @param {boolean} enabled True if recycling should be enabled.
   */
  setRecyclingEnabled(enabled) {
    const inflater = this.getInflaterForType("block");
    if (inflater instanceof RecyclableBlockFlyoutInflater) {
      inflater.setRecyclingEnabled(enabled);
    }
  }

  /**
   * Records scroll position for each category in the toolbox.
   * The scroll position is determined by the coordinates of each category's
   * label after the entire flyout has been rendered.
   * @package
   */
  recordScrollPositions() {
    // TODO(#211) Remove this once the continuous toolbox has been updated.
    this.scrollPositions = [];
    const categoryLabels = this.getContents()
      .filter(
        (item) =>
          (item.type === "label" || item.type === "status_indicator_label") &&
          item.element.isLabel() &&
          this.getParentToolbox_().getCategoryByName(
            item.element.getButtonText()
          )
      )
      .map((item) => item.element);
    for (const [index, label] of categoryLabels.entries()) {
      this.scrollPositions.push({
        name: label.getButtonText(),
        position: label.getPosition(),
      });
    }
  }

  /**
   * Positions the contents of the flyout.
   *
   * @param {!Blockly.FlyoutItem[]} The flyout items to position.
   */
  layout_(contents) {
    // TODO(#211) Remove this once the continuous toolbox has been updated.
    // Bypass the continuous flyout's layout method until the plugin is
    // updated for the new flyout API.
    Blockly.VerticalFlyout.prototype.layout_.call(this, contents);
  }

  /**
   * Updates the state of status indicators for hardware-based extensions.
   */
  refreshStatusButtons() {
    for (const item of this.contents) {
      if (item.element instanceof StatusIndicatorLabel) {
        item.element.refreshStatus();
      }
    }
  }
}
