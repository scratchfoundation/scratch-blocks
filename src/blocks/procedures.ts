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
 * @file Procedure blocks for Scratch.
 */
import * as Blockly from 'blockly/core'
import { FieldTextInputRemovable } from '../fields/field_textinput_removable'
import type { ScratchDragger } from '../scratch_dragger'

/**
 * An object mapping argument IDs to blocks and shadow DOMs.
 */
type ConnectionMap = Record<
  string,
  {
    shadow: Element
    block: Blockly.BlockSvg
  } | null
>

/**
 * Possible types for procedure arguments.
 */
enum ArgumentType {
  STRING = 's',
  NUMBER = 'n',
  BOOLEAN = 'b',
}

/**
 * Class representing a draggable block that copies itself on drag.
 */
class DuplicateOnDragDraggable implements Blockly.IDraggable {
  /**
   * The newly-created duplicate block.
   */
  private copy?: Blockly.BlockSvg
  constructor(private block: Blockly.BlockSvg) {}

  /**
   * Returns whether or not this draggable is movable.
   * @returns Always true.
   */
  isMovable(): boolean {
    return true
  }

  /**
   * Handles the start of a drag.
   * @param e The event that triggered the drag.
   */
  startDrag(e: PointerEvent) {
    const data = this.block.toCopyData()
    if (!data) {
      console.warn(
        'DuplicateOnDragDraggable.startDrag: failed to serialize block for copy',
        this.block.type,
        this.block.id,
      )
      return
    }
    this.copy = Blockly.clipboard.paste(data, this.block.workspace) as Blockly.BlockSvg
    this.copy.startDrag(e)
  }

  drag(newLoc: Blockly.utils.Coordinate, e?: PointerEvent) {
    const gesture = this.block.workspace.getGesture(e)
    if (!gesture || !this.copy) {
      console.warn('DuplicateOnDragDraggable.drag: missing gesture or copied block', {
        hasGesture: Boolean(gesture),
        hasCopy: Boolean(this.copy),
        blockId: this.block.id,
      })
      return
    }
    ;(gesture.getCurrentDragger() as ScratchDragger).setDraggable(this.copy)
    this.copy.drag(newLoc, e)
  }

  endDrag(e: PointerEvent) {
    this.copy?.endDrag(e)
  }

  revertDrag() {
    this.copy?.dispose()
  }

  getRelativeToSurfaceXY() {
    return this.copy ? this.copy.getRelativeToSurfaceXY() : this.block.getRelativeToSurfaceXY()
  }
}

// Serialization and deserialization.

/**
 * Create XML to represent the (non-editable) name and arguments of a procedure
 * call block.
 * @returns XML storage element.
 */
function callerMutationToDom(this: ProcedureCallBlock): Element {
  const container = document.createElement('mutation')
  container.setAttribute('proccode', this.procCode_)
  container.setAttribute('argumentids', JSON.stringify(this.argumentIds_))
  container.setAttribute('warp', JSON.stringify(this.warp_))
  return container
}

/**
 * Parse XML to restore the (non-editable) name and arguments of a procedure
 * call block.
 * @param xmlElement XML storage element.
 */
function callerDomToMutation(this: ProcedureCallBlock, xmlElement: Element) {
  this.procCode_ = xmlElement.getAttribute('proccode')!
  this.generateShadows_ = JSON.parse(xmlElement.getAttribute('generateshadows')!)
  this.argumentIds_ = JSON.parse(xmlElement.getAttribute('argumentids')!)
  this.warp_ = JSON.parse(xmlElement.getAttribute('warp')!)
  this.updateDisplay_()
}

/**
 * Create XML to represent the (non-editable) name and arguments of a
 * procedures_prototype block or a procedures_declaration block.
 * @param opt_generateShadows Whether to include the generateshadows flag in the
 *     generated XML. False if not provided.
 * @returns XML storage element.
 */
function definitionMutationToDom(
  this: ProcedurePrototypeBlock | ProcedureDeclarationBlock,
  opt_generateShadows?: boolean,
): Element {
  const container = document.createElement('mutation')

  if (opt_generateShadows) {
    container.setAttribute('generateshadows', 'true')
  }
  container.setAttribute('proccode', this.procCode_)
  container.setAttribute('argumentids', JSON.stringify(this.argumentIds_))
  container.setAttribute('argumentnames', JSON.stringify(this.displayNames_))
  container.setAttribute('argumentdefaults', JSON.stringify(this.argumentDefaults_))
  container.setAttribute('warp', JSON.stringify(this.warp_))
  return container
}

