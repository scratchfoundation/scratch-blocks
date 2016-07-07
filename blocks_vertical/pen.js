'use strict';

goog.provide('Blockly.Blocks.pen');

goog.require('Blockly.Blocks');

goog.require('Blockly.Colours');

goog.require('Blockly.constants');

Blockly.Blocks['pen_clear'] = {
  /**
   * Block to clear drawing.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "clear",
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.pen.primary,
      "colourSecondary": Blockly.Colours.pen.secondary,
      "colourTertiary": Blockly.Colours.pen.tertiary
    });
  }
};

Blockly.Blocks['pen_stamp'] = {
  /**
   * Block to stamp a sprite.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "stamp",
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.pen.primary,
      "colourSecondary": Blockly.Colours.pen.secondary,
      "colourTertiary": Blockly.Colours.pen.tertiary
    });
  }
};

Blockly.Blocks['pen_pendown'] = {
  /**
   * Block to pull down the sprite's pen.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "pen down",
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.pen.primary,
      "colourSecondary": Blockly.Colours.pen.secondary,
      "colourTertiary": Blockly.Colours.pen.tertiary
    });
  }
};

Blockly.Blocks['pen_penup'] = {
  /**
   * Block to pull up the sprite's pen.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "pen up",
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.pen.primary,
      "colourSecondary": Blockly.Colours.pen.secondary,
      "colourTertiary": Blockly.Colours.pen.tertiary
    });
  }
};

Blockly.Blocks['pen_changepencolorby'] = {
  /**
   * Block to change the pen's color by the value.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "change pen color by %1",
      "args0": [
        {
          "type": "input_value",
          "name": "COLOR"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.pen.primary,
      "colourSecondary": Blockly.Colours.pen.secondary,
      "colourTertiary": Blockly.Colours.pen.tertiary
    });
  }
};

Blockly.Blocks['pen_setpencolorto'] = {
  /**
   * Block to set the pen's color to the value.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "set pen color to %1",
      "args0": [
        {
          "type": "input_value",
          "name": "COLOR"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.pen.primary,
      "colourSecondary": Blockly.Colours.pen.secondary,
      "colourTertiary": Blockly.Colours.pen.tertiary
    });
  }
};

Blockly.Blocks['pen_changepenshadeby'] = {
  /**
   * Block to change the pen's shade by the value.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "change pen shade by %1",
      "args0": [
        {
          "type": "input_value",
          "name": "SHADE"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.pen.primary,
      "colourSecondary": Blockly.Colours.pen.secondary,
      "colourTertiary": Blockly.Colours.pen.tertiary
    });
  }
};

Blockly.Blocks['pen_setpenshadeto'] = {
  /**
   * Block to set the pen's shade to the value.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "set pen shade to %1",
      "args0": [
        {
          "type": "input_value",
          "name": "SHADE"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.pen.primary,
      "colourSecondary": Blockly.Colours.pen.secondary,
      "colourTertiary": Blockly.Colours.pen.tertiary
    });
  }
};

Blockly.Blocks['pen_changepensizeby'] = {
  /**
   * Block to change the pen's size by the value.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "change pen size by %1",
      "args0": [
        {
          "type": "input_value",
          "name": "SIZE"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.pen.primary,
      "colourSecondary": Blockly.Colours.pen.secondary,
      "colourTertiary": Blockly.Colours.pen.tertiary
    });
  }
};

Blockly.Blocks['pen_setpensizeto'] = {
  /**
   * Block to set the pen's size to the value.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "set pen size to %1",
      "args0": [
        {
          "type": "input_value",
          "name": "SIZE"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.pen.primary,
      "colourSecondary": Blockly.Colours.pen.secondary,
      "colourTertiary": Blockly.Colours.pen.tertiary
    });
  }
};
