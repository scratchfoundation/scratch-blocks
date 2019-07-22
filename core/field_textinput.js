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
 * @fileoverview Text input field.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.FieldTextInput');

goog.require('Blockly.BlockSvg.render');
goog.require('Blockly.Colours');
goog.require('Blockly.Field');
goog.require('Blockly.Msg');
goog.require('Blockly.scratchBlocksUtils');
goog.require('Blockly.utils');

goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.userAgent');


/**
 * Class for an editable text field.
 * @param {string} text The initial content of the field.
 * @param {Function=} opt_validator An optional function that is called
 *     to validate any constraints on what the user entered.  Takes the new
 *     text as an argument and returns either the accepted text, a replacement
 *     text, or null to abort the change.
 * @param {RegExp=} opt_restrictor An optional regular expression to restrict
 *     typed text to. Text that doesn't match the restrictor will never show
 *     in the text field.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldTextInput = function(text, opt_validator, opt_restrictor) {
  Blockly.FieldTextInput.superClass_.constructor.call(this, text,
      opt_validator);
  this.setRestrictor(opt_restrictor);
  this.addArgType('text');
};
goog.inherits(Blockly.FieldTextInput, Blockly.Field);

/**
 * Construct a FieldTextInput from a JSON arg object,
 * dereferencing any string table references.
 * @param {!Object} options A JSON object with options (text, class, and
 *                          spellcheck).
 * @returns {!Blockly.FieldTextInput} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldTextInput.fromJson = function(options) {
  var text = Blockly.utils.replaceMessageReferences(options['text']);
  var field = new Blockly.FieldTextInput(text, options['class']);
  if (typeof options['spellcheck'] === 'boolean') {
    field.setSpellcheck(options['spellcheck']);
  }
  return field;
};

/**
 * Length of animations in seconds.
 */
Blockly.FieldTextInput.ANIMATION_TIME = 0.25;

/**
 * Padding to use for text measurement for the field during editing, in px.
 */
Blockly.FieldTextInput.TEXT_MEASURE_PADDING_MAGIC = 45;

/**
 * The HTML input element for the user to type, or null if no FieldTextInput
 * editor is currently open.
 * @type {HTMLInputElement}
 * @private
 */
Blockly.FieldTextInput.htmlInput_ = null;

/**
 * Mouse cursor style when over the hotspot that initiates the editor.
 */
Blockly.FieldTextInput.prototype.CURSOR = 'text';

/**
 * Allow browser to spellcheck this field.
 * @private
 */
Blockly.FieldTextInput.prototype.spellcheck_ = true;

/**
 * Install this text field on a block.
 */
Blockly.FieldTextInput.prototype.init = function() {
  if (this.fieldGroup_) {
    // Field has already been initialized once.
    return;
  }

  var notInShadow = !this.sourceBlock_.isShadow();

  if (notInShadow) {
    this.className_ += ' blocklyEditableLabel';
  }

  Blockly.FieldTextInput.superClass_.init.call(this);

  // If not in a shadow block, draw a box.
  if (notInShadow) {
    this.box_ = Blockly.utils.createSvgElement('rect',
        {
          'x': 0,
          'y': 0,
          'width': this.size_.width,
          'height': this.size_.height,
          'fill': this.sourceBlock_.getColourTertiary()
        }
    );
    this.fieldGroup_.insertBefore(this.box_, this.textElement_);
  }
};

/**
 * Close the input widget if this input is being deleted.
 */
Blockly.FieldTextInput.prototype.dispose = function() {
  Blockly.WidgetDiv.hideIfOwner(this);
  Blockly.FieldTextInput.superClass_.dispose.call(this);
};

/**
 * Set the value of this field.
 * @param {?string} newValue New value.
 * @override
 */
Blockly.FieldTextInput.prototype.setValue = function(newValue) {
  if (newValue === null) {
    return;  // No change if null.
  }
  if (this.sourceBlock_) {
    var validated = this.callValidator(newValue);
    // If the new value is invalid, validation returns null.
    // In this case we still want to display the illegal result.
    if (validated !== null) {
      newValue = validated;
    }
  }
  Blockly.Field.prototype.setValue.call(this, newValue);
};

/**
 * Set the text in this field and fire a change event.
 * @param {*} newText New text.
 */
