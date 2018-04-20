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

goog.provide('Blockly.Blocks.pen');

goog.require('Blockly.Blocks');
goog.require('Blockly.Colours');
goog.require('Blockly.constants');
goog.require('Blockly.ScratchBlocks.VerticalExtensions');


Blockly.Blocks['pen_clear'] = {
  /**
   * Block to clear drawing.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "clear",
      "category": Blockly.Categories.pen,
      "extensions": ["colours_pen", "shape_statement"],
      "recyclable": true
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
      "category": Blockly.Categories.pen,
      "extensions": ["colours_pen", "shape_statement"],
      "recyclable": true
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
      "category": Blockly.Categories.pen,
      "extensions": ["colours_pen", "shape_statement"],
      "recyclable": true
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
      "category": Blockly.Categories.pen,
      "extensions": ["colours_pen", "shape_statement"],
      "recyclable": true
    });
  }
};

Blockly.Blocks['pen_setpencolortocolor'] = {
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
      "category": Blockly.Categories.pen,
      "extensions": ["colours_pen", "shape_statement"],
      "recyclable": true
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
      "category": Blockly.Categories.pen,
      "extensions": ["colours_pen", "shape_statement"],
      "recyclable": true
    });
  }
};

Blockly.Blocks['pen_setpencolortonum'] = {
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
      "category": Blockly.Categories.pen,
      "extensions": ["colours_pen", "shape_statement"],
      "recyclable": true
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
      "category": Blockly.Categories.pen,
      "extensions": ["colours_pen", "shape_statement"],
      "recyclable": true
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
      "category": Blockly.Categories.pen,
      "extensions": ["colours_pen", "shape_statement"],
      "recyclable": true
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
      "category": Blockly.Categories.pen,
      "extensions": ["colours_pen", "shape_statement"],
      "recyclable": true
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
      "category": Blockly.Categories.pen,
      "extensions": ["colours_pen", "shape_statement"],
      "recyclable": true
    });
  }
};

Blockly.Blocks['pen_changepentransparencyby'] = {
  /**
   * Block to change the pen's transparency by the value.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "change pen transparency by %1",
      "args0": [
        {
          "type": "input_value",
          "name": "TRANSPARENCY"
        }
      ],
      "category": Blockly.Categories.pen,
      "extensions": ["colours_pen", "shape_statement"],
      "recyclable": true
    });
  }
};

Blockly.Blocks['pen_setpentransparencyto'] = {
  /**
   * Block to set the pen's transparency to the value.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "set pen transparency to %1",
      "args0": [
        {
          "type": "input_value",
          "name": "TRANSPARENCY"
        }
      ],
      "category": Blockly.Categories.pen,
      "extensions": ["colours_pen", "shape_statement"],
      "recyclable": true
    });
  }
};
