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
 * @file Utility functions for handling variables.
 * @author fraser@google.com (Neil Fraser)
 */
import * as Blockly from 'blockly/core'
import { CheckableContinuousFlyout } from './checkable_continuous_flyout'
import { LIST_VARIABLE_TYPE, BROADCAST_MESSAGE_VARIABLE_TYPE } from './constants'
import { ScratchContinuousToolbox } from './scratch_continuous_toolbox'
import { ScratchVariableModel } from './scratch_variable_model'

/**
 * Constant prefix to differentiate cloud variable names from other types of
 * variables.
 * This is the \u2601 cloud unicode character followed by a space.
 */
const CLOUD_PREFIX = '☁ '

type PromptType = (
  message: string,
  defaultValue: string,
  callback: (
    variableName: string,
    additionalVars: string[],
    variableOptions?: { scope?: string; isCloud?: boolean },
  ) => void,
  title?: string,
  varType?: string,
) => void

let prompt: PromptType | undefined = undefined

/**
 * Sets the handler for calls to prompt().
 * @param handler The new prompt function.
 */
export function setPromptHandler(handler: PromptType) {
  prompt = handler
}

/**
 * Create a new variable on the given workspace.
 * @param workspace The workspace on which to create the variable.
 * @param opt_callback An optional callback function to act on the id of the
 *     variable that is created from the user's input, or null if the change is
 *     to be aborted (cancel button or an invalid name was provided).
 * @param opt_type Optional type of the variable to be created, like 'string' or
 *     'list'.
 */
export function createVariable(
  workspace: Blockly.WorkspaceSvg,
  opt_callback?: (id?: string) => void,
  opt_type?: string,
) {
  // Decide on a modal message based on the opt_type. If opt_type was not
  // provided, default to the original message for scalar variables.
  let newMsg, modalTitle
  if (opt_type === BROADCAST_MESSAGE_VARIABLE_TYPE) {
    newMsg = Blockly.Msg.NEW_BROADCAST_MESSAGE_TITLE
    modalTitle = Blockly.Msg.BROADCAST_MODAL_TITLE
  } else if (opt_type === LIST_VARIABLE_TYPE) {
    newMsg = Blockly.Msg.NEW_LIST_TITLE
    modalTitle = Blockly.Msg.LIST_MODAL_TITLE
  } else {
    // Note: this case covers 1) scalar variables, 2) any new type of
    // variable not explicitly checked for above, and 3) a null or undefined
    // opt_type -- turns a falsey opt_type into ''
    // TODO (#1251) Warn developers that they didn't provide an opt_type/
    // provided a falsey opt_type
    opt_type = opt_type ? opt_type : ''
    newMsg = Blockly.Msg.NEW_VARIABLE_TITLE
    modalTitle = Blockly.Msg.VARIABLE_MODAL_TITLE
  }
  const validate = nameValidator.bind(null, opt_type)

  // Prompt the user to enter a name for the variable
  prompt!(
    newMsg,
    '',
    (text: string, additionalVars: string[], variableOptions?: { scope?: string; isCloud?: boolean }) => {
      variableOptions = variableOptions || {}
      const scope = variableOptions.scope
      const isLocal = scope === 'local' || false
      const isCloud = variableOptions.isCloud || false
      // Default to [] if additionalVars is not provided
      additionalVars = additionalVars || []
      // Only use additionalVars for global variable creation.
      const additionalVarNames = isLocal ? [] : additionalVars

      const validatedText = validate(text, workspace, additionalVarNames, isCloud, opt_callback)
      if (validatedText) {
        const variable = new ScratchVariableModel(workspace, validatedText, opt_type, undefined, isLocal, isCloud)
        workspace.getVariableMap().addVariable(variable)
        Blockly.Events.fire(new (Blockly.Events.get(Blockly.Events.VAR_CREATE))(variable))

        const toolbox = workspace.getToolbox()
        const flyout = toolbox?.getFlyout()
        const variableBlockId = variable.getId()
        if (toolbox instanceof ScratchContinuousToolbox && flyout instanceof CheckableContinuousFlyout) {
          toolbox.runAfterRerender(() => {
            flyout.setCheckboxState(variableBlockId, true)
          })
        }

        if (opt_callback) {
          opt_callback(variableBlockId)
        }
      } else {
        // User canceled prompt without a value.
        if (opt_callback) {
          opt_callback(undefined)
        }
      }
    },
    modalTitle,
    opt_type,
  )
}

/**
 * This function provides a common interface for variable name validation
 * agnostic of type. This is so that functions like  createVariable and
 * renameVariable can call a single function (with a single type signature) to
 * validate the user-provided name for a variable.
 * @param type The type of the variable for which the provided name should be
 *     validated.
 * @param text The user-provided text that should be validated as a variable
 *     name.
 * @param workspace The workspace on which to validate the variable name. This
 *     is the workspace used to check whether the variable already exists.
 * @param additionalVars A list of additional var names to check for conflicts
 *     against.
 * @param isCloud Whether the variable is a cloud variable.
 * @param opt_callback An optional function to be called on a pre-existing
 *     variable of the user-provided name. This function is currently only used
 *     for broadcast messages.
 * @returns The validated name according to the parameters given, if the name is
 *     determined to be valid, or null if the name is determined to be invalid/
 *     in-use, and the calling function should not proceed with creating or
 *     renaming the variable.
 */