Blockly.FieldTextInput.prototype.setText = function(newText) {
  if (newText === null) {
    // No change if null.
    return;
  }
  newText = String(newText);
  if (newText === this.text_) {
    // No change.
    return;
  }
  if (this.sourceBlock_ && Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.BlockChange(
        this.sourceBlock_, 'field', this.name, this.text_, newText));
  }
  Blockly.Field.prototype.setText.call(this, newText);
};

/**
 * Set whether this field is spellchecked by the browser.
 * @param {boolean} check True if checked.
 */
Blockly.FieldTextInput.prototype.setSpellcheck = function(check) {
  this.spellcheck_ = check;
};

/**
 * Set the restrictor regex for this text input.
 * Text that doesn't match the restrictor will never show in the text field.
 * @param {?RegExp} restrictor Regular expression to restrict text.
 */
Blockly.FieldTextInput.prototype.setRestrictor = function(restrictor) {
  this.restrictor_ = restrictor;
};

/**
 * Show the inline free-text editor on top of the text.
 * @param {boolean=} opt_quietInput True if editor should be created without
 *     focus.  Defaults to false.
 * @param {boolean=} opt_readOnly True if editor should be created with HTML
 *     input set to read-only, to prevent virtual keyboards.
 * @param {boolean=} opt_withArrow True to show drop-down arrow in text editor.
 * @param {Function=} opt_arrowCallback Callback for when drop-down arrow clicked.
 * @private
 */
Blockly.FieldTextInput.prototype.showEditor_ = function(
    opt_quietInput, opt_readOnly, opt_withArrow, opt_arrowCallback) {
  this.workspace_ = this.sourceBlock_.workspace;
  var quietInput = opt_quietInput || false;
  var readOnly = opt_readOnly || false;
  Blockly.WidgetDiv.show(this, this.sourceBlock_.RTL,
      this.widgetDispose_(), this.widgetDisposeAnimationFinished_(),
      Blockly.FieldTextInput.ANIMATION_TIME);
  var div = Blockly.WidgetDiv.DIV;
  // Apply text-input-specific fixed CSS
  div.className += ' fieldTextInput';
  // Create the input.
  var htmlInput =
      goog.dom.createDom(goog.dom.TagName.INPUT, 'blocklyHtmlInput');
  htmlInput.setAttribute('spellcheck', this.spellcheck_);
  if (readOnly) {
    htmlInput.setAttribute('readonly', 'true');
  }
  /** @type {!HTMLInputElement} */
  Blockly.FieldTextInput.htmlInput_ = htmlInput;
  div.appendChild(htmlInput);

  if (opt_withArrow) {
    // Move text in input to account for displayed drop-down arrow.
    if (this.sourceBlock_.RTL) {
      htmlInput.style.paddingLeft = (this.arrowSize_ + Blockly.BlockSvg.DROPDOWN_ARROW_PADDING) + 'px';
    } else {
      htmlInput.style.paddingRight = (this.arrowSize_ + Blockly.BlockSvg.DROPDOWN_ARROW_PADDING) + 'px';
    }
    // Create the arrow.
    var dropDownArrow =
        goog.dom.createDom(goog.dom.TagName.IMG, 'blocklyTextDropDownArrow');
    dropDownArrow.setAttribute('src',
        Blockly.mainWorkspace.options.pathToMedia + 'dropdown-arrow-dark.svg');
    dropDownArrow.style.width = this.arrowSize_ + 'px';
    dropDownArrow.style.height = this.arrowSize_ + 'px';
    dropDownArrow.style.top = this.arrowY_ + 'px';
    dropDownArrow.style.cursor = 'pointer';
    // Magic number for positioning the drop-down arrow on top of the text editor.
    var dropdownArrowMagic = '11px';
    if (this.sourceBlock_.RTL) {
      dropDownArrow.style.left = dropdownArrowMagic;
    } else {
      dropDownArrow.style.right = dropdownArrowMagic;
    }
    if (opt_arrowCallback) {
      htmlInput.dropDownArrowMouseWrapper_ = Blockly.bindEvent_(dropDownArrow,
          'mousedown', this, opt_arrowCallback);
    }
    div.appendChild(dropDownArrow);
  }

  htmlInput.value = htmlInput.defaultValue = this.text_;
  htmlInput.oldValue_ = null;
  this.validate_();
  this.resizeEditor_();
  if (!quietInput) {
    htmlInput.focus();
    htmlInput.select();
    // For iOS only
    htmlInput.setSelectionRange(0, 99999);
  }

  this.bindEvents_(htmlInput, quietInput || readOnly);

  // Add animation transition properties
  var transitionProperties = 'box-shadow ' + Blockly.FieldTextInput.ANIMATION_TIME + 's';
  if (Blockly.BlockSvg.FIELD_TEXTINPUT_ANIMATE_POSITIONING) {
    div.style.transition += ',padding ' + Blockly.FieldTextInput.ANIMATION_TIME + 's,' +
      'width ' + Blockly.FieldTextInput.ANIMATION_TIME + 's,' +
      'height ' + Blockly.FieldTextInput.ANIMATION_TIME + 's,' +
      'margin-left ' + Blockly.FieldTextInput.ANIMATION_TIME + 's';
  }
  div.style.transition = transitionProperties;
  htmlInput.style.transition = 'font-size ' + Blockly.FieldTextInput.ANIMATION_TIME + 's';
  // The animated properties themselves
  htmlInput.style.fontSize = Blockly.BlockSvg.FIELD_TEXTINPUT_FONTSIZE_FINAL + 'pt';
  div.style.boxShadow = '0px 0px 0px 4px ' + Blockly.Colours.fieldShadow;
};