/**
 * Parse XML to restore the (non-editable) name and arguments of a
 * procedures_prototype block or a procedures_declaration block.
 * @param xmlElement XML storage element.
 */
function definitionDomToMutation(this: ProcedurePrototypeBlock | ProcedureDeclarationBlock, xmlElement: Element) {
  this.procCode_ = xmlElement.getAttribute('proccode')!
  this.warp_ = JSON.parse(xmlElement.getAttribute('warp')!)

  const prevArgIds = this.argumentIds_
  const prevDisplayNames = this.displayNames_

  this.argumentIds_ = JSON.parse(xmlElement.getAttribute('argumentids')!)
  this.displayNames_ = JSON.parse(xmlElement.getAttribute('argumentnames')!)
  this.argumentDefaults_ = JSON.parse(xmlElement.getAttribute('argumentdefaults')!)
  this.updateDisplay_()
  if ('updateArgumentReporterNames_' in this) {
    this.updateArgumentReporterNames_(prevArgIds, prevDisplayNames)
  }
}

// End of serialization and deserialization.

// Shared by all three procedure blocks (procedures_declaration,
// procedures_call, and procedures_prototype).
/**
 * Returns the name of the procedure this block calls, or the empty string if
 * it has not yet been set.
 * @returns Procedure name.
 */
function getProcCode(this: ProcedureBlock): string {
  return this.procCode_
}

/**
 * Update the block's structure and appearance to match the internally stored
 * mutation.
 */
function updateDisplay_(this: ProcedureBlock) {
  const connectionMap = this.disconnectOldBlocks_()
  this.removeAllInputs_()
  this.createAllInputs_(connectionMap)
  this.deleteShadows_(connectionMap)
}

/**
 * Disconnect old blocks from all value inputs on this block, but hold onto them
 * in case they can be reattached later.  Also save the shadow DOM if it exists.
 * The result is a map from argument ID to information that was associated with
 * that argument at the beginning of the mutation.
 * @returns An object mapping argument IDs to blocks and shadow DOMs.
 */
function disconnectOldBlocks_(this: ProcedureBlock): ConnectionMap {
  // Remove old stuff
  const connectionMap: ConnectionMap = {}
  for (const input of this.inputList) {
    if (input.connection) {
      const target = input.connection.targetBlock() as Blockly.BlockSvg
      const saveInfo = {
        shadow: input.connection.getShadowDom(true)!,
        block: target,
      }
      connectionMap[input.name] = saveInfo

      if (target) {
        input.connection.disconnect()
      }
    }
  }
  return connectionMap
}

/**
 * Remove all inputs on the block, including dummy inputs.
 * Assumes no input has shadow DOM set.
 */
function removeAllInputs_(this: ProcedureBlock) {
  // Delete inputs directly instead of with block.removeInput to avoid splicing
  // out of the input list at every index.
  this.inputList.forEach((input: Blockly.Input) => input.dispose())
  this.inputList = []
}

/**
 * Create all inputs specified by the new procCode, and populate them with
 * shadow blocks or reconnected old blocks as appropriate.
 * @param connectionMap An object mapping argument IDs to blocks and shadow DOMs.
 */
function createAllInputs_(this: ProcedureBlock, connectionMap: ConnectionMap) {
  // Split the proc into components, by %n, %b, and %s (ignoring escaped).
  const procComponents = this.procCode_.split(/(?=[^\\]%[nbs])/).map(
    (c: string) => c.trim(), // Strip whitespace.
  )
  // Create arguments and labels as appropriate.
  let argumentCount = 0
  for (const component of procComponents) {
    let labelText
    if (component.startsWith('%')) {
      const argumentType = component.substring(1, 2)
      if (
        !(
          argumentType === ArgumentType.NUMBER ||
          argumentType === ArgumentType.BOOLEAN ||
          argumentType === ArgumentType.STRING
        )
      ) {
        throw new Error('Found an custom procedure with an invalid type: ' + argumentType)
      }
      labelText = component.substring(2).trim()

      const id = this.argumentIds_[argumentCount]

      const input = this.appendValueInput(id)
      if (argumentType === ArgumentType.BOOLEAN) {
        input.setCheck('Boolean')
      }
      this.populateArgument_(argumentType, argumentCount, connectionMap, id, input)
      argumentCount++
    } else {
      labelText = component.trim()
    }
    this.addProcedureLabel_(labelText.replace(/\\%/, '%'))
  }
}

