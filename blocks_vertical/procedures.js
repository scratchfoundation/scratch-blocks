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
 * @fileoverview Procedure blocks for Scratch.
 */
'use strict';

goog.provide('Blockly.Blocks.procedures');

goog.require('Blockly.Blocks');
goog.require('Blockly.constants');


// TODO: Create a namespace properly.
Blockly.ScratchBlocks.ProcedureUtils = {};

/**
 * Returns the name of the procedure this block calls, or the empty string if
 * it has not yet been set.
 * @return {string} Procedure name.
 * @this Blockly.Block
 */
Blockly.ScratchBlocks.ProcedureUtils.getProcCode = function() {
  return this.procCode_;
};

/**
 * Create XML to represent the (non-editable) name and arguments of a procedure
 * call block (procedures_callnoreturn block).
 * @return {!Element} XML storage element.
 * @this Blockly.Block
 */
Blockly.ScratchBlocks.ProcedureUtils.callerMutationToDom = function() {
  var container = document.createElement('mutation');
  container.setAttribute('proccode', this.procCode_);
  container.setAttribute('argumentids', JSON.stringify(this.argumentIds_));
  container.setAttribute('warp', this.warp_);
  return container;
};

/**
 * Parse XML to restore the (non-editable) name and parameters of a procedure
 * call block (procedures_callnoreturn block).
 * @param {!Element} xmlElement XML storage element.
 * @this Blockly.Block
 */
Blockly.ScratchBlocks.ProcedureUtils.callerDomToMutation = function(xmlElement) {
  this.procCode_ = xmlElement.getAttribute('proccode');
  this.argumentIds_ = JSON.parse(xmlElement.getAttribute('argumentids'));
  this.warp_ = xmlElement.getAttribute('warp');
  this.updateDisplay_();
};

/**
 * Create XML to represent the (non-editable) name and arguments of a procedure
 * definition block (procedures_callnoreturn_internal, which is part of a definition,
 * or procedures_mutator_root).
 * @return {!Element} XML storage element.
 * @this Blockly.Block
 */
Blockly.ScratchBlocks.ProcedureUtils.definitionMutationToDom = function() {
  var container = document.createElement('mutation');
  container.setAttribute('proccode', this.procCode_);
  container.setAttribute('argumentids', JSON.stringify(this.argumentIds_));
  container.setAttribute('argumentnames', JSON.stringify(this.argumentNames_));
  container.setAttribute('argumentdefaults',
      JSON.stringify(this.argumentDefaults_));
  container.setAttribute('warp', this.warp_);
  return container;
};

/**
 * Parse XML to restore the (non-editable) name and parameters of a procedure
 * definition block (procedures_callnoreturn_internal, which is part of a definition,
 * or procedures_mutator_root).
 * @param {!Element} xmlElement XML storage element.
 * @this Blockly.Block
 */
Blockly.ScratchBlocks.ProcedureUtils.definitionDomToMutation = function(xmlElement) {
  this.procCode_ = xmlElement.getAttribute('proccode');
  this.warp_ = xmlElement.getAttribute('warp');

  this.argumentIds_ = JSON.parse(xmlElement.getAttribute('argumentids'));
  this.argumentNames_ = JSON.parse(xmlElement.getAttribute('argumentnames'));
  this.argumentDefaults_ = JSON.parse(
      xmlElement.getAttribute('argumentdefaults'));
  this.updateDisplay_();
};

/**
 * Remove all inputs on the block, including dummy inputs.
 * @private
 * @this Blockly.Block
 */
Blockly.ScratchBlocks.ProcedureUtils.removeAllInputs_ = function() {
  // Delete inputs directly instead of with block.removeInput to avoid splicing
  // out of the input list at every index.
  for (var i = 0, input; input = this.inputList[i]; i++) {
    input.dispose();
  }
  this.inputList = [];
};