/**
 * Bind handlers for user input on this field and size changes on the workspace.
 * @param {!HTMLInputElement} htmlInput The htmlInput created in showEditor, to
 *     which event handlers will be bound.
 * @param {boolean} bindGlobalKeypress Whether to bind a keypress listener to enable
 *     keyboard editing without focusing the field.
 * @private
 */
Blockly.FieldTextInput.prototype.bindEvents_ = function(
    htmlInput, bindGlobalKeypress) {
  // Bind to keydown -- trap Enter without IME and Esc to hide.
  htmlInput.onKeyDownWrapper_ =
      Blockly.bindEventWithChecks_(htmlInput, 'keydown', this,
          this.onHtmlInputKeyDown_);
  // Bind to keyup -- trap Enter; resize after every keystroke.
  htmlInput.onKeyUpWrapper_ =
      Blockly.bindEventWithChecks_(htmlInput, 'keyup', this,
          this.onHtmlInputChange_);
  // Bind to keyPress -- repeatedly resize when holding down a key.
  htmlInput.onKeyPressWrapper_ =
      Blockly.bindEventWithChecks_(htmlInput, 'keypress', this,
          this.onHtmlInputChange_);
  // For modern browsers (IE 9+, Chrome, Firefox, etc.) that support the
  // DOM input event, also trigger onHtmlInputChange_ then. The input event
  // is triggered on keypress but after the value of the text input
  // has updated, allowing us to resize the block at that time.
  htmlInput.onInputWrapper_ =
      Blockly.bindEvent_(htmlInput, 'input', this, this.onHtmlInputChange_);
  htmlInput.onWorkspaceChangeWrapper_ = this.resizeEditor_.bind(this);
  this.workspace_.addChangeListener(htmlInput.onWorkspaceChangeWrapper_);

  if (bindGlobalKeypress) {
    htmlInput.onDocumentKeyDownWrapper_ =
      Blockly.bindEventWithChecks_(document, 'keydown', this,
          this.onDocumentKeyDown_);
  }
};

/**
 * Unbind handlers for user input and workspace size changes.
 * @param {!HTMLInputElement} htmlInput The html for this text input.
 * @private
 */
Blockly.FieldTextInput.prototype.unbindEvents_ = function(htmlInput) {
  Blockly.unbindEvent_(htmlInput.onKeyDownWrapper_);
  Blockly.unbindEvent_(htmlInput.onKeyUpWrapper_);
  Blockly.unbindEvent_(htmlInput.onKeyPressWrapper_);
  Blockly.unbindEvent_(htmlInput.onInputWrapper_);
  this.workspace_.removeChangeListener(
      htmlInput.onWorkspaceChangeWrapper_);

  // Remove document handler only if it was added (e.g. in quiet mode)
  if (htmlInput.onDocumentKeyDownWrapper_) {
    Blockly.unbindEvent_(htmlInput.onDocumentKeyDownWrapper_);
  }
};

/**
 * Handle key down to the editor.
 * @param {!Event} e Keyboard event.
 * @private
 */
