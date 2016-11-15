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

goog.provide('Blockly.Procedures');

goog.require('Blockly.Blocks');
goog.require('Blockly.Field');
goog.require('Blockly.Names');
goog.require('Blockly.Workspace');


/**
 * Category to separate procedure names from variables and generated functions.
 */
Blockly.Procedures.NAME_TYPE = 'PROCEDURE';

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
  var proceduresReturn = [];
  var proceduresReturnBool = [];
  var proceduresNoReturn = [];
  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i].type) {
      var type = blocks[i].type;
      var form = blocks[i]._form;
      var procCode = blocks[i]._procCode;
      if (type) {
        if (type == "procedures_defnoreturn" && form == 0) {
          proceduresReturn.push(procCode);
        } else if (type == "procedures_defnoreturn" && form == null) {
          proceduresNoReturn.push(procCode);
        } else if (type == "procedures_defnoreturn" && form == 1) {
          proceduresReturnBool.push(procCode);
        }
        if (type == "procedures_defnoreturn" || type == "procedures_calreturn" || type == "procedures_callnoreturn") {
          procCode = Blockly.Procedures.findLegalName(procCode, blocks[i]);
        }
      }
    }
  }
  proceduresNoReturn.sort(Blockly.Procedures.procTupleComparator_);
  proceduresReturn.sort(Blockly.Procedures.procTupleComparator_);
  proceduresReturnBool.sort(Blockly.Procedures.procTupleComparator_);
  return [proceduresNoReturn, proceduresReturn, proceduresReturnBool];
};

/**
 * Comparison function for case-insensitive sorting of the first element of
 * a tuple.
 * @param {!Array} ta First tuple.
 * @param {!Array} tb Second tuple.
 * @return {number} -1, 0, or 1 to signify greater than, equality, or less than.
 * @private
 */
Blockly.Procedures.procTupleComparator_ = function(ta, tb) {
  return ta[0].toLowerCase().localeCompare(tb[0].toLowerCase());
};

/**
 * Ensure two identically-named procedures don't exist.
 * @param {string} name Proposed procedure name.
 * @param {!Blockly.Block} block Block to disambiguate.
 * @return {string} Non-colliding name.
 */
Blockly.Procedures.findLegalName = function(name, block) {
  var i = 2;
  while (!Blockly.Procedures.isLegalName(name, block.workspace)) {
    // Collision with another procedure.
    if (Blockly.Procedures.isLegalName(name + i, block.workspace)) {
      name = name + i;
    }
    i++;
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
Blockly.Procedures.isLegalName = function(name, workspace) {
  var blocks = workspace.getAllBlocks();
  // Iterate through every block and check the name.
  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i]._procCode) {
      var procCode = blocks[i]._procCode;
      if (Blockly.Names.equals(procCode, name)) {
        return false;
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
  if (Blockly.Blocks['procedures_report']) {
    // <block type="procedures_ifreturn" gap="16"></block>
    var block = goog.dom.createDom('block');
    block.setAttribute('type', 'procedures_report');
    block.setAttribute('gap', 16);
    xmlList.push(block);
  }
  if (xmlList.length) {
    // Add slightly larger gap between system blocks and user calls.
    xmlList[xmlList.length - 1].setAttribute('gap', 24);
  }
  var button1 = goog.dom.createDom('button');
  button1.setAttribute('text', 'New Block');
  button1.setAttribute('callbackKey', 'NEW_BLOCK');

  Blockly.registerButtonCallback('NEW_BLOCK', function() {
    Blockly.Procedures.new(0);
  });

  xmlList.push(button1);
  var button2 = goog.dom.createDom('button');
  button2.setAttribute('text', 'New Reporter');
  button2.setAttribute('callbackKey', 'NEW_REPORT');

  Blockly.registerButtonCallback('NEW_REPORT', function() {
    Blockly.Procedures.new(1);
  });

  xmlList.push(button2);
  var button3 = goog.dom.createDom('button');
  button3.setAttribute('text', 'New Boolean');
  button3.setAttribute('callbackKey', 'NEW_BOOL');

  Blockly.registerButtonCallback('NEW_BOOL', function() {
    Blockly.Procedures.new(2);
  });

  xmlList.push(button3);
  function populateProcedures(procedureList, templateName, form) {
    for (var i = 0; i < procedureList.length; i++) {
      var procCode = procedureList[i];
      // <block type="procedures_callnoreturn" gap="16">
      //   <mutation name="do something">
      //     <arg name="x"></arg>
      //   </mutation>
      // </block>
      var block = goog.dom.createDom('block');
      block.setAttribute('type', templateName);
      block.setAttribute('gap', 16);
      var mutation = goog.dom.createDom('mutation');
      mutation.setAttribute('proccode', procCode);
      mutation.setAttribute('form', form);
      block.appendChild(mutation);
      xmlList.push(block);
    }
  }

  var tuple = Blockly.Procedures.allProcedures(workspace);
  populateProcedures(tuple[0], 'procedures_callnoreturn', null);
  populateProcedures(tuple[1], 'procedures_callreturn', 0);
  populateProcedures(tuple[2], 'procedures_callreturn', 1);
  return xmlList;
};

Blockly.Procedures.new = function(type) {
  switch (type) {
    case 0:
      // TODO
      break;
    case 1:
      // TODO
      break;
    case 2:
      // TODO
      break;
  }
};
