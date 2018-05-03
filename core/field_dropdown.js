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
 * @fileoverview Dropdown input field.  Used for editable titles and variables.
 * In the interests of a consistent UI, the toolbox shares some functions and
 * properties with the context menu.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.FieldDropdown');

goog.require('Blockly.Field');
goog.require('Blockly.DropDownDiv');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.style');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuItem');
goog.require('goog.userAgent');


/**
 * Class for an editable dropdown field.
 * @param {(!Array.<!Array>|!Function)} menuGenerator An array of options
 *     for a dropdown list, or a function which generates these options.
 * @param {Function=} opt_validator A function that is executed when a new
 *     option is selected, with the newly selected value as its sole argument.
 *     If it returns a value, that value (which must be one of the options) will
 *     become selected in place of the newly selected option, unless the return
 *     value is null, in which case the change is aborted.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldDropdown = function(menuGenerator, opt_validator) {
  this.menuGenerator_ = menuGenerator;
  this.trimOptions_();
  var firstTuple = this.getOptions()[0];

  // Call parent's constructor.
  Blockly.FieldDropdown.superClass_.constructor.call(this, firstTuple[1],
      opt_validator);
  this.addArgType('dropdown');
};
goog.inherits(Blockly.FieldDropdown, Blockly.Field);

/**
 * Construct a FieldDropdown from a JSON arg object.
 * @param {!Object} element A JSON object with options.
 * @returns {!Blockly.FieldDropdown} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldDropdown.fromJson = function(element) {
  return new Blockly.FieldDropdown(element['options']);
};

/**
 * Horizontal distance that a checkmark overhangs the dropdown.
 */
Blockly.FieldDropdown.CHECKMARK_OVERHANG = 25;

/**
 * Mouse cursor style when over the hotspot that initiates the editor.
 */
Blockly.FieldDropdown.prototype.CURSOR = 'default';

/**
 * Closure menu item currently selected.
 * @type {?goog.ui.MenuItem}
 */
Blockly.FieldDropdown.prototype.selectedItem = null;

/**
 * Language-neutral currently selected string or image object.
 * @type {string|!Object}
 * @private
 */
Blockly.FieldDropdown.prototype.value_ = '';

/**
 * SVG image element if currently selected option is an image, or null.
 * @type {SVGElement}
 * @private
 */
Blockly.FieldDropdown.prototype.imageElement_ = null;

/**
 * Object with src, height, width, and alt attributes if currently selected
 * option is an image, or null.
 * @type {Object}
 * @private
 */
Blockly.FieldDropdown.prototype.imageJson_ = null;

/**
 * Install this dropdown on a block.
 */
Blockly.FieldDropdown.prototype.init = function() {
  if (this.fieldGroup_) {
    // Dropdown has already been initialized once.
    return;
  }
  // Add dropdown arrow: "option ▾" (LTR) or "▾ אופציה" (RTL)
  // Positioned on render, after text size is calculated.
  /** @type {Number} */
  this.arrowSize_ = 12;
  /** @type {Number} */
  this.arrowX_ = 0;
  /** @type {Number} */
  this.arrowY_ = 11;
  this.arrow_ = Blockly.utils.createSvgElement('image', {
    'height': this.arrowSize_ + 'px',
    'width': this.arrowSize_ + 'px'
  });
  this.arrow_.setAttributeNS('http://www.w3.org/1999/xlink',
      'xlink:href', Blockly.mainWorkspace.options.pathToMedia + 'dropdown-arrow.svg');
  this.className_ += ' blocklyDropdownText';

  Blockly.FieldDropdown.superClass_.init.call(this);
  // If not in a shadow block, draw a box.
  if (!this.sourceBlock_.isShadow()) {
    this.box_ = Blockly.utils.createSvgElement('rect', {
      'rx': Blockly.BlockSvg.CORNER_RADIUS,
      'ry': Blockly.BlockSvg.CORNER_RADIUS,
      'x': 0,
      'y': 0,
      'width': this.size_.width,
      'height': this.size_.height,
      'stroke': this.sourceBlock_.getColourTertiary(),
      'fill': this.sourceBlock_.getColour(),
      'class': 'blocklyBlockBackground',
      'fill-opacity': 1
    }, null);
    this.fieldGroup_.insertBefore(this.box_, this.textElement_);
  }
  // Force a reset of the text to add the arrow.
  var text = this.text_;
  this.text_ = null;
  this.setText(text);
};

