/**
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
 * @file Utility functions for handling procedures.
 * @author fraser@google.com (Neil Fraser)
 */
import * as Blockly from 'blockly/core'
import * as scratchBlocksUtils from '../src/scratch_blocks_utils'
import * as Constants from './constants'

/**
 * Find all user-created procedure definition mutations in a workspace.
 * @param root Root workspace.
 * @returns Array of mutation xml elements.
 */
function allProcedureMutations(root: Blockly.WorkspaceSvg): Element[] {
  const blocks = root.getAllBlocks()
  return blocks
    .filter((b) => b.type === Constants.PROCEDURES_PROTOTYPE_BLOCK_TYPE)
    .map((b) => b.mutationToDom!(/* opt_generateShadows */ true))
}

/**
 * Sorts an array of procedure definition mutations alphabetically.
 * (Does not mutate the given array.)
 * @param mutations Array of mutation xml elements.
 * @returns Sorted array of mutation xml elements.
 */
function sortProcedureMutations(mutations: Element[]): Element[] {
  return mutations.slice().sort((a, b) => {
    const procCodeA = a.getAttribute('proccode')!
    const procCodeB = b.getAttribute('proccode')!

    return scratchBlocksUtils.compareStrings(procCodeA, procCodeB)
  })
}

/**
 * Construct the blocks required by the flyout for the procedure category.
 * @param workspace The workspace containing procedures.
 * @returns Array of XML block elements.
 */
function getProceduresCategory(workspace: Blockly.WorkspaceSvg): Element[] {
  const xmlList: Element[] = []

  addCreateButton(workspace, xmlList)

  // Create call blocks for each procedure defined in the workspace
  const mutations = sortProcedureMutations(allProcedureMutations(workspace))
  for (const mutation of mutations) {
    // <block type="procedures_call">
    //   <mutation ...></mutation>
    // </block>
    const block = document.createElement('block')
    block.setAttribute('type', 'procedures_call')
    block.setAttribute('gap', '16')
    block.appendChild(mutation)
    xmlList.push(block)
  }
  return xmlList
}

/**
 * Create the "Make a Block..." button.
 * @param workspace The workspace containing procedures.
 * @param xmlList Array of XML block elements to add to.
 */
function addCreateButton(workspace: Blockly.WorkspaceSvg, xmlList: Element[]) {
  const button = document.createElement('button')
  const msg = Blockly.Msg.NEW_PROCEDURE
  const callbackKey = 'CREATE_PROCEDURE'
  const callback = function () {
    // Run the callback after a delay to avoid it getting captured by the React
    // modal in scratch-gui and being registered as a click on the scrim that
    // dismisses the dialog.
    requestAnimationFrame(() => {
      setTimeout(() => {
        createProcedureDefCallback(workspace)
      })
    })
  }
  button.setAttribute('text', msg)
  button.setAttribute('callbackKey', callbackKey)
  workspace.registerButtonCallback(callbackKey, callback)
  xmlList.push(button)
}

/**
 * Find all callers of a named procedure.
 * @param name Name of procedure (procCode in scratch-blocks).
 * @param workspace The workspace to find callers in.
 * @param definitionRoot The root of the stack where the
 *     procedure is defined.
 * @param allowRecursive True if the search should include recursive
 *     procedure calls.  False if the search should ignore the stack starting
 *     with definitionRoot.
 * @returns Array of caller blocks.
 */
export function getCallers(
  name: string,
  workspace: Blockly.WorkspaceSvg,
  definitionRoot: Blockly.BlockSvg,
  allowRecursive: boolean,
): Blockly.BlockSvg[] {
  return workspace.getTopBlocks().flatMap((block) => {
    if (block.id === definitionRoot.id && !allowRecursive) {
      return []
    }

    return block
      .getDescendants(false)
      .filter(
        (descendant) =>
          isProcedureBlock(descendant) &&
          descendant.type === Constants.PROCEDURES_CALL_BLOCK_TYPE &&
          descendant.getProcCode() === name,
      )
  })
}

/**
 * Find and edit all callers with a procCode using a new mutation.
 * @param name Name of procedure (procCode in scratch-blocks).
 * @param workspace The workspace to find callers in.
 * @param mutation New mutation for the callers.
 */
