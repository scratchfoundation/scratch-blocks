/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from "blockly/core";

export class BlockDragEnd extends Blockly.Events.BlockBase {
  constructor(block, isOutside) {
    super(block);
    this.type = "endDrag";
    this.isOutside = isOutside;
    this.recordUndo = false;
    this.xml = Blockly.Xml.blockToDom(block, true);
  }

  toJson() {
    return {
      ...super.toJson(),
      isOutside: this.isOutside,
      xml: this.xml,
    };
  }

  static fromJson(json, workspace, event) {
    const newEvent = super.fromJson(json, workspace, event);
    newEvent.isOutside = json["isOutside"];
    newEvent.xml = json["xml"];

    return newEvent;
  }
}