/**
 * Create a dropdown menu under the text.
 * @private
 */
Blockly.FieldDropdown.prototype.showEditor_ = function() {
  var options = this.getOptions();
  if (options.length == 0) return;

  this.dropDownOpen_ = true;
  // If there is an existing drop-down someone else owns, hide it immediately and clear it.
  Blockly.DropDownDiv.hideWithoutAnimation();
  Blockly.DropDownDiv.clearContent();

  var contentDiv = Blockly.DropDownDiv.getContentDiv();

  var thisField = this;

  function callback(e) {
    var menu = this;
    var menuItem = e.target;
    if (menuItem) {
      thisField.onItemSelected(menu, menuItem);
    }
    Blockly.DropDownDiv.hide();
    Blockly.Events.setGroup(false);
  }

  var menu = new goog.ui.Menu();
  menu.setRightToLeft(this.sourceBlock_.RTL);
  for (var i = 0; i < options.length; i++) {
    var content = options[i][0]; // Human-readable text or image.
    var value = options[i][1];   // Language-neutral value.
    if (typeof content == 'object') {
      // An image, not text.
      var image = new Image(content['width'], content['height']);
      image.src = content['src'];
      image.alt = content['alt'] || '';
      content = image;
    }
    var menuItem = new goog.ui.MenuItem(content);
    menuItem.setRightToLeft(this.sourceBlock_.RTL);
    menuItem.setValue(value);
    menuItem.setCheckable(true);
    menu.addChild(menuItem, true);
    var checked = (value == this.value_);
    menuItem.setChecked(checked);
    if (checked) {
      this.selectedItem = menuItem;
    }
  }
  // Listen for mouse/keyboard events.
  goog.events.listen(menu, goog.ui.Component.EventType.ACTION, callback);
  // Listen for touch events (why doesn't Closure handle this already?).
  function callbackTouchStart(e) {
    var control = this.getOwnerControl(/** @type {Node} */ (e.target));
    // Highlight the menu item.
    control.handleMouseDown(e);
  }
  function callbackTouchEnd(e) {
    var control = this.getOwnerControl(/** @type {Node} */ (e.target));
    // Activate the menu item.
    control.performActionInternal(e);
  }
  menu.getHandler().listen(
      menu.getElement(), goog.events.EventType.TOUCHSTART, callbackTouchStart);
  menu.getHandler().listen(
      menu.getElement(), goog.events.EventType.TOUCHEND, callbackTouchEnd);

  // Record windowSize and scrollOffset before adding menu.
  menu.render(contentDiv);
  var menuDom = menu.getElement();
  Blockly.utils.addClass(menuDom, 'blocklyDropdownMenu');
  // Record menuSize after adding menu.
  var menuSize = goog.style.getSize(menuDom);
  // Recalculate height for the total content, not only box height.
  menuSize.height = menuDom.scrollHeight;

  var primaryColour = (this.sourceBlock_.isShadow()) ?
    this.sourceBlock_.parentBlock_.getColour() : this.sourceBlock_.getColour();

  Blockly.DropDownDiv.setColour(primaryColour, this.sourceBlock_.getColourTertiary());

  var category = (this.sourceBlock_.isShadow()) ?
    this.sourceBlock_.parentBlock_.getCategory() : this.sourceBlock_.getCategory();
  Blockly.DropDownDiv.setCategory(category);

  // Calculate positioning based on the field position.
  var scale = this.sourceBlock_.workspace.scale;
  var bBox = {width: this.size_.width, height: this.size_.height};
  bBox.width *= scale;
  bBox.height *= scale;
  var position = this.fieldGroup_.getBoundingClientRect();
  var primaryX = position.left + bBox.width / 2;
  var primaryY = position.top + bBox.height;
  var secondaryX = primaryX;
  var secondaryY = position.top;
  // Set bounds to workspace; show the drop-down.
  Blockly.DropDownDiv.setBoundsElement(this.sourceBlock_.workspace.getParentSvg().parentNode);
  Blockly.DropDownDiv.show(
      this, primaryX, primaryY, secondaryX, secondaryY, this.onHide.bind(this));

  menu.setAllowAutoFocus(true);
  menuDom.focus();

  // Update colour to look selected.
  if (!this.disableColourChange_) {
    if (this.sourceBlock_.isShadow()) {
      this.savedPrimary_ = this.sourceBlock_.getColour();
      this.sourceBlock_.setColour(this.sourceBlock_.getColourTertiary(),
          this.sourceBlock_.getColourSecondary(),
          this.sourceBlock_.getColourTertiary());
    } else if (this.box_) {
      this.box_.setAttribute('fill', this.sourceBlock_.getColourTertiary());
    }
  }
};

