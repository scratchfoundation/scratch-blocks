/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Massachusetts Institute of Technology
 * All rights reserved.
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

import * as Blockly from "blockly/core";
import { Categories } from "../categories.js";
import * as Constants from "../constants.js";
import * as scratchBlocksUtils from "../scratch_blocks_utils.js";
import { renameVariable } from "../variables.js";

Blockly.Blocks["data_variable"] = {
  /**
   * Block of Variables
   * @this Blockly.Block
   */
  init: function () {
    this.jsonInit({
      message0: "%1",
      lastDummyAlign0: "CENTRE",
      args0: [
        {
          type: "field_variable_getter",
          name: "VARIABLE",
          allowedVariableType: Constants.SCALAR_VARIABLE_TYPE,
        },
      ],
      category: Categories.data,
      extensions: [
        "contextMenu_getVariableBlock",
        "colours_data",
        "output_string",
        "monitor_block",
      ],
    });
  },
};

Blockly.Blocks["data_setvariableto"] = {
  /**
   * Block to set variable to a certain value
   * @this Blockly.Block
   */
  init: function () {
    this.jsonInit({
      message0: Blockly.Msg.DATA_SETVARIABLETO,
      args0: [
        {
          type: "field_variable",
          name: "VARIABLE",
          variableTypes: [Constants.SCALAR_VARIABLE_TYPE],
          defaultType: Constants.SCALAR_VARIABLE_TYPE,
        },
        {
          type: "input_value",
          name: "VALUE",
        },
      ],
      category: Categories.data,
      extensions: ["colours_data", "shape_statement"],
    });
  },
};

Blockly.Blocks["data_changevariableby"] = {
  /**
   * Block to change variable by a certain value
   * @this Blockly.Block
   */
  init: function () {
    this.jsonInit({
      message0: Blockly.Msg.DATA_CHANGEVARIABLEBY,
      args0: [
        {
          type: "field_variable",
          name: "VARIABLE",
          variableTypes: [Constants.SCALAR_VARIABLE_TYPE],
          defaultType: Constants.SCALAR_VARIABLE_TYPE,
        },
        {
          type: "input_value",
          name: "VALUE",
        },
      ],
      category: Categories.data,
      extensions: ["colours_data", "shape_statement"],
    });
  },
};

Blockly.Blocks["data_showvariable"] = {
  /**
   * Block to show a variable
   * @this Blockly.Block
   */
  init: function () {
    this.jsonInit({
      message0: Blockly.Msg.DATA_SHOWVARIABLE,
      args0: [
        {
          type: "field_variable",
          name: "VARIABLE",
          variableTypes: [Constants.SCALAR_VARIABLE_TYPE],
          defaultType: Constants.SCALAR_VARIABLE_TYPE,
        },
      ],
      previousStatement: null,
      nextStatement: null,
      category: Categories.data,
      extensions: ["colours_data"],
    });
  },
};

Blockly.Blocks["data_hidevariable"] = {
  /**
   * Block to hide a variable
   * @this Blockly.Block
   */
  init: function () {
    this.jsonInit({
      message0: Blockly.Msg.DATA_HIDEVARIABLE,
      args0: [
        {
          type: "field_variable",
          name: "VARIABLE",
          variableTypes: [Constants.SCALAR_VARIABLE_TYPE],
          defaultType: Constants.SCALAR_VARIABLE_TYPE,
        },
      ],
      previousStatement: null,
      nextStatement: null,
      category: Categories.data,
      extensions: ["colours_data"],
    });
  },
};

Blockly.Blocks["data_listcontents"] = {
  /**
   * List reporter.
   * @this Blockly.Block
   */
  init: function () {
    this.jsonInit({
      message0: "%1",
      args0: [
        {
          type: "field_variable_getter",
          name: "LIST",
          allowedVariableType: Constants.LIST_VARIABLE_TYPE,
        },
      ],
      category: Categories.dataLists,
      extensions: [
        "contextMenu_getListBlock",
        "colours_data_lists",
        "output_string",
        "monitor_block",
      ],
    });
  },
};

Blockly.Blocks["data_listindexall"] = {
  /**
   * List index menu, with all option.
   * @this Blockly.Block
   */
  init: function () {
    this.jsonInit({
      message0: "%1",
      args0: [
        {
          type: "field_numberdropdown",
          name: "INDEX",
          value: "1",
          min: 1,
          precision: 1,
          options: [
            ["1", "1"],
            [Blockly.Msg.DATA_INDEX_LAST, "last"],
            [Blockly.Msg.DATA_INDEX_ALL, "all"],
          ],
        },
      ],
      category: Categories.data,
      extensions: ["colours_textfield", "output_string"],
    });
  },
};

