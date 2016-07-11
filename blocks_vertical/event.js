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

goog.provide('Blockly.Blocks.event');

goog.require('Blockly.Blocks');
goog.require('Blockly.Colours');
goog.require('Blockly.constants');


Blockly.Blocks['event_whenflagclicked'] = {
  /**
   * Block for when flag clicked.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "id": "event_whenflagclicked",
      "message0": "when %1 clicked",
      "args0": [
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "icons/event_whenflagclicked.svg",
          "width": 24,
          "height": 24,
          "alt": "flag",
          "flip_rtl": true
        }
      ],
      "inputsInline": true,
      "nextStatement": null,
      "colour": Blockly.Colours.event.primary,
      "colourSecondary": Blockly.Colours.event.secondary,
      "colourTertiary": Blockly.Colours.event.tertiary
    });
  }
};

Blockly.Blocks['event_broadcast_menu'] = {
  /**
   * Broadcast drop-down menu.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit(
      {
        "message0": "%1",
        "args0": [
          {
            "type": "field_dropdown",
            "name": "BROADCAST_OPTION",
            "options": [
              ['message1', 'MESSAGE1'],
              ['message2', 'MESSAGE2'],
              ['new message', 'NEW_MESSAGE']
            ]
          }
        ],
        "inputsInline": true,
        "output": "String",
        "colour": Blockly.Colours.event.secondary,
        "colourSecondary": Blockly.Colours.event.secondary,
        "colourTertiary": Blockly.Colours.event.tertiary,
        "outputShape": Blockly.OUTPUT_SHAPE_ROUND
      });
  }
};

Blockly.Blocks['event_whenthisspriteclicked'] = {
  /**
   * Block for when this sprite clicked.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "when this sprite clicked",
      "inputsInline": true,
      "nextStatement": null,
      "colour": Blockly.Colours.event.primary,
      "colourSecondary": Blockly.Colours.event.secondary,
      "colourTertiary": Blockly.Colours.event.tertiary
    });
  }
};

Blockly.Blocks['event_whenbroadcastreceived'] = {
  /**
   * Block for when broadcast received.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "id": "event_whenbroadcastreceived",
      "message0": "when I receive %1",
      "args0": [
        {
          "type": "input_value",
          "name": "BROADCAST_OPTION"
        }
      ],
      "inputsInline": true,
      "nextStatement": null,
      "colour": Blockly.Colours.event.primary,
      "colourSecondary": Blockly.Colours.event.secondary,
      "colourTertiary": Blockly.Colours.event.tertiary
    });
  }
};

Blockly.Blocks['event_whenbackdropswitchesto'] = {
  /**
   * Block for when the current backdrop switched to a selected backdrop.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "when backdrop switches to %1",
      "args0": [
        {
          "type": "input_value",
          "name": "BACKDROP"
        }
      ],
      "inputsInline": true,
      "nextStatement": null,
      "colour": Blockly.Colours.event.primary,
      "colourSecondary": Blockly.Colours.event.secondary,
      "colourTertiary": Blockly.Colours.event.tertiary
    });
  }
};

Blockly.Blocks['event_backdrops'] = {
  /**
   * Backdrop list
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "id": "event_backdrops",
      "message0": "%1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "BACKDROP",
          "options": [
              ['backdrop1', 'BACKDROP1']
          ]
        }
      ],
      "inputsInline": true,
      "output": "String",
      "colour": Blockly.Colours.event.secondary,
      "colourSecondary": Blockly.Colours.event.secondary,
      "colourTertiary": Blockly.Colours.event.tertiary,
      "outputShape": Blockly.OUTPUT_SHAPE_ROUND
    });
  }
};

Blockly.Blocks['event_whengreaterthan'] = {
  /**
   * Block for when loudness/timer/video motion is greater than the value.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "when %1 > %2",
      "args0": [
        {
          "type": "input_value",
          "name": "WHENGREATERTHANMENU"
        },
        {
          "type": "input_value",
          "name": "VALUE"
        }
      ],
      "inputsInline": true,
      "nextStatement": null,
      "colour": Blockly.Colours.event.primary,
      "colourSecondary": Blockly.Colours.event.secondary,
      "colourTertiary": Blockly.Colours.event.tertiary
    });
  }
};

Blockly.Blocks['event_whengreaterthanmenu'] = {
  /**
   * "When [loudness/timer/video motion] > [Value]" list
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "id": "event_whengreaterthanmenu",
      "message0": "%1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "WHENGREATERTHANMENU",
          "options": [
              ['loudness', 'LOUDNESS'],
              ['timer', 'TIMER'],
              ['video motion', 'VIDEOMOTION']
          ]
        }
      ],
      "inputsInline": true,
      "output": "String",
      "colour": Blockly.Colours.event.secondary,
      "colourSecondary": Blockly.Colours.event.secondary,
      "colourTertiary": Blockly.Colours.event.tertiary,
      "outputShape": Blockly.OUTPUT_SHAPE_ROUND
    });
  }
};

Blockly.Blocks['event_broadcast'] = {
  /**
   * Block to send a broadcast.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "id": "event_broadcast",
      "message0": "broadcast %1",
      "args0": [
        {
          "type": "input_value",
          "name": "BROADCAST_OPTION"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.event.primary,
      "colourSecondary": Blockly.Colours.event.secondary,
      "colourTertiary": Blockly.Colours.event.tertiary
    });
  }
};

Blockly.Blocks['event_broadcastandwait'] = {
  /**
   * Block to send a broadcast.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "broadcast %1 and wait",
      "args0": [
        {
          "type": "input_value",
          "name": "BROADCAST_OPTION"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.event.primary,
      "colourSecondary": Blockly.Colours.event.secondary,
      "colourTertiary": Blockly.Colours.event.tertiary
    });
  }
};

Blockly.Blocks['event_keyoptions'] = {
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
      "colour": Blockly.Colours.event.secondary,
      "colourSecondary": Blockly.Colours.event.secondary,
      "colourTertiary": Blockly.Colours.event.tertiary,
      "outputShape": Blockly.OUTPUT_SHAPE_ROUND
    });
  }
};

Blockly.Blocks['event_whenkeypressed'] = {
  /**
   * Block to send a broadcast.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "id": "event_whenkeypressed",
      "message0": "when %1 key pressed",
      "args0": [
        {
          "type": "input_value",
          "name": "KEY_OPTION"
        }
      ],
      "inputsInline": true,
      "nextStatement": null,
      "colour": Blockly.Colours.event.primary,
      "colourSecondary": Blockly.Colours.event.secondary,
      "colourTertiary": Blockly.Colours.event.tertiary
    });
  }
};
