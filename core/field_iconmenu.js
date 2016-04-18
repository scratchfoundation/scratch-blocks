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
  var defaultValue = icons[0].value;
  Blockly.FieldIconMenu.superClass_.constructor.call(this, defaultValue);
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
* Set the language-neutral value for this dropdown menu.
 * @param {?string} newValue New value.
 * @override
 */
Blockly.FieldIconMenu.prototype.setValue = function(newValue) {
  if (newValue === null || newValue === this.value_) {
    return;  // No change
  }
  if (this.sourceBlock_ && Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.Change(
        this.sourceBlock_, 'field', this.name, this.value_, newValue));
  }
  for (var i = 0, icon; icon = this.icons_[i]; i++) {
    if (icon.value === newValue) {
      this.value_ = newValue;
      this.setParentImageField_(icon.src);
      return;
    }
  }
};

Blockly.FieldIconMenu.prototype.setParentImageField_ = function(newSrc) {
  if (this.sourceBlock_) {
    var parentBlock = this.sourceBlock_.parentBlock_;
    for (var i = 0, input; input = parentBlock.inputList[i]; i++) {
      for (var j = 0, field; field = input.fieldRow[j]; j++) {
        if (field instanceof Blockly.FieldImage) {
          field.setValue(newSrc);
          return;
        }
      }
    }
  }
};

/**
 * Get the language-neutral value from this dropdown menu.
 * @return {string} Current text.
 */
Blockly.FieldIconMenu.prototype.getValue = function() {
  return this.value_;
};

/**
 * Show the menu.
 * @private
 */
Blockly.FieldIconMenu.prototype.showEditor_ = function() {
  // Set up contents of the drop-down
  Blockly.DropDownDiv.hideWithoutAnimation();
  Blockly.DropDownDiv.clearContent();
  var contentDiv = Blockly.DropDownDiv.getContentDiv();
  for (var i = 0, icon; icon = this.icons_[i]; i++) {
    var button = document.createElement('button');
    button.setAttribute('class', 'blocklyDropDownButton');
    button.title = icon.alt;
    button.style.width = icon.width + 'px';
    button.style.height = icon.height + 'px';
    var backgroundColor = this.sourceBlock_.getColour();
    if (icon.value == this.value_) {
      // This icon is selected
      backgroundColor = this.sourceBlock_.getColourTertiary();
    }
    button.style.backgroundColor = backgroundColor;
    button.style.borderColor = this.sourceBlock_.getColourTertiary();
    button.onclick = this.buttonClick_.bind(this);
    button.ontouchend = this.buttonClick_.bind(this);
    var buttonImg = document.createElement('img');
    buttonImg.src = icon.src;
    buttonImg.alt = icon.alt;
    // Set data-value on both elements to pick up value regardless of e.target
    button.setAttribute('data-value', icon.value);
    buttonImg.setAttribute('data-value', icon.value);
    button.appendChild(buttonImg);
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

Blockly.FieldIconMenu.prototype.buttonClick_ = function(e) {
  var value = e.target.getAttribute('data-value');
  this.setValue(value);
  Blockly.DropDownDiv.hide();
};
