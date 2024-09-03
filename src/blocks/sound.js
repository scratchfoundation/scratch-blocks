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

import * as Blockly from "blockly/core";
import { Categories } from "../categories.js";

/**
 * Sound effects drop-down menu. Populated dynamically by scratch-gui.
 */
Blockly.Blocks["sound_sounds_menu"] = {};

Blockly.Blocks["sound_play"] = {
  /**
   * Block to play sound.
   * @this Blockly.Block
   */
  init: function () {
    this.jsonInit({
      message0: Blockly.Msg.SOUND_PLAY,
      args0: [
        {
          type: "input_value",
          name: "SOUND_MENU",
        },
      ],
      category: Categories.sound,
      extensions: ["colours_sounds", "shape_statement"],
    });
  },
};

Blockly.Blocks["sound_playuntildone"] = {
  /**
   * Block to play sound until done.
   * @this Blockly.Block
   */
  init: function () {
    this.jsonInit({
      message0: Blockly.Msg.SOUND_PLAYUNTILDONE,
      args0: [
        {
          type: "input_value",
          name: "SOUND_MENU",
        },
      ],
      category: Categories.sound,
      extensions: ["colours_sounds", "shape_statement"],
    });
  },
};

Blockly.Blocks["sound_stopallsounds"] = {
  /**
   * Block to stop all sounds
   * @this Blockly.Block
   */
  init: function () {
    this.jsonInit({
      message0: Blockly.Msg.SOUND_STOPALLSOUNDS,
      category: Categories.sound,
      extensions: ["colours_sounds", "shape_statement"],
    });
  },
};

Blockly.Blocks["sound_seteffectto"] = {
  /**
   * Block to set the audio effect
   * @this Blockly.Block
   */
  init: function () {
    this.jsonInit({
      message0: Blockly.Msg.SOUND_SETEFFECTO,
      args0: [
        {
          type: "field_dropdown",
          name: "EFFECT",
          options: [
            [Blockly.Msg.SOUND_EFFECTS_PITCH, "PITCH"],
            [Blockly.Msg.SOUND_EFFECTS_PAN, "PAN"],
          ],
        },
        {
          type: "input_value",
          name: "VALUE",
        },
      ],
      category: Categories.sound,
      extensions: ["colours_sounds", "shape_statement"],
    });
  },
};

Blockly.Blocks["sound_changeeffectby"] = {
  /**
   * Block to change the audio effect
   * @this Blockly.Block
   */
  init: function () {
    this.jsonInit({
      message0: Blockly.Msg.SOUND_CHANGEEFFECTBY,
      args0: [
        {
          type: "field_dropdown",
          name: "EFFECT",
          options: [
            [Blockly.Msg.SOUND_EFFECTS_PITCH, "PITCH"],
            [Blockly.Msg.SOUND_EFFECTS_PAN, "PAN"],
          ],
        },
        {
          type: "input_value",
          name: "VALUE",
        },
      ],
      category: Categories.sound,
      extensions: ["colours_sounds", "shape_statement"],
    });
  },
};

Blockly.Blocks["sound_cleareffects"] = {
  /**
   * Block to clear audio effects
   * @this Blockly.Block
   */
  init: function () {
    this.jsonInit({
      message0: Blockly.Msg.SOUND_CLEAREFFECTS,
      category: Categories.sound,
      extensions: ["colours_sounds", "shape_statement"],
    });
  },
};

Blockly.Blocks["sound_changevolumeby"] = {
  /**
   * Block to change the sprite's volume by a certain value
   * @this Blockly.Block
   */
  init: function () {
    this.jsonInit({
      message0: Blockly.Msg.SOUND_CHANGEVOLUMEBY,
      args0: [
        {
          type: "input_value",
          name: "VOLUME",
        },
      ],
      category: Categories.sound,
      extensions: ["colours_sounds", "shape_statement"],
    });
  },
};

Blockly.Blocks["sound_setvolumeto"] = {
  /**
   * Block to set the sprite's volume to a certain percent
   * @this Blockly.Block
   */
  init: function () {
    this.jsonInit({
      message0: Blockly.Msg.SOUND_SETVOLUMETO,
      args0: [
        {
          type: "input_value",
          name: "VOLUME",
        },
      ],
      category: Categories.sound,
      extensions: ["colours_sounds", "shape_statement"],
    });
  },
};

Blockly.Blocks["sound_volume"] = {
  /**
   * Block to report volume
   * @this Blockly.Block
   */
  init: function () {
    this.jsonInit({
      message0: Blockly.Msg.SOUND_VOLUME,
      category: Categories.sound,
      checkboxInFlyout: true,
      extensions: ["colours_sounds", "output_number"],
    });
    this.checkboxInFlyout = true;
  },
};