/**
 * Disconnect old blocks from all value inputs on this block, but hold onto them
 * in case they can be reattached later.
 * @return {!Object.<string, Blockly.Block>} An object mapping parameter IDs to
 *     the blocks that were connected to those IDs at the beginning of the
 *     mutation.
 * @private
 * @this Blockly.Block
 */
Blockly.ScratchBlocks.ProcedureUtils.disconnectOldBlocks_ = function() {
  // Remove old stuff
  var connectionMap = {};
  for (var id in this.paramMap_) {
    var input = this.paramMap_[id];
    if (input.connection) {
      // Remove the shadow DOM.  Otherwise a shadow block will respawn
      // instantly, and we'd have to remove it when we remove the input.
      input.connection.setShadowDom(null);
      var target = input.connection.targetBlock();
      connectionMap[id] = target;
      if (target) {
        input.connection.disconnect();
      }
    }
  }
  return connectionMap;
};

/**
 * Delete all shadow blocks in the given map.
 * @param {!Object.<string, Blockly.Block>} connectionMap An object mapping
 *     parameter IDs to the blocks that were connected to those IDs at the
 *     beginning of the mutation.
 * @private
 * @this Blockly.Block
 */
Blockly.ScratchBlocks.ProcedureUtils.deleteShadows_ = function(connectionMap) {
  // Get rid of all of the old shadow blocks if they aren't connected.
  if (connectionMap) {
    for (var id in connectionMap) {
      var block = connectionMap[id];
      if (block && block.isShadow()) {
        block.dispose();
        connectionMap[id] = null;
      }
    }
  }
};

/**
 * Create all inputs specified by the new procCode, and populate them with
 * shadow blocks or reconnected old blocks as appropriate.
 * @param {!Object.<string, Blockly.Block>} connectionMap An object mapping
 *     parameter IDs to the blocks that were connected to those IDs at the
 *     beginning of the mutation.
 * @private
 * @this Blockly.Block
 */
Blockly.ScratchBlocks.ProcedureUtils.createAllInputs_ = function(connectionMap) {
  this.paramMap_ = {};
  // Split the proc into components, by %n, %b, and %s (ignoring escaped).
  var procComponents = this.procCode_.split(/(?=[^\\]\%[nbs])/);
  procComponents = procComponents.map(function(c) {
    return c.trim(); // Strip whitespace.
  });
  // Create inputs and shadow blocks as appropriate.
  var inputCount = 0;
  for (var i = 0, component; component = procComponents[i]; i++) {
    var newLabel;
    if (component.substring(0, 1) == '%') {
      var inputType = component.substring(1, 2);
      if (!(inputType == 'n' || inputType == 'b' || inputType == 's')) {
        throw new Error(
            'Found an custom procedure with an invalid type: ' + inputType);
      }
      newLabel = component.substring(2).trim();

      this.createInput_(inputType, inputCount, connectionMap);
      inputCount++;
    } else {
      newLabel = component.trim();
    }
    this.addLabel_(newLabel.replace(/\\%/, '%'));
  }
};

Blockly.ScratchBlocks.ProcedureUtils.addLabelCaller_ = function(text) {
  this.appendDummyInput().appendField(text);
};

Blockly.ScratchBlocks.ProcedureUtils.addLabelMutatorRoot_ = function(text) {
  if (text) {
    this.appendDummyInput(Blockly.utils.genUid()).
        appendField(new Blockly.FieldTextInput(text));
  }
};

/**
 * Build a DOM node representing a shadow block of the given type.
 * @param {string} type One of 's' (string) or 'n' (number).
 * @return {!Element} The DOM node representing the new shadow block.
 * @private
 * @this Blockly.Block
 */
