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
 * @fileoverview Variable input field.
 * @author fraser@google.com (Neil Fraser)
 */
import * as Blockly from "blockly/core";
import * as Constants from "../constants.js";
import { ScratchMsgs } from "../../msg/scratch_msgs.js";
import { createVariable, renameVariable } from "../variables.js";

class FieldVariable extends Blockly.FieldVariable {
  constructor(varName, validator, variableTypes, defaultType, config) {
    super(varName, validator, variableTypes, defaultType, config);
    this.menuGenerator_ = FieldVariable.dropdownCreate;
  }

  initModel() {
    if (!this.variable) {
      const sourceBlock = this.getSourceBlock();
      if (sourceBlock) {
        const broadcastVariable = this.initFlyoutBroadcast(
          sourceBlock.workspace
        );
        if (broadcastVariable) {
          this.doValueUpdate_(broadcastVariable.getId());
          return;
        }
      }
    }

    super.initModel();
  }

  /**
   * Initialize broadcast blocks in the flyout.
   * Implicit deletion of broadcast messages from the scratch vm may cause
   * broadcast blocks in the flyout to change which variable they display as the
   * selected option when the workspace is refreshed.
   * Re-sort the broadcast messages by name, and set the field value to the id
   * of the variable that comes first in sorted order.
   * @param {!Blockly.Workspace} workspace The flyout workspace containing the
   * broadcast block.
   * @return {string} The variable of type 'broadcast_msg' that comes
   * first in sorted order.
   */
  initFlyoutBroadcast(workspace) {
    const broadcastVars = workspace.getVariablesOfType(
      Constants.BROADCAST_MESSAGE_VARIABLE_TYPE
    );
    if (
      workspace.isFlyout &&
      this.getDefaultType() == Constants.BROADCAST_MESSAGE_VARIABLE_TYPE &&
      broadcastVars.length != 0
    ) {
      broadcastVars.sort(Blockly.Variables.compareByName);
      return broadcastVars[0];
    }
  }

  /**
   * Return a sorted list of variable names for variable dropdown menus.
   * Include a special option at the end for creating a new variable name.
   * @return {!Array.<string>} Array of variable names.
   * @this {Blockly.FieldVariable}
   */
  static dropdownCreate() {
    const options = super.dropdownCreate();
    const type = this.getDefaultType();
    if (type === Constants.BROADCAST_MESSAGE_VARIABLE_TYPE) {
      options.splice(-2, 2, [
        ScratchMsgs.translate("NEW_BROADCAST_MESSAGE"),
        Constants.NEW_BROADCAST_MESSAGE_ID,
      ]);
    } else if (type === Constants.LIST_VARIABLE_TYPE) {
      for (const option of options) {
        if (option[1] === Blockly.RENAME_VARIABLE_ID) {
          option[0] = ScratchMsgs.translate("RENAME_LIST");
        } else if (option[1] === Blockly.DELETE_VARIABLE_ID) {
          option[0] = ScratchMsgs.translate("DELETE_LIST").replace(
            "%1",
            this.getText()
          );
        }
      }
    }

    return options;
  }

  /** Handle the selection of an item in the variable dropdown menu.
   * Special case the 'Rename variable...', 'Delete variable...',
   * and 'New message...' options.
   * In the rename case, prompt the user for a new name.
   * @param {!Blockly.Menu} menu The Menu component clicked.
   * @param {!Blockly.MenuItem} menuItem The MenuItem selected within menu.
   */
  onItemSelected_(menu, menuItem) {
    const sourceBlock = this.getSourceBlock();
    if (sourceBlock && !sourceBlock.isDeadOrDying()) {
      const selectedItem = menuItem.getValue();
      if (selectedItem === Constants.NEW_BROADCAST_MESSAGE_ID) {
        createVariable(
          sourceBlock.workspace,
          (varId) => {
            if (varId) {
              this.setValue(varId);
            }
          },
          Constants.BROADCAST_MESSAGE_VARIABLE_TYPE
        );
        return;
      } else if (selectedItem === Blockly.RENAME_VARIABLE_ID) {
        renameVariable(sourceBlock.workspace, this.variable);
        return;
      }
    }
    super.onItemSelected_(menu, menuItem);
  }

  showEditor_(event) {
    super.showEditor_(event);
    const sourceBlock = this.getSourceBlock();
    if (sourceBlock.isShadow()) {
      sourceBlock.setColour(sourceBlock.style.colourQuaternary);
    }
  }

  dropdownDispose_() {
    super.dropdownDispose_();
    const sourceBlock = this.getSourceBlock();
    if (sourceBlock.isShadow()) {
      sourceBlock.setStyle(`colours_${sourceBlock.type.split("_")[0]}`);
    }
  }
}

Blockly.fieldRegistry.unregister("field_variable");
Blockly.fieldRegistry.register("field_variable", FieldVariable);
