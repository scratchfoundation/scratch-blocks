/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from "blockly/core";
import { cssVarify } from "../colours.js";

export class ConstantProvider extends Blockly.zelos.ConstantProvider {
  REPLACEMENT_GLOW_COLOUR = "#ffffff";

  /**
   * Sets the visual theme used to render the workspace.
   * This method also synthesizes a "selected" theme, used to color blocks with
   * dropdown menus when the menu is active. Additionally, if the theme's block
   * styles contain any raw color values, corresponding CSS variables will be
   * created/overridden so that those colors can be dynamically referenced in
   * stylesheets.
   * @param {!Blockly.Theme} The new theme to apply.
   */
  setTheme(theme) {
    const root = document.querySelector(":root");
    for (const [key, colour] of Object.entries(theme.blockStyles)) {
      if (typeof colour === "string") {
        const varKey = `--colour-${key}`;
        root.style.setProperty(varKey, colour);
      } else {
        theme.setBlockStyle(`${key}_selected`, {
          colourPrimary: colour.colourQuaternary ?? colour.colourTertiary,
          colourSecondary: colour.colourQuaternary ?? colour.colourTertiary,
          colourTertiary: colour.colourQuaternary ?? colour.colourTertiary,
          colourQuaternary: colour.colourQuaternary ?? colour.colourTertiary,
        });
      }
    }
    super.setTheme(theme);
  }

  createDom(svg, tagName, selector) {
    super.createDom(svg, tagName, selector);
    this.selectedGlowFilterId = "";
  }
}
