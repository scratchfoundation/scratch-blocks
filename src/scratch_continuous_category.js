import * as Blockly from "blockly/core";
import { ContinuousCategory } from "@blockly/continuous-toolbox";

class ScratchContinuousCategory extends ContinuousCategory {
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

  setSelected(isSelected) {
    super.setSelected(isSelected);
    // Prevent hardcoding the background color to grey.
    this.rowDiv_.style.backgroundColor = "";
  }
}

Blockly.registry.register(
  Blockly.registry.Type.TOOLBOX_ITEM,
  Blockly.ToolboxCategory.registrationName,
  ScratchContinuousCategory,
  true
);
