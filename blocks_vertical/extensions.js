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

goog.provide('Blockly.Blocks.extensions');

goog.require('Blockly.Blocks');
goog.require('Blockly.constants');

Blockly.Blocks['extensions_block'] = {
  /**
   * Block for calling a procedure with no return value.
   * @this Blockly.Block
   */
  init: function() {
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setCategory(Blockly.Categories.extensions);
    this.setColour(Blockly.Colours.extensions.primary,
      Blockly.Colours.extensions.secondary,
      Blockly.Colours.extensions.tertiary);
    this._spec = '';
    this._id = '';
  },
  /**
   * Create XML to represent the (non-editable) name and arguments.
   * @return {!Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('spec', this._spec);
    container.setAttribute('id', this._id);
    return container;
  },
  /**
   * Parse XML to restore the (non-editable) name and parameters.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    this._spec = xmlElement.getAttribute('spec');
    this._id = xmlElement.getAttribute('id');
    this._updateDisplay();
  },
  _updateDisplay: function() {
    // Split the proc into components, by %n, %b, and %s (ignoring escaped).
    var procComponents = this._spec.split(/(?=[^\\]\%[nbs])/);
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
          case 'c':
            var input = this.appendValueInput(inputName);
            var colour = this.workspace.newBlock('colour_picker');
            colour.setShadow(true);
            colour.outputConnection.connect(input.connection);
            break;
        }
      } else {
        newLabel = component.trim();
      }
      this.appendDummyInput().appendField(newLabel.replace(/\\%/, '%'));
    }
  }
};

Blockly.Blocks['extensions_hat'] = {
  /**
   * Block for calling a procedure with no return value.
   * @this Blockly.Block
   */
  init: function() {
    this.setPreviousStatement(false);
    this.setNextStatement(true);
    this.setCategory(Blockly.Categories.extensions);
    this.setColour(Blockly.Colours.extensions.primary,
      Blockly.Colours.extensions.secondary,
      Blockly.Colours.extensions.tertiary);
    this._spec = '';
    this._id = '';
  },
  /**
   * Create XML to represent the (non-editable) name and arguments.
   * @return {!Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('spec', this._spec);
    container.setAttribute('id', this._id);
    return container;
  },
  /**
   * Parse XML to restore the (non-editable) name and parameters.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    this._spec = xmlElement.getAttribute('spec');
    this._id = xmlElement.getAttribute('id');
    this._updateDisplay();
  },
  _updateDisplay: function() {
    // Split the proc into components, by %n, %b, and %s (ignoring escaped).
    var procComponents = this._spec.split(/(?=[^\\]\%[nbs])/);
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
          case 'c':
            var input = this.appendValueInput(inputName);
            var colour = this.workspace.newBlock('colour_picker');
            colour.setShadow(true);
            colour.outputConnection.connect(input.connection);
            break;
        }
      } else {
        newLabel = component.trim();
      }
      this.appendDummyInput().appendField(newLabel.replace(/\\%/, '%'));
    }
  }
};

Blockly.Blocks['extensions_reporter'] = {
  /**
   * Block for calling a procedure with no return value.
   * @this Blockly.Block
   */
  init: function() {
    this.setPreviousStatement(false);
    this.setNextStatement(false);
    this.setOutputShape(Blockly.OUTPUT_SHAPE_ROUND);
    this.setOutput(true, 'String');
    this.setCategory(Blockly.Categories.extensions);
    this.setColour(Blockly.Colours.extensions.primary,
      Blockly.Colours.extensions.secondary,
      Blockly.Colours.extensions.tertiary);
    this._spec = '';
    this._id = '';
  },
  /**
   * Create XML to represent the (non-editable) name and arguments.
   * @return {!Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('spec', this._spec);
    container.setAttribute('id', this._id);
    return container;
  },
  /**
   * Parse XML to restore the (non-editable) name and parameters.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    this._spec = xmlElement.getAttribute('spec');
    this._id = xmlElement.getAttribute('id');
    this._updateDisplay();
  },
  _updateDisplay: function() {
    // Split the proc into components, by %n, %b, and %s (ignoring escaped).
    var procComponents = this._spec.split(/(?=[^\\]\%[nbs])/);
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
          case 'c':
            var input = this.appendValueInput(inputName);
            var colour = this.workspace.newBlock('colour_picker');
            colour.setShadow(true);
            colour.outputConnection.connect(input.connection);
            break;
        }
      } else {
        newLabel = component.trim();
      }
      this.appendDummyInput().appendField(newLabel.replace(/\\%/, '%'));
    }
  }
};

Blockly.Blocks['extensions_boolean'] = {
  /**
   * Block for calling a procedure with no return value.
   * @this Blockly.Block
   */
  init: function() {
    this.setPreviousStatement(false);
    this.setNextStatement(false);
    this.setOutputShape(Blockly.OUTPUT_SHAPE_HEXAGONAL);
    this.setOutput(true, 'Boolean');
    this.setCategory(Blockly.Categories.extensions);
    this.setColour(Blockly.Colours.extensions.primary,
      Blockly.Colours.extensions.secondary,
      Blockly.Colours.extensions.tertiary);
    this._spec = '';
    this._id = '';
  },
  /**
   * Create XML to represent the (non-editable) name and arguments.
   * @return {!Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('spec', this._spec);
    container.setAttribute('id', this._id);
    return container;
  },
  /**
   * Parse XML to restore the (non-editable) name and parameters.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    this._spec = xmlElement.getAttribute('spec');
    this._id = xmlElement.getAttribute('id');
    this._updateDisplay();
  },
  _updateDisplay: function() {
    // Split the proc into components, by %n, %b, and %s (ignoring escaped).
    var procComponents = this._spec.split(/(?=[^\\]\%[nbs])/);
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
          case 'c':
            var input = this.appendValueInput(inputName);
            var colour = this.workspace.newBlock('colour_picker');
            colour.setShadow(true);
            colour.outputConnection.connect(input.connection);
            break;
        }
      } else {
        newLabel = component.trim();
      }
      this.appendDummyInput().appendField(newLabel.replace(/\\%/, '%'));
    }
  }
};