/**
 * Delete all shadow blocks in the given map.
 * @param connectionMap An object mapping argument IDs to the blocks that were
 *     connected to those IDs at the beginning of the mutation.
 */
function deleteShadows_(this: ProcedureBlock, connectionMap: ConnectionMap) {
  // Get rid of all of the old shadow blocks if they aren't connected.
  if (connectionMap) {
    for (const id in connectionMap) {
      const saveInfo = connectionMap[id]
      if (saveInfo) {
        const block = saveInfo.block
        if (block && block.isShadow()) {
          block.dispose()
          connectionMap[id] = null
          // At this point we know which shadow DOMs are about to be orphaned in
          // the VM.  What do we do with that information?
        }
      }
    }
  }
}
// End of shared code.

/**
 * Add a label field with the given text to a procedures_call or
 * procedures_prototype block.
 * @param text The string to display in the block's label field.
 */
function addLabelField_(this: ProcedureCallBlock | ProcedurePrototypeBlock, text: string) {
  this.appendDummyInput().appendField(text)
}

/**
 * Add a label editor with the given text to a procedures_declaration
 * block.  Editing the text in the label editor updates the text of the
 * corresponding label fields on function calls.
 * @param text The initial string to show in the label editor.
 */
function addLabelEditor_(this: ProcedureDeclarationBlock, text: string) {
  if (text) {
    this.appendDummyInput(Blockly.utils.idGenerator.genUid()).appendField(new FieldTextInputRemovable(text))
  }
}

/**
 * Build a DOM node representing a shadow block of the given type.
 * @param type One of 's' (string) or 'n' (number).
 * @returns The DOM node representing the new shadow block.
 */
function buildShadowDom_(type: ArgumentType): Element {
  const shadowDom = document.createElement('shadow')
  let shadowType, fieldName, fieldValue
  if (type === ArgumentType.NUMBER) {
    shadowType = 'math_number'
    fieldName = 'NUM'
    fieldValue = '1'
  } else {
    shadowType = 'text'
    fieldName = 'TEXT'
    fieldValue = ''
  }
  shadowDom.setAttribute('type', shadowType)
  const fieldDom = document.createElement('field')
  fieldDom.textContent = fieldValue
  fieldDom.setAttribute('name', fieldName)
  shadowDom.appendChild(fieldDom)
  return shadowDom
}

/**
 * Create a new shadow block and attach it to the given input.
 * @param input The value input to attach a block to.
 * @param argumentType One of 'b' (boolean), 's' (string) or
 *     'n' (number).
 */
function attachShadow_(this: ProcedureCallBlock, input: Blockly.Input, argumentType: ArgumentType) {
  if (argumentType === ArgumentType.NUMBER || argumentType === ArgumentType.STRING) {
    const blockType = argumentType === ArgumentType.NUMBER ? 'math_number' : 'text'
    Blockly.Events.disable()
    let newBlock
    try {
      newBlock = this.workspace.newBlock(blockType)
      if (argumentType === ArgumentType.NUMBER) {
        newBlock.setFieldValue('1', 'NUM')
      } else {
        newBlock.setFieldValue('', 'TEXT')
      }
      newBlock.setShadow(true)
      if (!this.isInsertionMarker()) {
        newBlock.initSvg()
        newBlock.render()
      }
    } finally {
      Blockly.Events.enable()
    }
    if (Blockly.Events.isEnabled()) {
      Blockly.Events.fire(new (Blockly.Events.get(Blockly.Events.BLOCK_CREATE))(newBlock))
    }
    newBlock.outputConnection.connect(input.connection!)
  }
}

/**
 * Create a new argument reporter block.
 * @param argumentType One of 'b' (boolean), 's' (string) or
 *     'n' (number).
 * @param displayName The name of the argument as provided by the
 *     user, which becomes the text of the label on the argument reporter block.
 * @returns The newly created argument reporter block.
 */
function createArgumentReporter_(
  this: ProcedurePrototypeBlock,
  argumentType: ArgumentType,
  displayName: string,
): Blockly.BlockSvg {
  let blockType
  if (argumentType === ArgumentType.NUMBER || argumentType === ArgumentType.STRING) {
    blockType = 'argument_reporter_string_number'
  } else {
    blockType = 'argument_reporter_boolean'
  }
  Blockly.Events.disable()
  let newBlock
  try {
    newBlock = this.workspace.newBlock(blockType)
    newBlock.setShadow(true)
    newBlock.setFieldValue(displayName, 'VALUE')
    if (!this.isInsertionMarker()) {
      newBlock.initSvg()
      newBlock.render()
    }
  } finally {
    Blockly.Events.enable()
  }
  if (Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new (Blockly.Events.get(Blockly.Events.BLOCK_CREATE))(newBlock))
  }
  return newBlock
}

