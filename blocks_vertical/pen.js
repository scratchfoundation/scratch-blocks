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
goog.require('Blockly.ScratchBlocks.VerticalExtensions');

Blockly.defineBlocksWithJsonArray([
  // Block to clear drawing.
  {
    "type": "pen_clear",
    "extensions": ["colours_pen", "shape_statement"],
    "message0": "clear"
  },
  // Block to stamp a sprite
  {
    "type": "pen_stamp",
    "extensions": ["colours_pen", "shape_statement"],
    "message0": "stamp"
  },
  // Block to pull down the sprite's pen.
  {
    "type": "pen_pendown",
    "extensions": ["colours_pen", "shape_statement"],
    "message0": "pen down"
  },
  // Block to pull up the sprite's pen.
  {
    "type": "pen_penup",
    "extensions": ["colours_pen", "shape_statement"],
    "message0": "pen up"
  },
  // Block to set the pen's color to the value.
  {
    "type": "pen_setpencolortocolor",
    "extensions": ["colours_pen", "shape_statement"],
    "message0": "set pen color to %1",
    "args0": [
      {
        "type": "input_value",
        "name": "COLOR"
      }
    ]
  },
  // Block to change the pen's color by the value.
  {
    "type": "pen_changepencolorby",
    "extensions": ["colours_pen", "shape_statement"],
    "message0": "change pen color by %1",
    "args0": [
      {
        "type": "input_value",
        "name": "COLOR"
      }
    ]
  },
  // Block to set the pen's color to the value.
  {
    "type": "pen_setpencolortonum",
    "extensions": ["colours_pen", "shape_statement"],
    "message0": "set pen color to %1",
    "args0": [
      {
        "type": "input_value",
        "name": "COLOR"
      }
    ]
  },
  // Block to change the pen's shade by the value.
  {
    "type": "pen_changepenshadeby",
    "extensions": ["colours_pen", "shape_statement"],
    "message0": "change pen shade by %1",
    "args0": [
      {
        "type": "input_value",
        "name": "SHADE"
      }
    ]
  },
  // Block to set the pen's shade to the value.
  {
    "type": "pen_setpenshadeto",
    "extensions": ["colours_pen", "shape_statement"],
    "message0": "set pen shade to %1",
    "args0": [
      {
        "type": "input_value",
        "name": "SHADE"
      }
    ]
  },
  // Block to change the pen's size by the value.
  {
    "type": "pen_changepensizeby",
    "extensions": ["colours_pen", "shape_statement"],
    "message0": "change pen size by %1",
    "args0": [
      {
        "type": "input_value",
        "name": "SIZE"
      }
    ]
  },
  // Block to set the pen's size to the value.
  {
    "type": "pen_setpensizeto",
    "extensions": ["colours_pen", "shape_statement"],
    "message0": "set pen size to %1",
    "args0": [
      {
        "type": "input_value",
        "name": "SIZE"
      }
    ]
  }
]);
