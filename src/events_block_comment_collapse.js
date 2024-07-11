/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from "blockly/core";
import { BlockCommentBase } from "./events_block_comment_base.js";

class BlockCommentCollapse extends BlockCommentBase {
  constructor(opt_blockComment, collapsed) {
    super(opt_blockComment);
    this.type = "block_comment_collapse";
    this.newCollapsed = collapsed;
  }

  toJson() {
    return {
      ...super.toJson(),
      collapsed: this.newCollapsed,
    };
  }

  static fromJson(json, workspace, event) {
    const newEvent = super.fromJson(json, workspace, event);
    newEvent.newCollapsed = json["collapsed"];

    return newEvent;
  }

  run(forward) {
    const workspace = this.getEventWorkspace_();
    const block = workspace.getBlockById(this.blockId);
    const comment = block.getIcon(Blockly.icons.IconType.COMMENT);
    comment.setBubbleVisible(forward ? !this.newCollapsed : this.newCollapsed);
  }
}

Blockly.registry.register(
  Blockly.registry.Type.EVENT,
  "block_comment_collapse",
  BlockCommentCollapse
);
