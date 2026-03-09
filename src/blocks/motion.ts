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

Blockly.Blocks.motion_movesteps = {
  /**
   * Block to move steps.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.MOTION_MOVESTEPS,
      args0: [
        {
          type: 'input_value',
          name: 'STEPS',
        },
      ],
      extensions: ['colours_motion', 'shape_statement'],
    })
  },
}

Blockly.Blocks.motion_turnright = {
  /**
   * Block to turn right.
   */
  init: function (this: Blockly.Block) {
    const ws = this.workspace.options.parentWorkspace || this.workspace
    this.jsonInit({
      message0: Blockly.Msg.MOTION_TURNRIGHT,
      args0: [
        {
          type: 'field_image',
          src: ws.options.pathToMedia + 'rotate-right.svg',
          width: 24,
          height: 24,
        },
        {
          type: 'input_value',
          name: 'DEGREES',
        },
      ],
      extensions: ['colours_motion', 'shape_statement'],
    })
  },
}

Blockly.Blocks.motion_turnleft = {
  /**
   * Block to turn left.
   */
  init: function (this: Blockly.Block) {
    const ws = this.workspace.options.parentWorkspace || this.workspace
    this.jsonInit({
      message0: Blockly.Msg.MOTION_TURNLEFT,
      args0: [
        {
          type: 'field_image',
          src: ws.options.pathToMedia + 'rotate-left.svg',
          width: 24,
          height: 24,
        },
        {
          type: 'input_value',
          name: 'DEGREES',
        },
      ],
      extensions: ['colours_motion', 'shape_statement'],
    })
  },
}

