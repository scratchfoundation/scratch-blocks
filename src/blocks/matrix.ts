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
/**
 * @file Matrix blocks for Blockly.
 * @author khanning@gmail.com (Kreg Hanning)
 */
import * as Blockly from 'blockly/core'
import * as Constants from '../constants'

Blockly.Blocks.matrix = {
  /**
   * Block for matrix value.
   */
  init: function (this: Blockly.Block) {
    this.jsonInit({
      message0: '%1',
      args0: [
        {
          type: 'field_matrix',
          name: 'MATRIX',
        },
      ],
      outputShape: Constants.OUTPUT_SHAPE_ROUND,
      output: 'Number',
      extensions: ['colours_pen'],
    })
  },
}