/**
 * Populate the argument by attaching the correct child block or shadow to the
 * given input.
 * @param type One of 'b' (boolean), 's' (string) or 'n' (number).
 * @param index The index of this argument into the argument id array.
 * @param connectionMap An object mapping argument IDs to blocks and shadow DOMs.
 * @param id The ID of the input to populate.
 * @param input The newly created input to populate.
 */
function populateArgumentOnCaller_(
  this: ProcedureCallBlock,
  type: ArgumentType,
  index: number,
  connectionMap: ConnectionMap,
  id: string,
  input: Blockly.Input,
) {
  let oldBlock: Blockly.BlockSvg | undefined
  let oldShadow: Element | undefined
  if (connectionMap && id in connectionMap) {
    const saveInfo = connectionMap[id]
    oldBlock = saveInfo?.block
    oldShadow = saveInfo?.shadow
  }

  if (connectionMap && oldBlock) {
    // Reattach the old block and shadow DOM.
    connectionMap[input.name] = null
    oldBlock.outputConnection.connect(input.connection!)
    if (type !== ArgumentType.BOOLEAN && this.generateShadows_) {
      const shadowDom = oldShadow || this.buildShadowDom_(type)
      input.connection!.setShadowDom(shadowDom)
    }
  } else if (this.generateShadows_) {
    this.attachShadow_(input, type)
  }
}

/**
 * Populate the argument by attaching the correct argument reporter to the given
 * input.
 * @param type One of 'b' (boolean), 's' (string) or 'n' (number).
 * @param index The index of this argument into the argument ID and
 *     argument display name arrays.
 * @param connectionMap An object mapping argument IDs to blocks and shadow DOMs.
 * @param id The ID of the input to populate.
 * @param input The newly created input to populate.
 */
function populateArgumentOnPrototype_(
  this: ProcedurePrototypeBlock,
  type: ArgumentType,
  index: number,
  connectionMap: ConnectionMap,
  id: string,
  input: Blockly.Input,
) {
  let oldBlock: Blockly.BlockSvg | null = null
  if (connectionMap && id in connectionMap) {
    const saveInfo = connectionMap[id]
    oldBlock = saveInfo?.block ?? null
  }

  const oldTypeMatches = checkOldTypeMatches_(oldBlock, type)
  const displayName = this.displayNames_[index]

  // Decide which block to attach.
  let argumentReporter: Blockly.BlockSvg
  if (connectionMap && oldBlock && oldTypeMatches) {
    // Update the text if needed. The old argument reporter is the same type,
    // and on the same input, but the argument's display name may have changed.
    argumentReporter = oldBlock
    argumentReporter.setFieldValue(displayName, 'VALUE')
    connectionMap[input.name] = null
  } else {
    argumentReporter = this.createArgumentReporter_(type, displayName)
  }

  // Attach the block.
  input.connection!.connect(argumentReporter.outputConnection)
}

/**
 * Populate the argument by attaching the correct argument editor to the given
 * input.
 * @param type One of 'b' (boolean), 's' (string) or 'n' (number).
 * @param index The index of this argument into the argument id and argument
 *     display name arrays.
 * @param connectionMap An object mapping argument IDs to blocks and shadow DOMs.
 * @param id The ID of the input to populate.
 * @param input The newly created input to populate.
 */
function populateArgumentOnDeclaration_(
  this: ProcedureDeclarationBlock,
  type: ArgumentType,
  index: number,
  connectionMap: ConnectionMap,
  id: string,
  input: Blockly.Input,
) {
  let oldBlock: Blockly.BlockSvg | null = null
  if (connectionMap && id in connectionMap) {
    const saveInfo = connectionMap[id]
    oldBlock = saveInfo?.block ?? null
  }

  // TODO: This always returns false, because it checks for argument reporter
  // blocks instead of argument editor blocks.  Create a new version for argument
  // editors.
  const oldTypeMatches = checkOldTypeMatches_(oldBlock, type)
  const displayName = this.displayNames_[index]

  // Decide which block to attach.
  let argumentEditor: Blockly.BlockSvg
  if (oldBlock && oldTypeMatches) {
    argumentEditor = oldBlock
    oldBlock.setFieldValue(displayName, 'TEXT')
    connectionMap[input.name] = null
  } else {
    argumentEditor = this.createArgumentEditor_(type, displayName)
  }

  // Attach the block.
  input.connection!.connect(argumentEditor.outputConnection)
}