Blockly.Blocks["data_listindexrandom"] = {
  /**
   * List index menu, with random option.
   * @this Blockly.Block
   */
  init: function () {
    this.jsonInit({
      message0: "%1",
      args0: [
        {
          type: "field_numberdropdown",
          name: "INDEX",
          value: "1",
          min: 1,
          precision: 1,
          options: [
            ["1", "1"],
            [Blockly.Msg.DATA_INDEX_LAST, "last"],
            [Blockly.Msg.DATA_INDEX_RANDOM, "random"],
          ],
        },
      ],
      category: Categories.data,
      extensions: ["colours_textfield", "output_string"],
    });
  },
};

Blockly.Blocks["data_addtolist"] = {
  /**
   * Block to add item to list.
   * @this Blockly.Block
   */
  init: function () {
    this.jsonInit({
      message0: Blockly.Msg.DATA_ADDTOLIST,
      args0: [
        {
          type: "input_value",
          name: "ITEM",
        },
        {
          type: "field_variable",
          name: "LIST",
          variableTypes: [Constants.LIST_VARIABLE_TYPE],
          defaultType: Constants.LIST_VARIABLE_TYPE,
        },
      ],
      category: Categories.dataLists,
      extensions: ["colours_data_lists", "shape_statement"],
    });
  },
};

Blockly.Blocks["data_deleteoflist"] = {
  /**
   * Block to delete item from list.
   * @this Blockly.Block
   */
  init: function () {
    this.jsonInit({
      message0: Blockly.Msg.DATA_DELETEOFLIST,
      args0: [
        {
          type: "input_value",
          name: "INDEX",
        },
        {
          type: "field_variable",
          name: "LIST",
          variableTypes: [Constants.LIST_VARIABLE_TYPE],
          defaultType: Constants.LIST_VARIABLE_TYPE,
        },
      ],
      category: Categories.dataLists,
      extensions: ["colours_data_lists", "shape_statement"],
    });
  },
};

Blockly.Blocks["data_deletealloflist"] = {
  /**
   * Block to delete all items from list.
   * @this Blockly.Block
   */
  init: function () {
    this.jsonInit({
      message0: Blockly.Msg.DATA_DELETEALLOFLIST,
      args0: [
        {
          type: "field_variable",
          name: "LIST",
          variableTypes: [Constants.LIST_VARIABLE_TYPE],
          defaultType: Constants.LIST_VARIABLE_TYPE,
        },
      ],
      category: Categories.dataLists,
      extensions: ["colours_data_lists", "shape_statement"],
    });
  },
};

Blockly.Blocks["data_insertatlist"] = {
  /**
   * Block to insert item to list.
   * @this Blockly.Block
   */
  init: function () {
    this.jsonInit({
      message0: Blockly.Msg.DATA_INSERTATLIST,
      args0: [
        {
          type: "input_value",
          name: "ITEM",
        },
        {
          type: "input_value",
          name: "INDEX",
        },
        {
          type: "field_variable",
          name: "LIST",
          variableTypes: [Constants.LIST_VARIABLE_TYPE],
          defaultType: Constants.LIST_VARIABLE_TYPE,
        },
      ],
      category: Categories.dataLists,
      extensions: ["colours_data_lists", "shape_statement"],
    });
  },
};

Blockly.Blocks["data_replaceitemoflist"] = {
  /**
   * Block to insert item to list.
   * @this Blockly.Block
   */
  init: function () {
    this.jsonInit({
      message0: Blockly.Msg.DATA_REPLACEITEMOFLIST,
      args0: [
        {
          type: "input_value",
          name: "INDEX",
        },
        {
          type: "field_variable",
          name: "LIST",
          variableTypes: [Constants.LIST_VARIABLE_TYPE],
          defaultType: Constants.LIST_VARIABLE_TYPE,
        },
        {
          type: "input_value",
          name: "ITEM",
        },
      ],
      category: Categories.dataLists,
      extensions: ["colours_data_lists", "shape_statement"],
    });
  },
};

Blockly.Blocks["data_itemoflist"] = {
  /**
   * Block for reporting item of list.
   * @this Blockly.Block
   */
  init: function () {
    this.jsonInit({
      message0: Blockly.Msg.DATA_ITEMOFLIST,
      args0: [
        {
          type: "input_value",
          name: "INDEX",
        },
        {
          type: "field_variable",
          name: "LIST",
          variableTypes: [Constants.LIST_VARIABLE_TYPE],
          defaultType: Constants.LIST_VARIABLE_TYPE,
        },
      ],
      output: null,
      category: Categories.dataLists,
      extensions: ["colours_data_lists"],
      outputShape: Constants.OUTPUT_SHAPE_ROUND,
    });
  },
};

