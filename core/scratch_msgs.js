/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
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
 * @fileoverview Scratch Messages singleton, with function to override Blockly.Msg values.
 * @author chrisg@media.mit.edu (Chris Garrity)
 */
'use strict';

/**
 * Name space for the Msg singleton.
 * Msg gets populated in the message files.
 */
goog.provide('Blockly.ScratchMsgs');

goog.require('Blockly.Msg');

/**
 * Change the Blockly.Msg strings to a new Locale
 * Does not exist in Blockly, but needed in scratch-blocks
 * @param {string} locale E.g., 'de', or 'zh-tw'
 * @package
 */
Blockly.ScratchMsgs.setLocale = function(locale) {
  if (Object.keys(Blockly.ScratchMsgs.locales).includes(locale)) {
    Blockly.Msg = Blockly.ScratchMsgs.locales[locale];
  } else {
    // keep current locale
    console.warn('Ignoring unrecognized locale: ' + locale);
  }
};