Blockly.ScratchBlocks.ProcedureUtils.buildShadowDom_ = function(type) {
  var shadowDom = goog.dom.createDom('shadow');
  if (type == 'n') {
    var shadowType = 'math_number';
    var fieldName = 'NUM';
    var fieldValue = '10';
  } else {
    var shadowType = 'text';
    var fieldName = 'TEXT';
    var fieldValue = 'hello world';
  }
  shadowDom.setAttribute('type', shadowType);
  var fieldDom = goog.dom.createDom('field', null, fieldValue);
  fieldDom.setAttribute('name', fieldName);
  shadowDom.appendChild(fieldDom);
  return shadowDom;
};

/**
 * Create a new shadow block and attach it to the given input.
 * @param {!Blockly.Input} input The value input to attach a block to.
 * @param {string} inputType One of 'b' (boolean), 's' (string) or 'n' (number).
 * @private
 * @this Blockly.Block
 */
Blockly.ScratchBlocks.ProcedureUtils.attachShadow_ = function(input, inputType) {
  if (inputType == 'n' || inputType == 's') {
    var blockType = inputType == 'n' ? 'math_number' : 'text';
    var newBlock = this.workspace.newBlock(blockType);
    if (inputType == 'n') {
      newBlock.setFieldValue('99', 'NUM');
    } else {
      newBlock.setFieldValue('hello world', 'TEXT');
    }
    newBlock.setShadow(true);
    if (!this.isInsertionMarker()) {
      newBlock.initSvg();
      newBlock.render(false);
    }
    newBlock.outputConnection.connect(input.connection);
  } else {
    input.setCheck('Boolean');
  }
};

/**
 * Create a new argument reporter block and attach it to the given input.
 * This function is used by the procedures_callnoreturn_internal block.
 * TODO (#1213) consider renaming.
 * @param {!Blockly.Input} input The value input to attach a block to.
 * @param {string} inputType One of 'b' (boolean), 's' (string) or 'n' (number).
 * @param {string} argumentName The name of the argument as provided by the
 *     user, which becomes the text of the label on the argument reporter block.
 * @private
 * @this Blockly.Block
 */
Blockly.ScratchBlocks.ProcedureUtils.attachArgumentReporter_ = function(
    input, inputType, argumentName) {
  if (inputType == 'n' || inputType == 's') {
    var blockType = 'argument_reporter_string_number';
  } else {
    var blockType = 'argument_reporter_boolean';
  }
  var newBlock = this.workspace.newBlock(blockType);
  newBlock.setShadow(true);
  newBlock.setFieldValue(argumentName, 'VALUE');
  if (!this.isInsertionMarker()) {
    newBlock.initSvg();
    newBlock.render(false);
  }
  newBlock.outputConnection.connect(input.connection);
};

/**
 * Create an input, attach the correct block to it, and insert it into the
 * params map.
 * This function is used by the procedures_callnoreturn block.
 * @param {string} type One of 'b' (boolean), 's' (string) or 'n' (number).
 * @param {number} index The index of this input into the argument id array.
 * @param {!Object.<string, Blockly.Block>} connectionMap An object mapping
 *     parameter IDs to the blocks that were connected to those IDs at the
 *     beginning of the mutation.
 * @private
 * @this Blockly.Block
 */
Blockly.ScratchBlocks.ProcedureUtils.createInput_ = function(type, index,
    connectionMap) {
  // Shared
  var id = this.argumentIds_[index];
  var oldBlock = null;
  if (connectionMap && (id in connectionMap)) {
    oldBlock = connectionMap[id];
  }
  var input = this.appendValueInput(id);
  if (type == 'b') {
    input.setCheck('Boolean');
  }
  // End shared



  if (connectionMap && oldBlock) {
    // Reattach the old block.
    connectionMap[id] = null;
    oldBlock.outputConnection.connect(input.connection);
    if (type != 'b') {
      input.connection.setShadowDom(this.buildShadowDom_(type));
    }
  } else {
    this.attachShadow_(input, type);
  }
  this.paramMap_[id] = input;
};

