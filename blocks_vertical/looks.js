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

goog.provide('Blockly.Blocks.looks');

goog.require('Blockly.Blocks');
goog.require('Blockly.Colours');
goog.require('Blockly.constants');


/**
 * Register extensions.
 * TODO: Consider moving these to another file.
 */

Blockly.Extensions.register('set_color_looks',
  function() {
    this.setColour(Blockly.Colours.looks.primary,
        Blockly.Colours.looks.secondary,
        Blockly.Colours.looks.tertiary);
  }
);

Blockly.Extensions.register('set_category_looks',
  function() {
    this.setCategory(Blockly.Categories.looks);
  }
);

Blockly.Extensions.register('set_shape_statement',
  function() {
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
  }
);

Blockly.Extensions.register('set_output_string',
  function() {
    this.setOutput(true, "String");
    this.setOutputShape(Blockly.OUTPUT_SHAPE_ROUND);
  }
);

Blockly.Extensions.register('set_output_number',
  function() {
    this.setOutput(true, "Number");
    this.setOutputShape(Blockly.OUTPUT_SHAPE_ROUND);
  }
);

/**
 * This may be scraped to extract a .json file of block definitions. The array
 * passed to defineBlocksWithJsonArray(..) must be strict JSON: double quotes
 * only, no outside references, no functions, no trailing commas, etc. The one
 * exception is end-of-line comments, which the scraper will remove.
 */

