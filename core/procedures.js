/**
 * @license
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
 * @fileoverview Utility functions for handling procedures.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * @name Blockly.Procedures
 * @namespace
 **/
goog.provide('Blockly.Procedures');

goog.require('Blockly.Blocks');
goog.require('Blockly.constants');
goog.require('Blockly.Field');
goog.require('Blockly.Names');
goog.require('Blockly.Workspace');


/**
 * Find all user-created procedure definitions in a workspace.
 * @param {!Blockly.Workspace} root Root workspace.
 * @return {!Array.<!Array.<!Array>>} Pair of arrays, the
 *     first contains procedures without return variables, the second with.
 *     Each procedure is defined by a three-element list of name, parameter
 *     list, and return value boolean.
 */
Blockly.Procedures.allProcedures = function(root) {
  var blocks = root.getAllBlocks();
  var proceduresNoReturn = [];
  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i].type == "procedures_defnoreturn") {
      if (blocks[i]._procCode) {
        var procCode = blocks[i]._procCode;
        proceduresNoReturn.push(procCode);
      }
    }
  }
  return proceduresNoReturn;
};

/**
 * Ensure two identically-named procedures don't exist.
 * @param {string} name Proposed procedure name.
 * @param {!Blockly.Block} block Block to disambiguate.
 * @return {string} Non-colliding name.
 */
Blockly.Procedures.findLegalName = function(name, block) {
  if (block.isInFlyout) {
    // Flyouts can have multiple procedures called 'do something'.
    return name;
  }
  while (!Blockly.Procedures.isLegalName_(name, block.workspace, block)) {
    // Collision with another procedure.
    var r = name.match(/^(.*?)(\d+)$/);
    if (!r) {
      name += '2';
    } else {
      name = r[1] + (parseInt(r[2], 10) + 1);
    }
  }
  return name;
};

/**
 * Does this procedure have a legal name?  Illegal names include names of
 * procedures already defined.
 * @param {string} name The questionable name.
 * @param {!Blockly.Workspace} workspace The workspace to scan for collisions.
 * @param {Blockly.Block=} opt_exclude Optional block to exclude from
 *     comparisons (one doesn't want to collide with oneself).
 * @return {boolean} True if the name is legal.
 * @private
 */
Blockly.Procedures.isLegalName_ = function(name, workspace, opt_exclude) {
  var blocks = workspace.getAllBlocks();
  // Iterate through every block and check the name.
  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i] == opt_exclude) {
      continue;
    }
    if (blocks[i].type == "procedures_defnoreturn") {
      if (blocks[i]._procCode) {
        var procName = blocks[i]._procCode;
        if (Blockly.Names.equals(procName[0], name)) {
          return false;
        }
      }
    }
  }
  return true;
};

/**
 * Construct the blocks required by the flyout for the procedure category.
 * @param {!Blockly.Workspace} workspace The workspace contianing procedures.
 * @return {!Array.<!Element>} Array of XML block elements.
 */
Blockly.Procedures.flyoutCategory = function(workspace) {
  var xmlList = [];
  function populateProcedures(procedureList, templateName) {
    for (var i = 0; i < procedureList.length; i++) {
      var name = procedureList[i];
      // <block type="procedures_callnoreturn" gap="16">
      //   <mutation name="do something">
      //     <arg name="x"></arg>
      //   </mutation>
      // </block>
      var block = goog.dom.createDom('block');
      block.setAttribute('type', templateName);
      var mutation = goog.dom.createDom('mutation');
      mutation.setAttribute('proccode', name);
      block.appendChild(mutation);
      xmlList.push(block);
    }
  }

  var tuple = Blockly.Procedures.allProcedures(workspace);
  populateProcedures(tuple, 'procedures_callnoreturn');
  return xmlList;
};
