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

Blockly.Blocks['procedures_defnoreturn'] = {
  /**
   * Block for defining a procedure with no return value.
   * @this Blockly.Block
   */
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldLabel(), 'procCode');
    this.appendDummyInput()
        .appendField(new Blockly.FieldLabel(), 'argumentNames');
    this.appendDummyInput()
        .appendField(new Blockly.FieldLabel(), 'argumentDefaults');
    this.appendDummyInput()
        .appendField(new Blockly.FieldLabel(), 'warp');
    this.setCategory(Blockly.Categories.more);
    this.setColour(Blockly.Colours.more.primary,
      Blockly.Colours.more.secondary,
      Blockly.Colours.more.tertiary);
    this.setNextStatement(true);

    /* Data known about the procedure. */
    this._procCode = '';
    this._argumentNames = [];
    this._argumentDefaults = [];
    this._warp = false;
  },
  mutationToDom: function() {
    var container = document.createElement('mutation');
    var procCode = document.createElement('proccode');
    procCode.setAttribute('value', this._procCode);
    container.appendChild(procCode);
    var argumentNames = document.createElement('argumentnames');
    argumentNames.setAttribute('value', JSON.stringify(this._argumentNames));
    container.appendChild(argumentNames);
    var argumentDefaults = document.createElement('argumentdefaults');
    argumentDefaults.setAttribute('value', JSON.stringify(this._argumentDefaults));
    container.appendChild(argumentDefaults);
    var warp = document.createElement('warp');
    warp.setAttribute('value', this._warp);
    container.appendChild(warp);
    return container;
  },
  domToMutation: function(xmlElement) {
    this._procCode = xmlElement.getAttribute('proccode');
    this._argumentNames =  JSON.parse(xmlElement.getAttribute('argumentnames'));
    this._argumentValues =  JSON.parse(xmlElement.getAttribute('argumentvalues'));
    this._warp = xmlElement.getAttribute('warp');
    this._updateDisplay();
  },
  _updateDisplay: function() {
    this.setFieldValue(this._procCode, 'procCode');
    this.setFieldValue(this._argumentNames, 'argumentNames');
    this.setFieldValue(this._argumentDefaults, 'argumentDefaults');
    this.setFieldValue(this._warp, 'warp');
  }
};


Blockly.Blocks['procedures_callnoreturn'] = {
  /**
   * Block for calling a procedure with no return value.
   * @this Blockly.Block
   */
  init: function() {
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setCategory(Blockly.Categories.more);
    this.setColour(Blockly.Colours.more.primary,
      Blockly.Colours.more.secondary,
      Blockly.Colours.more.tertiary);
    this._procCode = '';
  },
  /**
   * Create XML to represent the (non-editable) name and arguments.
   * @return {!Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('proccode', this._procCode);
    return container;
  },
  /**
   * Parse XML to restore the (non-editable) name and parameters.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    this._procCode = xmlElement.getAttribute('proccode');
    this._updateDisplay();
  },
  _updateDisplay: function() {
    // Split the proc into components, by %n, %b, and %s (ignoring escaped).
    var procComponents = this._procCode.split(/(?=[^\\]\%[nbs])/);
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
        var inputName = inputPrefix + (inputCount++);
        switch (inputType) {
          case 'n':
            var input = this.appendValueInput(inputName);
            var num = this.workspace.newBlock('math_number');
            num.setShadow(true);
            num.outputConnection.connect(input.connection);
            break;
          case 'b':
            var input = this.appendValueInput(inputName);
            input.setCheck('Boolean');
            break;
          case 's':
            var input = this.appendValueInput(inputName);
            var text = this.workspace.newBlock('text');
            text.setShadow(true);
            text.outputConnection.connect(input.connection);
            break;
        }
      } else {
        newLabel = component.trim();
      }
      this.appendDummyInput().appendField(newLabel.replace(/\\%/, '%'));
    }
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
