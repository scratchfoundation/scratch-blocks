/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from "blockly/core";
import { BlockCommentBase } from "./events_block_comment_base.js";

class BlockCommentResize extends BlockCommentBase {
  constructor(opt_blockComment, oldSize, newSize) {
    super(opt_blockComment);
    this.type = "block_comment_resize";
    this.oldSize = oldSize;
    this.newSize = newSize;
  }

  toJson() {
    return {
      ...super.toJson(),
      newSize: this.newSize,
      oldSize: this.oldSize,
    };
  }

  static fromJson(json, workspace, event) {
    const newEvent = super.fromJson(json, workspace, event);
    newEvent.newSize = new Blockly.utils.Size(
      json["newSize"]["width"],
      json["newSize"]["height"]
    );
    newEvent.oldSize = new Blockly.utils.Size(
      json["oldSize"]["width"],
      json["oldSize"]["height"]
    );

    return newEvent;
  }

  run(forward) {
    const workspace = this.getEventWorkspace_();
    const block = workspace?.getBlockById(this.blockId);
    const comment = block?.getIcon(Blockly.icons.IconType.COMMENT);
    comment?.setBubbleSize(forward ? this.newSize : this.oldSize);
  }
}

Blockly.registry.register(
  Blockly.registry.Type.EVENT,
  "block_comment_resize",
  BlockCommentResize
);
