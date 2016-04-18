/**
 * @fileoverview Icon picker input field.
 * This is primarily for use in Scratch Horizontal blocks.
 * Pops open a drop-down with icons; when an icon is selected, it replaces
 * the icon (image field) in the original block.
 * @author tmickel@mit.edu (Tim Mickel)
 */
'use strict';

goog.provide('Blockly.FieldIconMenu');

goog.require('Blockly.DropDownDiv');

/**
 * Class for an icon menu field.
 * @param {Object} icons List of icons. These take the same options as an Image Field.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldIconMenu = function(icons) {
  /** @type {object} */
  this.icons_ = icons;
  // Example:
  // [{src: '...', width: 20, height: 20, alt: '...', value: 'machine_value'}, ...]
  // First icon provides the default values.
  var defaultValue = icons[0].value;
  Blockly.FieldIconMenu.superClass_.constructor.call(this, defaultValue);
};
goog.inherits(Blockly.FieldIconMenu, Blockly.Field);


/**
 * Fixed width of the drop-down, in px. Icon buttons will flow inside this width.
 * @type {number}
 * @const
 */
Blockly.FieldIconMenu.DROPDOWN_WIDTH = 180;

/**
 * Called when the field is placed on a block.
 * @param {Block} block The owning block.
 */
Blockly.FieldIconMenu.prototype.init = function(block) {
  // Render the arrow icon
  // Fixed sizes in px. Saved for creating the flip transform of the menu renders above the button.
  var arrowSize = 12;
  /** @type {Number} */
  this.arrowX_ = 18;
  /** @type {Number} */
  this.arrowY_ = 10;
  if (block.RTL) {
    // In RTL, the icon position is flipped and rendered from the right (offset by width)
    this.arrowX_ = -this.arrowX_ - arrowSize;
  }
  /** @type {Element} */
  this.arrowIcon_ = Blockly.createSvgElement('image', {
    'height': arrowSize + 'px',
    'width': arrowSize + 'px',
    'transform': 'translate(' + this.arrowX_ + ',' + this.arrowY_ + ')'
  });
  this.arrowIcon_.setAttributeNS('http://www.w3.org/1999/xlink',
      'xlink:href', Blockly.mainWorkspace.options.pathToMedia + 'dropdown-arrow.svg');
  block.getSvgRoot().appendChild(this.arrowIcon_);
  Blockly.FieldIconMenu.superClass_.init.call(this, block);
};

/**
 * Mouse cursor style when over the hotspot that initiates the editor.
 * @const
 */
Blockly.FieldIconMenu.prototype.CURSOR = 'default';

/**
* Set the language-neutral value for this icon dropdown menu.
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
  this.value_ = newValue;
  // Find the relevant icon in this.icons_ to get the image src.
  this.setParentFieldImage(this.getSrcForValue(this.value_));
};

/**
* Find the parent block's FieldImage and set its src.
 * @param {?string} src New src for the parent block FieldImage.
 * @private
 */
Blockly.FieldIconMenu.prototype.setParentFieldImage = function(src) {
  if (this.sourceBlock_) {
    var parentBlock = this.sourceBlock_.parentBlock_;
    // Loop through all inputs' fields to find the first FieldImage
    for (var i = 0, input; input = parentBlock.inputList[i]; i++) {
      for (var j = 0, field; field = input.fieldRow[j]; j++) {
        if (field instanceof Blockly.FieldImage) {
          // Src for a FieldImage is stored in its value.
          field.setValue(src);
          return;
        }
      }
    }
  }
};

/**
 * Get the language-neutral value from this dropdown menu.
 * @return {string} Current language-neutral value.
 */
Blockly.FieldIconMenu.prototype.getValue = function() {
  return this.value_;
};

/**
 * For a language-neutral value, get the src for the image that represents it.
 * @param {string} value Language-neutral value to look up.
 * @return {string} Src to image representing value
 */