Blockly.FieldTextInput.prototype.onHtmlInputKeyDown_ = function(e) {
  var htmlInput = Blockly.FieldTextInput.htmlInput_;
  var tabKey = 9, enterKey = 13, escKey = 27;
  if (e.keyCode == enterKey) {
    Blockly.WidgetDiv.hide();
    Blockly.DropDownDiv.hideWithoutAnimation();
  } else if (e.keyCode == escKey) {
    htmlInput.value = htmlInput.defaultValue;
    Blockly.WidgetDiv.hide();
    Blockly.DropDownDiv.hideWithoutAnimation();
  } else if (e.keyCode == tabKey) {
    Blockly.WidgetDiv.hide();
    Blockly.DropDownDiv.hideWithoutAnimation();
    this.sourceBlock_.tab(this, !e.shiftKey);
    e.preventDefault();
  }
};

Blockly.FieldTextInput.prototype.onDocumentKeyDown_ = function(e) {
  var htmlInput = Blockly.FieldTextInput.htmlInput_;
  var targetMatches = e.target === htmlInput;
  var targetIsInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
  if (targetMatches || !targetIsInput) { // Ignore keys into other inputs
    htmlInput.removeAttribute('readonly');
    htmlInput.value = ''; // Reset the input, new value is picked up by input keypress
    htmlInput.focus();
    Blockly.unbindEvent_(htmlInput.onDocumentKeyDownWrapper_);
    htmlInput.onDocumentKeyDownWrapper_ = null;
  }
};

/**
 * Key codes that are whitelisted from the restrictor.
 * These are only needed and used on Gecko (Firefox).
 * See: https://github.com/LLK/scratch-blocks/issues/503.
 */
Blockly.FieldTextInput.GECKO_KEYCODE_WHITELIST = [
  97, // Select all, META-A.
  99, // Copy, META-C.
  118, // Paste, META-V.
  120 // Cut, META-X.
];

/**
 * Handle a change to the editor.
 * @param {!Event} e Keyboard event.
 * @private
 */
Blockly.FieldTextInput.prototype.onHtmlInputChange_ = function(e) {
  // Check if the key matches the restrictor.
  if (e.type === 'keypress' && this.restrictor_) {
    var keyCode;
    var isWhitelisted = false;
    if (goog.userAgent.GECKO) {
      // e.keyCode is not available in Gecko.
      keyCode = e.charCode;
      // Gecko reports control characters (e.g., left, right, copy, paste)
      // in the key event - whitelist these from being restricted.
      // < 32 and 127 (delete) are control characters.
      // See: http://www.theasciicode.com.ar/ascii-control-characters/delete-ascii-code-127.html
      if (keyCode < 32 || keyCode == 127) {
        isWhitelisted = true;
      } else if (e.metaKey || e.ctrlKey) {
        // For combos (ctrl-v, ctrl-c, etc.), Gecko reports the ASCII letter
        // and the metaKey/ctrlKey flags.
        isWhitelisted = Blockly.FieldTextInput.GECKO_KEYCODE_WHITELIST.indexOf(keyCode) > -1;
      }
    } else {
      keyCode = e.keyCode;
    }
    var char = String.fromCharCode(keyCode);
    if (!isWhitelisted && !this.restrictor_.test(char) && e.preventDefault) {
      // Failed to pass restrictor.
      e.preventDefault();
      return;
    }
  }
  var htmlInput = Blockly.FieldTextInput.htmlInput_;
  // Update source block.
  var text = htmlInput.value;
  if (text !== htmlInput.oldValue_) {
    htmlInput.oldValue_ = text;
    this.setText(text);
    this.validate_();
  } else if (goog.userAgent.WEBKIT) {
    // Cursor key.  Render the source block to show the caret moving.
    // Chrome only (version 26, OS X).
    this.sourceBlock_.render();
  }
  this.resizeEditor_();
};

/**
 * Check to see if the contents of the editor validates.
 * Style the editor accordingly.
 * @private
 */
Blockly.FieldTextInput.prototype.validate_ = function() {
  var valid = true;
  goog.asserts.assertObject(Blockly.FieldTextInput.htmlInput_);
  var htmlInput = Blockly.FieldTextInput.htmlInput_;
  if (this.sourceBlock_) {
    valid = this.callValidator(htmlInput.value);
  }
  if (valid === null) {
    Blockly.utils.addClass(htmlInput, 'blocklyInvalidInput');
  } else {
    Blockly.utils.removeClass(htmlInput, 'blocklyInvalidInput');
  }
};

