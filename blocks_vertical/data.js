'use strict';

goog.provide('Blockly.Blocks.data');

goog.require('Blockly.Blocks');

goog.require('Blockly.Colours');

goog.require('Blockly.constants');

Blockly.Blocks['data_variablemenu'] = {
  /**
   * Variable menu.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit(
      {
        "message0": "%1",
        "args0": [
          {
            "type": "field_variable",
            "name": "VARIABLE",
            "options": [
              ['v', 'V'],
              ['v2', 'V2'],
              ['v3', 'V3'],
              ['v4', 'V4'],
              ['v5', 'V5'],
              ['v6', 'V6'],
              ['v7', 'V7'],			  
            ]
          }
        ],
        "inputsInline": true,
        "output": "String",
        "colour": Blockly.Colours.data.secondary,
        "colourSecondary": Blockly.Colours.data.secondary,
        "colourTertiary": Blockly.Colours.data.tertiary,
        "outputShape": Blockly.OUTPUT_SHAPE_ROUND
      });
  }
};

Blockly.Blocks['data_variable'] = {
  /**
   * Block of Variables
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1",
        "args0": [
          {
            "type": "input_value",
            "name": "VARIABLE"
          }
        ],  
      "colour": Blockly.Colours.data.primary,
      "colourSecondary": Blockly.Colours.data.secondary,
      "colourTertiary": Blockly.Colours.data.tertiary,
      "output": "Number",
      "outputShape": Blockly.OUTPUT_SHAPE_ROUND,	  
      "checkboxInFlyout": true
    });
  }
};

Blockly.Blocks['data_setvariableto'] = {
  /**
   * Block to set variable to a certain value
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "set %1 to %2",
      "args0": [
        {
          "type": "input_value",
          "name": "VARIABLE"
        },
        {
          "type": "input_value",
          "name": "VALUE"
        }		
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.data.primary,
      "colourSecondary": Blockly.Colours.data.secondary,
      "colourTertiary": Blockly.Colours.data.tertiary
    });
  }
};

Blockly.Blocks['data_changevariableby'] = {
  /**
   * Block to change variable by a certain value
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "change %1 to %2",
      "args0": [
        {
          "type": "input_value",
          "name": "VARIABLE"
        },
        {
          "type": "input_value",
          "name": "VALUE"
        }		
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.data.primary,
      "colourSecondary": Blockly.Colours.data.secondary,
      "colourTertiary": Blockly.Colours.data.tertiary
    });
  }
};

Blockly.Blocks['data_showvariable'] = {
  /**
   * Block to show a variable
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "show variable %1",
      "args0": [
        {
          "type": "input_value",
          "name": "VARIABLE"
        }		
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.data.primary,
      "colourSecondary": Blockly.Colours.data.secondary,
      "colourTertiary": Blockly.Colours.data.tertiary
    });
  }
};

Blockly.Blocks['data_hidevariable'] = {
  /**
   * Block to hide a variable
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "hide variable %1",
      "args0": [
        {
          "type": "input_value",
          "name": "VARIABLE"
        }		
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.data.primary,
      "colourSecondary": Blockly.Colours.data.secondary,
      "colourTertiary": Blockly.Colours.data.tertiary
    });
  }
};