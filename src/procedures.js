/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Utility functions for handling procedures.
 * @author fraser@google.com (Neil Fraser)
 */

import * as Blockly from "blockly/core";
import * as Constants from "./constants.js";
import * as scratchBlocksUtils from "../core/scratch_blocks_utils.js";

/**
 * Find all user-created procedure definition mutations in a workspace.
 * @param {!Blockly.Workspace} root Root workspace.
 * @return {!Array.<Element>} Array of mutation xml elements.
 * @package
 */
function allProcedureMutations(root) {
  var blocks = root.getAllBlocks();
  var mutations = [];
  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i].type == Constants.PROCEDURES_PROTOTYPE_BLOCK_TYPE) {
      var mutation = blocks[i].mutationToDom(/* opt_generateShadows */ true);
      if (mutation) {
        mutations.push(mutation);
      }
    }
  }
  return mutations;
}

/**
 * Sorts an array of procedure definition mutations alphabetically.
 * (Does not mutate the given array.)
 * @param {!Array.<Element>} mutations Array of mutation xml elements.
 * @return {!Array.<Element>} Sorted array of mutation xml elements.
 * @private
 */
function sortProcedureMutations_(mutations) {
  var newMutations = mutations.slice();

  newMutations.sort(function (a, b) {
    var procCodeA = a.getAttribute("proccode");
    var procCodeB = b.getAttribute("proccode");

    return scratchBlocksUtils.compareStrings(procCodeA, procCodeB);
  });

  return newMutations;
}

/**
 * Construct the blocks required by the flyout for the procedure category.
 * @param {!Blockly.Workspace} workspace The workspace containing procedures.
 * @return {!Array.<!Element>} Array of XML block elements.
 */
function getProceduresCategory(workspace) {
  var xmlList = [];

  addCreateButton_(workspace, xmlList);

  // Create call blocks for each procedure defined in the workspace
  var mutations = allProcedureMutations(workspace);
  mutations = sortProcedureMutations_(mutations);
  for (var i = 0; i < mutations.length; i++) {
    var mutation = mutations[i];
    // <block type="procedures_call">
    //   <mutation ...></mutation>
    // </block>
    var block = document.createElement("block");
    block.setAttribute("type", "procedures_call");
    block.setAttribute("gap", 16);
    block.appendChild(mutation);
    xmlList.push(block);
  }
  return xmlList;
}

/**
 * Create the "Make a Block..." button.
 * @param {!Blockly.Workspace} workspace The workspace contianing procedures.
 * @param {!Array.<!Element>} xmlList Array of XML block elements to add to.
 * @private
 */
function addCreateButton_(workspace, xmlList) {
  var button = document.createElement("button");
  var msg = Blockly.Msg.NEW_PROCEDURE;
  var callbackKey = "CREATE_PROCEDURE";
  var callback = function () {
    createProcedureDefCallback(workspace);
  };
  button.setAttribute("text", msg);
  button.setAttribute("callbackKey", callbackKey);
  workspace.registerButtonCallback(callbackKey, callback);
  xmlList.push(button);
}

/**
 * Find all callers of a named procedure.
 * @param {string} name Name of procedure (procCode in scratch-blocks).
 * @param {!Blockly.Workspace} ws The workspace to find callers in.
 * @param {!Blockly.Block} definitionRoot The root of the stack where the
 *     procedure is defined.
 * @param {boolean} allowRecursive True if the search should include recursive
 *     procedure calls.  False if the search should ignore the stack starting
 *     with definitionRoot.
 * @return {!Array.<!Blockly.Block>} Array of caller blocks.
 * @package
 */
function getCallers(name, ws, definitionRoot, allowRecursive) {
  var allBlocks = [];
  var topBlocks = ws.getTopBlocks();

  // Start by deciding which stacks to investigate.
  for (var i = 0; i < topBlocks.length; i++) {
    var block = topBlocks[i];
    if (block.id == definitionRoot.id && !allowRecursive) {
      continue;
    }
    allBlocks.push.apply(allBlocks, block.getDescendants(false));
  }

  var callers = [];
  for (var i = 0; i < allBlocks.length; i++) {
    var block = allBlocks[i];
    if (block.type == Constants.PROCEDURES_CALL_BLOCK_TYPE) {
      var procCode = block.getProcCode();
      if (procCode && procCode == name) {
        callers.push(block);
      }
    }
  }
  return callers;
}