/**
 * Check whether the type of the old block corresponds to the given argument
 * type.
 * @param oldBlock The old block to check.
 * @param type The argument type.  One of 'n', 'n', or 's'.
 * @returns True if the type matches, false otherwise.
 */
function checkOldTypeMatches_(oldBlock: Blockly.BlockSvg | null, type: string): boolean {
  if (!oldBlock) {
    return false
  }
  if (
    (type === ArgumentType.NUMBER || type === ArgumentType.STRING) &&
    oldBlock.type === 'argument_reporter_string_number'
  ) {
    return true
  }
  if (type === ArgumentType.BOOLEAN && oldBlock.type === 'argument_reporter_boolean') {
    return true
  }
  return false
}

/**
 * Create an argument editor.
 * An argument editor is a shadow block with a single text field, which is used
 * to set the display name of the argument.
 * @param argumentType One of 'b' (boolean), 's' (string) or 'n' (number).
 * @param displayName The display name  of this argument, which is the text of
 *     the field on the shadow block.
 * @returns The newly created argument editor block.
 */
function createArgumentEditor_(
  this: ProcedureDeclarationBlock,
  argumentType: ArgumentType,
  displayName: string,
): Blockly.BlockSvg {
  Blockly.Events.disable()
  let newBlock
  try {
    if (argumentType === ArgumentType.NUMBER || argumentType === ArgumentType.STRING) {
      newBlock = this.workspace.newBlock('argument_editor_string_number')
    } else {
      newBlock = this.workspace.newBlock('argument_editor_boolean')
    }
    newBlock.setFieldValue(displayName, 'TEXT')
    newBlock.setShadow(true)
    if (!this.isInsertionMarker()) {
      newBlock.initSvg()
      newBlock.queueRender()
    }
  } finally {
    Blockly.Events.enable()
  }
  if (Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new (Blockly.Events.get(Blockly.Events.BLOCK_CREATE))(newBlock))
  }
  return newBlock
}

/**
 * Update the serializable information on the block based on the existing inputs
 * and their text.
 */
function updateDeclarationProcCode_(this: ProcedureDeclarationBlock) {
  this.procCode_ = ''
  this.displayNames_ = []
  this.argumentIds_ = []
  for (let i = 0; i < this.inputList.length; i++) {
    if (i !== 0) {
      this.procCode_ += ' '
    }
    const input = this.inputList[i]
    if (input.type === Blockly.inputs.inputTypes.DUMMY) {
      this.procCode_ += input.fieldRow[0].getValue()
    } else if (input.type === Blockly.inputs.inputTypes.VALUE) {
      // Inspect the argument editor.
      const target = input.connection!.targetBlock()!
      this.displayNames_.push(target.getFieldValue('TEXT'))
      this.argumentIds_.push(input.name)
      if (target.type === 'argument_editor_boolean') {
        this.procCode_ += '%b'
      } else {
        this.procCode_ += '%s'
      }
    } else {
      throw new Error('Unexpected input type on a procedure mutator root: ' + input.type)
    }
  }
}

/**
 * Focus on the last argument editor or label editor on the block.
 */
function focusLastEditor_(this: ProcedureDeclarationBlock) {
  if (this.inputList.length > 0) {
    const newInput = this.inputList[this.inputList.length - 1]
    if (newInput.type === Blockly.inputs.inputTypes.DUMMY) {
      newInput.fieldRow[0].showEditor()
    } else if (newInput.type === Blockly.inputs.inputTypes.VALUE) {
      // Inspect the argument editor.
      const target = newInput.connection!.targetBlock()!
      target.getField('TEXT')!.showEditor()
    }
  }
}

/**
 * Externally-visible function to add a label to the procedure declaration.
 */
function addLabelExternal(this: ProcedureDeclarationBlock) {
  Blockly.WidgetDiv.hide()
  this.procCode_ = this.procCode_ + ' label text'
  this.updateDisplay_()
  this.focusLastEditor_()
}

/**
 * Externally-visible function to add a boolean argument to the procedure
 * declaration.
 */
function addBooleanExternal(this: ProcedureDeclarationBlock) {
  Blockly.WidgetDiv.hide()
  this.procCode_ = this.procCode_ + ' %b'
  this.displayNames_.push('boolean')
  this.argumentIds_.push(Blockly.utils.idGenerator.genUid())
  this.argumentDefaults_.push('false')
  this.updateDisplay_()
  this.focusLastEditor_()
}

