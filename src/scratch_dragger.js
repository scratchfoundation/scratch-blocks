/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from "blockly/core";

class ScratchDragger extends Blockly.dragging.Dragger {
  setDraggable(draggable) {
    this.draggable = draggable;
  }
}

Blockly.registry.register(
  Blockly.registry.Type.BLOCK_DRAGGER,
  Blockly.registry.DEFAULT,
  ScratchDragger,
  true
);
