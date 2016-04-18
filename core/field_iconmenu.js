/**
 * @fileoverview Icon picker input field.
 * @author tmickel@mit.edu (Tim Mickel)
 */
'use strict';

goog.provide('Blockly.FieldIconMenu');

goog.require('Blockly.DropDownDiv');

/**
 * Class for an icon menu field.
 * @param {Object} icons List of icons and their associated text.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldIconMenu = function(icons) {
  this.icons_ = icons;
  Blockly.FieldIconMenu.superClass_.constructor.call(this);
};
goog.inherits(Blockly.FieldIconMenu, Blockly.Field);

/**
 * Called when the field is placed on a block.
 * @param {Block} block The owning block.
 */
Blockly.FieldIconMenu.prototype.init = function(block) {
  // Render the arrow icon
  var arrowSize = 12;
  var arrowX = 18;
  var arrowY = 10;
  if (block.RTL) {
    arrowX = -arrowX - arrowSize;
  }
  this.arrowIcon_ = Blockly.createSvgElement('image', {
    'height': arrowSize + 'px',
    'width': arrowSize + 'px',
    'transform': 'translate(' + arrowX + ',' + arrowY + ')'
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
  // Set up contents of the drop-down
  var contentDiv = Blockly.DropDownDiv.getContentDiv();
  for (var i = 0, icon; icon = this.icons_[i]; i++) {
    var button = document.createElement('button');
    button.setAttribute('class', 'blocklyDropDownButton');
    var buttonImg = document.createElement('img');
    buttonImg.src = icon[0];
    button.appendChild(buttonImg);
    button.style.backgroundColor = this.sourceBlock_.getColour();
    button.style.borderColor = this.sourceBlock_.getColourTertiary();
    contentDiv.appendChild(button);
  }
  contentDiv.style.width = '180px';
  // Calculate positioning for the drop-down
  var scale = this.sourceBlock_.workspace.scale;
  var bBox = this.sourceBlock_.getHeightWidth();
  bBox.width *= scale;
  bBox.height *= scale;
  var position = this.getAbsoluteXY_();
  // If we can fit it, render below the shadow block
  var primaryX = position.x + bBox.width / 2;
  var primaryY = position.y + bBox.height;
  // If we can't fit it, render above the entire block
  var secondaryX = primaryX;
  var secondaryY = position.y - Blockly.BlockSvg.MIN_BLOCK_Y * scale - Blockly.BlockSvg.FIELD_Y_OFFSET * scale;

  Blockly.DropDownDiv.setColour(this.sourceBlock_.getColour(), this.sourceBlock_.getColourTertiary());
  Blockly.DropDownDiv.setBoundsElement(this.sourceBlock_.workspace.getParentSvg().parentNode);
  Blockly.DropDownDiv.show(primaryX, primaryY, secondaryX, secondaryY);
};
