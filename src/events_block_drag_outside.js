/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from "blockly/core";

export class BlockDragOutside extends Blockly.Events.BlockBase {
  constructor(block, isOutside) {
    super(block);
    this.type = "dragOutside";
    this.isOutside = isOutside;
    this.recordUndo = false;
  }

  toJson() {
    return {
      ...super.toJson(),
      isOutside: this.isOutside,
    };
  }

  static fromJson(json, workspace, event) {
    const newEvent = super.fromJson(json, workspace, event);
    newEvent.isOutside = json["isOutside"];

    return newEvent;
  }
}
