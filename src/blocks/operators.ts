/**
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
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

Blockly.Blocks.operator_add = {
  /**
   * Block for adding two numbers.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.OPERATORS_ADD,
      args0: [
        {
          type: 'input_value',
          name: 'NUM1',
        },
        {
          type: 'input_value',
          name: 'NUM2',
        },
      ],
      extensions: ['colours_operators', 'output_number'],
    })
  },
}

Blockly.Blocks.operator_subtract = {
  /**
   * Block for subtracting two numbers.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.OPERATORS_SUBTRACT,
      args0: [
        {
          type: 'input_value',
          name: 'NUM1',
        },
        {
          type: 'input_value',
          name: 'NUM2',
        },
      ],
      extensions: ['colours_operators', 'output_number'],
    })
  },
}

Blockly.Blocks.operator_multiply = {
  /**
   * Block for multiplying two numbers.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.OPERATORS_MULTIPLY,
      args0: [
        {
          type: 'input_value',
          name: 'NUM1',
        },
        {
          type: 'input_value',
          name: 'NUM2',
        },
      ],
      extensions: ['colours_operators', 'output_number'],
    })
  },
}

Blockly.Blocks.operator_divide = {
  /**
   * Block for dividing two numbers.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.OPERATORS_DIVIDE,
      args0: [
        {
          type: 'input_value',
          name: 'NUM1',
        },
        {
          type: 'input_value',
          name: 'NUM2',
        },
      ],
      extensions: ['colours_operators', 'output_number'],
    })
  },
}

Blockly.Blocks.operator_random = {
  /**
   * Block for picking a random number.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.OPERATORS_RANDOM,
      args0: [
        {
          type: 'input_value',
          name: 'FROM',
        },
        {
          type: 'input_value',
          name: 'TO',
        },
      ],
      extensions: ['colours_operators', 'output_number'],
    })
  },
}

Blockly.Blocks.operator_lt = {
  /**
   * Block for less than comparator.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.OPERATORS_LT,
      args0: [
        {
          type: 'input_value',
          name: 'OPERAND1',
        },
        {
          type: 'input_value',
          name: 'OPERAND2',
        },
      ],
      extensions: ['colours_operators', 'output_boolean'],
    })
  },
}

Blockly.Blocks.operator_equals = {
  /**
   * Block for equals comparator.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.OPERATORS_EQUALS,
      args0: [
        {
          type: 'input_value',
          name: 'OPERAND1',
        },
        {
          type: 'input_value',
          name: 'OPERAND2',
        },
      ],
      extensions: ['colours_operators', 'output_boolean'],
    })
  },
}

Blockly.Blocks.operator_gt = {
  /**
   * Block for greater than comparator.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.OPERATORS_GT,
      args0: [
        {
          type: 'input_value',
          name: 'OPERAND1',
        },
        {
          type: 'input_value',
          name: 'OPERAND2',
        },
      ],
      extensions: ['colours_operators', 'output_boolean'],
    })
  },
}

Blockly.Blocks.operator_and = {
  /**
   * Block for "and" boolean comparator.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.OPERATORS_AND,
      args0: [
        {
          type: 'input_value',
          name: 'OPERAND1',
          check: 'Boolean',
        },
        {
          type: 'input_value',
          name: 'OPERAND2',
          check: 'Boolean',
        },
      ],
      extensions: ['colours_operators', 'output_boolean'],
    })
  },
}

Blockly.Blocks.operator_or = {
  /**
   * Block for "or" boolean comparator.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.OPERATORS_OR,
      args0: [
        {
          type: 'input_value',
          name: 'OPERAND1',
          check: 'Boolean',
        },
        {
          type: 'input_value',
          name: 'OPERAND2',
          check: 'Boolean',
        },
      ],
      extensions: ['colours_operators', 'output_boolean'],
    })
  },
}

Blockly.Blocks.operator_not = {
  /**
   * Block for "not" unary boolean operator.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.OPERATORS_NOT,
      args0: [
        {
          type: 'input_value',
          name: 'OPERAND',
          check: 'Boolean',
        },
      ],
      extensions: ['colours_operators', 'output_boolean'],
    })
  },
}

Blockly.Blocks.operator_join = {
  /**
   * Block for string join operator.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.OPERATORS_JOIN,
      args0: [
        {
          type: 'input_value',
          name: 'STRING1',
        },
        {
          type: 'input_value',
          name: 'STRING2',
        },
      ],
      extensions: ['colours_operators', 'output_string'],
    })
  },
}

Blockly.Blocks.operator_letter_of = {
  /**
   * Block for "letter _ of _" operator.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.OPERATORS_LETTEROF,
      args0: [
        {
          type: 'input_value',
          name: 'LETTER',
        },
        {
          type: 'input_value',
          name: 'STRING',
        },
      ],
      extensions: ['colours_operators', 'output_string'],
    })
  },
}

Blockly.Blocks.operator_length = {
  /**
   * Block for string length operator.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.OPERATORS_LENGTH,
      args0: [
        {
          type: 'input_value',
          name: 'STRING',
        },
      ],
      extensions: ['colours_operators', 'output_string'],
    })
  },
}

Blockly.Blocks.operator_contains = {
  /**
   * Block for _ contains _ operator
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.OPERATORS_CONTAINS,
      args0: [
        {
          type: 'input_value',
          name: 'STRING1',
        },
        {
          type: 'input_value',
          name: 'STRING2',
        },
      ],
      extensions: ['colours_operators', 'output_boolean'],
    })
  },
}

Blockly.Blocks.operator_mod = {
  /**
   * Block for mod two numbers.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.OPERATORS_MOD,
      args0: [
        {
          type: 'input_value',
          name: 'NUM1',
        },
        {
          type: 'input_value',
          name: 'NUM2',
        },
      ],
      extensions: ['colours_operators', 'output_number'],
    })
  },
}

Blockly.Blocks.operator_round = {
  /**
   * Block for rounding a numbers.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.OPERATORS_ROUND,
      args0: [
        {
          type: 'input_value',
          name: 'NUM',
        },
      ],
      extensions: ['colours_operators', 'output_number'],
    })
  },
}

Blockly.Blocks.operator_mathop = {
  /**
   * Block for "advanced" math ops on a number.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.OPERATORS_MATHOP,
      args0: [
        {
          type: 'field_dropdown',
          name: 'OPERATOR',
          options: [
            [Blockly.Msg.OPERATORS_MATHOP_ABS, 'abs'],
            [Blockly.Msg.OPERATORS_MATHOP_FLOOR, 'floor'],
            [Blockly.Msg.OPERATORS_MATHOP_CEILING, 'ceiling'],
            [Blockly.Msg.OPERATORS_MATHOP_SQRT, 'sqrt'],
            [Blockly.Msg.OPERATORS_MATHOP_SIN, 'sin'],
            [Blockly.Msg.OPERATORS_MATHOP_COS, 'cos'],
            [Blockly.Msg.OPERATORS_MATHOP_TAN, 'tan'],
            [Blockly.Msg.OPERATORS_MATHOP_ASIN, 'asin'],
            [Blockly.Msg.OPERATORS_MATHOP_ACOS, 'acos'],
            [Blockly.Msg.OPERATORS_MATHOP_ATAN, 'atan'],
            [Blockly.Msg.OPERATORS_MATHOP_LN, 'ln'],
            [Blockly.Msg.OPERATORS_MATHOP_LOG, 'log'],
            [Blockly.Msg.OPERATORS_MATHOP_EEXP, 'e ^'],
            [Blockly.Msg.OPERATORS_MATHOP_10EXP, '10 ^'],
          ],
        },
        {
          type: 'input_value',
          name: 'NUM',
        },
      ],
      extensions: ['colours_operators', 'output_number'],
    })
  },
}

Blockly.Blocks.operator_convert = {
  /**
   * Block for converting a number to a decimal or percentage.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: Blockly.Msg.OPERATORS_CONVERT,
      args0: [
        {
          type: 'input_value',
          name: 'NUM',
        },
        {
          type: 'field_dropdown',
          name: 'CONVERT_TYPE',
          options: [
            [Blockly.Msg.OPERATORS_CONVERT_DECIMAL, 'DECIMAL'],
            [Blockly.Msg.OPERATORS_CONVERT_PERCENT, 'PERCENT'],
          ],
        },
      ],
      extensions: ['colours_operators', 'output_number'],
    })
  },
}
