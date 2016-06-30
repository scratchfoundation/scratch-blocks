'use strict';

goog.provide('Blockly.Blocks.motion');

goog.require('Blockly.Blocks');

goog.require('Blockly.Colours');

Blockly.Blocks['motion_movesteps'] = {
  /**
   * Block to move steps.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "move %1 steps",
      "args0": [
        {
          "type": "input_value",
          "name": "STEPS"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.motion.primary,
      "colourSecondary": Blockly.Colours.motion.secondary,
      "colourTertiary": Blockly.Colours.motion.tertiary
    });
  }
};

Blockly.Blocks['motion_turnright'] = {
  /**
   * Block to turn right.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "turn right %1 degrees",
      "args0": [
        {
          "type": "input_value",
          "name": "DEGREES"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.motion.primary,
      "colourSecondary": Blockly.Colours.motion.secondary,
      "colourTertiary": Blockly.Colours.motion.tertiary
    });
  }
};

Blockly.Blocks['motion_turnleft'] = {
  /**
   * Block to turn left.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "turn left %1 degrees",
      "args0": [
        {
          "type": "input_value",
          "name": "DEGREES"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.motion.primary,
      "colourSecondary": Blockly.Colours.motion.secondary,
      "colourTertiary": Blockly.Colours.motion.tertiary
    });
  }
};

Blockly.Blocks['motion_pointindirection'] = {
  /**
   * Block to point in direction.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "point in direction %1",
      "args0": [
        {
          "type": "input_value",
          "name": "DIRECTION"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.motion.primary,
      "colourSecondary": Blockly.Colours.motion.secondary,
      "colourTertiary": Blockly.Colours.motion.tertiary
    });
  }
};

Blockly.Blocks['motion_pointtowards_menu'] = {
  /**
   * Point towards drop-down menu.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit(
      {
        "message0": "%1",
        "args0": [
          {
            "type": "field_dropdown",
            "name": "TOWARDS",
            "options": [
              ['mouse pointer', 'MOUSE-POINTER']
            ]
          }
        ],
        "inputsInline": true,
        "output": "String",
        "colour": Blockly.Colours.motion.secondary,
        "colourSecondary": Blockly.Colours.motion.secondary,
        "colourTertiary": Blockly.Colours.motion.tertiary,
        "outputShape": Blockly.OUTPUT_SHAPE_SQUARE
      });
  }
};

Blockly.Blocks['motion_pointtowards'] = {
  /**
   * Block to point in direction.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "point towards %1",
      "args0": [
        {
          "type": "input_value",
          "name": "TOWARDS"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.motion.primary,
      "colourSecondary": Blockly.Colours.motion.secondary,
      "colourTertiary": Blockly.Colours.motion.tertiary
    });
  }
};
