/**
 * Visual Blocks Editor
 *
 * Copyright 2017 Google Inc.
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
 * @file Extensions for vertical blocks in scratch-blocks.
 * The following extensions can be used to describe a block in Scratch terms.
 * For instance, a block in the operators colour scheme with a number output
 * would have the "colours_operators" and "output_number" extensions.
 * @author fenichel@google.com (Rachel Fenichel)
 */
import * as Blockly from 'blockly/core'
import * as Constants from '../constants'
import { FlyoutCheckboxIcon } from '../flyout_checkbox_icon'
import { ScratchProcedures } from '../procedures'

/**
 * Helper function that generates an extension based on a category name.
 * The generated function will set the block's style based on the category name.
 * @param category The name of the category to set colours for.
 * @returns An extension function that sets colours based on the given category.
 */
const colourHelper = function (category: string): () => void {
  /**
   * Set the block style on this block for the given category.
   */
  return function (this: Blockly.Block) {
    this.setStyle(category)
  }
}

/**
 * Extension to set the colours of a text field, which are all the same.
 */
const COLOUR_TEXTFIELD = function (this: Blockly.Block) {
  colourHelper('textField').apply(this)
}

/**
 * Extension to make a block fit into a stack of statements, regardless of its
 * inputs.  That means the block should have a previous connection and a next
 * connection and have inline inputs.
 */
const SHAPE_STATEMENT = function (this: Blockly.Block) {
  this.setInputsInline(true)
  this.setPreviousStatement(true, null)
  this.setNextStatement(true, null)
}

/**
 * Extension to make a block be shaped as a hat block, regardless of its
 * inputs.  That means the block should have a next connection and have inline
 * inputs, but have no previous connection.
 */
const SHAPE_HAT = function (this: Blockly.Block) {
  this.setInputsInline(true)
  this.setNextStatement(true, null)
  this.hat = 'cap'
}

/**
 * Extension to make a block be shaped as a bowler hat block, with rounded
 * corners on both sides and no indentation for statement blocks.
 */
const SHAPE_BOWLER_HAT = function (this: Blockly.Block) {
  this.setInputsInline(true)
  this.setNextStatement(true, null)
  this.hat = 'bowler'
}

/**
 * Extension to make a block be shaped as an end block, regardless of its
 * inputs.  That means the block should have a previous connection and have
 * inline inputs, but have no next connection.
 */
const SHAPE_END = function (this: Blockly.Block) {
  this.setInputsInline(true)
  this.setPreviousStatement(true, null)
}

/**
 * Extension to make represent a number reporter in Scratch-Blocks.
 * That means the block has inline inputs, a round output shape, and a 'Number'
 * output type.
 */
const OUTPUT_NUMBER = function (this: Blockly.Block) {
  this.setInputsInline(true)
  this.setOutputShape(Constants.OUTPUT_SHAPE_ROUND)
  this.setOutput(true, 'Number')
}

/**
 * Extension to make represent a string reporter in Scratch-Blocks.
 * That means the block has inline inputs, a round output shape, and a 'String'
 * output type.
 */
const OUTPUT_STRING = function (this: Blockly.Block) {
  this.setInputsInline(true)
  this.setOutputShape(Constants.OUTPUT_SHAPE_ROUND)
  this.setOutput(true, 'String')
}

/**
 * Extension to make represent a boolean reporter in Scratch-Blocks.
 * That means the block has inline inputs, a round output shape, and a 'Boolean'
 * output type.
 */
const OUTPUT_BOOLEAN = function (this: Blockly.Block) {
  this.setInputsInline(true)
  this.setOutputShape(Constants.OUTPUT_SHAPE_HEXAGONAL)
  this.setOutput(true, 'Boolean')
}

/**
 * Extension to make a block a monitor block, capable of reporting its current
 * value in a dropdown. These blocks also have an accompanying checkbox in the
 * flyout to toggle display of their current value in a chip on the stage.
 */
const MONITOR_BLOCK = function (this: Blockly.BlockSvg) {
  this.addIcon(new FlyoutCheckboxIcon(this))
  ;(this as any).checkboxInFlyout = true
}