function nameValidator(
  type: string,
  text: string,
  workspace: Blockly.WorkspaceSvg,
  additionalVars: string[],
  isCloud: boolean,
  opt_callback?: (id?: string) => void,
): string | null {
  // The validators for the different variable types require slightly different
  // arguments. For broadcast messages, if a broadcast message of the provided
  // name already exists, the validator needs to call a function that updates
  // the selected field option of the dropdown menu of the block that was used
  // to create the new message. For scalar variables and lists, the validator
  // has the same validation behavior, but needs to know which type of variable
  // to check for and needs a type-specific error message that is displayed when
  // a variable of the given name and type already exists.

  if (type === BROADCAST_MESSAGE_VARIABLE_TYPE) {
    return validateBroadcastMessageName(text, workspace, opt_callback)
  } else if (type === LIST_VARIABLE_TYPE) {
    return validateScalarVarOrListName(text, workspace, additionalVars, false, type, Blockly.Msg.LIST_ALREADY_EXISTS)
  } else {
    return validateScalarVarOrListName(
      text,
      workspace,
      additionalVars,
      isCloud,
      type,
      Blockly.Msg.VARIABLE_ALREADY_EXISTS,
    )
  }
}

/**
 * Validate the given name as a broadcast message type.
 * @param name The name to validate
 * @param workspace The workspace the name should be validated against.
 * @param opt_callback An optional function to call if a broadcast message
 *     already exists with the given name. This function will be called on the
 *     id of the existing variable.
 * @returns The validated name, or null if invalid.
 */
function validateBroadcastMessageName(
  name: string,
  workspace: Blockly.WorkspaceSvg,
  opt_callback?: (id?: string) => void,
): string | null {
  if (!name) {
    // no name was provided or the user cancelled the prompt
    return null
  }
  const variable = workspace.getVariable(name, BROADCAST_MESSAGE_VARIABLE_TYPE)
  if (variable) {
    // If the user provided a name for a broadcast message that already exists,
    // use the provided callback function to update the selected option in
    // the field of the block that was used to create
    // this message.
    if (opt_callback) {
      opt_callback(variable.getId())
    }
    // Return null to signal to the calling function that we do not want to create
    // a new variable since one already exists.
    return null
  } else {
    // The name provided is actually a new name, so the calling
    // function should go ahead and create it as a new variable.
    return name
  }
}

/**
 * Validate the given name as a scalar variable or list type.
 * This function is also responsible for any user facing error-handling.
 * @param name The name to validate
 * @param workspace The workspace the name should be validated against.
 * @param additionalVars A list of additional variable names to check for
 *     conflicts against.
 * @param isCloud Whether the variable is a cloud variable.
 * @param type The type to validate the variable as. This should be one of
 *     SCALAR_VARIABLE_TYPE or LIST_VARIABLE_TYPE.
 * @param errorMsg The type-specific error message the user should see if a
 *     variable of the validated, given name and type already exists.
 * @returns The validated name, or null if invalid.
 */
function validateScalarVarOrListName(
  name: string,
  workspace: Blockly.WorkspaceSvg,
  additionalVars: string[],
  isCloud: boolean,
  type: string,
  errorMsg: string,
): string | null {
  // For scalar variables, we don't want leading or trailing white space
  name = name.trim()
  if (!name) {
    return null
  }
  if (isCloud) {
    name = CLOUD_PREFIX + name
  }
  if (workspace.getVariable(name, type) || additionalVars.includes(name)) {
    // error
    Blockly.dialog.alert(errorMsg.replace('%1', name))
    return null
  } else {
    // trimmed name is valid
    return name
  }
}

/**
 * Rename a variable with the given workspace, variableType, and oldName.
 * @param workspace The workspace on which to rename the variable.
 * @param variable Variable to rename.
 * @param opt_callback A callback. It will be passed an acceptable new variable
 *     name, or null if change is to be aborted (cancel button), or undefined if
 *     an existing variable was chosen.
 */
export function renameVariable(
  workspace: Blockly.WorkspaceSvg,
  variable: ScratchVariableModel,
  opt_callback?: (id?: string) => void,
) {
  // Validation and modal message/title depends on the variable type
  let promptMsg, modalTitle
  const varType = variable.getType()
  if (varType === BROADCAST_MESSAGE_VARIABLE_TYPE) {
    console.warn(
      `Unexpected attempt to rename a broadcast message with
      id: "${variable.getId()} and name: ${variable.getName()}`,
    )
    return
  }
  if (varType === LIST_VARIABLE_TYPE) {
    promptMsg = Blockly.Msg.RENAME_LIST_TITLE
    modalTitle = Blockly.Msg.RENAME_LIST_MODAL_TITLE
  } else {
    // Default for all other types of variables
    promptMsg = Blockly.Msg.RENAME_VARIABLE_TITLE
    modalTitle = Blockly.Msg.RENAME_VARIABLE_MODAL_TITLE
  }
  const validate = nameValidator.bind(null, varType)

  const promptText = promptMsg.replace('%1', variable.getName())
  let promptDefaultText = variable.getName()
  if (variable.isCloud && variable.getName().startsWith(CLOUD_PREFIX)) {
    promptDefaultText = promptDefaultText.substring(CLOUD_PREFIX.length)
  }

  prompt!(
    promptText,
    promptDefaultText,
    (newName: string, additionalVars: string[]) => {
      if (variable.isCloud && newName.length > 0 && newName.startsWith(CLOUD_PREFIX)) {
        newName = newName.substring(CLOUD_PREFIX.length)
        // The name validator will add the prefix back
      }
      additionalVars = additionalVars || []
      const additionalVarNames = variable.isLocal ? [] : additionalVars
      const validatedText = validate(newName, workspace, additionalVarNames, variable.isCloud)
      if (validatedText) {
        workspace.renameVariableById(variable.getId(), validatedText)
        if (opt_callback) {
          opt_callback(newName)
        }
      } else {
        // User canceled prompt without a value.
        if (opt_callback) {
          opt_callback(undefined)
        }
      }
    },
    modalTitle,
    varType,
  )
}

export { getVariablesCategory } from './data_category'
