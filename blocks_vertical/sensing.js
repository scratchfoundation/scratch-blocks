'use strict';

goog.provide('Blockly.Blocks.sensing');

goog.require('Blockly.Blocks');

goog.require('Blockly.Colours');

goog.require('Blockly.constants');

Blockly.Blocks['sensing_touchingobject'] = {
  /**
   * Block to Report if its touching a Object.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "touching %1",
      "args0": [
        {
          "type": "input_value",
          "name": "TOUCHINGOBJECTMENU"
        }
      ],
      "inputsInline": true,
      "output": "Boolean",
      "colour": Blockly.Colours.sensing.primary,
      "colourSecondary": Blockly.Colours.sensing.secondary,
      "colourTertiary": Blockly.Colours.sensing.tertiary,
      "outputShape": Blockly.OUTPUT_SHAPE_HEXAGONAL
    });
  }
};

Blockly.Blocks['sensing_touchingobjectmenu'] = {
  /**
   * "Touching [Object]" Block Menu.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit(
      {
        "message0": "%1",
        "args0": [
          {
            "type": "field_dropdown",
            "name": "TOUCHINGOBJECTMENU",
            "options": [
              ['mouse pointer', 'MOUSE_POINTER'],
              ['edge', 'EDGE']
            ]
          }
        ],
        "inputsInline": true,
        "output": "String",
        "colour": Blockly.Colours.sensing.secondary,
        "colourSecondary": Blockly.Colours.sensing.secondary,
        "colourTertiary": Blockly.Colours.sensing.tertiary,
        "outputShape": Blockly.OUTPUT_SHAPE_ROUND
      });
  }
};

Blockly.Blocks['sensing_touchingcolor'] = {
  /**
   * Block to Report if its touching a certain Color.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "touching color %1",
      "args0": [
        {
          "type": "input_value",
          "name": "COLOR"
        }
      ],
      "inputsInline": true,
      "output": "Boolean",
      "colour": Blockly.Colours.sensing.primary,
      "colourSecondary": Blockly.Colours.sensing.secondary,
      "colourTertiary": Blockly.Colours.sensing.tertiary,
      "outputShape": Blockly.OUTPUT_SHAPE_HEXAGONAL
    });
  }
};

Blockly.Blocks['sensing_coloristouchingcolor'] = {
  /**
   * Block to Report if a color is touching a certain Color.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "color %1 is touching %2",
      "args0": [
        {
          "type": "input_value",
          "name": "COLOR"
        },
        {
          "type": "input_value",
          "name": "COLOR2"
        }		
      ],
      "inputsInline": true,
      "output": "Boolean",
      "colour": Blockly.Colours.sensing.primary,
      "colourSecondary": Blockly.Colours.sensing.secondary,
      "colourTertiary": Blockly.Colours.sensing.tertiary,
      "outputShape": Blockly.OUTPUT_SHAPE_HEXAGONAL
    });
  }
};

Blockly.Blocks['sensing_distanceto'] = {
  /**
   * Block to Report distance to another Object.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "distance to %1",
      "args0": [
        {
          "type": "input_value",
          "name": "DISTANCETOMENU"
        }
      ],
      "colour": Blockly.Colours.sensing.primary,
      "colourSecondary": Blockly.Colours.sensing.secondary,
      "colourTertiary": Blockly.Colours.sensing.tertiary,
      "output": "Number",	  
      "outputShape": Blockly.OUTPUT_SHAPE_ROUND
    });
  }
};

Blockly.Blocks['sensing_distancetomenu'] = {
  /**
   * "Distance to [Object]" Block Menu.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit(
      {
        "message0": "%1",
        "args0": [
          {
            "type": "field_dropdown",
            "name": "DISTANCETOMENU",
            "options": [
              ['mouse pointer', 'MOUSE_POINTER']
            ]
          }
        ],
        "inputsInline": true,
        "output": "String",
        "colour": Blockly.Colours.sensing.secondary,
        "colourSecondary": Blockly.Colours.sensing.secondary,
        "colourTertiary": Blockly.Colours.sensing.tertiary,
        "outputShape": Blockly.OUTPUT_SHAPE_ROUND
      });
  }
};

Blockly.Blocks['sensing_askandwait'] = {
  /**
   * Block to ask a question and wait
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "ask %1 and wait",
      "args0": [
        {
          "type": "input_value",
          "name": "QUESTION"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.sensing.primary,
      "colourSecondary": Blockly.Colours.sensing.secondary,
      "colourTertiary": Blockly.Colours.sensing.tertiary
    });
  }
};

Blockly.Blocks['sensing_answer'] = {
  /**
   * Block to report answer
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "answer",
      "colour": Blockly.Colours.sensing.primary,
      "colourSecondary": Blockly.Colours.sensing.secondary,
      "colourTertiary": Blockly.Colours.sensing.tertiary,
      "output": "Number",
      "outputShape": Blockly.OUTPUT_SHAPE_ROUND,
      "checkboxInFlyout": true
    });
  }
};

Blockly.Blocks['sensing_keypressed'] = {
  /**
   * Block to Report if a key is pressed.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "key %1 pressed",
      "args0": [
        {
          "type": "input_value",
          "name": "KEY_OPTIONS"
        }
      ],
      "inputsInline": true,
      "output": "Boolean",
      "colour": Blockly.Colours.sensing.primary,
      "colourSecondary": Blockly.Colours.sensing.secondary,
      "colourTertiary": Blockly.Colours.sensing.tertiary,
      "outputShape": Blockly.OUTPUT_SHAPE_HEXAGONAL
    });
  }
};

Blockly.Blocks['sensing_keyoptions'] = {
  /**
   * Options for Keys
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "id": "event_keyoptions",
      "message0": "%1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "KEY_OPTION",
          "options": [
              ['space', 'SPACE'],
              ['left arrow', 'LEFTARROW'],
              ['right arrow', 'RIGHTARROW'],
              ['down arrow', 'DOWNARROW'],
              ['up arrow', 'UPARROW'],
              ['any', 'ANY'],
              ['a', 'A'],
              ['b', 'B'],
              ['c', 'C'],
              ['d', 'D'],
              ['e', 'E'],
              ['f', 'F'],
              ['g', 'G'],
              ['h', 'H'],
              ['i', 'I'],
              ['j', 'J'],
              ['k', 'K'],
              ['m', 'M'],
              ['n', 'N'],
              ['o', 'O'],
              ['p', 'P'],
              ['q', 'Q'],
              ['r', 'R'],
              ['s', 'S'],
              ['t', 'T'],
              ['u', 'U'],
              ['v', 'V'],
              ['w', 'W'],
              ['x', 'X'],
              ['y', 'Y'],
              ['0', 'ZERO'],
              ['1', 'ONE'],
              ['2', 'TWO'],
              ['3', 'THREE'],
              ['4', 'FOUR'],
              ['5', 'FIVE'],
              ['6', 'SIX'],
              ['7', 'SEVEN'],
              ['8', 'EIGHT'],
              ['9', 'NINE']
          ]
        }
      ],
      "inputsInline": true,
      "output": "String",
      "colour": Blockly.Colours.sensing.secondary,
      "colourSecondary": Blockly.Colours.sensing.secondary,
      "colourTertiary": Blockly.Colours.sensing.tertiary,
      "outputShape": Blockly.OUTPUT_SHAPE_ROUND
    });
  }
};

Blockly.Blocks['sensing_mousedown'] = {
  /**
   * Block to Report if the mouse is down.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "mouse down",
      "inputsInline": true,
      "output": "Boolean",
      "colour": Blockly.Colours.sensing.primary,
      "colourSecondary": Blockly.Colours.sensing.secondary,
      "colourTertiary": Blockly.Colours.sensing.tertiary,
      "outputShape": Blockly.OUTPUT_SHAPE_HEXAGONAL
    });
  }
};

Blockly.Blocks['sensing_mousex'] = {
  /**
   * Block to report mouse's x position
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "mouse x",
      "colour": Blockly.Colours.sensing.primary,
      "colourSecondary": Blockly.Colours.sensing.secondary,
      "colourTertiary": Blockly.Colours.sensing.tertiary,
      "output": "Number",
      "outputShape": Blockly.OUTPUT_SHAPE_ROUND
    });
  }
};

Blockly.Blocks['sensing_mousey'] = {
  /**
   * Block to report mouse's y position
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "mouse y",
      "colour": Blockly.Colours.sensing.primary,
      "colourSecondary": Blockly.Colours.sensing.secondary,
      "colourTertiary": Blockly.Colours.sensing.tertiary,
      "output": "Number",
      "outputShape": Blockly.OUTPUT_SHAPE_ROUND
    });
  }
};

Blockly.Blocks['sensing_loudness'] = {
  /**
   * Block to report loudness
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "loudness",
      "colour": Blockly.Colours.sensing.primary,
      "colourSecondary": Blockly.Colours.sensing.secondary,
      "colourTertiary": Blockly.Colours.sensing.tertiary,
      "output": "Number",
      "outputShape": Blockly.OUTPUT_SHAPE_ROUND,
      "checkboxInFlyout": true	  
    });
  }
};

Blockly.Blocks['sensing_videoon'] = {
  /**
   * Block to Report the Video [Motion/Direction] of the Stage or Sprite (Not added Sprite's Option).
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "video %1 on %2",
      "args0": [
        {
          "type": "input_value",
          "name": "VIDEOONMENU1"
        },
        {
          "type": "input_value",
          "name": "VIDEOONMENU2"
        }		
      ],
      "inputsInline": true,
      "output": "Number",
      "colour": Blockly.Colours.sensing.primary,
      "colourSecondary": Blockly.Colours.sensing.secondary,
      "colourTertiary": Blockly.Colours.sensing.tertiary,
      "outputShape": Blockly.OUTPUT_SHAPE_ROUND,
      "checkboxInFlyout": true	  
    });
  }
};

Blockly.Blocks['sensing_videoonmenuone'] = {
  /**
   * "Video [Motion/Direction] of [Stage]" First Block Menu.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit(
      {
        "message0": "%1",
        "args0": [
          {
            "type": "field_dropdown",
            "name": "VIDEOONMENU1",
            "options": [
              ['motion', 'MOTION'],
              ['direction', 'DIRECTION']
            ]
          }
        ],
        "inputsInline": true,
        "output": "String",
        "colour": Blockly.Colours.sensing.secondary,
        "colourSecondary": Blockly.Colours.sensing.secondary,
        "colourTertiary": Blockly.Colours.sensing.tertiary,
        "outputShape": Blockly.OUTPUT_SHAPE_ROUND
      });
  }
};
Blockly.Blocks['sensing_videoonmenutwo'] = {
  /**
   * "Video [Motion/Direction] of [Stage]" Second Block Menu.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit(
      {
        "message0": "%1",
        "args0": [
          {
            "type": "field_dropdown",
            "name": "VIDEOONMENU2",
            "options": [
              ['stage', 'STAGE']
            ]
          }
        ],
        "inputsInline": true,
        "output": "String",
        "colour": Blockly.Colours.sensing.secondary,
        "colourSecondary": Blockly.Colours.sensing.secondary,
        "colourTertiary": Blockly.Colours.sensing.tertiary,
        "outputShape": Blockly.OUTPUT_SHAPE_ROUND
      });
  }
};

Blockly.Blocks['sensing_videotoggle'] = {
  /**
   * Block to toggle video
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "turn video %1",
      "args0": [
        {
          "type": "input_value",
          "name": "VIDEOTOGGLEMENU"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.sensing.primary,
      "colourSecondary": Blockly.Colours.sensing.secondary,
      "colourTertiary": Blockly.Colours.sensing.tertiary
    });
  }
};

Blockly.Blocks['sensing_videotogglemenu'] = {
  /**
   * "Turn Video [On/Off/On-flipped]" Block Menu.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit(
      {
        "message0": "%1",
        "args0": [
          {
            "type": "field_dropdown",
            "name": "VIDEOTOGGLEMENU",
            "options": [
              ['on', 'ON'],
              ['off', 'OFF'],
              ['on-flipped', 'ONFLIPPED']			  
            ]
          }
        ],
        "inputsInline": true,
        "output": "String",
        "colour": Blockly.Colours.sensing.secondary,
        "colourSecondary": Blockly.Colours.sensing.secondary,
        "colourTertiary": Blockly.Colours.sensing.tertiary,
        "outputShape": Blockly.OUTPUT_SHAPE_ROUND
      });
  }
};

Blockly.Blocks['sensing_setvideotransparency'] = {
  /**
   * Block to set the video transparency to a certain percent
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "set video transparency to %1%",
      "args0": [
        {
          "type": "input_value",
          "name": "TRANSPARENCY"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.sensing.primary,
      "colourSecondary": Blockly.Colours.sensing.secondary,
      "colourTertiary": Blockly.Colours.sensing.tertiary
    });
  }
};

Blockly.Blocks['sensing_timer'] = {
  /**
   * Block to report timer
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "timer",
      "colour": Blockly.Colours.sensing.primary,
      "colourSecondary": Blockly.Colours.sensing.secondary,
      "colourTertiary": Blockly.Colours.sensing.tertiary,
      "output": "Number",
      "outputShape": Blockly.OUTPUT_SHAPE_ROUND,
      "checkboxInFlyout": true	  
    });
  }
};

Blockly.Blocks['sensing_resettimer'] = {
  /**
   * Block to reset timer
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "reset timer",
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.sensing.primary,
      "colourSecondary": Blockly.Colours.sensing.secondary,
      "colourTertiary": Blockly.Colours.sensing.tertiary
    });
  }
};

Blockly.Blocks['sensing_current'] = {
  /**
   * Block to Report the current option.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "current %1",
      "args0": [
        {
          "type": "input_value",
          "name": "CURRENTMENU"
        }	
      ],
      "inputsInline": true,
      "output": "Number",
      "colour": Blockly.Colours.sensing.primary,
      "colourSecondary": Blockly.Colours.sensing.secondary,
      "colourTertiary": Blockly.Colours.sensing.tertiary,
      "outputShape": Blockly.OUTPUT_SHAPE_ROUND,
      "checkboxInFlyout": true	  
    });
  }
};

Blockly.Blocks['sensing_currentmenu'] = {
  /**
   * "Current [Options]" Block Menu.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit(
      {
        "message0": "%1",
        "args0": [
          {
            "type": "field_dropdown",
            "name": "CURRENTMENU",
            "options": [
              ['year', 'YEAR'],
              ['month', 'MONTH'],
              ['date', 'DATE'],
              ['day of week', 'DAYOFWEEK'],
              ['hour', 'HOUR'],
              ['minute', 'MINUTE'],
              ['second', 'SECOND']			  
            ]
          }
        ],
        "inputsInline": true,
        "output": "String",
        "colour": Blockly.Colours.sensing.secondary,
        "colourSecondary": Blockly.Colours.sensing.secondary,
        "colourTertiary": Blockly.Colours.sensing.tertiary,
        "outputShape": Blockly.OUTPUT_SHAPE_ROUND
      });
  }
};

Blockly.Blocks['sensing_dayssince2000'] = {
  /**
   * Block to report days since 2000
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "days since 2000",
      "colour": Blockly.Colours.sensing.primary,
      "colourSecondary": Blockly.Colours.sensing.secondary,
      "colourTertiary": Blockly.Colours.sensing.tertiary,
      "output": "Number",
      "outputShape": Blockly.OUTPUT_SHAPE_ROUND,  
    });
  }
};

Blockly.Blocks['sensing_username'] = {
  /**
   * Block to report user's username
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "username",
      "colour": Blockly.Colours.sensing.primary,
      "colourSecondary": Blockly.Colours.sensing.secondary,
      "colourTertiary": Blockly.Colours.sensing.tertiary,
      "output": "Number",
      "outputShape": Blockly.OUTPUT_SHAPE_ROUND,
      "checkboxInFlyout": true	  
    });
  }
};