/**
 * Create an input, attach the correct block to it, and insert it into the
 * params map.
 * This function is used by the procedures_callnoreturn_internal block.
 * TODO (#1213) consider renaming.
 * @param {string} type One of 'b' (boolean), 's' (string) or 'n' (number).
 * @param {number} index The index of this input into the argument id and name
 *     arrays.
 * @param {!Object.<string, Blockly.Block>} connectionMap An object mapping
 *     parameter IDs to the blocks that were connected to those IDs at the
 *     beginning of the mutation.
 * @private
 * @this Blockly.Block
 */
Blockly.ScratchBlocks.ProcedureUtils.createInputCallerInternal_ = function(type,
    index, connectionMap) {
  // Shared
  var id = this.argumentIds_[index];
  var oldBlock = null;
  if (connectionMap && (id in connectionMap)) {
    oldBlock = connectionMap[id];
  }
  var input = this.appendValueInput(id);
  if (type == 'b') {
    input.setCheck('Boolean');
  }
  // End shared


  var oldTypeMatches =
    Blockly.ScratchBlocks.ProcedureUtils.checkOldTypeMatches_(oldBlock, type);
  var argumentText = this.argumentNames_[index];
  if (connectionMap && oldBlock && oldTypeMatches) {
    // Reattach the old block, and update the text if needed.
    // The old block is the same type, and on the same input, but the input name
    // may have changed.
    oldBlock.setFieldValue(argumentText, 'VALUE');
    connectionMap[id] = null;
    oldBlock.outputConnection.connect(input.connection);
  } else {
    this.attachArgumentReporter_(input, type, argumentText);
  }
  this.paramMap_[id] = input;
};

/**
 * Create an input, attach the correct block to it, and insert it into the
 * params map.
 * This function is used by the procedures_callnoreturn_internal block.
 * TODO (#1213) consider renaming.
 * @param {string} type One of 'b' (boolean), 's' (string) or 'n' (number).
 * @param {number} index The index of this input into the argument id and name
 *     arrays.
 * @param {!Object.<string, Blockly.Block>} connectionMap An object mapping
 *     parameter IDs to the blocks that were connected to those IDs at the
 *     beginning of the mutation.
 * @private
 * @this Blockly.Block
 */
Blockly.ScratchBlocks.ProcedureUtils.createInputMutatorRoot_ = function(type,
    index, connectionMap) {
  // Shared
  var id = this.argumentIds_[index];
  var oldBlock = null;
  if (connectionMap && (id in connectionMap)) {
    oldBlock = connectionMap[id];
  }
  var input = this.appendValueInput(id);
  if (type == 'b') {
    input.setCheck('Boolean');
  }
  // End shared

  var oldTypeMatches =
    Blockly.ScratchBlocks.ProcedureUtils.checkOldTypeMatches_(oldBlock, type);

  var argumentText = this.argumentNames_[index];
  if (connectionMap && oldBlock && oldTypeMatches) {
    oldBlock.setFieldValue(argumentText, 'TEXT');
    connectionMap[id] = null;
    oldBlock.outputConnection.connect(input.connection);
  } else {
    this.attachShadow_(input, type, argumentText);
  }
  this.paramMap_[id] = input;
};

Blockly.ScratchBlocks.ProcedureUtils.checkOldTypeMatches_ = function(oldBlock,
    type) {
  if (!oldBlock) {
    return false;
  }
  if ((type == 'n' || type == 's') &&
      oldBlock.type == 'argument_reporter_string_number') {
    return true;
  }
  if (type == 'b' && oldBlock.type == 'argument_reporter_boolean') {
    return true;
  }
  return false;
};

/**
 * Create a new shadow block and attach it to the given input.
 * @param {!Blockly.Input} input The value input to attach a block to.
 * @param {string} inputType One of 'b' (boolean), 's' (string) or 'n' (number).
 * @private
 * @this Blockly.Block
 */
