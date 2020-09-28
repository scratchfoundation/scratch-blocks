/**
 * Created by Riven on 7/7/2016.
 */

'use strict';

goog.provide('Blockly.Blocks.arduino');

goog.require('Blockly.Blocks');

goog.require('Blockly.Colours');


Blockly.Blocks['event_arduinobegin'] = {
    /**
     * Block for when flag clicked.
     * @this Blockly.Block
     */
    init: function() {
        this.jsonInit({
            "id": "event_arduinobegin",
            "message0": Blockly.Msg.ARDUINO_BEGIN,
            "inputsInline": true,
            "nextStatement": null,
            "category": Blockly.Categories.event,
            "colour": Blockly.Colours.arduino.primary,
            "colourSecondary": Blockly.Colours.arduino.secondary,
            "colourTertiary": Blockly.Colours.arduino.tertiary
        });
    }
};


Blockly.Blocks['arduino_analog_in_option'] = {
    /**
     * enum of devices uses one pin
     * @this Blockly.Block
     */
    init: function() {
        this.jsonInit({
            "id": "arduino_analog_in_option",
            "message0": "%1",
            "args0": [
                {
                    "type": "field_dropdown",
                    "name": "ARDUINO_ANALOG_IN_OPTION",
                    "options": [
                        ['a0', 'A0'],
                        ['a1', 'A1'],
                        ['a2', 'A2'],
                        ['a3', 'A3'],
                        ['a4', 'A4'],
                        ['a5', 'A5']
                    ]
                }
            ],
            "inputsInline": true,
            "output": "String",
            "colour": Blockly.Colours.arduino.secondary,
            "colourSecondary": Blockly.Colours.arduino.secondary,
            "colourTertiary": Blockly.Colours.arduino.tertiary,
            "outputShape": Blockly.OUTPUT_SHAPE_SQUARE
        });
    }
};

Blockly.Blocks['arduino_pwm_option'] = {
    /**
     * enum of devices uses one pin
     * @this Blockly.Block
     */
    init: function() {
        this.jsonInit({
            "id": "arduino_pwm_option",
            "message0": "%1",
            "args0": [
                {
                    "type": "field_dropdown",
                    "name": "ARDUINO_PWM_OPTION",
                    "options": [
                        ['3', '3'],
                        ['5', '5'],
                        ['9', '9'],
                        ['10', '10'],
                        ['11', '11']
                    ]
                }
            ],
            "inputsInline": true,
            "output": "String",
            "colour": Blockly.Colours.arduino.secondary,
            "colourSecondary": Blockly.Colours.arduino.secondary,
            "colourTertiary": Blockly.Colours.arduino.tertiary,
            "outputShape": Blockly.OUTPUT_SHAPE_SQUARE
        });
    }
};


Blockly.Blocks['arduino_pin_mode_option'] = {
    /**
     * enum of devices uses one pin
     * @this Blockly.Block
     */
    init: function() {
        this.jsonInit({
            "id": "arduino_pin_mode_option",
            "message0": "%1",
            "args0": [
                {
                    "type": "field_dropdown",
                    "name": "ARDUINO_PIN_MODE_OPTION",
                    "options": [
                        [Blockly.Msg.ARDUINO_INPUT, 'INPUT'],
                        [Blockly.Msg.ARDUINO_OUTPUT, 'OUTPUT']
                    ]
                }
            ],
            "inputsInline": true,
            "output": "String",
            "colour": Blockly.Colours.arduino.secondary,
            "colourSecondary": Blockly.Colours.arduino.secondary,
            "colourTertiary": Blockly.Colours.arduino.tertiary,
            "outputShape": Blockly.OUTPUT_SHAPE_SQUARE
        });
    }
};

