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

goog.provide('Blockly.Blocks.control');

goog.require('Blockly.Blocks');
goog.require('Blockly.Colours');


Blockly.Blocks['control_forever'] = {
  /**
   * Block for repeat n times (external number).
   * https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#5eke39
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "id": "control_forever",
      "message0": "forever",
      "message1": "%1", // Statement
      "message2": "%1", // Icon
      "lastDummyAlign2": "RIGHT",
      "args1": [
        {
          "type": "input_statement",
          "name": "SUBSTACK"
        }
      ],
      "args2": [
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "icons/control_forever.svg",
          "width": 10,
          "height": 10,
          "alt": "*",
          "flip_rtl": true
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "colour": Blockly.Colours.control.primary,
      "colourSecondary": Blockly.Colours.control.secondary,
      "colourTertiary": Blockly.Colours.control.tertiary
    });
  }
};

Blockly.Blocks['control_repeat'] = {
  /**
   * Block for repeat n times (external number).
   * https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#so57n9
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "id": "control_repeat",
      "message0": "repeat %1",
      "message1": "%1", // Statement
      "message2": "%1", // Icon
      "lastDummyAlign2": "RIGHT",
      "args0": [
        {
          "type": "input_value",
          "name": "TIMES"
        }
      ],
      "args1": [
        {
          "type": "input_statement",
          "name": "SUBSTACK"
        }
      ],
      "args2": [
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "icons/control_forever.svg",
          "width": 10,
          "height": 10,
          "alt": "*",
          "flip_rtl": true
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.control.primary,
      "colourSecondary": Blockly.Colours.control.secondary,
      "colourTertiary": Blockly.Colours.control.tertiary
    });
  }
};

Blockly.Blocks['control_if'] = {
  /**
   * Block for if-then.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "type": "control_if",
      "message0": "if %1 then",
      "message1": "%1", // Statement
      "args0": [
        {
          "type": "input_value",
          "name": "CONDITION",
          "check": "Boolean"
        }
      ],
      "args1": [
        {
          "type": "input_statement",
          "name": "SUBSTACK"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.control.primary,
      "colourSecondary": Blockly.Colours.control.secondary,
      "colourTertiary": Blockly.Colours.control.tertiary
    });
  }
};

Blockly.Blocks['control_if_else'] = {
  /**
   * Block for if-else.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "type": "control_if_else",
      "message0": "if %1 then",
      "message1": "%1",
      "message2": "else",
      "message3": "%1",
      "args0": [
        {
          "type": "input_value",
          "name": "CONDITION",
          "check": "Boolean"
        }
      ],
      "args1": [
        {
          "type": "input_statement",
          "name": "SUBSTACK"
        }
      ],
      "args3": [
        {
          "type": "input_statement",
          "name": "SUBSTACK2"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.control.primary,
      "colourSecondary": Blockly.Colours.control.secondary,
      "colourTertiary": Blockly.Colours.control.tertiary
    });
  }
};

Blockly.Blocks['control_stop_menu'] = {
  /**
   * Stop drop-down menu.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit(
      {
        "message0": "%1",
        "args0": [
          {
            "type": "field_dropdown",
            "name": "STOP_OPTION",
            "options": [
              ['all', 'ALL'],
              ['this script', 'THIS'],
              ['other scripts in sprite', 'OTHER']
            ]
          }
        ],
        "inputsInline": true,
        "output": "String",
        "colour": Blockly.Colours.control.secondary,
        "colourSecondary": Blockly.Colours.control.secondary,
        "colourTertiary": Blockly.Colours.control.tertiary
      });
  }
};

Blockly.Blocks['control_stop'] = {
  /**
   * Block for stop all scripts.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "id": "control_stop",
      "message0": "stop %1",
      "args0": [
        {
          "type": "input_value",
          "name": "STOP_OPTION"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "colour": Blockly.Colours.control.primary,
      "colourSecondary": Blockly.Colours.control.secondary,
      "colourTertiary": Blockly.Colours.control.tertiary
    });
  }
};

Blockly.Blocks['control_wait'] = {
  /**
   * Block to wait (pause) stack.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "id": "control_wait",
      "message0": "wait %1 secs",
      "args0": [
        {
          "type": "input_value",
          "name": "DURATION"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.control.primary,
      "colourSecondary": Blockly.Colours.control.secondary,
      "colourTertiary": Blockly.Colours.control.tertiary
    });
  }
};

Blockly.Blocks['control_wait_until'] = {
  /**
   * Block to wait until a condition becomes true.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "wait until %1",
      "args0": [
        {
          "type": "input_value",
          "name": "CONDITION",
          "check": "Boolean"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.control.primary,
      "colourSecondary": Blockly.Colours.control.secondary,
      "colourTertiary": Blockly.Colours.control.tertiary
    });
  }
};

Blockly.Blocks['control_repeat_until'] = {
  /**
   * Block for repeat until a condition becomes true.
   */
  init: function() {
    this.jsonInit({
      "message0": "repeat until %1",
      "message1": "%1",
      "message2": "%1",
      "lastDummyAlign2": "RIGHT",
      "args0": [
        {
          "type": "input_value",
          "name": "CONDITION",
          "check": "Boolean"
        }
      ],
      "args1": [
        {
          "type": "input_statement",
          "name": "SUBSTACK"
        }
      ],
      "args2": [
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "icons/control_forever.svg",
          "width": 10,
          "height": 10,
          "alt": "*",
          "flip_rtl": true
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.control.primary,
      "colourSecondary": Blockly.Colours.control.secondary,
      "colourTertiary": Blockly.Colours.control.tertiary
    });
  }
};

Blockly.Blocks['control_start_as_clone'] = {
  /**
   * Block for "when I start as a clone" hat.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "id": "control_start_as_clone",
      "message0": "when I start as a clone",
      "args0": [
      ],
      "inputsInline": true,
      "nextStatement": null,
      "colour": Blockly.Colours.control.primary,
      "colourSecondary": Blockly.Colours.control.secondary,
      "colourTertiary": Blockly.Colours.control.tertiary
    });
  }
};

Blockly.Blocks['control_create_clone_of_menu'] = {
  /**
   * Create-clone drop-down menu.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit(
      {
        "message0": "%1",
        "args0": [
          {
            "type": "field_dropdown",
            "name": "CLONE_OPTION",
            "options": [
              ['myself', 'MYSELF']
            ]
          }
        ],
        "inputsInline": true,
        "output": "String",
        "colour": Blockly.Colours.control.secondary,
        "colourSecondary": Blockly.Colours.control.secondary,
        "colourTertiary": Blockly.Colours.control.tertiary
      });
  }
};

Blockly.Blocks['control_create_clone_of'] = {
  /**
   * Block for "create clone of..."
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "id": "control_start_as_clone",
      "message0": "create clone of %1",
      "args0": [
        {
          "type": "input_value",
          "name": "CLONE_OPTION"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.control.primary,
      "colourSecondary": Blockly.Colours.control.secondary,
      "colourTertiary": Blockly.Colours.control.tertiary
    });
  }
};

Blockly.Blocks['control_delete_this_clone'] = {
  /**
   * Block for "delete this clone."
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "delete this clone",
      "args0": [
      ],
      "inputsInline": true,
      "previousStatement": null,
      "colour": Blockly.Colours.control.primary,
      "colourSecondary": Blockly.Colours.control.secondary,
      "colourTertiary": Blockly.Colours.control.tertiary
    });
  }
};