/**
 * Callback for when the drop-down is hidden.
 */
Blockly.FieldDropdown.prototype.onHide = function() {
  this.dropDownOpen_ = false;
  // Update colour to look selected.
  if (!this.disableColourChange_ && this.sourceBlock_) {
    if (this.sourceBlock_.isShadow()) {
      this.sourceBlock_.setColour(this.savedPrimary_,
          this.sourceBlock_.getColourSecondary(),
          this.sourceBlock_.getColourTertiary());
    } else if (this.box_) {
      this.box_.setAttribute('fill', this.sourceBlock_.getColour());
    }
  }
};

/**
 * Handle the selection of an item in the dropdown menu.
 * @param {!goog.ui.Menu} menu The Menu component clicked.
 * @param {!goog.ui.MenuItem} menuItem The MenuItem selected within menu.
 */
Blockly.FieldDropdown.prototype.onItemSelected = function(menu, menuItem) {
  var value = menuItem.getValue();
  if (this.sourceBlock_) {
    // Call any validation function, and allow it to override.
    value = this.callValidator(value);
  }
  if (value !== null) {
    this.setValue(value);
  }
};

/**
 * Factor out common words in statically defined options.
 * Create prefix and/or suffix labels.
 * @private
 */
Blockly.FieldDropdown.prototype.trimOptions_ = function() {
  this.prefixField = null;
  this.suffixField = null;
  var options = this.menuGenerator_;
  if (!goog.isArray(options)) {
    return;
  }
  var hasImages = false;

  // Localize label text and image alt text.
  for (var i = 0; i < options.length; i++) {
    var label = options[i][0];
    if (typeof label == 'string') {
      options[i][0] = Blockly.utils.replaceMessageReferences(label);
    } else {
      if (label.alt != null) {
        options[i][0].alt = Blockly.utils.replaceMessageReferences(label.alt);
      }
      hasImages = true;
    }
  }
  if (hasImages || options.length < 2) {
    return;  // Do nothing if too few items or at least one label is an image.
  }
  var strings = [];
  for (var i = 0; i < options.length; i++) {
    strings.push(options[i][0]);
  }
  var shortest = Blockly.utils.shortestStringLength(strings);
  var prefixLength = Blockly.utils.commonWordPrefix(strings, shortest);
  var suffixLength = Blockly.utils.commonWordSuffix(strings, shortest);
  if (!prefixLength && !suffixLength) {
    return;
  }
  if (shortest <= prefixLength + suffixLength) {
    // One or more strings will entirely vanish if we proceed.  Abort.
    return;
  }
  if (prefixLength) {
    this.prefixField = strings[0].substring(0, prefixLength - 1);
  }
  if (suffixLength) {
    this.suffixField = strings[0].substr(1 - suffixLength);
  }
  // Remove the prefix and suffix from the options.
  var newOptions = [];
  for (var i = 0; i < options.length; i++) {
    var text = options[i][0];
    var value = options[i][1];
    text = text.substring(prefixLength, text.length - suffixLength);
    newOptions[i] = [text, value];
  }
  this.menuGenerator_ = newOptions;
};

/**
 * @return {boolean} True if the option list is generated by a function.
 *     Otherwise false.
 */
Blockly.FieldDropdown.prototype.isOptionListDynamic = function() {
  return goog.isFunction(this.menuGenerator_);
};