/**
 * Resize the editor and the underlying block to fit the text.
 * @private
 */
Blockly.FieldTextInput.prototype.resizeEditor_ = function() {
  var scale = this.sourceBlock_.workspace.scale;
  var div = Blockly.WidgetDiv.DIV;

  var initialWidth;
  if (this.sourceBlock_.isShadow()) {
    initialWidth = this.sourceBlock_.getHeightWidth().width * scale;
  } else {
    initialWidth = this.size_.width * scale;
  }

  var width;
  if (Blockly.BlockSvg.FIELD_TEXTINPUT_EXPAND_PAST_TRUNCATION) {
    // Resize the box based on the measured width of the text, pre-truncation
    var textWidth = Blockly.scratchBlocksUtils.measureText(
        Blockly.FieldTextInput.htmlInput_.style.fontSize,
        Blockly.FieldTextInput.htmlInput_.style.fontFamily,
        Blockly.FieldTextInput.htmlInput_.style.fontWeight,
        Blockly.FieldTextInput.htmlInput_.value
    );
    // Size drawn in the canvas needs padding and scaling
    textWidth += Blockly.FieldTextInput.TEXT_MEASURE_PADDING_MAGIC;
    textWidth *= scale;
    width = textWidth;
  } else {
    // Set width to (truncated) block size.
    width = initialWidth;
  }
  // The width must be at least FIELD_WIDTH and at most FIELD_WIDTH_MAX_EDIT
  width = Math.max(width, Blockly.BlockSvg.FIELD_WIDTH_MIN_EDIT * scale);
  width = Math.min(width, Blockly.BlockSvg.FIELD_WIDTH_MAX_EDIT * scale);
  // Add 1px to width and height to account for border (pre-scale)
  div.style.width = (width / scale + 1) + 'px';
  div.style.height = (Blockly.BlockSvg.FIELD_HEIGHT_MAX_EDIT + 1) + 'px';
  div.style.transform = 'scale(' + scale + ')';

  // Use margin-left to animate repositioning of the box (value is unscaled).
  // This is the difference between the default position and the positioning
  // after growing the box.
  div.style.marginLeft = -0.5 * (width - initialWidth) + 'px';

  // Add 0.5px to account for slight difference between SVG and CSS border
  var borderRadius = this.getBorderRadius() + 0.5;
  div.style.borderRadius = borderRadius + 'px';
  Blockly.FieldTextInput.htmlInput_.style.borderRadius = borderRadius + 'px';
  // Pull stroke colour from the existing shadow block
  var strokeColour = this.sourceBlock_.getColourTertiary();
  div.style.borderColor = strokeColour;

  var xy = this.getAbsoluteXY_();
  // Account for border width, post-scale
  xy.x -= scale / 2;
  xy.y -= scale / 2;
  // In RTL mode block fields and LTR input fields the left edge moves,
  // whereas the right edge is fixed.  Reposition the editor.
  if (this.sourceBlock_.RTL) {
    xy.x += width;
    xy.x -= div.offsetWidth * scale;
    xy.x += 1 * scale;
  }
  // Shift by a few pixels to line up exactly.
  xy.y += 1 * scale;
  if (goog.userAgent.GECKO && Blockly.WidgetDiv.DIV.style.top) {
    // Firefox mis-reports the location of the border by a pixel
    // once the WidgetDiv is moved into position.
    xy.x += 2 * scale;
    xy.y += 1 * scale;
  }
  if (goog.userAgent.WEBKIT) {
    xy.y -= 1 * scale;
  }
  // Finally, set the actual style
  div.style.left = xy.x + 'px';
  div.style.top = xy.y + 'px';
};

/**
 * Border radius for drawing this field, called when rendering the owning shadow block.
 * @return {Number} Border radius in px.
*/
Blockly.FieldTextInput.prototype.getBorderRadius = function() {
  if (this.sourceBlock_.getOutputShape() == Blockly.OUTPUT_SHAPE_ROUND) {
    return Blockly.BlockSvg.NUMBER_FIELD_CORNER_RADIUS;
  }
  return Blockly.BlockSvg.TEXT_FIELD_CORNER_RADIUS;
};