Blockly.defineBlocksWithJsonArray([  // BEGIN JSON EXTRACT
  // Block to say something for some amount of time.
  {
    "type": "looks_sayforsecs",
    "message0": "say %1 for %2 secs",
    "args0": [
      {
        "type": "input_value",
        "name": "MESSAGE"
      },
      {
        "type": "input_value",
        "name": "SECS"
      }
    ],
    "extensions": ["set_category_looks", "set_color_looks",
        "set_shape_statement"]
  },
  // Block to say something.
  {
    "type": "looks_say",
    "message0": "say %1",
    "args0": [
      {
        "type": "input_value",
        "name": "MESSAGE"
      }
    ],
    "extensions": ["set_category_looks", "set_color_looks",
        "set_shape_statement"]
  },
  // Block to think something for some amount of time.
  {
    "type": "looks_thinkforsecs",
    "message0": "think %1 for %2 secs",
    "args0": [
      {
        "type": "input_value",
        "name": "MESSAGE"
      },
      {
        "type": "input_value",
        "name": "SECS"
      }
    ],
    "extensions": ["set_category_looks", "set_color_looks",
        "set_shape_statement"]
  },
  // Block for the sprite to think something.
  {
    "type": "looks_think",
    "message0": "think %1",
    "args0": [
      {
        "type": "input_value",
        "name": "MESSAGE"
      }
    ],
    "extensions": ["set_category_looks", "set_color_looks",
        "set_shape_statement"]
  },
  // Show block.
  {
    "type": "looks_show",
    "message0": "show",
    "extensions": ["set_category_looks", "set_color_looks",
      "set_shape_statement"]
  },
  // Hide block.
  {
    "type": "looks_hide",
    "message0": "hide",
    "extensions": ["set_category_looks", "set_color_looks",
      "set_shape_statement"]
  },
  // Graphic effects drop-down menu.
  {
    "type": "looks_effectmenu",
    "message0": "%1",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "EFFECT",
        "options": [
          ['color', 'COLOR'],
          ['fisheye', 'FISHEYE'],
          ['whirl', 'WHIRL'],
          ['pixelate', 'PIXELATE'],
          ['mosaic', 'MOSAIC'],
          ['brightness', 'BRIGHTNESS'],
          ['ghost', 'GHOST']
        ]
      }
    ],
    "colour": Blockly.Colours.looks.secondary,
    "colourSecondary": Blockly.Colours.looks.secondary,
    "colourTertiary": Blockly.Colours.looks.tertiary,
    "extensions": ["set_output_string"]
  },
  // Block to change graphic effects.
  {
    "type": "looks_changeeffectby",
    "message0": "change effect %1 by %2",
    "args0": [
      {
        "type": "input_value",
        "name": "EFFECT"
      },
      {
        "type": "input_value",
        "name": "CHANGE"
      }
    ],
    "extensions": ["set_category_looks", "set_color_looks",
        "set_shape_statement"]
  },
  // Block to set graphic effects.
  {
    "type": "looks_seteffectto",
    "message0": "set effect %1 to %2",
    "args0": [
      {
        "type": "input_value",
        "name": "EFFECT"
      },
      {
        "type": "input_value",
        "name": "VALUE"
      }
    ],
    "extensions": ["set_category_looks", "set_color_looks",
        "set_shape_statement"]
  },
  // Block to clear graphic effects.
  {
    "type": "looks_cleargraphiceffects",
    "message0": "clear graphic effects",
    "extensions": ["set_category_looks", "set_color_looks",
        "set_shape_statement"]
  },
  // Block to change size.
  {
    "type": "looks_changesizeby",
    "message0": "change size by %1",
    "args0": [
      {
        "type": "input_value",
        "name": "CHANGE"
      }
    ],
    "extensions": ["set_category_looks", "set_color_looks",
        "set_shape_statement"]
  },
  // Block to set size.
  {
    "type": "looks_setsizeto",
    "message0": "set size to %1 %",
    "args0": [
      {
        "type": "input_value",
        "name": "SIZE"
      }
    ],
    "extensions": ["set_category_looks", "set_color_looks",
        "set_shape_statement"]
  },
  // Block to report size.
  {
    "type": "looks_size",
    "message0": "size",
    "extensions": ["set_category_looks", "set_color_looks",
        "set_output_number"],
    "checkboxInFlyout": true
  },
  // Costumes drop-down menu.
  {
    "type": "looks_costume",
    "message0": "%1",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "COSTUME",
        "options": [
          ['costume1', 'COSTUME1'],
          ['costume2', 'COSTUME2']
        ]
      }
    ],
    "colour": Blockly.Colours.looks.secondary,
    "colourSecondary": Blockly.Colours.looks.secondary,
    "colourTertiary": Blockly.Colours.looks.tertiary,
    "extensions": ["set_output_string"]
  },
  // Block to switch the sprite's costume to the selected one.
  {
    "type": "looks_switchcostumeto",
    "message0": "switch costume to %1",
    "args0": [
      {
        "type": "input_value",
        "name": "COSTUME"
      }
    ],
    "extensions": ["set_category_looks", "set_color_looks",
        "set_shape_statement"]
  },
  // Block to switch the sprite's costume to the next one.
  {
    "type": "looks_nextcostume",
    "message0": "next costume",
    "extensions": ["set_category_looks", "set_color_looks",
      "set_shape_statement"]
  },
  // Block to switch the backdrop to the selected one.
  {
    "type": "looks_switchbackdropto",
    "message0": "switch backdrop to %1",
    "args0": [
      {
        "type": "input_value",
        "name": "BACKDROP"
      }
    ],
    "extensions": ["set_category_looks", "set_color_looks",
        "set_shape_statement"]
  },
  // Backdrop list.
  {
    "type": "looks_backdrops",
    // Is the id supposed to be set here?
    "id": "looks_backdrops",
    "message0": "%1",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "BACKDROP",
        "options": [
            ['backdrop1', 'BACKDROP1']
        ]
      }
    ],
    "colour": Blockly.Colours.looks.secondary,
    "colourSecondary": Blockly.Colours.looks.secondary,
    "colourTertiary": Blockly.Colours.looks.tertiary,
    "extensions": ["set_output_string"]
  },
  // "Go to front" block.
  {
    "type": "looks_gotofront",
    "message0": "go to front",
    "extensions": ["set_category_looks", "set_color_looks",
      "set_shape_statement"]
  },
  // "Go back [Number] Layers" block.
  {
    "type": "looks_gobacklayers",
    "message0": "go back %1 layers",
    "args0": [
      {
        "type": "input_value",
        "name": "NUM"
      }
    ],
    "extensions": ["set_category_looks", "set_color_looks",
        "set_shape_statement"]
  },
  // Block to report backdrop's name.
  {
    "type": "looks_backdropname",
    "message0": "backdrop name",
    "extensions": ["set_category_looks", "set_color_looks",
        "set_output_number"],
    "checkboxInFlyout": true
  },
  // Block to report costume's order.
  {
    "type": "looks_costumeorder",
    "message0": "costume #",
    "extensions": ["set_category_looks", "set_color_looks",
        "set_output_number"],
    "checkboxInFlyout": true
  },
  // Block to report backdrop's order.
  {
    "type": "looks_backdroporder",
    "message0": "backdrop #",
    "extensions": ["set_category_looks", "set_color_looks",
        "set_output_number"],
    "checkboxInFlyout": true
  },
  // Block to switch the backdrop to the selected one and wait.
  {
    "type": "looks_switchbackdroptoandwait",
    "message0": "switch backdrop to %1 and wait",
    "args0": [
      {
        "type": "input_value",
        "name": "BACKDROP"
      }
    ],
    "extensions": ["set_category_looks", "set_color_looks",
        "set_shape_statement"]
  },
  // Block to switch the backdrop to the next one.
  {
    "type": "looks_nextbackdrop",
    "message0": "next backdrop",
    "extensions": ["set_category_looks", "set_color_looks",
      "set_shape_statement"]
  }
]);  // END JSON EXTRACT (Do not delete this comment.)
