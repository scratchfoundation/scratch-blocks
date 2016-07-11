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

goog.provide('Blockly.Blocks.sound');

goog.require('Blockly.Blocks');
goog.require('Blockly.Colours');
goog.require('Blockly.constants');


Blockly.Blocks['sound_sounds_option'] = {
  /**
   * Sound effects drop-down menu.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit(
      {
        "message0": "%1",
        "args0": [
          {
            "type": "field_dropdown",
            "name": "SOUND_MENU",
            "options": [
              ['meow', 'MEOW'],
              ['meow2', 'MEOW2'],
              ['pop', 'POP']
            ]
          }
        ],
        "inputsInline": true,
        "output": "String",
        "colour": Blockly.Colours.sounds.secondary,
        "colourSecondary": Blockly.Colours.sounds.secondary,
        "colourTertiary": Blockly.Colours.sounds.tertiary,
        "outputShape": Blockly.OUTPUT_SHAPE_ROUND
      });
  }
};

Blockly.Blocks['sound_play'] = {
  /**
   * Block to play sound.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "play sound %1",
      "args0": [
        {
          "type": "input_value",
          "name": "SOUND_MENU"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.sounds.primary,
      "colourSecondary": Blockly.Colours.sounds.secondary,
      "colourTertiary": Blockly.Colours.sounds.tertiary
    });
  }
};

Blockly.Blocks['sound_playuntildone'] = {
  /**
   * Block to play sound until done.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "play sound %1 until done",
      "args0": [
        {
          "type": "input_value",
          "name": "SOUND_MENU"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.sounds.primary,
      "colourSecondary": Blockly.Colours.sounds.secondary,
      "colourTertiary": Blockly.Colours.sounds.tertiary
    });
  }
};

Blockly.Blocks['sound_stopallsounds'] = {
  /**
   * Block to stop all sounds
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "stop all sounds",
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.sounds.primary,
      "colourSecondary": Blockly.Colours.sounds.secondary,
      "colourTertiary": Blockly.Colours.sounds.tertiary
    });
  }
};

Blockly.Blocks['sound_playdrumforbeats'] = {
  /**
   * Block to play a certain drum for certain beats
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "play drum %1 for %2 beats",
      "args0": [
        {
          "type": "input_value",
          "name": "DRUMTYPE"
        },
        {
          "type": "input_value",
          "name": "BEATS"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.sounds.primary,
      "colourSecondary": Blockly.Colours.sounds.secondary,
      "colourTertiary": Blockly.Colours.sounds.tertiary
    });
  }
};

Blockly.Blocks['sound_restforbeats'] = {
  /**
   * Block to rest for certain beats
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "rest for %1 beats",
      "args0": [
        {
          "type": "input_value",
          "name": "BEATS"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.sounds.primary,
      "colourSecondary": Blockly.Colours.sounds.secondary,
      "colourTertiary": Blockly.Colours.sounds.tertiary
    });
  }
};

Blockly.Blocks['sound_playnoteforbeats'] = {
  /**
   * Block to play a certain note for certain beats
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "play note %1 to %2 beats",
      "args0": [
        {
          "type": "input_value",
          "name": "NOTE"
        },
        {
          "type": "input_value",
          "name": "BEATS"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.sounds.primary,
      "colourSecondary": Blockly.Colours.sounds.secondary,
      "colourTertiary": Blockly.Colours.sounds.tertiary
    });
  }
};

Blockly.Blocks['sound_setinstrumentto'] = {
  /**
   * Block to set the sprite's instrument to a certain value
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "set instrument to %1",
      "args0": [
        {
          "type": "input_value",
          "name": "INSTRUMENT"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.sounds.primary,
      "colourSecondary": Blockly.Colours.sounds.secondary,
      "colourTertiary": Blockly.Colours.sounds.tertiary
    });
  }
};

Blockly.Blocks['sound_changevolumeby'] = {
  /**
   * Block to change the sprite's volume by a certain value
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "change volume by %1",
      "args0": [
        {
          "type": "input_value",
          "name": "VOLUME"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.sounds.primary,
      "colourSecondary": Blockly.Colours.sounds.secondary,
      "colourTertiary": Blockly.Colours.sounds.tertiary
    });
  }
};

Blockly.Blocks['sound_setvolumeto'] = {
  /**
   * Block to set the sprite's volume to a certain percent
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "set volume to %1%",
      "args0": [
        {
          "type": "input_value",
          "name": "VOLUME"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.sounds.primary,
      "colourSecondary": Blockly.Colours.sounds.secondary,
      "colourTertiary": Blockly.Colours.sounds.tertiary
    });
  }
};

Blockly.Blocks['sound_volume'] = {
  /**
   * Block to report volume
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "volume",
      "colour": Blockly.Colours.sounds.primary,
      "colourSecondary": Blockly.Colours.sounds.secondary,
      "colourTertiary": Blockly.Colours.sounds.tertiary,
      "output": "Number",
      "outputShape": Blockly.OUTPUT_SHAPE_ROUND,
      "checkboxInFlyout": true
    });
  }
};

Blockly.Blocks['sound_changetempoby'] = {
  /**
   * Block to change the sprite's tempo by a certain value
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "change tempo by %1",
      "args0": [
        {
          "type": "input_value",
          "name": "TEMPO"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.sounds.primary,
      "colourSecondary": Blockly.Colours.sounds.secondary,
      "colourTertiary": Blockly.Colours.sounds.tertiary
    });
  }
};

Blockly.Blocks['sound_settempotobpm'] = {
  /**
   * Block to set the sprite's volume to a certain bpm
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "set tempo to %1 bpm",
      "args0": [
        {
          "type": "input_value",
          "name": "TEMPO"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.sounds.primary,
      "colourSecondary": Blockly.Colours.sounds.secondary,
      "colourTertiary": Blockly.Colours.sounds.tertiary
    });
  }
};

Blockly.Blocks['sound_tempo'] = {
  /**
   * Block to report tempo
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "tempo",
      "colour": Blockly.Colours.sounds.primary,
      "colourSecondary": Blockly.Colours.sounds.secondary,
      "colourTertiary": Blockly.Colours.sounds.tertiary,
      "output": "Number",
      "outputShape": Blockly.OUTPUT_SHAPE_ROUND,
      "checkboxInFlyout": true
    });
  }
};
