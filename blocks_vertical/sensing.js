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
      "message0": "touching %1?",
      "args0": [
        {
          "type": "input_value",
          "name": "TOUCHINGOBJECTMENU"
        }
      ],
      "inputsInline": true,
      "output": "Boolean",
      "category": Blockly.Categories.sensing,
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
              ['mouse-pointer', '_mouse_'],
              ['edge', '_edge_']
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
      "message0": "touching color %1?",
      "args0": [
        {
          "type": "input_value",
          "name": "COLOR"
        }
      ],
      "inputsInline": true,
      "output": "Boolean",
      "category": Blockly.Categories.sensing,
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
      "message0": "color %1 is touching %2?",
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
      "category": Blockly.Categories.sensing,
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
      "category": Blockly.Categories.sensing,
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
              ['mouse-pointer', '_mouse_']
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
      "category": Blockly.Categories.sensing,
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
      "category": Blockly.Categories.sensing,
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
      "message0": "key %1 pressed?",
      "args0": [
        {
          "type": "input_value",
          "name": "KEY_OPTION"
        }
      ],
      "inputsInline": true,
      "output": "Boolean",
      "category": Blockly.Categories.sensing,
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
      "message0": "%1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "KEY_OPTION",
          "options": [
              // [localization, language-independent saved value]
              ['space', 'space'],
              ['left arrow', 'left arrow'],
              ['right arrow', 'right arrow'],
              ['down arrow', 'down arrow'],
              ['up arrow', 'up arrow'],
              ['any', 'any'],
              ['a', 'a'],
              ['b', 'b'],
              ['c', 'c'],
              ['d', 'd'],
              ['e', 'e'],
              ['f', 'f'],
              ['g', 'g'],
              ['h', 'h'],
              ['i', 'i'],
              ['j', 'j'],
              ['k', 'k'],
              ['l', 'l'],
              ['m', 'm'],
              ['n', 'n'],
              ['o', 'o'],
              ['p', 'p'],
              ['q', 'q'],
              ['r', 'r'],
              ['s', 's'],
              ['t', 't'],
              ['u', 'u'],
              ['v', 'v'],
              ['w', 'w'],
              ['x', 'x'],
              ['y', 'y'],
              ['z', 'z'],
              ['0', '0'],
              ['1', '1'],
              ['2', '2'],
              ['3', '3'],
              ['4', '4'],
              ['5', '5'],
              ['6', '6'],
              ['7', '7'],
              ['8', '8'],
              ['9', '9']
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
      "message0": "mouse down?",
      "inputsInline": true,
      "output": "Boolean",
      "category": Blockly.Categories.sensing,
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
      "category": Blockly.Categories.sensing,
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
      "category": Blockly.Categories.sensing,
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
      "category": Blockly.Categories.sensing,
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
      "category": Blockly.Categories.sensing,
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
      "category": Blockly.Categories.sensing,
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
      "category": Blockly.Categories.sensing,
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
      "category": Blockly.Categories.sensing,
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
      "category": Blockly.Categories.sensing,
      "colour": Blockly.Colours.sensing.primary,
      "colourSecondary": Blockly.Colours.sensing.secondary,
      "colourTertiary": Blockly.Colours.sensing.tertiary
    });
  }
};

Blockly.Blocks['sensing_of_property_menu'] = {
  /**
   * "_ of *" properties menu.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit(
      {
        "message0": "%1",
        "args0": [
          {
            "type": "field_dropdown",
            "name": "PROPERTY",
            "options": [
              ['x position', 'x position'],
              ['y position', 'y position'],
              ['direction', 'direction'],
              ['costume #', 'costume #'],
              ['costume name', 'costume name'],
              ['size', 'size'],
              ['volume', 'volume'],
              ['backdrop #', 'backdrop #'],
              ['backdrop name', 'backdrop name']
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

Blockly.Blocks['sensing_of_object_menu'] = {
  /**
   * "* of _" object menu.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit(
      {
        "message0": "%1",
        "args0": [
          {
            "type": "field_dropdown",
            "name": "OBJECT",
            "options": [
              ['Sprite1', 'Sprite1'],
              ['Stage', '_stage_']
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


Blockly.Blocks['sensing_of'] = {
  /**
   * Block to report properties of sprites.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1 of %2",
      "args0": [
        {
          "type": "input_value",
          "name": "PROPERTY"
        },
        {
          "type": "input_value",
          "name": "OBJECT"
        }
      ],
      "output": true,
      "category": Blockly.Categories.sensing,
      "colour": Blockly.Colours.sensing.primary,
      "colourSecondary": Blockly.Colours.sensing.secondary,
      "colourTertiary": Blockly.Colours.sensing.tertiary,
      "outputShape": Blockly.OUTPUT_SHAPE_ROUND,
      "checkboxInFlyout": true
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
      "category": Blockly.Categories.sensing,
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
      "category": Blockly.Categories.sensing,
      "colour": Blockly.Colours.sensing.primary,
      "colourSecondary": Blockly.Colours.sensing.secondary,
      "colourTertiary": Blockly.Colours.sensing.tertiary,
      "output": "Number",
      "outputShape": Blockly.OUTPUT_SHAPE_ROUND
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
      "category": Blockly.Categories.sensing,
      "colour": Blockly.Colours.sensing.primary,
      "colourSecondary": Blockly.Colours.sensing.secondary,
      "colourTertiary": Blockly.Colours.sensing.tertiary,
      "output": "Number",
      "outputShape": Blockly.OUTPUT_SHAPE_ROUND,
      "checkboxInFlyout": true
    });
  }
};