/**
 * Externally-visible function to add a string/number argument to the procedure
 * declaration.
 */
function addStringNumberExternal(this: ProcedureDeclarationBlock) {
  Blockly.WidgetDiv.hide()
  this.procCode_ = this.procCode_ + ' %s'
  this.displayNames_.push('number or text')
  this.argumentIds_.push(Blockly.utils.idGenerator.genUid())
  this.argumentDefaults_.push('')
  this.updateDisplay_()
  this.focusLastEditor_()
}

/**
 * Externally-visible function to get the warp on procedure declaration.
 * @returns The value of the warp_ property.
 */
function getWarp(this: ProcedureDeclarationBlock): boolean {
  return this.warp_
}

/**
 * Externally-visible function to set the warp on procedure declaration.
 * @param warp The value of the warp_ property.
 */
function setWarp(this: ProcedureDeclarationBlock, warp: boolean) {
  this.warp_ = warp
}

/**
 * Callback to remove a field, only for the declaration block.
 * @param field The field being removed.
 */
function removeFieldCallback(this: ProcedureDeclarationBlock, field: Blockly.Field) {
  // Do not delete if there is only one input
  if (this.inputList.length === 1) {
    return
  }
  let inputNameToRemove = null
  for (let n = 0; n < this.inputList.length; n++) {
    const input = this.inputList[n]
    if (input.connection) {
      const target = input.connection.targetBlock()!
      if (field.name && target.getField(field.name) === field) {
        inputNameToRemove = input.name
      }
    } else {
      for (let j = 0; j < input.fieldRow.length; j++) {
        if (input.fieldRow[j] === field) {
          inputNameToRemove = input.name
        }
      }
    }
  }
  if (inputNameToRemove) {
    Blockly.WidgetDiv.hide()
    this.removeInput(inputNameToRemove)
    this.onChangeFn()
    this.updateDisplay_()
  }
}

/**
 * Callback to pass removeField up to the declaration block from arguments.
 * @param field The field being removed.
 */
function removeArgumentCallback_(
  this: ProcedureDeclarationBlock | ProcedureArgumentEditorBlock,
  field: Blockly.Field,
) {
  const parent = this.getParent()
  if (parent && parent.removeFieldCallback) {
    parent.removeFieldCallback(field)
  }
}

/**
 * Update argument reporter field values after an edit to the prototype mutation
 * using previous argument ids and names.
 * Because the argument reporters only store names and not which argument ids they
 * are linked to, it would not be safe to update all argument reporters on the workspace
 * since they may be argument reporters with the same name from a different procedure.
 * Until there is a more explicit way of identifying argument reporter blocks using ids,
 * be conservative and only update argument reporters that are used in the
 * stack below the prototype, ie the definition.
 * @param prevArgIds The previous ordering of argument ids.
 * @param prevDisplayNames The previous argument names.
 */
function updateArgumentReporterNames_(
  this: ProcedurePrototypeBlock,
  prevArgIds: string[],
  prevDisplayNames: string[],
) {
  const nameChanges: { newName: string; blocks: Blockly.BlockSvg[] }[] = []
  const argReporters: Blockly.BlockSvg[] = []
  const definitionBlock = this.getParent()
  if (!definitionBlock) return

  // Create a list of argument reporters that are descendants of the definition stack (see above comment)
  definitionBlock.getDescendants(false).forEach((block: Blockly.BlockSvg) => {
    if (
      (block.type === 'argument_reporter_string_number' || block.type === 'argument_reporter_boolean') &&
      !block.isShadow()
    ) {
      // Exclude arg reporters in the prototype block, which are shadows.
      argReporters.push(block)
    }
  })

  // Create a list of "name changes", including the new name and blocks matching the old name
  // Only search over the current set of argument ids, ignore args that have been removed
  for (let i = 0, id; (id = this.argumentIds_[i]); i++) {
    // Find the previous index of this argument id. Could be -1 if it is newly added.
    const prevIndex = prevArgIds.indexOf(id)
    if (prevIndex === -1) continue // Newly added argument, no corresponding previous argument to update.
    const prevName = prevDisplayNames[prevIndex]
    if (prevName !== this.displayNames_[i]) {
      nameChanges.push({
        newName: this.displayNames_[i],
        blocks: argReporters.filter((block) => block.getFieldValue('VALUE') === prevName),
      })
    }
  }

  // Finally update the blocks for each name change.
  // Do this after creating the lists to avoid cycles of renaming.
  for (const nameChange of nameChanges) {
    for (const block of nameChange.blocks) {
      block.setFieldValue(nameChange.newName, 'VALUE')
    }
  }
}