/**
 * Mixin to add a context menu for a procedure definition block.
 * It adds the "edit" option and removes the "duplicate" option.
 */
const PROCEDURE_DEF_CONTEXTMENU = function (this: Blockly.Block) {
  /**
   * Add the "edit" option and removes the "duplicate" option from the context
   * menu.
   * @param menuOptions List of menu options to edit.
   */
  this.mixin(
    {
      customContextMenu: function (
        menuOptions: (
          | Blockly.ContextMenuRegistry.ContextMenuOption
          | Blockly.ContextMenuRegistry.LegacyContextMenuOption
        )[],
      ) {
        // Add the edit option at the end.
        menuOptions.push(ScratchProcedures.makeEditOption(this))

        // Find and remove the duplicate option
        for (let i = 0, option; (option = menuOptions[i]); i++) {
          if (option.text == Blockly.Msg.DUPLICATE) {
            menuOptions.splice(i, 1)
            break
          }
        }
      },
      checkAndDelete: function () {
        const input = this.getInput('custom_block')
        // this is the root block, not the shadow block.
        if (input?.connection?.targetBlock()) {
          const procCode = input.connection.targetBlock().getProcCode()
          const didDelete = ScratchProcedures.deleteProcedureDefCallback(procCode, this)
          if (!didDelete) {
            alert(Blockly.Msg.PROCEDURE_USED)
          }
        }
      },
    },
    true,
  )
}

/**
 * Mixin to add a context menu for a procedure call block.
 * It adds the "edit" option and the "define" option.
 * @package
 */
const PROCEDURE_CALL_CONTEXTMENU = {
  /**
   * Add the "edit" option to the context menu.
   * @todo Add "go to definition" option once implemented.
   * @param menuOptions List of menu options to edit.
   */
  customContextMenu: function (
    this: Blockly.BlockSvg,
    menuOptions: (
      | Blockly.ContextMenuRegistry.ContextMenuOption
      | Blockly.ContextMenuRegistry.LegacyContextMenuOption
    )[],
  ) {
    menuOptions.push(ScratchProcedures.makeEditOption(this))
  },
}

const SCRATCH_EXTENSION = function (this: Blockly.Block) {
  ;(this as any).isScratchExtension = true
}

/**
 * Register all extensions for scratch-blocks.
 * @package
 */
function registerAll() {
  const categoryNames = [
    'control',
    'data',
    'data_lists',
    'sounds',
    'motion',
    'looks',
    'event',
    'sensing',
    'pen',
    'operators',
    'more',
  ]
  // Register functions for all category colours.
  for (const name of categoryNames) {
    Blockly.Extensions.register('colours_' + name, colourHelper(name))
  }

  // Text fields transcend categories.
  Blockly.Extensions.register('colours_textfield', COLOUR_TEXTFIELD)

  // Register extensions for common block shapes.
  Blockly.Extensions.register('shape_statement', SHAPE_STATEMENT)
  Blockly.Extensions.register('shape_hat', SHAPE_HAT)
  Blockly.Extensions.register('shape_bowler_hat', SHAPE_BOWLER_HAT)
  Blockly.Extensions.register('shape_end', SHAPE_END)

  // Output shapes and types are related.
  Blockly.Extensions.register('output_number', OUTPUT_NUMBER)
  Blockly.Extensions.register('output_string', OUTPUT_STRING)
  Blockly.Extensions.register('output_boolean', OUTPUT_BOOLEAN)

  // Custom procedures have interesting context menus.
  Blockly.Extensions.register('procedure_def_contextmenu', PROCEDURE_DEF_CONTEXTMENU)
  Blockly.Extensions.registerMixin('procedure_call_contextmenu', PROCEDURE_CALL_CONTEXTMENU)

  // Extension blocks have slightly different block rendering.
  Blockly.Extensions.register('scratch_extension', SCRATCH_EXTENSION)

  Blockly.Extensions.register('monitor_block', MONITOR_BLOCK)
}

registerAll()
