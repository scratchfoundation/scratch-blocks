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
 * @fileoverview Utility functions for handling variables.
 * @author fraser@google.com (Neil Fraser)
 */
import * as Blockly from "blockly/core";
import {
  LIST_VARIABLE_TYPE,
  BROADCAST_MESSAGE_VARIABLE_TYPE,
} from "./constants.js";

/**
 * Constant prefix to differentiate cloud variable names from other types
 * of variables.
 * This is the \u2601 cloud unicode character followed by a space.
 * @type {string}
 * @package
 */
const CLOUD_PREFIX = "☁ ";

let prompt = null;

export function setPromptHandler(handler) {
  prompt = handler;
}

/**
 * Create a new variable on the given workspace.
 * @param {!Blockly.Workspace} workspace The workspace on which to create the
 *     variable.
 * @param {function(?string=)=} opt_callback An optional callback function to act
 *     on the id of the variable that is created from the user's input, or null
 *     if the change is to be aborted (cancel button or an invalid name was provided).
 * @param {string} opt_type Optional type of the variable to be created,
 *     like 'string' or 'list'.
 */
export function createVariable(workspace, opt_callback, opt_type) {
  // Decide on a modal message based on the opt_type. If opt_type was not
  // provided, default to the original message for scalar variables.
  var newMsg, modalTitle;
  if (opt_type === BROADCAST_MESSAGE_VARIABLE_TYPE) {
    newMsg = Blockly.Msg.NEW_BROADCAST_MESSAGE_TITLE;
    modalTitle = Blockly.Msg.BROADCAST_MODAL_TITLE;
  } else if (opt_type === LIST_VARIABLE_TYPE) {
    newMsg = Blockly.Msg.NEW_LIST_TITLE;
    modalTitle = Blockly.Msg.LIST_MODAL_TITLE;
  } else {
    // Note: this case covers 1) scalar variables, 2) any new type of
    // variable not explicitly checked for above, and 3) a null or undefined
    // opt_type -- turns a falsey opt_type into ''
    // TODO (#1251) Warn developers that they didn't provide an opt_type/provided
    // a falsey opt_type
    opt_type = opt_type ? opt_type : "";
    newMsg = Blockly.Msg.NEW_VARIABLE_TITLE;
    modalTitle = Blockly.Msg.VARIABLE_MODAL_TITLE;
  }
  var validate = nameValidator.bind(null, opt_type);

  // Prompt the user to enter a name for the variable
  prompt(
    newMsg,
    "",
    function (text, additionalVars, variableOptions) {
      variableOptions = variableOptions || {};
      var scope = variableOptions.scope;
      var isLocal = scope === "local" || false;
      var isCloud = variableOptions.isCloud || false;
      // Default to [] if additionalVars is not provided
      additionalVars = additionalVars || [];
      // Only use additionalVars for global variable creation.
      var additionalVarNames = isLocal ? [] : additionalVars;

      var validatedText = validate(
        text,
        workspace,
        additionalVarNames,
        isCloud,
        opt_callback
      );
      if (validatedText) {
        const VariableModel = Blockly.registry.getObject(
          Blockly.registry.Type.VARIABLE_MODEL,
          Blockly.registry.DEFAULT,
          true
        );
        const variable = new VariableModel(
          workspace,
          validatedText,
          opt_type,
          null,
          isLocal,
          isCloud
        );
        workspace.getVariableMap().addVariable(variable);
        Blockly.Events.fire(
          new (Blockly.Events.get(Blockly.Events.VAR_CREATE))(variable)
        );

        var flyout = workspace.isFlyout ? workspace : workspace.getFlyout();
        var variableBlockId = variable.getId();
        if (flyout.setCheckboxState) {
          flyout.setCheckboxState(variableBlockId, true);
        }

        if (opt_callback) {
          opt_callback(variableBlockId);
        }
      } else {
        // User canceled prompt without a value.
        if (opt_callback) {
          opt_callback(null);
        }
      }
    },
    modalTitle,
    opt_type
  );
}

/**
 * This function provides a common interface for variable name validation agnostic
 * of type. This is so that functions like Blockly.Variables.createVariable and
 * Blockly.Variables.renameVariable can call a single function (with a single
 * type signature) to validate the user-provided name for a variable.
 * @param {string} type The type of the variable for which the provided name
 *     should be validated.
 * @param {string} text The user-provided text that should be validated as a
 *     variable name.
 * @param {!Blockly.Workspace} workspace The workspace on which to validate the
 *     variable name. This is the workspace used to check whether the variable
 *     already exists.
 * @param {Array<string>} additionalVars A list of additional var names to check
 *     for conflicts against.
 * @param {boolean} isCloud Whether the variable is a cloud variable.
 * @param {function(?string=)=} opt_callback An optional function to be called on
 *     a pre-existing variable of the user-provided name. This function is currently
 *     only used for broadcast messages.
 * @return {string} The validated name according to the parameters given, if
 *     the name is determined to be valid, or null if the name
 *     is determined to be invalid/in-use, and the calling function should not
 *     proceed with creating or renaming the variable.
 * @private
 */