Blockly.Blocks["data_itemnumoflist"] = {
  /**
   * Block for reporting the item # of a string in a list.
   * @this Blockly.Block
   */
  init: function () {
    this.jsonInit({
      message0: Blockly.Msg.DATA_ITEMNUMOFLIST,
      args0: [
        {
          type: "input_value",
          name: "ITEM",
        },
        {
          type: "field_variable",
          name: "LIST",
          variableTypes: [Constants.LIST_VARIABLE_TYPE],
          defaultType: Constants.LIST_VARIABLE_TYPE,
        },
      ],
      output: null,
      category: Categories.dataLists,
      extensions: ["colours_data_lists"],
      outputShape: Constants.OUTPUT_SHAPE_ROUND,
    });
  },
};

Blockly.Blocks["data_lengthoflist"] = {
  /**
   * Block for reporting length of list.
   * @this Blockly.Block
   */
  init: function () {
    this.jsonInit({
      message0: Blockly.Msg.DATA_LENGTHOFLIST,
      args0: [
        {
          type: "field_variable",
          name: "LIST",
          variableTypes: [Constants.LIST_VARIABLE_TYPE],
          defaultType: Constants.LIST_VARIABLE_TYPE,
        },
      ],
      category: Categories.dataLists,
      extensions: ["colours_data_lists", "output_number"],
    });
  },
};

Blockly.Blocks["data_listcontainsitem"] = {
  /**
   * Block to report whether list contains item.
   * @this Blockly.Block
   */
  init: function () {
    this.jsonInit({
      message0: Blockly.Msg.DATA_LISTCONTAINSITEM,
      args0: [
        {
          type: "field_variable",
          name: "LIST",
          variableTypes: [Constants.LIST_VARIABLE_TYPE],
          defaultType: Constants.LIST_VARIABLE_TYPE,
        },
        {
          type: "input_value",
          name: "ITEM",
        },
      ],
      category: Categories.dataLists,
      extensions: ["colours_data_lists", "output_boolean"],
    });
  },
};

Blockly.Blocks["data_showlist"] = {
  /**
   * Block to show a list.
   * @this Blockly.Block
   */
  init: function () {
    this.jsonInit({
      message0: Blockly.Msg.DATA_SHOWLIST,
      args0: [
        {
          type: "field_variable",
          name: "LIST",
          variableTypes: [Constants.LIST_VARIABLE_TYPE],
          defaultType: Constants.LIST_VARIABLE_TYPE,
        },
      ],
      category: Categories.dataLists,
      extensions: ["colours_data_lists", "shape_statement"],
    });
  },
};

Blockly.Blocks["data_hidelist"] = {
  /**
   * Block to hide a list.
   * @this Blockly.Block
   */
  init: function () {
    this.jsonInit({
      message0: Blockly.Msg.DATA_HIDELIST,
      args0: [
        {
          type: "field_variable",
          name: "LIST",
          variableTypes: [Constants.LIST_VARIABLE_TYPE],
          defaultType: Constants.LIST_VARIABLE_TYPE,
        },
      ],
      category: Categories.dataLists,
      extensions: ["colours_data_lists", "shape_statement"],
    });
  },
};

/**
 * Mixin to add a context menu for a data_variable block.  It adds one item for
 * each variable defined on the workspace.
 * @mixin
 * @augments Blockly.Block
 * @package
 * @readonly
 */
const CUSTOM_CONTEXT_MENU_GET_VARIABLE_MIXIN = {
  /**
   * Add context menu option to change the selected variable.
   * @param {!Array} options List of menu options to add to.
   * @this Blockly.Block
   */
  customContextMenu: function (options) {
    var fieldName = "VARIABLE";
    if (this.isCollapsed()) {
      return;
    }
    var currentVarName = this.getField(fieldName).getVariable().getName();
    if (!this.isInFlyout) {
      var variablesList = this.workspace.getVariablesOfType(
        Constants.SCALAR_VARIABLE_TYPE
      );
      variablesList.sort(function (a, b) {
        return scratchBlocksUtils.compareStrings(a.getName(), b.getName());
      });
      for (var i = 0; i < variablesList.length; i++) {
        var varName = variablesList[i].getName();
        if (varName == currentVarName) continue;

        var option = { enabled: true };
        option.text = varName;

        option.callback = VARIABLE_OPTION_CALLBACK_FACTORY(
          this,
          variablesList[i].getId(),
          fieldName
        );
        options.push(option);
      }
    } else {
      var renameOption = {
        text: Blockly.Msg.RENAME_VARIABLE,
        enabled: true,
        callback: RENAME_OPTION_CALLBACK_FACTORY(this, fieldName),
      };
      var deleteOption = {
        text: Blockly.Msg.DELETE_VARIABLE.replace("%1", currentVarName),
        enabled: true,
        callback: DELETE_OPTION_CALLBACK_FACTORY(this, fieldName),
      };
      options.push(renameOption);
      options.push(deleteOption);
    }
  },
};