Blockly.Blocks['arduino_level_option'] = {
    /**
     * enum of devices uses one pin
     * @this Blockly.Block
     */
    init: function() {
        this.jsonInit({
            "id": "arduino_level_option",
            "message0": "%1",
            "args0": [
                {
                    "type": "field_dropdown",
                    "name": "ARDUINO_LEVEL_OPTION",
                    "options": [
                        [Blockly.Msg.ARDUINO_HIGH, 'HIGH'],
                        [Blockly.Msg.ARDUINO_LOW, 'LOW']
                    ]
                }
            ],
            "inputsInline": true,
            "output": "String",
            "colour": Blockly.Colours.arduino.secondary,
            "colourSecondary": Blockly.Colours.arduino.secondary,
            "colourTertiary": Blockly.Colours.arduino.tertiary,
            "outputShape": Blockly.OUTPUT_SHAPE_SQUARE
        });
    }
};

Blockly.Blocks['arduino_digital_write'] = {
    /**
     * digital write
     * @this Blockly.Block
     */
    init: function() {
        this.jsonInit({
            "id": "arduino_digital_write",
            "message0": Blockly.Msg.ARDUINO_DIGITALWRITE,
            "args0": [
                {
                    "type": "input_value",
                    "name": "PINNUM"
                },
                {
                    "type": "input_value",
                    "name": "ARDUINO_LEVEL_OPTION"
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "colour": Blockly.Colours.arduino.primary,
            "colourSecondary": Blockly.Colours.arduino.secondary,
            "colourTertiary": Blockly.Colours.arduino.tertiary
        });
    }
};

Blockly.Blocks['arduino_pwm_write'] = {
    /**
     * digital write
     * @this Blockly.Block
     */
    init: function() {
        this.jsonInit({
            "id": "arduino_pwm_write",
            "message0": Blockly.Msg.ARDUINO_ANALOGWRITE,
            "args0": [
                {
                    "type": "input_value",
                    "name": "ARDUINO_PWM_OPTION"
                },
                {
                    "type": "input_value",
                    "name": "PWM"
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "colour": Blockly.Colours.arduino.primary,
            "colourSecondary": Blockly.Colours.arduino.secondary,
            "colourTertiary": Blockly.Colours.arduino.tertiary
        });
    }
};

Blockly.Blocks['arduino_digital_read'] = {
    /**
     * digital read
     * @this Blockly.Block
     */
    init: function() {
        this.jsonInit({
            "id": "arduino_pin_ison",
            "message0": Blockly.Msg.ARDUINO_DIGITALREAD,
            "args0": [
                {
                    "type": "input_value",
                    "name": "PINNUM"
                }
            ],
            "inputsInline": true,
            "output": "Number",
            "colour": Blockly.Colours.arduino.primary,
            "colourSecondary": Blockly.Colours.arduino.secondary,
            "colourTertiary": Blockly.Colours.arduino.tertiary,
            "outputShape": Blockly.OUTPUT_SHAPE_ROUND
        });
    }
};

Blockly.Blocks['arduino_pin_mode'] = {
    /**
     * pin mode
     * @this Blockly.Block
     */
    init: function() {
        this.jsonInit({
            "id": "arduino_pin_mode",
            "message0": Blockly.Msg.ARDUINO_PINMODE,
            "args0": [
                {
                    "type": "input_value",
                    "name": "PINNUM"
                },
                {
                    "type": "input_value",
                    "name": "ARDUINO_PIN_MODE_OPTION"
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "colour": Blockly.Colours.arduino.primary,
            "colourSecondary": Blockly.Colours.arduino.secondary,
            "colourTertiary": Blockly.Colours.arduino.tertiary
        });
    }
};

Blockly.Blocks['arduino_pin_value'] = {
    /**
     * return pin level
     * @this Blockly.Block
     */
    init: function() {
        this.jsonInit(
            {
                "message0": Blockly.Msg.ARDUINO_DIGITALREAD,
                "args0": [
                    {
                        "type": "input_value",
                        "name": "PINNUM"
                    }
                ],
                "inputsInline": true,
                "output": "Number",
                "colour": Blockly.Colours.arduino.tertiary,
                "colourSecondary": Blockly.Colours.arduino.secondary,
                "colourTertiary": Blockly.Colours.arduino.tertiary,
                "outputShape": Blockly.OUTPUT_SHAPE_ROUND
            });
    }
};


Blockly.Blocks['arduino_analog_read'] = {
    /**
     * return analogread on port
     * @this Blockly.Block
     */
    init: function() {
        this.jsonInit(
            {
                "message0": Blockly.Msg.ARDUINO_ANALOGREAD,
                "args0": [
                    {
                        "type": "input_value",
                        "name": "PINNUM"
                    }
                ],
                "inputsInline": true,
                "output": "Number",
                "colour": Blockly.Colours.arduino.tertiary,
                "colourSecondary": Blockly.Colours.arduino.secondary,
                "colourTertiary": Blockly.Colours.arduino.tertiary,
                "outputShape": Blockly.OUTPUT_SHAPE_ROUND
            });
    }
};

Blockly.Blocks['arduino_tone'] = {
  /**
   * tone(pin, frequency, duration)
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "id": "arduino_tone",
      "message0": Blockly.Msg.ARDUINO_TONE,
      "args0": [
        {
          "type": "input_value",
          "name": "PINNUM"
        },
        {
          "type": "input_value",
          "name": "FREQUENCY"
        },
        {
          "type": "input_value",
          "name": "DURATION"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Colours.arduino.primary,
      "colourSecondary": Blockly.Colours.arduino.secondary,
      "colourTertiary": Blockly.Colours.arduino.tertiary
    });
  }
};


Blockly.Blocks['arduino_map'] = {
    /**
     * tone(pin, frequency, duration)
     * @this Blockly.Block
     */
    init: function() {
        this.jsonInit({
            "id": "arduino_map",
            "message0": "map %1 from %2~%3 to %4~%5",
            "args0": [
                {
                    "type": "input_value",
                    "name": "VAL"
                },
                {
                    "type": "input_value",
                    "name": "FROMLOW"
                },
                {
                    "type": "input_value",
                    "name": "FROMHIGH"
                },
                {
                    "type": "input_value",
                    "name": "TOLOW"
                },
                {
                    "type": "input_value",
                    "name": "TOHIGH"
                }
            ],
            "inputsInline": true,
            "output": "Number",
            "colour": Blockly.Colours.arduino.primary,
            "colourSecondary": Blockly.Colours.arduino.secondary,
            "colourTertiary": Blockly.Colours.arduino.tertiary,
            "outputShape": Blockly.OUTPUT_SHAPE_ROUND
        });
    }
};


Blockly.Blocks['arduino_servo'] = {
    /**
     * servo(pin, angle)
     * @this Blockly.Block
     */
    init: function() {
        this.jsonInit({
            "id": "arduino_servo",
            "message0": Blockly.Msg.ARDUINO_SERVO,
            "args0": [
                {
                    "type": "input_value",
                    "name": "PINNUM"
                },
                {
                    "type": "input_value",
                    "name": "ANGLE"
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "colour": Blockly.Colours.arduino.primary,
            "colourSecondary": Blockly.Colours.arduino.secondary,
            "colourTertiary": Blockly.Colours.arduino.tertiary
        });
    }
};


Blockly.Blocks['arduino_pulsein'] = {
    /**
     * ultrasonicsensor(pintrig, pinecho)
     * @this Blockly.Block
     */
    init: function() {
        this.jsonInit({
            "id": "arduino_pulsein",
            "message0": Blockly.Msg.ARDUINO_PULSEIN,
            "args0": [
                {
                    "type": "input_value",
                    "name": "PINNUM"
                }
            ],
            "inputsInline": true,
            "output": "Number",
            "colour": Blockly.Colours.arduino.primary,
            "colourSecondary": Blockly.Colours.arduino.secondary,
            "colourTertiary": Blockly.Colours.arduino.tertiary,
            "outputShape": Blockly.OUTPUT_SHAPE_ROUND
        });
    }
};


Blockly.Blocks['arduino_println'] = {
    /**
     * serial println
     * @this Blockly.Block
     */
    init: function() {
        this.jsonInit({
            "id": "arduino_println",
            "message0": Blockly.Msg.ARDUINO_PRINTLN,
            "args0": [
                {
                    "type": "input_value",
                    "name": "TEXT"
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "colour": Blockly.Colours.arduino.primary,
            "colourSecondary": Blockly.Colours.arduino.secondary,
            "colourTertiary": Blockly.Colours.arduino.tertiary
        });
    }
};