Blockly.Blocks.motion_pointindirection = {
  /**
   * Block to point in direction.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.MOTION_POINTINDIRECTION,
      args0: [
        {
          type: 'input_value',
          name: 'DIRECTION',
        },
      ],
      extensions: ['colours_motion', 'shape_statement'],
    })
  },
}

/**
 * Point towards drop-down menu. Populated dynamically by scratch-gui.
 */
Blockly.Blocks.motion_pointtowards_menu = {}

Blockly.Blocks.motion_pointtowards = {
  /**
   * Block to point in direction.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.MOTION_POINTTOWARDS,
      args0: [
        {
          type: 'input_value',
          name: 'TOWARDS',
        },
      ],
      extensions: ['colours_motion', 'shape_statement'],
    })
  },
}

/**
 * Go to drop-down menu. Populated dynamically by scratch-gui.
 */
Blockly.Blocks.motion_goto_menu = {}

Blockly.Blocks.motion_gotoxy = {
  /**
   * Block to go to X, Y.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.MOTION_GOTOXY,
      args0: [
        {
          type: 'input_value',
          name: 'X',
        },
        {
          type: 'input_value',
          name: 'Y',
        },
      ],
      extensions: ['colours_motion', 'shape_statement'],
    })
  },
}

Blockly.Blocks.motion_goto = {
  /**
   * Block to go to a menu item.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.MOTION_GOTO,
      args0: [
        {
          type: 'input_value',
          name: 'TO',
        },
      ],
      extensions: ['colours_motion', 'shape_statement'],
    })
  },
}

Blockly.Blocks.motion_glidesecstoxy = {
  /**
   * Block to glide for a specified time.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.MOTION_GLIDESECSTOXY,
      args0: [
        {
          type: 'input_value',
          name: 'SECS',
        },
        {
          type: 'input_value',
          name: 'X',
        },
        {
          type: 'input_value',
          name: 'Y',
        },
      ],
      extensions: ['colours_motion', 'shape_statement'],
    })
  },
}

/**
 * Glide to drop-down menu. Populated dynamically by scratch-gui.
 */
Blockly.Blocks.motion_glideto_menu = {}

Blockly.Blocks.motion_glideto = {
  /**
   * Block to glide to a menu item
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.MOTION_GLIDETO,
      args0: [
        {
          type: 'input_value',
          name: 'SECS',
        },
        {
          type: 'input_value',
          name: 'TO',
        },
      ],
      extensions: ['colours_motion', 'shape_statement'],
    })
  },
}

Blockly.Blocks.motion_changexby = {
  /**
   * Block to change X.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.MOTION_CHANGEXBY,
      args0: [
        {
          type: 'input_value',
          name: 'DX',
        },
      ],
      extensions: ['colours_motion', 'shape_statement'],
    })
  },
}

Blockly.Blocks.motion_setx = {
  /**
   * Block to set X.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.MOTION_SETX,
      args0: [
        {
          type: 'input_value',
          name: 'X',
        },
      ],
      extensions: ['colours_motion', 'shape_statement'],
    })
  },
}

Blockly.Blocks.motion_changeyby = {
  /**
   * Block to change Y.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.MOTION_CHANGEYBY,
      args0: [
        {
          type: 'input_value',
          name: 'DY',
        },
      ],
      extensions: ['colours_motion', 'shape_statement'],
    })
  },
}

Blockly.Blocks.motion_sety = {
  /**
   * Block to set Y.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.MOTION_SETY,
      args0: [
        {
          type: 'input_value',
          name: 'Y',
        },
      ],
      extensions: ['colours_motion', 'shape_statement'],
    })
  },
}

Blockly.Blocks.motion_ifonedgebounce = {
  /**
   * Block to bounce on edge.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.MOTION_IFONEDGEBOUNCE,
      extensions: ['colours_motion', 'shape_statement'],
    })
  },
}

Blockly.Blocks.motion_setrotationstyle = {
  /**
   * Block to set rotation style.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.MOTION_SETROTATIONSTYLE,
      args0: [
        {
          type: 'field_dropdown',
          name: 'STYLE',
          options: [
            [Blockly.Msg.MOTION_SETROTATIONSTYLE_LEFTRIGHT, 'left-right'],
            [Blockly.Msg.MOTION_SETROTATIONSTYLE_DONTROTATE, "don't rotate"],
            [Blockly.Msg.MOTION_SETROTATIONSTYLE_ALLAROUND, 'all around'],
          ],
        },
      ],
      extensions: ['colours_motion', 'shape_statement'],
    })
  },
}

Blockly.Blocks.motion_xposition = {
  /**
   * Block to report X.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.MOTION_XPOSITION,
      extensions: ['colours_motion', 'output_number', 'monitor_block'],
    })
  },
}

Blockly.Blocks.motion_yposition = {
  /**
   * Block to report Y.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.MOTION_YPOSITION,
      extensions: ['colours_motion', 'output_number', 'monitor_block'],
    })
  },
}

Blockly.Blocks.motion_direction = {
  /**
   * Block to report direction.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.MOTION_DIRECTION,
      extensions: ['colours_motion', 'output_number', 'monitor_block'],
    })
  },
}

Blockly.Blocks.motion_scroll_right = {
  /**
   * Block to scroll the stage right. Does not actually do anything. This is
   * an obsolete block that is implemented for compatibility with Scratch 2.0
   * projects.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.MOTION_SCROLLRIGHT,
      args0: [
        {
          type: 'input_value',
          name: 'DISTANCE',
        },
      ],
      extensions: ['colours_motion', 'shape_statement'],
    })
  },
}

Blockly.Blocks.motion_scroll_up = {
  /**
   * Block to scroll the stage up. Does not actually do anything. This is an
   * obsolete block that is implemented for compatibility with Scratch 2.0
   * projects.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.MOTION_SCROLLUP,
      args0: [
        {
          type: 'input_value',
          name: 'DISTANCE',
        },
      ],
      extensions: ['colours_motion', 'shape_statement'],
    })
  },
}

Blockly.Blocks.motion_align_scene = {
  /**
   * Block to change the stage's scrolling alignment. Does not actually do
   * anything. This is an obsolete block that is implemented for compatibility
   * with Scratch 2.0 projects.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.MOTION_ALIGNSCENE,
      args0: [
        {
          type: 'field_dropdown',
          name: 'ALIGNMENT',
          options: [
            [Blockly.Msg.MOTION_ALIGNSCENE_BOTTOMLEFT, 'bottom-left'],
            [Blockly.Msg.MOTION_ALIGNSCENE_BOTTOMRIGHT, 'bottom-right'],
            [Blockly.Msg.MOTION_ALIGNSCENE_MIDDLE, 'middle'],
            [Blockly.Msg.MOTION_ALIGNSCENE_TOPLEFT, 'top-left'],
            [Blockly.Msg.MOTION_ALIGNSCENE_TOPRIGHT, 'top-right'],
          ],
        },
      ],
      extensions: ['colours_motion', 'shape_statement'],
    })
  },
}

Blockly.Blocks.motion_xscroll = {
  /**
   * Block to report the stage's scroll position's X value. Does not actually
   * do anything. This is an obsolete block that is implemented for
   * compatibility with Scratch 2.0 projects.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.MOTION_XSCROLL,
      extensions: ['colours_motion', 'output_number'],
    })
  },
}

Blockly.Blocks.motion_yscroll = {
  /**
   * Block to report the stage's scroll position's Y value. Does not actually
   * do anything. This is an obsolete block that is implemented for
   * compatibility with Scratch 2.0 projects.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.MOTION_YSCROLL,
      extensions: ['colours_motion', 'output_number'],
    })
  },
}
