/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from "blockly/core";
import { BlockCommentBase } from "./events_block_comment_base.js";

class BlockCommentChange extends BlockCommentBase {
  constructor(opt_blockComment, oldContents, newContents) {
    super(opt_blockComment);
    this.type = "block_comment_change";
    this.oldContents_ = oldContents;
    this.newContents_ = newContents;
    // Disable undo because Blockly already tracks changes to comment text for
    // undo purposes; this event exists solely to keep the Scratch VM apprised
    // of the state of things.
    this.recordUndo = false;
  }

  toJson() {
    return {
      ...super.toJson(),
      newContents: this.newContents_,
      oldContents: this.oldContents_,
    };
  }

  static fromJson(json, workspace, event) {
    const newEvent = super.fromJson(json, workspace, event);
    newEvent.newContents_ = json["newContents"];
    newEvent.oldContents_ = json["oldContents"];

    return newEvent;
  }
}

Blockly.registry.register(
  Blockly.registry.Type.EVENT,
  "block_comment_change",
  BlockCommentChange
);
