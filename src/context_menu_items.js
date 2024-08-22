/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from "blockly/core";

/**
 * Registers a block delete option that ignores shadows in the block count.
 */
export function registerDeleteBlock() {
  const deleteOption = {
    displayText(scope) {
      const descendantCount = getDeletableBlocksInStack(scope.block).length;
      return descendantCount === 1
        ? Blockly.Msg["DELETE_BLOCK"]
        : Blockly.Msg["DELETE_X_BLOCKS"].replace("%1", `${descendantCount}`);
    },
    preconditionFn(scope) {
      if (!scope.block.isInFlyout && scope.block.isDeletable()) {
        return "enabled";
      }
      return "hidden";
    },
    callback(scope) {
      Blockly.Events.setGroup(true);
      scope.block.dispose(true, true);
      Blockly.Events.setGroup(false);
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: "blockDelete",
    weight: 6,
  };
  Blockly.ContextMenuRegistry.registry.register(deleteOption);
}

function getDeletableBlocksInStack(block) {
  let descendants = block.getDescendants(false).filter(isDeletable);
  if (block.getNextBlock()) {
    // Next blocks are not deleted.
    const nextDescendants = block
      .getNextBlock()
      .getDescendants(false)
      .filter(isDeletable);
    descendants = descendants.filter((b) => !nextDescendants.includes(b));
  }
  return descendants;
}

function isDeletable(block) {
  return block.isDeletable() && !block.isShadow();
}

/**
 * Option to delete all blocks.
 */
export function registerDeleteAll() {
  const deleteOption = {
    displayText(scope) {
      if (!scope.workspace) {
        return "";
      }
      const deletableBlocksLength = getDeletableBlocksInWorkspace(
        scope.workspace
      ).length;
      if (deletableBlocksLength === 1) {
        return Blockly.Msg["DELETE_BLOCK"];
      }
      return Blockly.Msg["DELETE_X_BLOCKS"].replace(
        "%1",
        `${deletableBlocksLength}`
      );
    },
    preconditionFn(scope) {
      if (!scope.workspace) {
        return "disabled";
      }
      const deletableBlocksLength = getDeletableBlocksInWorkspace(
        scope.workspace
      ).length;
      return deletableBlocksLength > 0 ? "enabled" : "disabled";
    },
    callback(scope) {
      if (!scope.workspace) {
        return;
      }
      scope.workspace.cancelCurrentGesture();
      const deletableBlocks = getDeletableBlocksInWorkspace(scope.workspace);
      if (deletableBlocks.length < 2) {
        deleteNext(deletableBlocks);
      } else {
        Blockly.dialog.confirm(
          Blockly.Msg["DELETE_ALL_BLOCKS"].replace(
            "%1",
            String(deletableBlocks.length)
          ),
          function (ok) {
            if (ok) {
              deleteNext(deletableBlocks);
            }
          }
        );
      }
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
    id: "workspaceDelete",
    weight: 6,
  };
  Blockly.ContextMenuRegistry.registry.register(deleteOption);
}

/*
 * Constructs a list of blocks that can be deleted in the given workspace.
 *
 * @param workspace to delete all blocks from.
 * @returns list of blocks to delete.
 */
function getDeletableBlocksInWorkspace(workspace) {
  return workspace
    .getTopBlocks(true)
    .flatMap((b) => b.getDescendants(false).filter(isDeletable));
}

/**
 * Deletes the given blocks. Used to delete all blocks in the workspace.
 *
 * @param deleteList List of blocks to delete.
 * @param eventGroup Event group ID with which all delete events should be
 *     associated.  If not specified, create a new group.
 */
function deleteNext(deleteList, eventGroup) {
  const DELAY = 10;
  if (eventGroup) {
    Blockly.Events.setGroup(eventGroup);
  } else {
    Blockly.Events.setGroup(true);
    eventGroup = Blockly.Events.getGroup();
  }
  const block = deleteList.shift();
  if (block) {
    if (!block.isDeadOrDying()) {
      block.dispose(false, true);
      setTimeout(deleteNext, DELAY, deleteList, eventGroup);
    } else {
      deleteNext(deleteList, eventGroup);
    }
  }
  Blockly.Events.setGroup(false);
}
