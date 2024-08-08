/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from "blockly/core";

export class BowlerHat extends Blockly.blockRendering.Hat {
  constructor(constants) {
    super(constants);
    // Calculated dynamically by computeBounds_().
    this.width = 0;
    this.height = 20;
    this.ascenderHeight = this.height;
  }
}