Blockly.ScratchBlocks.ProcedureUtils.attachShadowMutatorRoot_ = function(input,
    inputType, argumentName) {
  console.log(argumentName);
  if (inputType == 'n' || inputType == 's') {
    var newBlock = this.workspace.newBlock('text');
  } else {
    var newBlock = this.workspace.newBlock('boolean_textinput');
    input.setCheck('Boolean');
  }
  newBlock.setFieldValue(argumentName, 'TEXT');
  newBlock.setShadow(true);
  if (!this.isInsertionMarker()) {
    newBlock.initSvg();
    newBlock.render(false);
  }
  newBlock.outputConnection.connect(input.connection);
};

/**
 * Update the block's structure and appearance to match the internally stored
 * mutation.
 * @private
 * @this Blockly.Block
 */
Blockly.ScratchBlocks.ProcedureUtils.updateDisplay_ = function() {
  var wasRendered = this.rendered;
  this.rendered = false;

  if (this.paramMap_) {
    var connectionMap = this.disconnectOldBlocks_();
    this.removeAllInputs_();
  }

  this.createAllInputs_(connectionMap);
  this.deleteShadows_(connectionMap);

  // TODO: Maybe also bump all old non-shadow blocks explicitly.

  this.rendered = wasRendered;
  if (wasRendered && !this.isInsertionMarker()) {
    this.initSvg();
    this.render();
  }
};

Blockly.ScratchBlocks.ProcedureUtils.updateProcCodeMutatorRoot_ = function() {
  this.procCode_ = '';
  this.argumentNames_ = [];
  this.argumentIds_ = [];
  for (var i = 0; i < this.inputList.length; i++) {
    if (i != 0) {
      this.procCode_ += ' ';
    }
    var input = this.inputList[i];
    if (input.type == Blockly.DUMMY_INPUT) {
      this.procCode_ += input.fieldRow[0].getValue();
    } else if (input.type == Blockly.INPUT_VALUE) {
      var target = input.connection.targetBlock();
      this.argumentNames_.push(target.getFieldValue('TEXT'));
      this.argumentIds_.push(input.name);
      if (target.type == 'boolean_textinput') {
        this.procCode_ += '%b';
      } else {
        this.procCode_ += '%s';
      }
    } else {
      throw new Error(
          'Unexpected input type on a procedure mutator root: ' + input.type);
    }
  }
};

Blockly.ScratchBlocks.ProcedureUtils.addLabelExternal = function() {
  this.procCode_ = this.procCode_ + ' label text';
  this.updateDisplay_();
};

Blockly.ScratchBlocks.ProcedureUtils.addBooleanExternal = function() {
  this.procCode_ = this.procCode_ + ' %b';
  this.argumentNames_.push('boolean');
  this.argumentIds_.push(Blockly.utils.genUid());
  this.argumentDefaults_.push('todo');
  this.updateDisplay_();
};

Blockly.ScratchBlocks.ProcedureUtils.addStringNumberExternal = function() {
  this.procCode_ = this.procCode_ + ' %s';
  this.argumentNames_.push('string or number');
  this.argumentIds_.push(Blockly.utils.genUid());
  this.argumentDefaults_.push('todo');
  this.updateDisplay_();
};

