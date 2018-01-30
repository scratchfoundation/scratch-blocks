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

goog.provide('Blockly.Blocks.motion');

goog.require('Blockly.Blocks');
goog.require('Blockly.Colours');
goog.require('Blockly.constants');
goog.require('Blockly.ScratchBlocks.VerticalExtensions');


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
      "category": Blockly.Categories.motion,
      "extensions": ["colours_motion", "shape_statement"]
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
      "message0": "turn %1 %2 degrees",
      "args0": [
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "rotate-right.svg",
          "width": 24,
          "height": 24
        },
        {
          "type": "input_value",
          "name": "DEGREES"
        }
      ],
      "category": Blockly.Categories.motion,
      "extensions": ["colours_motion", "shape_statement"]
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
      "message0": "turn %1 %2 degrees",
      "args0": [
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "rotate-left.svg",
          "width": 24,
          "height": 24
        },
        {
          "type": "input_value",
          "name": "DEGREES"
        }
      ],
      "category": Blockly.Categories.motion,
      "extensions": ["colours_motion", "shape_statement"]
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
      "category": Blockly.Categories.motion,
      "extensions": ["colours_motion", "shape_statement"]
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
                ['mouse-pointer', '_mouse_']
              ]
            }
          ],
          "colour": Blockly.Colours.motion.secondary,
          "colourSecondary": Blockly.Colours.motion.secondary,
          "colourTertiary": Blockly.Colours.motion.tertiary,
          "extensions": ["output_string"]
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
      "category": Blockly.Categories.motion,
      "extensions": ["colours_motion", "shape_statement"]
    });
  }
};

Blockly.Blocks['motion_goto_menu'] = {
  /**
   * Go to drop-down menu.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit(
        {
          "message0": "%1",
          "args0": [
            {
              "type": "field_dropdown",
              "name": "TO",
              "options": [
                ['mouse-pointer', '_mouse_'],
                ['random position', '_random_']
              ]
            }
          ],
          "colour": Blockly.Colours.motion.secondary,
          "colourSecondary": Blockly.Colours.motion.secondary,
          "colourTertiary": Blockly.Colours.motion.tertiary,
          "extensions": ["output_string"]
        });
  }
};

Blockly.Blocks['motion_gotoxy'] = {
  /**
   * Block to go to X, Y.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "go to x: %1 y: %2",
      "args0": [
        {
          "type": "input_value",
          "name": "X"
        },
        {
          "type": "input_value",
          "name": "Y"
        }
      ],
      "category": Blockly.Categories.motion,
      "extensions": ["colours_motion", "shape_statement"]
    });
  }
};

Blockly.Blocks['motion_goto'] = {
  /**
   * Block to go to a menu item.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "go to %1",
      "args0": [
        {
          "type": "input_value",
          "name": "TO"
        }
      ],
      "category": Blockly.Categories.motion,
      "extensions": ["colours_motion", "shape_statement"]
    });
  }
};

Blockly.Blocks['motion_glidesecstoxy'] = {
  /**
   * Block to glide for a specified time.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "glide %1 secs to x: %2 y: %3",
      "args0": [
        {
          "type": "input_value",
          "name": "SECS"
        },
        {
          "type": "input_value",
          "name": "X"
        },
        {
          "type": "input_value",
          "name": "Y"
        }
      ],
      "category": Blockly.Categories.motion,
      "extensions": ["colours_motion", "shape_statement"]
    });
  }
};

Blockly.Blocks['motion_glideto_menu'] = {
  /**
   * Glide to drop-down menu
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "TO",
          "options": [
            ['mouse-pointer', '_mouse_'],
            ['random position', '_random_']
          ]
        }
      ],
      "colour": Blockly.Colours.motion.secondary,
      "colourSecondary": Blockly.Colours.motion.secondary,
      "colourTertiary": Blockly.Colours.motion.tertiary,
      "extensions": ["output_string"]
    });
  }
};

Blockly.Blocks['motion_glideto'] = {
  /**
   * Block to glide to a menu item
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "glide %1 secs to %2",
      "args0": [
        {
          "type": "input_value",
          "name": "SECS"
        },
        {
          "type": "input_value",
          "name": "TO"
        }
      ],
      "category": Blockly.Categories.motion,
      "extensions": ["colours_motion", "shape_statement"]
    });
  }
};

Blockly.Blocks['motion_changexby'] = {
  /**
   * Block to change X.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "change x by %1",
      "args0": [
        {
          "type": "input_value",
          "name": "DX"
        }
      ],
      "category": Blockly.Categories.motion,
      "extensions": ["colours_motion", "shape_statement"]
    });
  }
};

Blockly.Blocks['motion_setx'] = {
  /**
   * Block to set X.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "set x to %1",
      "args0": [
        {
          "type": "input_value",
          "name": "X"
        }
      ],
      "category": Blockly.Categories.motion,
      "extensions": ["colours_motion", "shape_statement"]
    });
  }
};

Blockly.Blocks['motion_changeyby'] = {
  /**
   * Block to change Y.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "change y by %1",
      "args0": [
        {
          "type": "input_value",
          "name": "DY"
        }
      ],
      "category": Blockly.Categories.motion,
      "extensions": ["colours_motion", "shape_statement"]
    });
  }
};

Blockly.Blocks['motion_sety'] = {
  /**
   * Block to set Y.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "set y to %1",
      "args0": [
        {
          "type": "input_value",
          "name": "Y"
        }
      ],
      "category": Blockly.Categories.motion,
      "extensions": ["colours_motion", "shape_statement"]
    });
  }
};

Blockly.Blocks['motion_ifonedgebounce'] = {
  /**
   * Block to bounce on edge.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "if on edge, bounce",
      "category": Blockly.Categories.motion,
      "extensions": ["colours_motion", "shape_statement"]
    });
  }
};

Blockly.Blocks['motion_setrotationstyle'] = {
  /**
   * Block to set rotation style.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "set rotation style %1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "STYLE",
          "options": [
            ['left-right', 'left-right'],
            ['don\'t rotate', 'don\'t rotate'],
            ['all around', 'all around']
          ]
        }
      ],
      "category": Blockly.Categories.motion,
      "extensions": ["colours_motion", "shape_statement"]
    });
  }
};

Blockly.Blocks['motion_xposition'] = {
  /**
   * Block to report X.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "x position",
      "category": Blockly.Categories.motion,
      "checkboxInFlyout": true,
      "extensions": ["colours_motion", "output_number"]
    });
  }
};

Blockly.Blocks['motion_yposition'] = {
  /**
   * Block to report Y.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "y position",
      "category": Blockly.Categories.motion,
      "checkboxInFlyout": true,
      "extensions": ["colours_motion", "output_number"]
    });
  }
};

Blockly.Blocks['motion_direction'] = {
  /**
   * Block to report direction.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "direction",
      "category": Blockly.Categories.motion,
      "checkboxInFlyout": true,
      "extensions": ["colours_motion", "output_number"]
    });
  }
};
