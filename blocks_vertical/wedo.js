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

/**
 * @fileoverview Wedo blocks for Scratch (Horizontal)
 * @author ascii@media.mit.edu <Andrew Sliwinski>
 */
'use strict';

goog.provide('Blockly.Blocks.wedo');

goog.require('Blockly.Blocks');

goog.require('Blockly.Colours');

Blockly.Blocks['wedo_setcolor'] = {
  /**
   * Block to set color of LED
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "id": "wedo_setcolor",
      "message0": "set light color to %1",
      "args0": [
        {
          "type": "input_value",
          "name": "CHOICE",
          "check": "Number"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "category": Blockly.Categories.looks,
      "colour": Blockly.Colours.motion.primary,
      "colourSecondary": Blockly.Colours.motion.secondary,
      "colourTertiary": Blockly.Colours.motion.tertiary
    });
  }
};

Blockly.Blocks['wedo_motorclockwise'] = {
  /**
   * Block to spin motor clockwise.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "id": "wedo_motorclockwise",
      "message0": "turn motor %1 for %2 secs",
      "args0": [
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "/turnright_arrow.png",
          "width": 16,
          "height": 16
        },
        {
          "type": "input_value",
          "name": "DURATION",
          "check": "Number"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "category": Blockly.Categories.motion,
      "colour": Blockly.Colours.motion.primary,
      "colourSecondary": Blockly.Colours.motion.secondary,
      "colourTertiary": Blockly.Colours.motion.tertiary
    });
  }
};

Blockly.Blocks['wedo_motorcounterclockwise'] = {
  /**
   * Block to spin motor counter-clockwise.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "id": "wedo_motorcounterclockwise",
      "message0": "turn motor %1 for %2 secs",
      "args0": [
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "/turnleft_arrow.png",
          "width": 16,
          "height": 16
        },
        {
          "type": "input_value",
          "name": "DURATION",
          "check": "Number"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "category": Blockly.Categories.motion,
      "colour": Blockly.Colours.motion.primary,
      "colourSecondary": Blockly.Colours.motion.secondary,
      "colourTertiary": Blockly.Colours.motion.tertiary
    });
  }
};

Blockly.Blocks['wedo_motorspeed'] = {
  /**
   * Block to set motor speed.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "id": "wedo_motorspeed",
      "message0": "set motor speed to %1",
      "args0": [
        {
          "type": "input_value",
          "name": "CHOICE",
          "check": "Number"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "category": Blockly.Categories.motion,
      "colour": Blockly.Colours.motion.primary,
      "colourSecondary": Blockly.Colours.motion.secondary,
      "colourTertiary": Blockly.Colours.motion.tertiary
    });
  }
};

Blockly.Blocks['dropdown_wedo_whentilt'] = {
  /**
   * WeDo tilt drop-down menu.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit(
      {
        "message0": "%1",
        "args0": [
          {
            "type": "field_dropdown",
            "name": "CHOICE",
            "options": [
              ['any', 'any'],
              ['up', 'backward'],
              ['down', 'forward'],
              ['left', 'left'],
              ['right', 'right']
            ]
          }
        ],
        "inputsInline": true,
        "output": "String",
        "colour": Blockly.Colours.motion.secondary,
        "colourSecondary": Blockly.Colours.motion.secondary,
        "colourTertiary": Blockly.Colours.motion.tertiary,
        "outputShape": Blockly.OUTPUT_SHAPE_ROUND
      });
  }
};

Blockly.Blocks['wedo_whentilt'] = {
  /**
   * Block for when tilted.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "id": "wedo_whentilt",
      "message0": "when tilted %1",
      "args0": [
        {
          "type": "input_value",
          "name": "CHOICE"
        }
      ],
      "inputsInline": true,
      "nextStatement": null,
      "category": Blockly.Categories.event,
      "colour": Blockly.Colours.motion.primary,
      "colourSecondary": Blockly.Colours.motion.secondary,
      "colourTertiary": Blockly.Colours.motion.tertiary
    });
  }
};

Blockly.Blocks['wedo_whendistanceclose'] = {
  /**
   * Block for when distance sensor is close.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "id": "wedo_whendistanceclose",
      "message0": "when distance close",
      "args0": [],
      "inputsInline": true,
      "nextStatement": null,
      "category": Blockly.Categories.event,
      "colour": Blockly.Colours.motion.primary,
      "colourSecondary": Blockly.Colours.motion.secondary,
      "colourTertiary": Blockly.Colours.motion.tertiary
    });
  }
};

Blockly.Blocks['wedo_distance'] = {
  /**
   * Block to report timer
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "distance",
      "category": Blockly.Categories.sensing,
      "colour": Blockly.Colours.motion.primary,
      "colourSecondary": Blockly.Colours.motion.secondary,
      "colourTertiary": Blockly.Colours.motion.tertiary,
      "output": "Number",
      "outputShape": Blockly.OUTPUT_SHAPE_ROUND,
      "checkboxInFlyout": false
    });
  }
};

Blockly.Blocks['wedo_distance'] = {
  /**
   * Block to report timer
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "distance",
      "category": Blockly.Categories.sensing,
      "colour": Blockly.Colours.motion.primary,
      "colourSecondary": Blockly.Colours.motion.secondary,
      "colourTertiary": Blockly.Colours.motion.tertiary,
      "output": "Number",
      "outputShape": Blockly.OUTPUT_SHAPE_ROUND,
      "checkboxInFlyout": false
    });
  }
};

Blockly.Blocks['dropdown_wedo_tilt'] = {
  /**
   * WeDo tilt drop-down menu.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit(
      {
        "message0": "%1",
        "args0": [
          {
            "type": "field_dropdown",
            "name": "CHOICE",
            "options": [
              ['front/back', 'y'],
              ['left/right', 'x']
            ]
          }
        ],
        "inputsInline": true,
        "output": "String",
        "colour": Blockly.Colours.motion.secondary,
        "colourSecondary": Blockly.Colours.motion.secondary,
        "colourTertiary": Blockly.Colours.motion.tertiary,
        "outputShape": Blockly.OUTPUT_SHAPE_ROUND
      });
  }
};

Blockly.Blocks['wedo_tilt'] = {
  /**
   * Block to report the current tilt.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "tilt angle %1",
      "args0": [
        {
          "type": "input_value",
          "name": "CHOICE"
        }
      ],
      "inputsInline": true,
      "output": "Number",
      "category": Blockly.Categories.sensing,
      "colour": Blockly.Colours.motion.primary,
      "colourSecondary": Blockly.Colours.motion.secondary,
      "colourTertiary": Blockly.Colours.motion.tertiary,
      "outputShape": Blockly.OUTPUT_SHAPE_ROUND,
      "checkboxInFlyout": false
    });
  }
};