/**
 * Find and edit all callers with a procCode using a new mutation.
 * @param {string} name Name of procedure (procCode in scratch-blocks).
 * @param {!Blockly.Workspace} ws The workspace to find callers in.
 * @param {!Element} mutation New mutation for the callers.
 * @package
 */
function mutateCallersAndPrototype(name, ws, mutation) {
  var defineBlock = getDefineBlock(name, ws);
  var prototypeBlock = getPrototypeBlock(name, ws);
  if (defineBlock && prototypeBlock) {
    var callers = getCallers(
      name,
      defineBlock.workspace,
      defineBlock,
      true /* allowRecursive */
    );
    callers.push(prototypeBlock);
    Blockly.Events.setGroup(true);
    for (var i = 0, caller; (caller = callers[i]); i++) {
      var oldMutationDom = caller.mutationToDom();
      var oldMutation = oldMutationDom && Blockly.Xml.domToText(oldMutationDom);
      caller.domToMutation(mutation);
      var newMutationDom = caller.mutationToDom();
      var newMutation = newMutationDom && Blockly.Xml.domToText(newMutationDom);
      if (oldMutation != newMutation) {
        Blockly.Events.fire(
          new Blockly.Events.BlockChange(
            caller,
            "mutation",
            null,
            oldMutation,
            newMutation
          )
        );
      }
    }
    Blockly.Events.setGroup(false);
  } else {
    alert("No define block on workspace"); // TODO decide what to do about this.
  }
}

/**
 * Find the definition block for the named procedure.
 * @param {string} procCode The identifier of the procedure.
 * @param {!Blockly.Workspace} workspace The workspace to search.
 * @return {Blockly.Block} The procedure definition block, or null not found.
 * @package
 */
function getDefineBlock(procCode, workspace) {
  // Assume that a procedure definition is a top block.
  var blocks = workspace.getTopBlocks(false);
  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i].type == Constants.PROCEDURES_DEFINITION_BLOCK_TYPE) {
      var prototypeBlock = blocks[i]
        .getInput("custom_block")
        .connection.targetBlock();
      if (
        prototypeBlock.getProcCode &&
        prototypeBlock.getProcCode() == procCode
      ) {
        return blocks[i];
      }
    }
  }
  return null;
}

/**
 * Find the prototype block for the named procedure.
 * @param {string} procCode The identifier of the procedure.
 * @param {!Blockly.Workspace} workspace The workspace to search.
 * @return {Blockly.Block} The procedure prototype block, or null not found.
 * @package
 */
function getPrototypeBlock(procCode, workspace) {
  var defineBlock = getDefineBlock(procCode, workspace);
  if (defineBlock) {
    return defineBlock.getInput("custom_block").connection.targetBlock();
  }
  return null;
}

/**
 * Create a mutation for a brand new custom procedure.
 * @return {Element} The mutation for a new custom procedure
 * @package
 */
function newProcedureMutation() {
  var mutationText =
    "<xml>" +
    "<mutation" +
    ' proccode="' +
    Blockly.Msg["PROCEDURE_DEFAULT_NAME"] +
    '"' +
    ' argumentids="[]"' +
    ' argumentnames="[]"' +
    ' argumentdefaults="[]"' +
    ' warp="false">' +
    "</mutation>" +
    "</xml>";
  return Blockly.utils.xml.textToDom(mutationText).firstChild;
}

/**
 * Callback to create a new procedure custom command block.
 * @param {!Blockly.Workspace} workspace The workspace to create the new procedure on.
 * @private
 */
function createProcedureDefCallback(workspace) {
  ScratchProcedures.externalProcedureDefCallback(
    newProcedureMutation(),
    createProcedureCallbackFactory_(workspace)
  );
}

/**
 * Callback factory for adding a new custom procedure from a mutation.
 * @param {!Blockly.Workspace} workspace The workspace to create the new procedure on.
 * @return {function(?Element)} callback for creating the new custom procedure.
 * @private
 */
