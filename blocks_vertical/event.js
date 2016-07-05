/**
 * @fileoverview Control blocks for Scratch (Horizontal)
 * @author ascii@media.mit.edu <Andrew Sliwinski>
 */
'use strict';

goog.provide('Blockly.Blocks.event');

goog.require('Blockly.Blocks');

goog.require('Blockly.Colours');

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
      "colourTertiary": Blockly.Colours.event.tertiary
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
