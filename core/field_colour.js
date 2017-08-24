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
 * @fileoverview Colour input field.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.FieldColour');

goog.require('Blockly.Field');
goog.require('Blockly.DropDownDiv');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.style');
goog.require('goog.color');
goog.require('goog.ui.Slider');

/**
 * Class for a colour input field.
 * @param {string} colour The initial colour in '#rrggbb' format.
 * @param {Function=} opt_validator A function that is executed when a new
 *     colour is selected.  Its sole argument is the new colour value.  Its
 *     return value becomes the selected colour, unless it is undefined, in
 *     which case the new colour stands, or it is null, in which case the change
 *     is aborted.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldColour = function(colour, opt_validator) {
  Blockly.FieldColour.superClass_.constructor.call(this, colour, opt_validator);
  this.addArgType('colour');
};
goog.inherits(Blockly.FieldColour, Blockly.Field);

/**
 * By default use the global constants for colours.
 * @type {Array.<string>}
 * @private
 */
Blockly.FieldColour.prototype.colours_ = null;

/**
 * By default use the global constants for columns.
 * @type {number}
 * @private
 */
Blockly.FieldColour.prototype.columns_ = 0;

/**
 * Function to be called if eyedropper can be activated.
 * If defined, an eyedropper button will be added to the color picker.
 * The button calls this function with a callback to update the field value.
 */
Blockly.FieldColour.activateEyedropper = null;

/**
 * Path to the eyedropper svg icon.
 */
Blockly.FieldColour.EYEDROPPER_PATH = 'eyedropper.svg';

/**
 * Install this field on a block.
 * @param {!Blockly.Block} block The block containing this field.
 */
Blockly.FieldColour.prototype.init = function(block) {
  Blockly.FieldColour.superClass_.init.call(this, block);
  this.setValue(this.getValue());
};

/**
 * Return the current colour.
 * @return {string} Current colour in '#rrggbb' format.
 */
Blockly.FieldColour.prototype.getValue = function() {
  return this.colour_;
};

/**
 * Set the colour. If opt_fromSliders is true, do not update the sliders.
 * @param {string} colour The new colour in '#rrggbb' format.
 * @param {boolea} opt_fromSliders Flag to prevent sliders from recursing on themselves.
 */
Blockly.FieldColour.prototype.setValue = function(colour, opt_fromSliders) {
  if (this.sourceBlock_ && Blockly.Events.isEnabled() &&
      this.colour_ != colour) {
    Blockly.Events.fire(new Blockly.Events.BlockChange(
        this.sourceBlock_, 'field', this.name, this.colour_, colour));
  }
  this.colour_ = colour;
  if (this.sourceBlock_) {
    // Set the primary, secondary and tertiary colour to this value.
    // The renderer expects to be able to use the secondary color as the fill for a shadow.
    this.sourceBlock_.setColour(colour, colour, this.sourceBlock_.getColourTertiary());
  }
  if (!opt_fromSliders) {
    this.updateSliderHandles_();
  }
  this.updateDom_();
};

/**
 * Create the hue, saturation or value CSS gradient for the slide backgrounds.
 * @param {string} channel – Either "hue", "saturation" or "value".
 * @return {string} Array color hex color stops for the given channel
 */
Blockly.FieldColour.prototype.createColorStops_ = function(channel) {
  var hsv = goog.color.hexToHsv(this.getValue());
  var stops = [];
  for(var n = 0; n <= 360; n += 20) {
    switch (channel) {
      case 'hue':
        stops.push(goog.color.hsvToHex(n, hsv[1], hsv[2]));
        break;
      case 'saturation':
        stops.push(goog.color.hsvToHex(hsv[0], n / 360, hsv[2]));
        break;
      case 'brightness':
        stops.push(goog.color.hsvToHex(hsv[0], hsv[1], 255 * n / 360));
        break;
    }
  }
  return stops;
};

/**
 * Set the gradient CSS properties for the given node and channel
 * @param {Node} node - The DOM node the gradient will be set on.
 * @param {string} channel – Either "hue", "saturation" or "value".
 */
