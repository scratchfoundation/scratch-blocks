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
 * @file Variable input field.
 * @author fraser@google.com (Neil Fraser)
 */
import * as Blockly from 'blockly/core'
import { ScratchMsgs } from '../../msg/scratch_msgs.js'
import * as Constants from '../constants'
import type { ScratchVariableModel } from '../scratch_variable_model'
import { createVariable, renameVariable } from '../variables'

export class ScratchFieldVariable extends Blockly.FieldVariable {
  private originalStyle!: string

  private getSourceWorkspaceSvg_(sourceBlock: Blockly.Block): Blockly.WorkspaceSvg {
    if (!(sourceBlock.workspace instanceof Blockly.WorkspaceSvg)) {
      throw new Error('[scratch_field_variable] Expected source block workspace to be a WorkspaceSvg')
    }
    return sourceBlock.workspace
  }

  constructor(
    varName: string | null | typeof Blockly.Field.SKIP_SETUP,
    validator?: Blockly.FieldVariableValidator,
    variableTypes?: string[],
    defaultType?: string,
    config?: Blockly.FieldVariableConfig,
  ) {
    super(varName, validator, variableTypes, defaultType, config)
    // dropdownCreate returns MenuOption[] rather than Blockly.MenuGenerator's
    // MenuOption[][] variant; the cast is needed to satisfy FieldVariable's
    // menuGenerator_ type while the actual runtime shape is compatible.
    this.menuGenerator_ = ScratchFieldVariable.dropdownCreate.bind(this)
  }

  initModel() {
    if (!this.getVariable()) {
      const sourceBlock = this.getSourceBlock()
      if (sourceBlock) {
        const sourceWorkspace = this.getSourceWorkspaceSvg_(sourceBlock)
        const broadcastVariable = this.initFlyoutBroadcast(sourceWorkspace)
        if (broadcastVariable) {
          this.doValueUpdate_(broadcastVariable.getId())
          return
        }
      }
    }

    super.initModel()
  }

  /**
   * Initialize broadcast blocks in the flyout.
   * Implicit deletion of broadcast messages from the scratch vm may cause
   * broadcast blocks in the flyout to change which variable they display as the
   * selected option when the workspace is refreshed.
   * Re-sort the broadcast messages by name, and set the field value to the id
   * of the variable that comes first in sorted order.
   * @param workspace The flyout workspace containing the broadcast block.
   * @returns The variable of type 'broadcast_msg' that comes first in sorted
   * order.
   */
  initFlyoutBroadcast(workspace: Blockly.WorkspaceSvg): Blockly.IVariableModel<Blockly.IVariableState> | undefined {
    const broadcastVars = workspace.getVariableMap().getVariablesOfType(Constants.BROADCAST_MESSAGE_VARIABLE_TYPE)
    if (
      workspace.isFlyout &&
      this.getDefaultType() == Constants.BROADCAST_MESSAGE_VARIABLE_TYPE &&
      broadcastVars.length != 0
    ) {
      broadcastVars.sort(Blockly.Variables.compareByName)
      return broadcastVars[0]
    }
  }

  /**
   * Return a sorted list of variable names for variable dropdown menus.
   * Include a special option at the end for creating a new variable name.
   * @returns Array of variable names.
   */
  static dropdownCreate(this: ScratchFieldVariable): Blockly.MenuOption[] {
    let options = super.dropdownCreate()
    const type = this.getDefaultType()
    if (type === Constants.BROADCAST_MESSAGE_VARIABLE_TYPE) {
      options.splice(-2, 2, [ScratchMsgs.translate('NEW_BROADCAST_MESSAGE'), Constants.NEW_BROADCAST_MESSAGE_ID])
    } else if (type === Constants.LIST_VARIABLE_TYPE) {
      options = options.map((option) => {
        if (option[1] === Blockly.RENAME_VARIABLE_ID) {
          return [ScratchMsgs.translate('RENAME_LIST'), option[1]]
        } else if (option[1] === Blockly.DELETE_VARIABLE_ID) {
          const fieldText = (this as Blockly.FieldVariable).getText()
          return [String(ScratchMsgs.translate('DELETE_LIST')).replace('%1', fieldText), option[1]]
        }
        return option
      })
    }

    return options
  }

  /**
   * Handle the selection of an item in the variable dropdown menu.
   * Special case the 'Rename variable...', 'Delete variable...',
   * and 'New message...' options.
   * In the rename case, prompt the user for a new name.
   * @param menu The Menu component clicked.
   * @param menuItem The MenuItem selected within menu.
   */
  onItemSelected_(menu: Blockly.Menu, menuItem: Blockly.MenuItem) {
    const sourceBlock = this.getSourceBlock()
    if (sourceBlock && !sourceBlock.isDeadOrDying()) {
      const selectedItem = menuItem.getValue()
      if (selectedItem === Constants.NEW_BROADCAST_MESSAGE_ID) {
        const sourceWorkspace = this.getSourceWorkspaceSvg_(sourceBlock)
        createVariable(
          sourceWorkspace,
          (varId) => {
            if (varId) {
              this.setValue(varId)
            }
          },
          Constants.BROADCAST_MESSAGE_VARIABLE_TYPE,
        )
        return
      } else if (selectedItem === Blockly.RENAME_VARIABLE_ID) {
        renameVariable(sourceBlock.workspace, this.getVariable() as ScratchVariableModel)
        return
      }
    }
    super.onItemSelected_(menu, menuItem)
  }

  showEditor_(event: PointerEvent) {
    super.showEditor_(event)
    const sourceBlock = this.getSourceBlock()
    if (!sourceBlock) {
      throw new Error('[scratch_field_variable] Missing source block in showEditor_')
    }
    const sourceWorkspace = this.getSourceWorkspaceSvg_(sourceBlock)
    const styleName = sourceBlock.getStyleName()
    const style = sourceWorkspace.getRenderer().getConstants().getBlockStyle(styleName)
    if (sourceBlock.isShadow()) {
      this.originalStyle = styleName
      sourceBlock.setStyle(`${this.originalStyle}_selected`)
    } else if (this.borderRect_) {
      this.borderRect_.setAttribute(
        'fill',
        'colourQuaternary' in style ? String(style.colourQuaternary) : style.colourTertiary,
      )
    }
  }

  dropdownDispose_() {
    super.dropdownDispose_()
    const sourceBlock = this.getSourceBlock()
    if (!sourceBlock) {
      throw new Error('[scratch_field_variable] Missing source block in dropdownDispose_')
    }
    if (sourceBlock.isShadow()) {
      sourceBlock.setStyle(this.originalStyle)
    }
  }
}

/**
 * Register the field and any dependencies.
 */
export function registerScratchFieldVariable() {
  Blockly.fieldRegistry.unregister('field_variable')
  Blockly.fieldRegistry.register('field_variable', ScratchFieldVariable)
}
