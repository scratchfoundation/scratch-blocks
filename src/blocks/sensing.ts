/**
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
import * as Blockly from 'blockly/core'
import * as Constants from '../constants'

Blockly.Blocks.sensing_touchingobject = {
  /**
   * Block to Report if its touching a Object.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.SENSING_TOUCHINGOBJECT,
      args0: [
        {
          type: 'input_value',
          name: 'TOUCHINGOBJECTMENU',
        },
      ],
      extensions: ['colours_sensing', 'output_boolean'],
    })
  },
}

/**
 * "Touching [Object]" Block Menu. Populated dynamically by scratch-gui.
 */
Blockly.Blocks.sensing_touchingobjectmenu = {}

Blockly.Blocks.sensing_touchingcolor = {
  /**
   * Block to Report if its touching a certain Color.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.SENSING_TOUCHINGCOLOR,
      args0: [
        {
          type: 'input_value',
          name: 'COLOR',
        },
      ],
      extensions: ['colours_sensing', 'output_boolean'],
    })
  },
}

Blockly.Blocks.sensing_coloristouchingcolor = {
  /**
   * Block to Report if a color is touching a certain Color.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.SENSING_COLORISTOUCHINGCOLOR,
      args0: [
        {
          type: 'input_value',
          name: 'COLOR',
        },
        {
          type: 'input_value',
          name: 'COLOR2',
        },
      ],
      extensions: ['colours_sensing', 'output_boolean'],
    })
  },
}

Blockly.Blocks.sensing_distanceto = {
  /**
   * Block to Report distance to another Object.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.SENSING_DISTANCETO,
      args0: [
        {
          type: 'input_value',
          name: 'DISTANCETOMENU',
        },
      ],
      extensions: ['colours_sensing', 'output_number'],
    })
  },
}

/**
 * "Distance to [Object]" Block Menu. Populated dynamically by scratch-gui.
 */
Blockly.Blocks.sensing_distancetomenu = {}

Blockly.Blocks.sensing_askandwait = {
  /**
   * Block to ask a question and wait
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.SENSING_ASKANDWAIT,
      args0: [
        {
          type: 'input_value',
          name: 'QUESTION',
        },
      ],
      extensions: ['colours_sensing', 'shape_statement'],
    })
  },
}

Blockly.Blocks.sensing_answer = {
  /**
   * Block to report answer
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.SENSING_ANSWER,
      extensions: ['colours_sensing', 'output_number', 'monitor_block'],
    })
  },
}

Blockly.Blocks.sensing_keypressed = {
  /**
   * Block to Report if a key is pressed.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.SENSING_KEYPRESSED,
      args0: [
        {
          type: 'input_value',
          name: 'KEY_OPTION',
        },
      ],
      extensions: ['colours_sensing', 'output_boolean'],
    })
  },
}

Blockly.Blocks.sensing_keyoptions = {
  /**
   * Options for Keys
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: '%1',
      args0: [
        {
          type: 'field_dropdown',
          name: 'KEY_OPTION',
          options: [
            [Blockly.Msg.EVENT_WHENKEYPRESSED_SPACE, 'space'],
            [Blockly.Msg.EVENT_WHENKEYPRESSED_UP, 'up arrow'],
            [Blockly.Msg.EVENT_WHENKEYPRESSED_DOWN, 'down arrow'],
            [Blockly.Msg.EVENT_WHENKEYPRESSED_RIGHT, 'right arrow'],
            [Blockly.Msg.EVENT_WHENKEYPRESSED_LEFT, 'left arrow'],
            [Blockly.Msg.EVENT_WHENKEYPRESSED_ANY, 'any'],
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
            ['9', '9'],
          ],
        },
      ],
      extensions: ['colours_sensing', 'output_string'],
    })
  },
}

Blockly.Blocks.sensing_mousedown = {
  /**
   * Block to Report if the mouse is down.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.SENSING_MOUSEDOWN,
      extensions: ['colours_sensing', 'output_boolean'],
    })
  },
}

Blockly.Blocks.sensing_mousex = {
  /**
   * Block to report mouse's x position
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.SENSING_MOUSEX,
      extensions: ['colours_sensing', 'output_number'],
    })
  },
}

Blockly.Blocks.sensing_mousey = {
  /**
   * Block to report mouse's y position
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.SENSING_MOUSEY,
      extensions: ['colours_sensing', 'output_number'],
    })
  },
}

Blockly.Blocks.sensing_setdragmode = {
  /**
   * Block to set drag mode.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.SENSING_SETDRAGMODE,
      args0: [
        {
          type: 'field_dropdown',
          name: 'DRAG_MODE',
          options: [
            [Blockly.Msg.SENSING_SETDRAGMODE_DRAGGABLE, 'draggable'],
            [Blockly.Msg.SENSING_SETDRAGMODE_NOTDRAGGABLE, 'not draggable'],
          ],
        },
      ],
      extensions: ['colours_sensing', 'shape_statement'],
    })
  },
}

Blockly.Blocks.sensing_loudness = {
  /**
   * Block to report loudness
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.SENSING_LOUDNESS,
      extensions: ['colours_sensing', 'output_number', 'monitor_block'],
    })
  },
}

Blockly.Blocks.sensing_loud = {
  /**
   * Block to report if the loudness is "loud" (greater than 10). This is an
   * obsolete block that is implemented for compatibility with Scratch 2.0 and
   * 1.4 projects.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.SENSING_LOUD,
      extensions: ['colours_sensing', 'output_boolean'],
    })
  },
}

Blockly.Blocks.sensing_timer = {
  /**
   * Block to report timer
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.SENSING_TIMER,
      extensions: ['colours_sensing', 'output_number', 'monitor_block'],
    })
  },
}

Blockly.Blocks.sensing_resettimer = {
  /**
   * Block to reset timer
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.SENSING_RESETTIMER,
      extensions: ['colours_sensing', 'shape_statement'],
    })
  },
}

/**
 * "* of _" object menu. Populated dynamically by scratch-gui.
 */
Blockly.Blocks.sensing_of_object_menu = {}

/**
 * Block to report properties of sprites. Populated dynamically by scratch-gui.
 */
Blockly.Blocks.sensing_of = {}

Blockly.Blocks.sensing_current = {
  /**
   * Block to Report the current option.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.SENSING_CURRENT,
      args0: [
        {
          type: 'field_dropdown',
          name: 'CURRENTMENU',
          options: [
            [Blockly.Msg.SENSING_CURRENT_YEAR, 'YEAR'],
            [Blockly.Msg.SENSING_CURRENT_MONTH, 'MONTH'],
            [Blockly.Msg.SENSING_CURRENT_DATE, 'DATE'],
            [Blockly.Msg.SENSING_CURRENT_DAYOFWEEK, 'DAYOFWEEK'],
            [Blockly.Msg.SENSING_CURRENT_HOUR, 'HOUR'],
            [Blockly.Msg.SENSING_CURRENT_MINUTE, 'MINUTE'],
            [Blockly.Msg.SENSING_CURRENT_SECOND, 'SECOND'],
          ],
        },
      ],
      extensions: ['colours_sensing', 'output_number', 'monitor_block'],
    })
  },
}

Blockly.Blocks.sensing_dayssince2000 = {
  /**
   * Block to report days since 2000
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.SENSING_DAYSSINCE2000,
      extensions: ['colours_sensing', 'output_number'],
    })
  },
}

Blockly.Blocks.sensing_online = {
  /**
   * Block to report whether or not the system is online
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.SENSING_ONLINE,
      extensions: ['colours_sensing', 'output_boolean', 'monitor_block'],
    })
  },
}

Blockly.Blocks.sensing_username = {
  /**
   * Block to report user's username
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.SENSING_USERNAME,
      extensions: ['colours_sensing', 'output_number', 'monitor_block'],
    })
  },
}

Blockly.Blocks.sensing_userid = {
  /**
   * Block to report user's ID. Does not actually do anything. This is an
   * obsolete block that is implemented for compatibility with Scratch 2.0
   * projects.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.SENSING_USERID,
      extensions: ['colours_sensing', 'output_number'],
    })
  },
}