Blockly.FieldColour.prototype.setGradient_ = function(node, channel) {
  var stops = this.createColorStops_(channel);
  goog.style.setStyle(node, 'background',
        '-moz-linear-gradient(left, ' + stops.join(',') + ')');
  goog.style.setStyle(node, 'background',
        '-webkit-linear-gradient(left, ' + stops.join(',') + ')');
  goog.style.setStyle(node, 'background',
        '-o-linear-gradient(left, ' + stops.join(',') + ')');
  goog.style.setStyle(node, 'background',
        '-ms-linear-gradient(left, ' + stops.join(',') + ')');
  goog.style.setStyle(node, 'background',
        'linear-gradient(left, ' + stops.join(',') + ')');
};

/**
 * Update the readouts and slider backgrounds after value has changed.
 */
Blockly.FieldColour.prototype.updateDom_ = function() {
  if (this.hueSlider_) {
    // Update the slider backgrounds
    this.setGradient_(this.hueSlider_.getElement(), 'hue');
    this.setGradient_(this.saturationSlider_.getElement(), 'saturation');
    this.setGradient_(this.brightnessSlider_.getElement(), 'brightness');

    // Update the readouts
    var hsv = goog.color.hexToHsv(this.getValue());
    this.hueReadout_.innerHTML = Math.floor(100 * hsv[0] / 360).toFixed(0);
    this.saturationReadout_.innerHTML = Math.floor(100 * hsv[1]).toFixed(0);
    this.brightnessReadout_.innerHTML = Math.floor(100 * hsv[2] / 255).toFixed(0);
  }
};

/**
 * Update the slider handle positions
 */
Blockly.FieldColour.prototype.updateSliderHandles_ = function() {
  if (this.hueSlider_) {
    var hsv = goog.color.hexToHsv(this.getValue());
    this.hueSlider_.animatedSetValue(hsv[0]);
    this.saturationSlider_.animatedSetValue(hsv[1]);
    this.brightnessSlider_.animatedSetValue(hsv[2]);
  }
};

/**
 * Get the text from this field.  Used when the block is collapsed.
 * @return {string} Current text.
 */