Blockly.Blocks.procedures_definition = {
  /**
   * Block for defining a procedure with no return value.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.PROCEDURES_DEFINITION,
      args0: [
        {
          type: 'input_statement',
          name: 'custom_block',
        },
      ],
      extensions: ['colours_more', 'shape_bowler_hat', 'procedure_def_contextmenu'],
    })
  },
}

Blockly.Blocks.procedures_call = {
  /**
   * Block for calling a procedure with no return value.
   */
  init: function (this: ProcedureCallBlock) {
    this.jsonInit({
      extensions: ['colours_more', 'shape_statement', 'procedure_call_contextmenu'],
    })
    this.procCode_ = ''
    this.argumentIds_ = []
    this.warp_ = false

    // Shared.
    this.getProcCode = getProcCode.bind(this)
    this.removeAllInputs_ = removeAllInputs_.bind(this)
    this.disconnectOldBlocks_ = disconnectOldBlocks_.bind(this)
    this.deleteShadows_ = deleteShadows_.bind(this)
    this.createAllInputs_ = createAllInputs_.bind(this)
    this.updateDisplay_ = updateDisplay_.bind(this)

    // Exist on all three blocks, but have different implementations.
    this.mutationToDom = callerMutationToDom.bind(this)
    this.domToMutation = callerDomToMutation.bind(this)
    this.populateArgument_ = populateArgumentOnCaller_.bind(this)
    this.addProcedureLabel_ = addLabelField_.bind(this)

    // Only exists on the external caller.
    this.attachShadow_ = attachShadow_.bind(this)
    this.buildShadowDom_ = buildShadowDom_.bind(this)
  },
}

Blockly.Blocks.procedures_prototype = {
  /**
   * Block for calling a procedure with no return value, for rendering inside
   * define block.
   */
  init: function (this: ProcedurePrototypeBlock) {
    this.jsonInit({
      extensions: ['colours_more', 'shape_statement'],
    })

    /* Data known about the procedure. */
    this.procCode_ = ''
    this.displayNames_ = []
    this.argumentIds_ = []
    this.argumentDefaults_ = []
    this.warp_ = false

    // Shared.
    this.getProcCode = getProcCode.bind(this)
    this.removeAllInputs_ = removeAllInputs_.bind(this)
    this.disconnectOldBlocks_ = disconnectOldBlocks_.bind(this)
    this.deleteShadows_ = deleteShadows_.bind(this)
    this.createAllInputs_ = createAllInputs_.bind(this)
    this.updateDisplay_ = updateDisplay_.bind(this)
    // Exist on all three blocks, but have different implementations.
    this.mutationToDom = definitionMutationToDom.bind(this)
    this.domToMutation = definitionDomToMutation.bind(this)
    this.populateArgument_ = populateArgumentOnPrototype_.bind(this)
    this.addProcedureLabel_ = addLabelField_.bind(this)

    // Only exists on procedures_prototype.
    this.createArgumentReporter_ = createArgumentReporter_.bind(this)
    this.updateArgumentReporterNames_ = updateArgumentReporterNames_.bind(this)
  },
}

Blockly.Blocks.procedures_declaration = {
  /**
   * The root block in the procedure declaration editor.
   */
  init: function (this: ProcedureDeclarationBlock) {
    this.jsonInit({
      extensions: ['colours_more', 'shape_statement'],
    })
    /* Data known about the procedure. */
    this.procCode_ = ''
    this.displayNames_ = []
    this.argumentIds_ = []
    this.argumentDefaults_ = []
    this.warp_ = false

    // Shared.
    this.getProcCode = getProcCode.bind(this)
    this.removeAllInputs_ = removeAllInputs_.bind(this)
    this.disconnectOldBlocks_ = disconnectOldBlocks_.bind(this)
    this.deleteShadows_ = deleteShadows_.bind(this)
    this.createAllInputs_ = createAllInputs_.bind(this)
    this.updateDisplay_ = updateDisplay_.bind(this)

    // Exist on all three blocks, but have different implementations.
    this.mutationToDom = definitionMutationToDom.bind(this)
    this.domToMutation = definitionDomToMutation.bind(this)
    this.populateArgument_ = populateArgumentOnDeclaration_.bind(this)
    this.addProcedureLabel_ = addLabelEditor_.bind(this)

    // Exist on declaration and arguments editors, with different implementations.
    this.removeFieldCallback = removeFieldCallback.bind(this)

    // Only exist on procedures_declaration.
    this.createArgumentEditor_ = createArgumentEditor_.bind(this)
    this.focusLastEditor_ = focusLastEditor_.bind(this)
    this.getWarp = getWarp.bind(this)
    this.setWarp = setWarp.bind(this)
    this.addLabelExternal = addLabelExternal.bind(this)
    this.addBooleanExternal = addBooleanExternal.bind(this)
    this.addStringNumberExternal = addStringNumberExternal.bind(this)
    this.onChangeFn = updateDeclarationProcCode_.bind(this)
  },
}

