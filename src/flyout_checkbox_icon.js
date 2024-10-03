/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from "blockly/core";
import { CheckboxBubble } from "./checkbox_bubble.js";

/**
 * Invisible icon that exists solely to host the corresponding checkbox bubble.
 * @implements {Blockly.IIcon}
 * @implements {Blockly.IHasBubble}
 */
export class FlyoutCheckboxIcon {
  sourceBlock;
  checkboxBubble;
  type = new Blockly.icons.IconType("checkbox");

  constructor(sourceBlock) {
    this.sourceBlock = sourceBlock;
    if (this.sourceBlock.workspace.isFlyout) {
      this.checkboxBubble = new CheckboxBubble(this.sourceBlock);
    }
  }

  getType() {
    return this.type;
  }

  getWeight() {
    return -1;
  }

  getSize() {
    // Awful hack to cancel out the default padding added to icons.
    return new Blockly.utils.Size(-8, 0);
  }

  isShownWhenCollapsed() {
    return false;
  }

  isClickableInFlyout() {
    return false;
  }

  bubbleIsVisible() {
    return this.sourceBlock.workspace.isFlyout;
  }

  onLocationChange(blockOrigin) {
    this.checkboxBubble?.updateLocation();
  }

  setChecked(checked) {
    this.checkboxBubble?.setChecked(checked);
  }

  dispose() {
    this.checkboxBubble?.dispose();
  }

  // These methods are required by the interfaces, but intentionally have no
  // implementation, largely because this icon has no visual representation.
  applyColour() {}

  hideForInsertionMarker() {}

  updateEditable() {}

  updateCollapsed() {}

  setOffsetInBlock() {}

  onClick() {}

  async setBubbleVisible(visible) {}

  initView(pointerDownListener) {}
}

Blockly.registry.register(
  Blockly.registry.Type.ICON,
  "checkbox",
  FlyoutCheckboxIcon,
  true
);
