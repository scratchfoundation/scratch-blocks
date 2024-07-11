/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from "blockly/core";
import { BlockCommentBase } from "./events_block_comment_base.js";

class BlockCommentMove extends BlockCommentBase {
  constructor(opt_blockComment, oldCoordinate, newCoordinate) {
    super(opt_blockComment);
    this.type = "block_comment_move";
    this.oldCoordinate_ = oldCoordinate;
    this.newCoordinate_ = newCoordinate;
  }

  toJson() {
    return {
      ...super.toJson(),
      newCoordinate: this.newCoordinate_,
      oldCoordinate: this.oldCoordinate_,
    };
  }

  static fromJson(json, workspace, event) {
    const newEvent = super.fromJson(json, workspace, event);
    newEvent.newCoordinate_ = new Blockly.utils.Coordinate(
      json["newCoordinate"]["x"],
      json["newCoordinate"]["y"]
    );
    newEvent.oldCoordinate_ = new Blockly.utils.Coordinate(
      json["oldCoordinate"]["x"],
      json["oldCoordinate"]["y"]
    );

    return newEvent;
  }

  run(forward) {
    const workspace = this.getEventWorkspace_();
    const block = workspace?.getBlockById(this.blockId);
    const comment = block?.getIcon(Blockly.icons.IconType.COMMENT);
    comment?.setBubbleLocation(
      forward ? this.newCoordinate_ : this.oldCoordinate_
    );
  }
}

Blockly.registry.register(
  Blockly.registry.Type.EVENT,
  "block_comment_move",
  BlockCommentMove
);