Blockly.Blocks['procedures_defnoreturn'] = {
  /**
   * Block for defining a procedure with no return value.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "define %1",
      "args0": [
        {
          "type": "input_statement",
          "name": "custom_block"
        }
      ],
      "extensions": ["colours_more", "shape_hat", "procedure_def_contextmenu"]
    });
  }
};

Blockly.Blocks['procedures_callnoreturn'] = {
  /**
   * Block for calling a procedure with no return value.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "extensions": ["colours_more", "shape_statement", "procedure_call_contextmenu"]
    });
    this.procCode_ = '';
    /**
     * @type {!Object.<string, Blockly.Block>}
     * An object mapping parameter IDs to the blocks that are connected to those
     * IDs.
     */
    this.paramMap_ = null;
  },
  getProcCode: Blockly.ScratchBlocks.ProcedureUtils.getProcCode,
  mutationToDom: Blockly.ScratchBlocks.ProcedureUtils.callerMutationToDom,
  domToMutation: Blockly.ScratchBlocks.ProcedureUtils.callerDomToMutation,
  removeAllInputs_: Blockly.ScratchBlocks.ProcedureUtils.removeAllInputs_,
  disconnectOldBlocks_: Blockly.ScratchBlocks.ProcedureUtils.disconnectOldBlocks_,
  deleteShadows_: Blockly.ScratchBlocks.ProcedureUtils.deleteShadows_,
  createAllInputs_: Blockly.ScratchBlocks.ProcedureUtils.createAllInputs_,
  buildShadowDom_: Blockly.ScratchBlocks.ProcedureUtils.buildShadowDom_,
  createInput_: Blockly.ScratchBlocks.ProcedureUtils.createInput_,
  updateDisplay_: Blockly.ScratchBlocks.ProcedureUtils.updateDisplay_,
  reattachBlock_: Blockly.ScratchBlocks.ProcedureUtils.reattachBlock_,
  attachShadow_: Blockly.ScratchBlocks.ProcedureUtils.attachShadow_,
  addLabel_: Blockly.ScratchBlocks.ProcedureUtils.addLabelCaller_
};

Blockly.Blocks['procedures_callnoreturn_internal'] = {
  /**
   * Block for calling a procedure with no return value, for rendering inside
   * define block.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "extensions": ["colours_more", "shape_statement"]
    });

    /* Data known about the procedure. */
    this.procCode_ = '';
    this.argumentNames_ = [];
    this.argumentDefaults_ = [];
    this.warp_ = false;

    /**
     * @type {!Object.<string, Blockly.Block>}
     * An object mapping parameter IDs to the blocks that are connected to those
     * IDs.
     */
    this.paramMap_ = null;
  },
  getProcCode: Blockly.ScratchBlocks.ProcedureUtils.getProcCode,
  mutationToDom: Blockly.ScratchBlocks.ProcedureUtils.definitionMutationToDom,
  domToMutation: Blockly.ScratchBlocks.ProcedureUtils.definitionDomToMutation,
  removeAllInputs_: Blockly.ScratchBlocks.ProcedureUtils.removeAllInputs_,
  disconnectOldBlocks_: Blockly.ScratchBlocks.ProcedureUtils.disconnectOldBlocks_,
  deleteShadows_: Blockly.ScratchBlocks.ProcedureUtils.deleteShadows_,
  createAllInputs_: Blockly.ScratchBlocks.ProcedureUtils.createAllInputs_,
  createInput_: Blockly.ScratchBlocks.ProcedureUtils.createInputCallerInternal_,
  updateDisplay_: Blockly.ScratchBlocks.ProcedureUtils.updateDisplay_,
  reattachBlock_: Blockly.ScratchBlocks.ProcedureUtils.reattachBlock_,
  attachArgumentReporter_: Blockly.ScratchBlocks.ProcedureUtils.attachArgumentReporter_,
  addLabel_: Blockly.ScratchBlocks.ProcedureUtils.addLabelCaller_
};