Blockly.FieldColour.prototype.getText = function() {
  var colour = this.colour_;
  // Try to use #rgb format if possible, rather than #rrggbb.
  var m = colour.match(/^#(.)\1(.)\2(.)\3$/);
  if (m) {
    colour = '#' + m[1] + m[2] + m[3];
  }
  return colour;
};

/**
 * Function to be called if eyedropper can be activated.
 * If defined, an eyedropper button will be added to the color picker.
 * The button calls this function with a callback to update the field value.
 * BEWARE: This is not a stable API, so it is being marked as private. It may change.
 */
Blockly.FieldColour.activateEyedropper_ = null;

/**
 * Path to the eyedropper svg icon.
 */
Blockly.FieldColour.EYEDROPPER_PATH = 'eyedropper.svg';

/**
 * Create label and readout DOM elements, returning the readout
 * @param {string} labelText - Text for the label
 * @return {Array} The container node and the readout node.
 * @private
 */
Blockly.FieldColour.prototype.createLabelDom_ = function(labelText) {
  var labelContainer = document.createElement('div');
  labelContainer.setAttribute('class', 'scratchColorPickerLabel');
  var readout = document.createElement('span');
  readout.setAttribute('class', 'scratchColorPickerReadout');
  var label = document.createElement('span');
  label.setAttribute('class', 'scratchColorPickerLabelText');
  label.innerHTML = labelText;
  labelContainer.appendChild(label);
  labelContainer.appendChild(readout);
  return [labelContainer, readout];
};

/**
 * Factory for creating the different slider callbacks
 * @param {string} channel - One of "hue", "saturation" or "brightness"
 * @return {function} the callback for slider update
 */
Blockly.FieldColour.prototype.sliderCallbackFactory = function(channel) {
  var thisField = this;
  return function(event) {
    var channelValue = event.target.getValue();
    var hsv = goog.color.hexToHsv(thisField.getValue());
    switch (channel) {
      case 'hue':
        hsv[0] = channelValue;
        break;
      case 'saturation':
        hsv[1] = channelValue;
        break;
      case 'brightness':
        hsv[2] = channelValue;
        break;
    }
    var colour = goog.color.hsvToHex(hsv[0], hsv[1], hsv[2]);
    if (thisField.sourceBlock_) {
         // Call any validation function, and allow it to override.
      colour = thisField.callValidator(colour);
    }
    if (colour !== null) {
      thisField.setValue(colour, true);
    }
  };
};

/**
 * Activate the eyedropper, passing in a callback for setting the field value.
 * @private
 */
Blockly.FieldColour.prototype.activateEyedropperInternal_ = function() {
  var thisField = this;
  Blockly.FieldColour.activateEyedropper_(function(value) {
    thisField.setValue(value);
  });
};

/**
 * Create a palette under the colour field.
 * @private
 */
Blockly.FieldColour.prototype.showEditor_ = function() {
  Blockly.DropDownDiv.hideWithoutAnimation();
  Blockly.DropDownDiv.clearContent();
  var div = Blockly.DropDownDiv.getContentDiv();

  var hueElements = this.createLabelDom_('Hue');
  div.appendChild(hueElements[0]);
  this.hueReadout_ = hueElements[1];
  this.hueSlider_ = new goog.ui.Slider();
  this.hueSlider_.setUnitIncrement(5);
  this.hueSlider_.setMinimum(0);
  this.hueSlider_.setMaximum(359);
  this.hueSlider_.render(div);

  var saturationElements = this.createLabelDom_('Saturation');
  div.appendChild(saturationElements[0]);
  this.saturationReadout_ = saturationElements[1];
  this.saturationSlider_ = new goog.ui.Slider();
  this.saturationSlider_.setUnitIncrement(0.01);
  this.saturationSlider_.setStep(0.001);
  this.saturationSlider_.setMinimum(0.01);
  this.saturationSlider_.setMaximum(0.99);
  this.saturationSlider_.render(div);

  var brightnessElements = this.createLabelDom_('Brightness');
  div.appendChild(brightnessElements[0]);
  this.brightnessReadout_ = brightnessElements[1];
  this.brightnessSlider_ = new goog.ui.Slider();
  this.brightnessSlider_.setUnitIncrement(2);
  this.brightnessSlider_.setMinimum(5);
  this.brightnessSlider_.setMaximum(255);
  this.brightnessSlider_.render(div);

  Blockly.FieldColour.hueChangeEventKey_ = goog.events.listen(this.hueSlider_,
        goog.ui.Component.EventType.CHANGE,
        this.sliderCallbackFactory('hue'));
  Blockly.FieldColour.saturationChangeEventKey_ = goog.events.listen(this.saturationSlider_,
        goog.ui.Component.EventType.CHANGE,
        this.sliderCallbackFactory('saturation'));
  Blockly.FieldColour.brightnessChangeEventKey_ = goog.events.listen(this.brightnessSlider_,
        goog.ui.Component.EventType.CHANGE,
        this.sliderCallbackFactory('brightness'));

  if (Blockly.FieldColour.activateEyedropper_) {
    var button = document.createElement('button');
    var image = document.createElement('img');
    image.src = Blockly.mainWorkspace.options.pathToMedia + Blockly.FieldColour.EYEDROPPER_PATH;
    button.appendChild(image);
    div.appendChild(button);
    Blockly.FieldColour.eyedropperEventData_ = Blockly.bindEventWithChecks_(button,
      'mousedown',
      this,
      this.activateEyedropperInternal_
    );
  }

  Blockly.DropDownDiv.setColour('#ffffff', '#dddddd');
  Blockly.DropDownDiv.setCategory(this.sourceBlock_.parentBlock_.getCategory());
  Blockly.DropDownDiv.showPositionedByBlock(this, this.sourceBlock_);

  this.setValue(this.getValue());
};

/**
 * Hide the colour palette.
 * @private
 */
Blockly.FieldColour.widgetDispose_ = function() {
  if (Blockly.FieldColour.hueChangeEventKey_) {
    goog.events.unlistenByKey(Blockly.FieldColour.hueChangeEventKey_);
  }
  if (Blockly.FieldColour.saturationChangeEventKey_) {
    goog.events.unlistenByKey(Blockly.FieldColour.saturationChangeEventKey_);
  }
  if (Blockly.FieldColour.brightnessChangeEventKey_) {
    goog.events.unlistenByKey(Blockly.FieldColour.brightnessChangeEventKey_);
  }
  if (Blockly.FieldColour.eyedropperEventData_) {
    Blockly.unbindEvent_(Blockly.FieldColour.eyedropperEventData_);
  }
  Blockly.Events.setGroup(false);
};