function mutateCallersAndPrototype(name: string, workspace: Blockly.WorkspaceSvg, mutation: Element) {
  const defineBlock = getDefineBlock(name, workspace)
  const prototypeBlock = getPrototypeBlock(name, workspace)
  if (!(defineBlock && prototypeBlock)) {
    alert('No define block on workspace') // TODO decide what to do about this.
    return
  }

  const callers = getCallers(name, defineBlock.workspace, defineBlock, true /* allowRecursive */)
  callers.push(prototypeBlock)
  Blockly.Events.setGroup(true)
  callers.forEach((caller) => {
    const oldMutationDom = caller.mutationToDom!()
    const oldMutation = oldMutationDom && Blockly.Xml.domToText(oldMutationDom)
    caller.domToMutation!(mutation)
    const newMutationDom = caller.mutationToDom!()
    const newMutation = newMutationDom && Blockly.Xml.domToText(newMutationDom)
    if (oldMutation !== newMutation) {
      Blockly.Events.fire(
        new (Blockly.Events.get(Blockly.Events.BLOCK_CHANGE))(caller, 'mutation', null, oldMutation, newMutation),
      )
    }
  })
  Blockly.Events.setGroup(false)
}

/**
 * Find the definition block for the named procedure.
 * @param procCode The identifier of the procedure.
 * @param workspace The workspace to search.
 * @returns The procedure definition block, or undefined if not found.
 */
function getDefineBlock(procCode: string, workspace: Blockly.WorkspaceSvg): Blockly.BlockSvg | undefined {
  // Assume that a procedure definition is a top block.
  return workspace.getTopBlocks(false).find((block) => {
    if (block.type === Constants.PROCEDURES_DEFINITION_BLOCK_TYPE) {
      const prototypeBlock = block.getInput('custom_block')!.connection!.targetBlock() as Blockly.BlockSvg
      return isProcedureBlock(prototypeBlock) && prototypeBlock.getProcCode() === procCode
    }

    return false
  })
}

/**
 * Find the prototype block for the named procedure.
 * @param procCode The identifier of the procedure.
 * @param workspace The workspace to search.
 * @returns The procedure prototype block, or undefined if not found.
 */
function getPrototypeBlock(procCode: string, workspace: Blockly.WorkspaceSvg): Blockly.BlockSvg | undefined {
  const defineBlock = getDefineBlock(procCode, workspace)
  if (defineBlock) {
    return defineBlock.getInput('custom_block')!.connection!.targetBlock() as Blockly.BlockSvg
  }
  return undefined
}

/**
 * Create a mutation for a brand new custom procedure.
 * @returns The mutation for a new custom procedure
 */
function newProcedureMutation(): Element {
  const mutationText = `
    <xml>
      <mutation
        proccode="${Blockly.Msg.PROCEDURE_DEFAULT_NAME}"
        argumentids="[]"
        argumentnames="[]"
        argumentdefaults="[]"
        warp="false">
      </mutation>
    </xml>`
  return Blockly.utils.xml.textToDom(mutationText).firstElementChild!
}

/**
 * Callback to create a new procedure custom command block.
 * @param workspace The workspace to create the new procedure on.
 */
function createProcedureDefCallback(workspace: Blockly.WorkspaceSvg) {
  ScratchProcedures.externalProcedureDefCallback!(newProcedureMutation(), createProcedureCallbackFactory(workspace))
}

/**
 * Callback factory for adding a new custom procedure from a mutation.
 * @param workspace The workspace to create the new procedure on.
 * @returns callback for creating the new custom procedure.
 */
function createProcedureCallbackFactory(workspace: Blockly.WorkspaceSvg): (mutation?: Element) => void {
  return (mutation?: Element) => {
    if (!mutation) return

    const blockText = `
      <xml>
        <block type="procedures_definition">
          <statement name="custom_block">
            <shadow type="procedures_prototype">
              ${Blockly.Xml.domToText(mutation)}
            </shadow>
          </statement>
        </block>
      </xml>`
    const blockDom = Blockly.utils.xml.textToDom(blockText).firstElementChild!
    Blockly.Events.setGroup(true)
    const block = Blockly.Xml.domToBlock(blockDom, workspace) as Blockly.BlockSvg
    Blockly.renderManagement.finishQueuedRenders().then(() => {
      // To convert from pixel units to workspace units
      const scale = workspace.scale
      // Position the block so that it is at the top left of the visible
      // workspace, padded from the edge by 30 units. Position in the top right
      // if RTL.
      let posX = -workspace.scrollX
      if (workspace.RTL) {
        posX += workspace.getMetrics().contentWidth - 30
      } else {
        posX += 30
      }
      block.moveBy(posX / scale, (-workspace.scrollY + 30) / scale)
      block.scheduleSnapAndBump()
      Blockly.Events.setGroup(false)
    })
  }
}

/**
 * Callback to open the modal for editing custom procedures.
 * @param block The block that was right-clicked.
 */
