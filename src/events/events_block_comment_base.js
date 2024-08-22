/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from "blockly/core";

export class BlockCommentBase extends Blockly.Events.Abstract {
  constructor(opt_blockComment) {
    super();
    this.isBlank = !opt_blockComment;

    if (!opt_blockComment) return;

    this.commentId = opt_blockComment.getId();
    this.blockId = opt_blockComment.getSourceBlock()?.id;
    this.workspaceId = opt_blockComment.getSourceBlock()?.workspace.id;
  }

  toJson() {
    return {
      ...super.toJson(),
      commentId: this.commentId,
      blockId: this.blockId,
    };
  }

  static fromJson(json, workspace, event) {
    const newEvent = super.fromJson(json, workspace, event);
    newEvent.commentId = json["commentId"];
    newEvent.blockId = json["blockId"];
    return newEvent;
  }
}
