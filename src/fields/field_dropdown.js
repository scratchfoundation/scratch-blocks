/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from "blockly/core";

class FieldDropdown extends Blockly.FieldDropdown {
  originalStyle;

  showEditor_(event) {
    super.showEditor_(event);
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
  }

  dropdownDispose_() {
    super.dropdownDispose_();
    const sourceBlock = this.getSourceBlock();
    if (sourceBlock.isShadow()) {
      sourceBlock.setStyle(this.originalStyle);
    }
  }
}

/**
 * Register the field and any dependencies.
 */
export function registerFieldDropdown() {
  Blockly.fieldRegistry.unregister("field_dropdown");
  Blockly.fieldRegistry.register("field_dropdown", FieldDropdown);
}