Blockly.Blocks['procedures_param'] = {
  /**
   * Block for a parameter.
   * @this Blockly.Block
   */
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldLabel(), 'paramName');

    this.setPreviousStatement(false);
    this.setNextStatement(false);
    this.setOutput(true);

    this.setCategory(Blockly.Categories.more);
    this.setColour(Blockly.Colours.more.primary,
      Blockly.Colours.more.secondary,
      Blockly.Colours.more.tertiary);
    this._paramName = 'undefined';
    this._shape = 'r';
  },
  /**
   * Create XML to represent the (non-editable) name and arguments.
   * @return {!Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('paramname', this._paramName);
    container.setAttribute('shape', this._shape);
    return container;
  },
  /**
   * Parse XML to restore the (non-editable) name and parameters.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    this._paramName = xmlElement.getAttribute('paramname');
    this._shape = xmlElement.getAttribute('shape');
    this.updateDisplay_();
  },
  updateDisplay_: function() {
    this.setFieldValue(this._paramName, 'paramName');
    switch (this._shape) {
      case 'b':
        this.setOutputShape(Blockly.OUTPUT_SHAPE_HEXAGONAL);
        this.setOutput(true, 'Boolean');
        break;
      case 's':
      default:
        this.setOutputShape(Blockly.OUTPUT_SHAPE_ROUND);
        this.setOutput(true, 'String');
        break;
    }
  }
};

Blockly.Blocks['argument_reporter_boolean'] = {
  init: function() {
    this.jsonInit({ "message0": " %1",
      "args0": [
        {
          "type": "field_label_serializable",
          "name": "VALUE",
          "text": ""
        }
      ],
      "extensions": ["colours_more", "output_boolean"]
    });
  }
};

Blockly.Blocks['argument_reporter_string_number'] = {
  init: function() {
    this.jsonInit({ "message0": " %1",
      "args0": [
        {
          "type": "field_label_serializable",
          "name": "VALUE",
          "text": ""
        }
      ],
      "extensions": ["colours_more", "output_number", "output_string"]
    });
  }
};

Blockly.Blocks['boolean_textinput'] = {
  init: function() {
    this.jsonInit({ "message0": " %1",
      "args0": [
        {
          "type": "field_input",
          "name": "TEXT",
          "text": "foo"
        }
      ],
      "colour": Blockly.Colours.textField,
      "colourSecondary": Blockly.Colours.textField,
      "colourTertiary": Blockly.Colours.textField,
      "extensions": ["output_boolean"]
    });
  }
};

Blockly.Blocks['procedures_mutator_root'] = {
  /**
   * The root block in the procedure editing workspace.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "extensions": ["colours_more", "shape_statement"]
    });
    /* Data known about the procedure. */
    this.procCode_ = '';
    this.argumentNames_ = [];
    this.argumentDefaults_ = [];
    this.warp_ = false;

    /**
     * @type {!Object.<string, Blockly.Block>}
     * An object mapping parameter IDs to the blocks that are connected to those
     * IDs.
     */
    this.paramMap_ = null;
  },
  getProcCode: Blockly.ScratchBlocks.ProcedureUtils.getProcCode,
  mutationToDom: Blockly.ScratchBlocks.ProcedureUtils.definitionMutationToDom,
  domToMutation: Blockly.ScratchBlocks.ProcedureUtils.definitionDomToMutation,
  removeAllInputs_: Blockly.ScratchBlocks.ProcedureUtils.removeAllInputs_,
  disconnectOldBlocks_: Blockly.ScratchBlocks.ProcedureUtils.disconnectOldBlocks_,
  deleteShadows_: Blockly.ScratchBlocks.ProcedureUtils.deleteShadows_,
  createAllInputs_: Blockly.ScratchBlocks.ProcedureUtils.createAllInputs_,
  createInput_: Blockly.ScratchBlocks.ProcedureUtils.createInputMutatorRoot_,
  updateDisplay_: Blockly.ScratchBlocks.ProcedureUtils.updateDisplay_,
  attachShadow_: Blockly.ScratchBlocks.ProcedureUtils.attachShadowMutatorRoot_,
  addLabel_: Blockly.ScratchBlocks.ProcedureUtils.addLabelMutatorRoot_,
  addLabelExternal: Blockly.ScratchBlocks.ProcedureUtils.addLabelExternal,
  addBooleanExternal: Blockly.ScratchBlocks.ProcedureUtils.addBooleanExternal,
  addStringNumberExternal: Blockly.ScratchBlocks.ProcedureUtils.addStringNumberExternal,
  onChangeFn: Blockly.ScratchBlocks.ProcedureUtils.updateProcCodeMutatorRoot_
};