function editProcedureCallback(block: Blockly.BlockSvg) {
  // Edit can come from one of three block types (call, define, prototype)
  // Normalize by setting the block to the prototype block for the procedure.
  let prototypeBlock: Blockly.BlockSvg
  if (block.type === Constants.PROCEDURES_DEFINITION_BLOCK_TYPE) {
    const input = block.getInput('custom_block')
    if (!input) {
      alert('Bad input') // TODO: Decide what to do about this.
      return
    }
    const conn = input.connection
    if (!conn) {
      alert('Bad connection') // TODO: Decide what to do about this.
      return
    }
    const innerBlock = conn.targetBlock()
    if (innerBlock?.type !== Constants.PROCEDURES_PROTOTYPE_BLOCK_TYPE) {
      alert('Bad inner block') // TODO: Decide what to do about this.
      return
    }
    prototypeBlock = innerBlock as Blockly.BlockSvg
  } else if (block.type === Constants.PROCEDURES_CALL_BLOCK_TYPE && isProcedureBlock(block)) {
    // This is a call block, find the prototype corresponding to the procCode.
    // Make sure to search the correct workspace, call block can be in flyout.
    const workspaceToSearch = block.workspace.isFlyout ? block.workspace.targetWorkspace! : block.workspace
    const foundBlock = getPrototypeBlock(block.getProcCode(), workspaceToSearch)
    if (!foundBlock) {
      console.warn('editProcedureCallback: could not find prototype for', block.getProcCode())
      return
    }
    prototypeBlock = foundBlock
  } else {
    prototypeBlock = block
  }
  // Block now refers to the procedure prototype block, it is safe to proceed.
  ScratchProcedures.externalProcedureDefCallback!(
    prototypeBlock.mutationToDom!(),
    editProcedureCallbackFactory(prototypeBlock),
  )
}

/**
 * Callback factory for editing an existing custom procedure.
 * @param block The procedure prototype block being edited.
 * @returns Callback for editing the custom procedure.
 */
function editProcedureCallbackFactory(block: Blockly.BlockSvg): (mutation?: Element) => void {
  return (mutation?: Element) => {
    if (mutation && isProcedureBlock(block)) {
      mutateCallersAndPrototype(block.getProcCode(), block.workspace, mutation)
    }
  }
}

/**
 * Make a context menu option for editing a custom procedure.
 * This appears in the context menu for procedure definitions and procedure
 * calls.
 * @param block The block where the right-click originated.
 * @returns A menu option, containing text, enabled, and a callback.
 */
function makeEditOption(block: Blockly.BlockSvg): Blockly.ContextMenuRegistry.ContextMenuOption {
  return {
    enabled: true,
    text: Blockly.Msg.EDIT_PROCEDURE,
    callback: () => {
      editProcedureCallback(block)
    },
    scope: block,
    weight: 7,
  }
}

/**
 * Callback to try to delete a custom block definitions.
 * @param procCode The identifier of the procedure to delete.
 * @param definitionRoot The root block of the stack that defines the custom
 *     procedure.
 * @returns True if the custom procedure was deleted, false otherwise.
 */
function deleteProcedureDefCallback(procCode: string, definitionRoot: Blockly.BlockSvg): boolean {
  const callers = getCallers(procCode, definitionRoot.workspace, definitionRoot, false /* allowRecursive */)
  if (callers.length > 0) {
    return false
  }

  const workspace = definitionRoot.workspace
  // Bypass the checkAndDelete provided by the procedure block mixin
  Blockly.BlockSvg.prototype.checkAndDelete.call(definitionRoot)
  return true
}

/**
 * Returns whether the given block is a procedure block and narrows its type.
 * @param block The block to check.
 * @returns True if the block is a procedure block, otherwise false.
 */
export function isProcedureBlock(block: Blockly.BlockSvg): block is ProcedureBlock {
  return (
    block.type === Constants.PROCEDURES_CALL_BLOCK_TYPE ||
    block.type === Constants.PROCEDURES_DECLARATION_BLOCK_TYPE ||
    block.type === Constants.PROCEDURES_PROTOTYPE_BLOCK_TYPE
  )
}

/**
 * Interface for procedure blocks, which have the getProcCode method added
 * through an extension.
 */
interface ProcedureBlock extends Blockly.BlockSvg {
  getProcCode(): string
}

/**
 * Type for a callback function invoked after a procedure is modified.
 */
type ProcedureDefCallback = (mutation: Element, postEditCallback: (mutation?: Element) => void) => void

const ScratchProcedures: {
  externalProcedureDefCallback: ProcedureDefCallback | undefined
  createProcedureDefCallback: typeof createProcedureDefCallback
  deleteProcedureDefCallback: typeof deleteProcedureDefCallback
  getProceduresCategory: typeof getProceduresCategory
  makeEditOption: typeof makeEditOption
} = {
  externalProcedureDefCallback: undefined,
  createProcedureDefCallback,
  deleteProcedureDefCallback,
  getProceduresCategory,
  makeEditOption,
}
export { ScratchProcedures }