/**
 * Close the editor, save the results, and start animating the disposal of elements.
 * @return {!Function} Closure to call on destruction of the WidgetDiv.
 * @private
 */
Blockly.FieldTextInput.prototype.widgetDispose_ = function() {
  var thisField = this;
  return function() {
    var div = Blockly.WidgetDiv.DIV;
    var htmlInput = Blockly.FieldTextInput.htmlInput_;
    // Save the edit (if it validates).
    thisField.maybeSaveEdit_();

    thisField.unbindEvents_(htmlInput);
    if (htmlInput.dropDownArrowMouseWrapper_) {
      Blockly.unbindEvent_(htmlInput.dropDownArrowMouseWrapper_);
    }
    Blockly.Events.setGroup(false);

    // Animation of disposal
    htmlInput.style.fontSize = Blockly.BlockSvg.FIELD_TEXTINPUT_FONTSIZE_INITIAL + 'pt';
    div.style.boxShadow = '';
    // Resize to actual size of final source block.
    if (thisField.sourceBlock_) {
      if (thisField.sourceBlock_.isShadow()) {
        var size = thisField.sourceBlock_.getHeightWidth();
        div.style.width = (size.width + 1) + 'px';
        div.style.height = (size.height + 1) + 'px';
      } else {
        div.style.width = (thisField.size_.width + 1) + 'px';
        div.style.height = (Blockly.BlockSvg.FIELD_HEIGHT_MAX_EDIT + 1) + 'px';
      }
    }
    div.style.marginLeft = 0;
  };
};

/**
 * Final disposal of the text field's elements and properties.
 * @return {!Function} Closure to call on finish animation of the WidgetDiv.
 * @private
 */
Blockly.FieldTextInput.prototype.widgetDisposeAnimationFinished_ = function() {
  return function() {
    // Delete style properties.
    var style = Blockly.WidgetDiv.DIV.style;
    style.width = 'auto';
    style.height = 'auto';
    style.fontSize = '';
    // Reset class
    Blockly.WidgetDiv.DIV.className = 'blocklyWidgetDiv';
    // Remove all styles
    Blockly.WidgetDiv.DIV.removeAttribute('style');
    Blockly.FieldTextInput.htmlInput_.style.transition = '';
    Blockly.FieldTextInput.htmlInput_ = null;
  };
};

Blockly.FieldTextInput.prototype.maybeSaveEdit_ = function() {
  var htmlInput = Blockly.FieldTextInput.htmlInput_;
  // Save the edit (if it validates).
  var text = htmlInput.value;
  if (this.sourceBlock_) {
    var text1 = this.callValidator(text);
    if (text1 === null) {
      // Invalid edit.
      text = htmlInput.defaultValue;
    } else {
      // Validation function has changed the text.
      text = text1;
      if (this.onFinishEditing_) {
        this.onFinishEditing_(text);
      }
    }
  }
  this.setText(text);
  this.sourceBlock_.rendered && this.sourceBlock_.render();
};

/**
 * Ensure that only a number may be entered.
 * @param {string} text The user's text.
 * @return {?string} A string representing a valid number, or null if invalid.
 */
Blockly.FieldTextInput.numberValidator = function(text) {
  console.warn('Blockly.FieldTextInput.numberValidator is deprecated. ' +
               'Use Blockly.FieldNumber instead.');
  if (text === null) {
    return null;
  }
  text = String(text);
  // TODO: Handle cases like 'ten', '1.203,14', etc.
  // 'O' is sometimes mistaken for '0' by inexperienced users.
  text = text.replace(/O/ig, '0');
  // Strip out thousands separators.
  text = text.replace(/,/g, '');
  var n = parseFloat(text || 0);
  return isNaN(n) ? null : String(n);
};

/**
 * Ensure that only a nonnegative integer may be entered.
 * @param {string} text The user's text.
 * @return {?string} A string representing a valid int, or null if invalid.
 */
Blockly.FieldTextInput.nonnegativeIntegerValidator = function(text) {
  var n = Blockly.FieldTextInput.numberValidator(text);
  if (n) {
    n = String(Math.max(0, Math.floor(n)));
  }
  return n;
};

Blockly.Field.register('field_input', Blockly.FieldTextInput);
