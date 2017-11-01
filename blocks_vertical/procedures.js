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
 * Create XML to represent the (non-editable) name and arguments.
 * @return {!Element} XML storage element.
 * @this Blockly.Block
 */
Blockly.ScratchBlocks.ProcedureUtils.callerMutationToDom = function() {
  var container = document.createElement('mutation');
  container.setAttribute('proccode', this.procCode_);
  container.setAttribute('argumentids', JSON.stringify(this.argumentIds_));
  return container;
};

/**
 * Parse XML to restore the (non-editable) name and parameters.
 * @param {!Element} xmlElement XML storage element.
 * @this Blockly.Block
 */
Blockly.ScratchBlocks.ProcedureUtils.callerDomToMutation = function(xmlElement) {
  this.procCode_ = xmlElement.getAttribute('proccode');
  this.argumentIds_ = JSON.parse(xmlElement.getAttribute('argumentids'));
  this._updateDisplay();
};
// TODO: Doc
Blockly.ScratchBlocks.ProcedureUtils.removeAllInputs_ = function() {
  // remove all inputs, including dummy inputs.
  for (var i = 0, input; input = this.inputList[i]; i++) {
    if (input.connection && input.connection.targetBlock()) {
      console.warn("connection was still attached?!");
    }
    input.dispose();
  }
  this.inputList = [];
};
// TODO: Doc
Blockly.ScratchBlocks.ProcedureUtils.disconnectOldBlocks_ = function() {
  // Remove old stuff
  var connectionMap = {};
  for (var id in this.paramMap_) {
    var input = this.paramMap_[id];
    console.log(id + ' ' + input);
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
// TODO: Doc.
Blockly.ScratchBlocks.ProcedureUtils.deleteOldShadows_ = function(connectionMap) {
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
// TODO: Doc.
Blockly.ScratchBlocks.ProcedureUtils.createAllInputs_ = function(connectionMap) {
  var params = {};
  // Split the proc into components, by %n, %b, and %s (ignoring escaped).
  var procComponents = this.procCode_.split(/(?=[^\\]\%[nbs])/);
  procComponents = procComponents.map(function(c) {
    return c.trim(); // Strip whitespace.
  });
  // Create inputs and shadow blocks as appropriate.
  var inputPrefix = 'input';
  var inputCount = 0;
  for (var i = 0, component; component = procComponents[i]; i++) {
    var newLabel;
    if (component.substring(0, 1) == '%') {
      var inputType = component.substring(1, 2);
      newLabel = component.substring(2).trim();

      var id = this.argumentIds_[inputCount];
      var oldBlock = null;
      if (connectionMap && (id in connectionMap)) {
        oldBlock = connectionMap[id];
      }

      var inputName = inputPrefix + (inputCount++);
      var input = this.createInput_(inputType, inputName, oldBlock, id,
          connectionMap);
      params[id] = input;
    } else {
      newLabel = component.trim();
    }
    this.appendDummyInput().appendField(newLabel.replace(/\\%/, '%'));
  }
  return params;
};
// TODO: Doc, refactor.
Blockly.ScratchBlocks.ProcedureUtils.buildShadowDom_ = function(type) {
  var xmlStart = '<xml xmlns="http://www.w3.org/1999/xhtml">';
  var xmlEnd = '</xml>';
  var shadow = '';
  switch (type) {
    case 'n':
      shadow = '<shadow type="math_number">' +
          '<field name="NUM">10</field>' +
          '</shadow>';
      break;
    case 's':
      shadow = '<shadow type="text"></shadow>';
      break;
    default:
      console.warn('Unexpected type in buildShadowDom_: ' + type);
  }
  return Blockly.Xml.textToDom(xmlStart + shadow + xmlEnd).firstChild;
};

Blockly.ScratchBlocks.ProcedureUtils.reattachBlock_ = function(input, inputType,
    oldBlock, id, connectionMap) {
  if (inputType == 'b') {
    input.setCheck('Boolean');
  } else if (inputType == 'n' || inputType == 's') {
    input.connection.setShadowDom(this.buildShadowDom_(inputType));
  } else {
    console.warn('Found an unexpected input type: ' + inputType);
  }
  connectionMap[id] = null;
  oldBlock.outputConnection.connect(input.connection);
};

Blockly.ScratchBlocks.ProcedureUtils.attachShadow_ = function(input, inputType) {
// There was no connection map or no old block to reattach.
  if (inputType == 'b') {
    input.setCheck('Boolean');
  } else if (inputType == 'n' || inputType == 's') {
    var blockType = inputType == 'n' ? 'math_number' : 'text';
    var newBlock = this.workspace.newBlock(blockType);
    newBlock.setShadow(true);
    if (!this.isInsertionMarker()) {
      newBlock.initSvg();
      newBlock.render(false);
    }
    newBlock.outputConnection.connect(input.connection);
  } else {
    console.warn('Found an unexpected input type: ' + inputType);
  }
};

// TODO: Doc.
Blockly.ScratchBlocks.ProcedureUtils.createInput_ = function(inputType,
    inputName, oldBlock, id, connectionMap) {
  var input = this.appendValueInput(inputName);
  if (connectionMap && oldBlock) {
    this.reattachBlock_(input, inputType, oldBlock, id, connectionMap);
  } else {
    this.attachShadow_(input, inputType);
  }
  return input;
};
// TODO: Doc, move underscore to end.
Blockly.ScratchBlocks.ProcedureUtils._updateDisplay = function() {
  var wasRendered = this.rendered;
  this.rendered = false;

  if (this.paramMap_) {
    var connectionMap = this.disconnectOldBlocks_();
    this.removeAllInputs_();
  }

  this.paramMap_ = this.createAllInputs_(connectionMap);
  this.deleteOldShadows_(connectionMap);

  // TODO: Maybe also bump all old non-shadow blocks explicitly.

  this.rendered = wasRendered;
  if (wasRendered && !this.isInsertionMarker()) {
    this.initSvg();
    this.render();
  }
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
  },
  getProcCode: Blockly.ScratchBlocks.ProcedureUtils.getProcCode,
  mutationToDom: Blockly.ScratchBlocks.ProcedureUtils.callerMutationToDom,
  domToMutation: Blockly.ScratchBlocks.ProcedureUtils.callerDomToMutation,
  removeAllInputs_: Blockly.ScratchBlocks.ProcedureUtils.removeAllInputs_,
  disconnectOldBlocks_: Blockly.ScratchBlocks.ProcedureUtils.disconnectOldBlocks_,
  deleteOldShadows_: Blockly.ScratchBlocks.ProcedureUtils.deleteOldShadows_,
  createAllInputs_: Blockly.ScratchBlocks.ProcedureUtils.createAllInputs_,
  buildShadowDom_: Blockly.ScratchBlocks.ProcedureUtils.buildShadowDom_,
  createInput_: Blockly.ScratchBlocks.ProcedureUtils.createInput_,
  _updateDisplay: Blockly.ScratchBlocks.ProcedureUtils._updateDisplay,
  reattachBlock_: Blockly.ScratchBlocks.ProcedureUtils.reattachBlock_,
  attachShadow_: Blockly.ScratchBlocks.ProcedureUtils.attachShadow_
};

Blockly.Blocks['procedures_callnoreturn_internal'] = {
  /**
   * Block for calling a procedure with no return value, for rendering inside
   * define block.
   * @this Blockly.Block
   */
  init: function() {
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setCategory(Blockly.Categories.more);
    this.setColour(Blockly.Colours.more.primary,
      Blockly.Colours.more.secondary,
      Blockly.Colours.more.tertiary);

    /* Data known about the procedure. */
    this.procCode_ = '';
    this.argumentNames_ = [];
    this.argumentDefaults_ = [];
    this.warp_ = false;
  },
  /**
   * Returns the name of the procedure this block calls, or the empty string if
   * it has not yet been set.
   * @return {string} Procedure name.
   * @this Blockly.Block
   */
  getProcCode: function() {
    return this.procCode_;
  },
  /**
   * Create XML to represent the (non-editable) name and arguments.
   * @return {!Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {

    var container = document.createElement('mutation');
    container.setAttribute('proccode', this.procCode_);
    container.setAttribute('argumentnames', JSON.stringify(this.argumentNames_));
    container.setAttribute('argumentdefaults', JSON.stringify(this.argumentDefaults_));
    container.setAttribute('argumentids', JSON.stringify(this.argumentIds_));
    container.setAttribute('warp', this.warp_);
    return container;
  },
  /**
   * Parse XML to restore the (non-editable) name and parameters.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    this.procCode_ = xmlElement.getAttribute('proccode');
    this.argumentNames_ =  JSON.parse(xmlElement.getAttribute('argumentnames'));
    this.argumentDefaults_ =  JSON.parse(xmlElement.getAttribute('argumentdefaults'));
    this.argumentIds_ = JSON.parse(xmlElement.getAttribute('argumentids'));
    this.warp_ = xmlElement.getAttribute('warp');
    this.updateDisplay_();

  },
  updateDisplay_: function() {
    // Remove old stuff
    if (this.params_) {
      for (var id in this.params_) {
        console.log(id + ' ' + this.params[id]);
      }
    }
    var params = {};
    // Split the proc into components, by %n, %b, and %s (ignoring escaped).
    var procComponents = this.procCode_.split(/(?=[^\\]\%[nbs])/);
    procComponents = procComponents.map(function(c) {
      return c.trim(); // Strip whitespace.
    });
    // Create inputs and shadow blocks as appropriate.
    var inputPrefix = 'input';
    var inputCount = 0;
    for (var i = 0, component; component = procComponents[i]; i++) {
      var newLabel;
      if (component.substring(0, 1) == '%') {
        var inputType = component.substring(1, 2);
        newLabel = component.substring(2).trim();
        var inputName = inputPrefix + inputCount;
        var blockType = '';
        switch (inputType) {
          case 'n':
            blockType = 'argument_reporter_string_number';
            break;
          case 'b':
            blockType = 'argument_reporter_boolean';
            break;
          case 's':
            blockType = 'argument_reporter_string_number';
            break;
        }
        if (blockType) {
          var id = this.argumentIds_[inputCount];

          var argumentName = this.argumentNames_[inputCount];
          var shadow = goog.dom.createDom('shadow');
          shadow.setAttribute('type', blockType);
          var field = goog.dom.createDom('field', null, argumentName);
          field.setAttribute('name', 'VALUE');
          shadow.appendChild(field);
          var input = this.appendValueInput(inputName);
          var newBlock = Blockly.Xml.domToBlock(shadow, this.workspace);
          newBlock.outputConnection.connect(input.connection);
          params[id] = input.connection;
        }
        inputCount++;
      } else {
        newLabel = component.trim();
      }
      this.appendDummyInput().appendField(newLabel.replace(/\\%/, '%'));
    }
    this.paramMap_ = params;
  }
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
    this._updateDisplay();
  },
  _updateDisplay: function() {
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
  },
  /**
   * Returns the name of the procedure this block calls, or the empty string if
   * it has not yet been set.
   * @return {string} Procedure name.
   * @this Blockly.Block
   */
  getProcCode: function() {
    return this.procCode_;
  },
  /**
   * Create XML to represent the (non-editable) name and arguments.
   * @return {!Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {

    var container = document.createElement('mutation');
    container.setAttribute('proccode', this.procCode_);
    container.setAttribute('argumentnames', JSON.stringify(this.argumentNames_));
    container.setAttribute('argumentdefaults', JSON.stringify(this.argumentDefaults_));
    container.setAttribute('argumentids', JSON.stringify(this.argumentIds_));
    container.setAttribute('warp', this.warp_);
    return container;
  },
  /**
   * Parse XML to restore the (non-editable) name and parameters.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    this.procCode_ = xmlElement.getAttribute('proccode');
    this.argumentNames_ =  JSON.parse(xmlElement.getAttribute('argumentnames'));
    this.argumentDefaults_ =  JSON.parse(xmlElement.getAttribute('argumentdefaults'));
    this.argumentIds_ = JSON.parse(xmlElement.getAttribute('argumentids'));
    this.warp_ = xmlElement.getAttribute('warp');
    //this.updateDisplay_();
  }
};

