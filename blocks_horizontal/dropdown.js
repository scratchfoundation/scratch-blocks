/**
 * @fileoverview Dropdown shadow blocks for Scratch (Horizontal)
 * @author tmickel@mit.edu <Tim Mickel>
 */
'use strict';

goog.provide('Blockly.Blocks.DropDown');

goog.require('Blockly.Blocks');

Blockly.Blocks['dropdown_icon'] = {
  /**
   * Block for icon dropdown (used for shadow).
   * @this Blockly.Block
   */
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldIconMenu(), 'CHOICE');
    this.setOutput(true);
  }
};
