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
        .appendField(new Blockly.FieldIconMenu([
          {src: Blockly.mainWorkspace.options.pathToMedia + 'icons/LetterGet_Blue.svg',
            value: 'blue', width: 50, height: 50, alt: 'Blue'}
        ]), 'CHOICE');
    this.setOutput(true);
  }
};