Blockly.Extensions.registerMixin(
  "contextMenu_getVariableBlock",
  CUSTOM_CONTEXT_MENU_GET_VARIABLE_MIXIN
);

/**
 * Mixin to add a context menu for a data_listcontents block.  It adds one item for
 * each list defined on the workspace.
 * @mixin
 * @augments Blockly.Block
 * @package
 * @readonly
 */
const CUSTOM_CONTEXT_MENU_GET_LIST_MIXIN = {
  /**
   * Add context menu option to change the selected list.
   * @param {!Array} options List of menu options to add to.
   * @this Blockly.Block
   */
  customContextMenu: function (options) {
    var fieldName = "LIST";
    if (this.isCollapsed()) {
      return;
    }
    var currentVarName = this.getField(fieldName).getVariable().getName();
    if (!this.isInFlyout) {
      var variablesList = this.workspace.getVariablesOfType(
        Constants.LIST_VARIABLE_TYPE
      );
      variablesList.sort(function (a, b) {
        return scratchBlocksUtils.compareStrings(a.getName(), b.getName());
      });
      for (var i = 0; i < variablesList.length; i++) {
        var varName = variablesList[i].getName();
        if (varName == currentVarName) continue;

        var option = { enabled: true };
        option.text = varName;

        option.callback = VARIABLE_OPTION_CALLBACK_FACTORY(
          this,
          variablesList[i].getId(),
          fieldName
        );
        options.push(option);
      }
    } else {
      var renameOption = {
        text: Blockly.Msg.RENAME_LIST,
        enabled: true,
        callback: RENAME_OPTION_CALLBACK_FACTORY(this, fieldName),
      };
      var deleteOption = {
        text: Blockly.Msg.DELETE_LIST.replace("%1", currentVarName),
        enabled: true,
        callback: DELETE_OPTION_CALLBACK_FACTORY(this, fieldName),
      };
      options.push(renameOption);
      options.push(deleteOption);
    }
  },
};
Blockly.Extensions.registerMixin(
  "contextMenu_getListBlock",
  CUSTOM_CONTEXT_MENU_GET_LIST_MIXIN
);

/**
 * Callback factory for dropdown menu options associated with a variable getter
 * block.  Each variable on the workspace gets its own item in the dropdown
 * menu, and clicking on that item changes the text of the field on the source
 * block.
 * @param {!Blockly.Block} block The block to update.
 * @param {string} id The id of the variable to set on this block.
 * @param {string} fieldName The name of the field to update on the block.
 * @return {!function()} A function that updates the block with the new name.
 */
const VARIABLE_OPTION_CALLBACK_FACTORY = function (block, id, fieldName) {
  return function () {
    var variableField = block.getField(fieldName);
    if (!variableField) {
      console.log("Tried to get a variable field on the wrong type of block.");
    }
    variableField.setValue(id);
  };
};

/**
 * Callback for rename variable dropdown menu option associated with a
 * variable getter block.
 * @param {!Blockly.Block} block The block with the variable to rename.
 * @param {string} fieldName The name of the field to inspect on the block.
 * @return {!function()} A function that renames the variable.
 */
const RENAME_OPTION_CALLBACK_FACTORY = function (block, fieldName) {
  return function () {
    var workspace = block.workspace;
    var variable = block.getField(fieldName).getVariable();
    renameVariable(workspace, variable);
  };
};

/**
 * Callback for delete variable dropdown menu option associated with a
 * variable getter block.
 * @param {!Blockly.Block} block The block with the variable to delete.
 * @param {string} fieldName The name of the field to inspect on the block.
 * @return {!function()} A function that deletes the variable.
 */
const DELETE_OPTION_CALLBACK_FACTORY = function (block, fieldName) {
  return function () {
    const variable = block.getField(fieldName).getVariable();
    Blockly.Variables.deleteVariable(variable.getWorkspace(), variable, block);
  };
};
