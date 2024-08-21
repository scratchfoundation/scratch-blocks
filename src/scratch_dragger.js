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

  onDragEnd(event) {
    if (
      this.draggable instanceof Blockly.BlockSvg &&
      this.draggable.type === "procedures_definition" &&
      this.wouldDeleteDraggable(event, this.draggable.getRootBlock())
    ) {
      const procCode = this.draggable
        .getInputTargetBlock("custom_block")
        .getProcCode();
      const hasCaller = this.workspace
        .getBlocksByType("procedures_call")
        .some((b) => b.getProcCode() === procCode);
      if (hasCaller) {
        Blockly.dialog.alert(Blockly.Msg.PROCEDURE_USED);
        this.draggable.revertDrag();
        this.draggable.endDrag();
        return;
      }
    }
    super.onDragEnd(event);
  }
}

Blockly.registry.register(
  Blockly.registry.Type.BLOCK_DRAGGER,
  Blockly.registry.DEFAULT,
  ScratchDragger,
  true
);
