/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from "blockly/core";
import { ContinuousCategory } from "@blockly/continuous-toolbox";

export class ScratchContinuousCategory extends ContinuousCategory {
  /**
   * Whether this toolbox category has a status indicator button on its label
   * in the flyout, typically for extensions that interface with hardware
   * devices.
   * @type {boolean}
   */
  showStatusButton = false;

  /** Creates a new ScratchContinuousCategory.
   *
   * @param {!Blockly.toolbox.CategoryInfo} toolboxItemDef A toolbox item
   *     definition.
   * @param {!Blockly.Toolbox} parentToolbox The toolbox this category is being
   *     added to.
   * @param {?Blockly.ICollapsibleToolboxItem} opt_parent The parent toolbox
   *     category, if any.
   */
  constructor(toolboxItemDef, parentToolbox, opt_parent) {
    super(toolboxItemDef, parentToolbox, opt_parent);
    this.showStatusButton = toolboxItemDef["showStatusButton"] === "true";
  }

  /**
   * Creates a DOM element for this category's icon.
   * @returns {!HTMLElement} A DOM element for this category's icon.
   */
  createIconDom_() {
    if (this.toolboxItemDef_.iconURI) {
      const icon = document.createElement("img");
      icon.src = this.toolboxItemDef_.iconURI;
      icon.className = "categoryIconBubble";
      return icon;
    } else {
      const icon = super.createIconDom_();
      icon.style.border = `1px solid ${this.toolboxItemDef_["secondaryColour"]}`;
      return icon;
    }
  }

  /**
   * Sets whether or not this category is selected.
   * @param {boolean} isSelected True if this category is selected.
   */
  setSelected(isSelected) {
    super.setSelected(isSelected);
    // Prevent hardcoding the background color to grey.
    this.rowDiv_.style.backgroundColor = "";
  }

  /**
   * Returns whether or not this category's label in the flyout should display
   * status indicators.
   */
  shouldShowStatusButton() {
    return this.showStatusButton;
  }
}

/** Registers this toolbox category and unregisters the default one. */
export function registerScratchContinuousCategory() {
  Blockly.registry.unregister(
    Blockly.registry.Type.TOOLBOX_ITEM,
    ScratchContinuousCategory.registrationName
  );
  Blockly.registry.register(
    Blockly.registry.Type.TOOLBOX_ITEM,
    ScratchContinuousCategory.registrationName,
    ScratchContinuousCategory
  );
}