Blockly.Blocks.argument_reporter_boolean = {
  init: function (this: Blockly.BlockSvg) {
    this.jsonInit({
      message0: ' %1',
      args0: [
        {
          type: 'field_label_serializable',
          name: 'VALUE',
          text: '',
        },
      ],
      extensions: ['colours_more', 'output_boolean'],
    })
    this.setDragStrategy(new DuplicateOnDragDraggable(this))
  },
}

Blockly.Blocks.argument_reporter_string_number = {
  init: function (this: Blockly.BlockSvg) {
    this.jsonInit({
      message0: ' %1',
      args0: [
        {
          type: 'field_label_serializable',
          name: 'VALUE',
          text: '',
        },
      ],
      extensions: ['colours_more', 'output_number', 'output_string'],
    })
    this.setDragStrategy(new DuplicateOnDragDraggable(this))
  },
}

Blockly.Blocks.argument_editor_boolean = {
  init: function (this: ProcedureArgumentEditorBlock) {
    this.jsonInit({
      message0: ' %1',
      args0: [
        {
          type: 'field_input_removable',
          name: 'TEXT',
          text: 'foo',
        },
      ],
      extensions: ['colours_textfield', 'output_boolean'],
    })

    // Exist on declaration and arguments editors, with different implementations.
    this.removeFieldCallback = removeArgumentCallback_.bind(this)
  },
}

Blockly.Blocks.argument_editor_string_number = {
  init: function (this: ProcedureArgumentEditorBlock) {
    this.jsonInit({
      message0: ' %1',
      args0: [
        {
          type: 'field_input_removable',
          name: 'TEXT',
          text: 'foo',
        },
      ],
      extensions: ['colours_textfield', 'output_number', 'output_string'],
    })

    // Exist on declaration and arguments editors, with different implementations.
    this.removeFieldCallback = removeArgumentCallback_.bind(this)
  },
}

interface ProcedureBlock extends Blockly.BlockSvg {
  procCode_: string
  argumentIds_: string[]
  warp_: boolean
  getProcCode: () => string
  removeAllInputs_: () => void
  disconnectOldBlocks_: () => ConnectionMap
  deleteShadows_: (connectionMap: ConnectionMap) => void
  createAllInputs_: (connectionMap: ConnectionMap) => void
  updateDisplay_: () => void
  populateArgument_: (
    type: ArgumentType,
    index: number,
    connectionMap: ConnectionMap,
    id: string,
    input: Blockly.Input,
  ) => void
  addProcedureLabel_: (text: string) => void
}

export interface ProcedureDeclarationBlock extends ProcedureBlock {
  displayNames_: string[]
  argumentDefaults_: string[]
  removeFieldCallback: (field: Blockly.Field) => void
  createArgumentEditor_: (argumentType: ArgumentType, displayName: string) => Blockly.BlockSvg
  focusLastEditor_: () => void
  getWarp: () => boolean
  setWarp: (warp: boolean) => void
  addLabelExternal: () => void
  addBooleanExternal: () => void
  addStringNumberExternal: () => void
  onChangeFn: () => void
}

interface ProcedureCallBlock extends ProcedureBlock {
  generateShadows_: boolean
  attachShadow_: (input: Blockly.Input, argumentType: ArgumentType) => void
  buildShadowDom_: (type: ArgumentType) => Element
}

interface ProcedurePrototypeBlock extends ProcedureBlock {
  displayNames_: string[]
  argumentDefaults_: string[]
  createArgumentReporter_: (argumentType: ArgumentType, displayName: string) => Blockly.BlockSvg
  updateArgumentReporterNames_: (prevArgIds: string[], prevDisplayNames: string[]) => void
}

interface ProcedureArgumentEditorBlock extends Blockly.BlockSvg {
  removeFieldCallback: (field: Blockly.Field) => void
}