/**
 * Return a list of the options for this dropdown.
 * @return {!Array.<!Array>} Array of option tuples:
 *     (human-readable text or image, language-neutral name).
 */
Blockly.FieldDropdown.prototype.getOptions = function() {
  if (goog.isFunction(this.menuGenerator_)) {
    return this.menuGenerator_.call(this);
  }
  return /** @type {!Array.<!Array.<string>>} */ (this.menuGenerator_);
};

/**
 * Get the language-neutral value from this dropdown menu.
 * @return {string} Current text.
 */
Blockly.FieldDropdown.prototype.getValue = function() {
  return this.value_;
};

/**
 * Set the language-neutral value for this dropdown menu.
 * @param {string} newValue New value to set.
 */
Blockly.FieldDropdown.prototype.setValue = function(newValue) {
  if (newValue === null || newValue === this.value_) {
    return;  // No change if null.
  }
  if (this.sourceBlock_ && Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.BlockChange(
        this.sourceBlock_, 'field', this.name, this.value_, newValue));
  }
  // Clear menu item for old value.
  if (this.selectedItem) {
    this.selectedItem.setChecked(false);
    this.selectedItem = null;
  }
  this.value_ = newValue;
  // Look up and display the human-readable text.
  var options = this.getOptions();
  for (var i = 0; i < options.length; i++) {
    // Options are tuples of human-readable text and language-neutral values.
    if (options[i][1] == newValue) {
      var content = options[i][0];
      if (typeof content == 'object') {
        this.imageJson_ = content;
        this.text_ = content.alt;
      } else {
        this.imageJson_ = null;
        this.text_ = content;
      }
      // Always rerender if either the value or the text has changed.
      this.forceRerender();
      return;
    }
  }
  // Value not found.  Add it, maybe it will become valid once set
  // (like variable names).
  this.text_ = newValue;
  this.forceRerender();
};

/**
 * Sets the text in this field.  Trigger a rerender of the source block.
 * @param {?string} text New text.
 */
Blockly.FieldDropdown.prototype.setText = function(text) {
  if (text === null || text === this.text_) {
    // No change if null.
    return;
  }
  this.text_ = text;
  this.updateTextNode_();

  if (this.textElement_) {
    this.textElement_.parentNode.appendChild(this.arrow_);
  }
  if (this.sourceBlock_ && this.sourceBlock_.rendered) {
    this.sourceBlock_.render();
    this.sourceBlock_.bumpNeighbours_();
  }
};

/**
 * Position a drop-down arrow at the appropriate location at render-time.
 * @param {number} x X position the arrow is being rendered at, in px.
 * @return {number} Amount of space the arrow is taking up, in px.
 */
Blockly.FieldDropdown.prototype.positionArrow = function(x) {
  if (!this.arrow_) {
    return 0;
  }

  var addedWidth = 0;
  if (this.sourceBlock_.RTL) {
    this.arrowX_ = this.arrowSize_ - Blockly.BlockSvg.DROPDOWN_ARROW_PADDING;
    addedWidth = this.arrowSize_ + Blockly.BlockSvg.DROPDOWN_ARROW_PADDING;
  } else {
    this.arrowX_ = x + Blockly.BlockSvg.DROPDOWN_ARROW_PADDING / 2;
    addedWidth = this.arrowSize_ + Blockly.BlockSvg.DROPDOWN_ARROW_PADDING;
  }
  if (this.box_) {
    // Bump positioning to the right for a box-type drop-down.
    this.arrowX_ += Blockly.BlockSvg.BOX_FIELD_PADDING;
  }
  this.arrow_.setAttribute('transform',
      'translate(' + this.arrowX_ + ',' + this.arrowY_ + ')');
  return addedWidth;
};

/**
 * Close the dropdown menu if this input is being deleted.
 */
Blockly.FieldDropdown.prototype.dispose = function() {
  this.selectedItem = null;
  Blockly.WidgetDiv.hideIfOwner(this);
  Blockly.FieldDropdown.superClass_.dispose.call(this);
};

Blockly.Field.register('field_dropdown', Blockly.FieldDropdown);
