/**
 * @fileoverview Icon picker input field.
 * @author tmickel@mit.edu (Tim Mickel)
 */
'use strict';

goog.provide('Blockly.FieldIconMenu');

goog.require('Blockly.DropDownDiv');

/**
 * Class for an icon menu field.
 * @param {string} text Text representation of initial icon.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldIconMenu = function(text) {
  Blockly.FieldIconMenu.superClass_.constructor.call(this);
};
goog.inherits(Blockly.FieldIconMenu, Blockly.Field);

Blockly.FieldIconMenu.prototype.init = function(block) {
  // Render the arrow icon
  this.arrowIcon_ = Blockly.createSvgElement('image', {
    'height': '12px',
    'width': '12px',
    'transform': 'translate(18, 10)'
  });
  this.arrowIcon_.setAttributeNS('http://www.w3.org/1999/xlink',
      'xlink:href', Blockly.mainWorkspace.options.pathToMedia + 'dropdown-arrow.svg');
  block.getSvgRoot().appendChild(this.arrowIcon_);
  Blockly.FieldIconMenu.superClass_.init.call(this, block);
};

/**
 * Mouse cursor style when over the hotspot that initiates the editor.
 */
Blockly.FieldIconMenu.prototype.CURSOR = 'default';

/**
 * Close the input widget if this input is being deleted.
 */
Blockly.FieldIconMenu.prototype.dispose = function() {
  Blockly.FieldIconMenu.superClass_.dispose.call(this);
};

/**
 * Set the text in this field.
 * @param {?string} text New text.
 * @override
 */
Blockly.FieldIconMenu.prototype.setValue = function(text) {
  if (text === null) {
    return;  // No change if null.
  }
  Blockly.Field.prototype.setValue.call(this, text);
};

/**
 * Show the menu.
 * @private
 */
Blockly.FieldIconMenu.prototype.showEditor_ = function() {
  console.log("show menu");
};