Blockly.FieldIconMenu.prototype.getSrcForValue = function(value) {
  for (var i = 0, icon; icon = this.icons_[i]; i++) {
    if (icon.value === value) {
      return icon.src;
    }
  }
};

/**
 * Show the drop-down menu for editing this field.
 * @private
 */
Blockly.FieldIconMenu.prototype.showEditor_ = function() {
  // If there is an existing drop-down, hide it and clear it.
  Blockly.DropDownDiv.hideWithoutAnimation();
  Blockly.DropDownDiv.clearContent();
  // Populate the drop-down with the icons for this field.
  var contentDiv = Blockly.DropDownDiv.getContentDiv();
  // Accessibility properties
  contentDiv.setAttribute('role', 'menu');
  contentDiv.setAttribute('aria-haspopup', 'true');
  for (var i = 0, icon; icon = this.icons_[i]; i++) {
    var button = document.createElement('button');
    button.setAttribute('id', ':' + i); // For aria-activedescendant
    button.setAttribute('role', 'menuitem');
    button.setAttribute('class', 'blocklyDropDownButton');
    button.title = icon.alt;
    button.style.width = icon.width + 'px';
    button.style.height = icon.height + 'px';
    var backgroundColor = this.sourceBlock_.getColour();
    if (icon.value == this.getValue()) {
      // This icon is selected, show it in a different colour
      backgroundColor = this.sourceBlock_.getColourTertiary();
      button.setAttribute('aria-selected', 'true');
    }
    button.style.backgroundColor = backgroundColor;
    button.style.borderColor = this.sourceBlock_.getColourTertiary();
    button.onclick = this.buttonClick_.bind(this);
    button.ontouchend = this.buttonClick_.bind(this);
    button.onmouseover = function() {
      contentDiv.setAttribute('aria-activedescendant', this.id);
    };
    button.onmouseout = function() {
      contentDiv.removeAttribute('aria-activedescendant');
    };
    var buttonImg = document.createElement('img');
    buttonImg.src = icon.src;
    buttonImg.alt = icon.alt;
    // Upon click/touch, we will be able to get the clicked element as e.target
    // Store a data attribute on all possible click targets so we can match it to the icon.
    button.setAttribute('data-value', icon.value);
    buttonImg.setAttribute('data-value', icon.value);
    button.appendChild(buttonImg);
    contentDiv.appendChild(button);
  }
  contentDiv.style.width = Blockly.FieldIconMenu.DROPDOWN_WIDTH + 'px';
  // Calculate positioning for the drop-down
  // sourceBlock_ is the rendered shadow field button
  var scale = this.sourceBlock_.workspace.scale;
  var bBox = this.sourceBlock_.getHeightWidth();
  bBox.width *= scale;
  bBox.height *= scale;
  var position = this.getAbsoluteXY_();
  // If we can fit it, render below the shadow block
  var primaryX = position.x + bBox.width / 2;
  var primaryY = position.y + bBox.height;
  // If we can't fit it, render above the entire parent block
  var secondaryX = primaryX;
  var secondaryY = position.y - (Blockly.BlockSvg.MIN_BLOCK_Y * scale) - (Blockly.BlockSvg.FIELD_Y_OFFSET * scale);

  Blockly.DropDownDiv.setColour(this.sourceBlock_.getColour(), this.sourceBlock_.getColourTertiary());
  Blockly.DropDownDiv.setBoundsElement(this.sourceBlock_.workspace.getParentSvg().parentNode);
  Blockly.DropDownDiv.show(primaryX, primaryY, secondaryX, secondaryY);
};

/**
 * Callback for when a button is clicked inside the drop-down.
 * Should be bound to the FieldIconMenu.
 * @param {Event} e DOM event for the click/touch
 * @private
 */
Blockly.FieldIconMenu.prototype.buttonClick_ = function(e) {
  var value = e.target.getAttribute('data-value');
  this.setValue(value);
  Blockly.DropDownDiv.hide();
};