function nameValidator(
  type,
  text,
  workspace,
  additionalVars,
  isCloud,
  opt_callback
) {
  // The validators for the different variable types require slightly different arguments.
  // For broadcast messages, if a broadcast message of the provided name already exists,
  // the validator needs to call a function that updates the selected
  // field option of the dropdown menu of the block that was used to create the new message.
  // For scalar variables and lists, the validator has the same validation behavior, but needs
  // to know which type of variable to check for and needs a type-specific error message
  // that is displayed when a variable of the given name and type already exists.

  if (type === BROADCAST_MESSAGE_VARIABLE_TYPE) {
    return validateBroadcastMessageName(text, workspace, opt_callback);
  } else if (type === LIST_VARIABLE_TYPE) {
    return validateScalarVarOrListName(
      text,
      workspace,
      additionalVars,
      false,
      type,
      Blockly.Msg.LIST_ALREADY_EXISTS
    );
  } else {
    return validateScalarVarOrListName(
      text,
      workspace,
      additionalVars,
      isCloud,
      type,
      Blockly.Msg.VARIABLE_ALREADY_EXISTS
    );
  }
}

/**
 * Validate the given name as a broadcast message type.
 * @param {string} name The name to validate
 * @param {!Blockly.Workspace} workspace The workspace the name should be validated
 *     against.
 * @param {function(?string=)=} opt_callback An optional function to call if a broadcast
 *     message already exists with the given name. This function will be called on the id
 *     of the existing variable.
 * @return {string} The validated name, or null if invalid.
 * @private
 */
function validateBroadcastMessageName(name, workspace, opt_callback) {
  if (!name) {
    // no name was provided or the user cancelled the prompt
    return null;
  }
  var variable = workspace.getVariable(name, BROADCAST_MESSAGE_VARIABLE_TYPE);
  if (variable) {
    // If the user provided a name for a broadcast message that already exists,
    // use the provided callback function to update the selected option in
    // the field of the block that was used to create
    // this message.
    if (opt_callback) {
      opt_callback(variable.getId());
    }
    // Return null to signal to the calling function that we do not want to create
    // a new variable since one already exists.
    return null;
  } else {
    // The name provided is actually a new name, so the calling
    // function should go ahead and create it as a new variable.
    return name;
  }
}

/**
 * Validate the given name as a scalar variable or list type.
 * This function is also responsible for any user facing error-handling.
 * @param {string} name The name to validate
 * @param {!Blockly.Workspace} workspace The workspace the name should be validated
 *     against.
 * @param {Array<string>} additionalVars A list of additional variable names to check
 *     for conflicts against.
 * @param {boolean} isCloud Whether the variable is a cloud variable.
 * @param {string} type The type to validate the variable as. This should be one of
 *     Blockly.SCALAR_VARIABLE_TYPE or Blockly.LIST_VARIABLE_TYPE.
 * @param {string} errorMsg The type-specific error message the user should see
 *     if a variable of the validated, given name and type already exists.
 * @return {string} The validated name, or null if invalid.
 * @private
 */
function validateScalarVarOrListName(
  name,
  workspace,
  additionalVars,
  isCloud,
  type,
  errorMsg
) {
  // For scalar variables, we don't want leading or trailing white space
  name = name.trim();
  if (!name) {
    return null;
  }
  if (isCloud) {
    name = CLOUD_PREFIX + name;
  }
  if (workspace.getVariable(name, type) || additionalVars.indexOf(name) >= 0) {
    // error
    Blockly.dialog.alert(errorMsg.replace("%1", name));
    return null;
  } else {
    // trimmed name is valid
    return name;
  }
}

/**
 * Rename a variable with the given workspace, variableType, and oldName.
 * @param {!Blockly.Workspace} workspace The workspace on which to rename the
 *     variable.
 * @param {Blockly.VariableModel} variable Variable to rename.
 * @param {function(?string=)=} opt_callback A callback. It will
 *     be passed an acceptable new variable name, or null if change is to be
 *     aborted (cancel button), or undefined if an existing variable was chosen.
 */
export function renameVariable(workspace, variable, opt_callback) {
  // Validation and modal message/title depends on the variable type
  var promptMsg, modalTitle;
  var varType = variable.type;
  if (varType === BROADCAST_MESSAGE_VARIABLE_TYPE) {
    console.warn(
      "Unexpected attempt to rename a broadcast message with " +
        "id: " +
        variable.getId() +
        " and name: " +
        variable.name
    );
    return;
  }
  if (varType === LIST_VARIABLE_TYPE) {
    promptMsg = Blockly.Msg.RENAME_LIST_TITLE;
    modalTitle = Blockly.Msg.RENAME_LIST_MODAL_TITLE;
  } else {
    // Default for all other types of variables
    promptMsg = Blockly.Msg.RENAME_VARIABLE_TITLE;
    modalTitle = Blockly.Msg.RENAME_VARIABLE_MODAL_TITLE;
  }
  var validate = nameValidator.bind(null, varType);

  var promptText = promptMsg.replace("%1", variable.name);
  var promptDefaultText = variable.name;
  if (variable.isCloud && variable.name.indexOf(CLOUD_PREFIX) == 0) {
    promptDefaultText = promptDefaultText.substring(CLOUD_PREFIX.length);
  }

  prompt(
    promptText,
    promptDefaultText,
    function (newName, additionalVars) {
      if (
        variable.isCloud &&
        newName.length > 0 &&
        newName.indexOf(CLOUD_PREFIX) == 0
      ) {
        newName = newName.substring(CLOUD_PREFIX.length);
        // The name validator will add the prefix back
      }
      additionalVars = additionalVars || [];
      var additionalVarNames = variable.isLocal ? [] : additionalVars;
      var validatedText = validate(
        newName,
        workspace,
        additionalVarNames,
        variable.isCloud
      );
      if (validatedText) {
        workspace.renameVariableById(variable.getId(), validatedText);
        if (opt_callback) {
          opt_callback(newName);
        }
      } else {
        // User canceled prompt without a value.
        if (opt_callback) {
          opt_callback(null);
        }
      }
    },
    modalTitle,
    varType
  );
}

export { getVariablesCategory } from "./data_category.js";