function createProcedureCallbackFactory_(workspace) {
  return function (mutation) {
    if (mutation) {
      var blockText =
        "<xml>" +
        '<block type="procedures_definition">' +
        '<statement name="custom_block">' +
        '<shadow type="procedures_prototype">' +
        Blockly.Xml.domToText(mutation) +
        "</shadow>" +
        "</statement>" +
        "</block>" +
        "</xml>";
      var blockDom = Blockly.utils.xml.textToDom(blockText).firstChild;
      Blockly.Events.setGroup(true);
      var block = Blockly.Xml.domToBlock(blockDom, workspace);
      var scale = workspace.scale; // To convert from pixel units to workspace units
      // Position the block so that it is at the top left of the visible workspace,
      // padded from the edge by 30 units. Position in the top right if RTL.
      var posX = -workspace.scrollX;
      if (workspace.RTL) {
        posX += workspace.getMetrics().contentWidth - 30;
      } else {
        posX += 30;
      }
      block.moveBy(posX / scale, (-workspace.scrollY + 30) / scale);
      block.scheduleSnapAndBump();
      Blockly.Events.setGroup(false);
    }
  };
}

/**
 * Callback to open the modal for editing custom procedures.
 * @param {!Blockly.Block} block The block that was right-clicked.
 * @private
 */
function editProcedureCallback_(block) {
  // Edit can come from one of three block types (call, define, prototype)
  // Normalize by setting the block to the prototype block for the procedure.
  if (block.type == Constants.PROCEDURES_DEFINITION_BLOCK_TYPE) {
    var input = block.getInput("custom_block");
    if (!input) {
      alert("Bad input"); // TODO: Decide what to do about this.
      return;
    }
    var conn = input.connection;
    if (!conn) {
      alert("Bad connection"); // TODO: Decide what to do about this.
      return;
    }
    var innerBlock = conn.targetBlock();
    if (
      !innerBlock ||
      !innerBlock.type == Constants.PROCEDURES_PROTOTYPE_BLOCK_TYPE
    ) {
      alert("Bad inner block"); // TODO: Decide what to do about this.
      return;
    }
    block = innerBlock;
  } else if (block.type == Constants.PROCEDURES_CALL_BLOCK_TYPE) {
    // This is a call block, find the prototype corresponding to the procCode.
    // Make sure to search the correct workspace, call block can be in flyout.
    var workspaceToSearch = block.workspace.isFlyout
      ? block.workspace.targetWorkspace
      : block.workspace;
    block = getPrototypeBlock(block.getProcCode(), workspaceToSearch);
  }
  // Block now refers to the procedure prototype block, it is safe to proceed.
  ScratchProcedures.externalProcedureDefCallback(
    block.mutationToDom(),
    editProcedureCallbackFactory_(block)
  );
}

/**
 * Callback factory for editing an existing custom procedure.
 * @param {!Blockly.Block} block The procedure prototype block being edited.
 * @return {function(?Element)} Callback for editing the custom procedure.
 * @private
 */
function editProcedureCallbackFactory_(block) {
  return function (mutation) {
    if (mutation) {
      mutateCallersAndPrototype(block.getProcCode(), block.workspace, mutation);
    }
  };
}

/**
 * Make a context menu option for editing a custom procedure.
 * This appears in the context menu for procedure definitions and procedure
 * calls.
 * @param {!Blockly.BlockSvg} block The block where the right-click originated.
 * @return {!Object} A menu option, containing text, enabled, and a callback.
 * @package
 */
function makeEditOption(block) {
  var editOption = {
    enabled: true,
    text: Blockly.Msg.EDIT_PROCEDURE,
    callback: function () {
      editProcedureCallback_(block);
    },
  };
  return editOption;
}

/**
 * Callback to try to delete a custom block definitions.
 * @param {string} procCode The identifier of the procedure to delete.
 * @param {!Blockly.Block} definitionRoot The root block of the stack that
 *     defines the custom procedure.
 * @return {boolean} True if the custom procedure was deleted, false otherwise.
 * @package
 */
function deleteProcedureDefCallback(procCode, definitionRoot) {
  const callers = getCallers(
    procCode,
    definitionRoot.workspace,
    definitionRoot,
    false /* allowRecursive */
  );
  if (callers.length > 0) {
    return false;
  }

  const workspace = definitionRoot.workspace;
  Blockly.BlockSvg.prototype.checkAndDelete.call(definitionRoot);
  return true;
}

const ScratchProcedures = {
  externalProcedureDefCallback: null,
  createProcedureDefCallback,
  deleteProcedureDefCallback,
  getProceduresCategory,
  makeEditOption,
};
export { ScratchProcedures };
