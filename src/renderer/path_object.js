/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from "blockly/core";

/**
 * An object that handles creating and setting each of the SVG elements
 * used by the renderer.
 */
export class PathObject extends Blockly.zelos.PathObject {
  /**
   * Apply the stored colours to the block's path, taking into account whether
   * the paths belong to a shadow block.
   *
   * @param {!Blockly.BlockSvg} block The source block.
   */
  applyColour(block) {
    super.applyColour(block);

    // These blocks are special in that, while they are technically shadow
    // blocks when contained in a procedure definition/prototype, their parent
    // (the sample procedure caller block embedded in the definition block) is
    // also a shadow, so they need to use normal block colors in order to
    // provide contrast with it.
    if (
      block.type === "argument_reporter_string_number" ||
      block.type === "argument_reporter_boolean"
    ) {
      this.svgPath.setAttribute("fill", this.style.colourPrimary);
    }
  }
}
