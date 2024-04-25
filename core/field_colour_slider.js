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
import * as Blockly from 'blockly/core';
import {FieldColour} from '@blockly/field-colour';

/**
 * Class for a slider-based colour input field.
 * @param {string} colour The initial colour in '#rrggbb' format.
 * @param {Function=} opt_validator A function that is executed when a new
 *     colour is selected.  Its sole argument is the new colour value.  Its
 *     return value becomes the selected colour, unless it is undefined, in
 *     which case the new colour stands, or it is null, in which case the change
 *     is aborted.
 * @extends {Blockly.Field}
 * @constructor
 */
export class FieldColourSlider extends FieldColour {
  /**
   * Function to be called if eyedropper can be activated.
   * If defined, an eyedropper button will be added to the color picker.
   * The button calls this function with a callback to update the field value.
   * BEWARE: This is not a stable API, so it is being marked as private. It may change.
   * @private
   */
  static activateEyedropper_ = null;

  constructor(colour, opt_validator) {
    super(colour, opt_validator);

    /**
     * Path to the eyedropper svg icon.
     */
    this.EYEDROPPER_PATH = 'eyedropper.svg';
    this.SERIALIZABLE = true;
    this.EDITABLE = true;
  }

  /**
   * Construct a FieldColourSlider from a JSON arg object.
   * @param {!Object} options A JSON object with options (colour).
   * @returns {!Blockly.FieldColourSlider} The new field instance.
   * @package
   * @nocollapse
   */
  static fromJson(options) {
    return new FieldColourSlider(options['colour']);
  }

  doValueUpdate_(newValue) {
    super.doValueUpdate_(newValue);
    this.updateSliderHandles_();
    this.updateDom_();
  }

  /**
   * Create the hue, saturation or value CSS gradient for the slide backgrounds.
   * @param {string} channel – Either "hue", "saturation" or "value".
   * @return {string} Array colour hex colour stops for the given channel
   * @private
   */
  createColourStops_(channel) {
    var stops = [];
    for(var n = 0; n <= 360; n += 20) {
      switch (channel) {
        case 'hue':
          stops.push(Blockly.utils.colour.hsvToHex(n, this.saturation_, this.brightness_));
          break;
        case 'saturation':
          stops.push(Blockly.utils.colour.hsvToHex(this.hue_, n / 360, this.brightness_));
          break;
        case 'brightness':
          stops.push(Blockly.utils.colour.hsvToHex(this.hue_, this.saturation_, 255 * n / 360));
          break;
        default:
          throw new Error("Unknown channel for colour sliders: " + channel);
      }
    }
    return stops;
  }

  /**
   * Set the gradient CSS properties for the given node and channel
   * @param {Node} node - The DOM node the gradient will be set on.
   * @param {string} channel – Either "hue", "saturation" or "value".
   * @private
   */
  setGradient_(node, channel) {
    var gradient = this.createColourStops_(channel).join(',');
    node.style['background'] = `linear-gradient(to right, ${gradient})`;
  }

  /**
   * Update the readouts and slider backgrounds after value has changed.
   * @private
   */
  updateDom_() {
    if (this.hueSlider_) {
      // Update the slider backgrounds
      this.setGradient_(this.hueSlider_, 'hue');
      this.setGradient_(this.saturationSlider_, 'saturation');
      this.setGradient_(this.brightnessSlider_, 'brightness');

      // Update the readouts
      this.hueReadout_.textContent = Math.floor(100 * this.hue_ / 360).toFixed(0);
      this.saturationReadout_.textContent = Math.floor(100 * this.saturation_).toFixed(0);
      this.brightnessReadout_.textContent = Math.floor(100 * this.brightness_ / 255).toFixed(0);
    }
  }

  /**
   * Update the slider handle positions from the current field value.
   * @private
   */
  updateSliderHandles_() {
    if (this.hueSlider_) {
      this.hueSlider_.value = this.hue_;
      this.saturationSlider_.value = this.saturation_;
      this.brightnessSlider_.value = this.brightness_;
    }
  }

  /**
   * Create label and readout DOM elements, returning the readout
   * @param {string} labelText - Text for the label
   * @return {Array} The container node and the readout node.
   * @private
   */
  createLabelDom_(labelText) {
    var labelContainer = document.createElement('div');
    labelContainer.setAttribute('class', 'scratchColourPickerLabel');
    var readout = document.createElement('span');
    readout.setAttribute('class', 'scratchColourPickerReadout');
    var label = document.createElement('span');
    label.setAttribute('class', 'scratchColourPickerLabelText');
    label.textContent = labelText;
    labelContainer.appendChild(label);
    labelContainer.appendChild(readout);
    return [labelContainer, readout];
  }

  /**
   * Factory for creating the different slider callbacks
   * @param {string} channel - One of "hue", "saturation" or "brightness"
   * @return {function} the callback for slider update
   * @private
   */
  sliderCallbackFactory_(channel) {
    var thisField = this;
    return function(event) {
      var channelValue = event.target.value;
      switch (channel) {
        case 'hue':
          thisField.hue_ = channelValue;
          break;
        case 'saturation':
          thisField.saturation_ = channelValue;
          break;
        case 'brightness':
          thisField.brightness_ = channelValue;
          break;
      }
      var colour = Blockly.utils.colour.hsvToHex(thisField.hue_, thisField.saturation_, thisField.brightness_);
      if (colour !== null) {
        thisField.setValue(colour, true);
      }
    };
  }

  /**
   * Activate the eyedropper, passing in a callback for setting the field value.
   * @private
   */
  activateEyedropperInternal_() {
    var thisField = this;
    FieldColourSlider.activateEyedropper_(function(chosenColour) {
      // Update the internal hue/saturation/brightness values so sliders update.
      const components = Blockly.utils.colour.hexToRgb(chosenColour);
      const {hue, saturation, value} = thisField.rgbToHsv(components[0], components[1], components[2]);
      thisField.hue_ = hue;
      thisField.saturation_ = saturation;
      thisField.brightness_ = value;
      thisField.setValue(chosenColour);
    });
  }

  /**
   * Create hue, saturation and brightness sliders under the colour field.
   * @private
   */
  showEditor_() {
    Blockly.DropDownDiv.hideWithoutAnimation();
    Blockly.DropDownDiv.clearContent();
    var div = Blockly.DropDownDiv.getContentDiv();
    div.className = 'scratchColourPicker';

    // Init color component values that are used while the editor is open
    // in order to keep the slider values stable.
    const components = Blockly.utils.colour.hexToRgb(this.getValue());
    var {hue, saturation, value} = this.rgbToHsv(components[0], components[1], components[2]);
    this.hue_ = hue;
    this.saturation_ = saturation;
    this.brightness_ = value;

    var hueElements = this.createLabelDom_(Blockly.Msg.COLOUR_HUE_LABEL);
    div.appendChild(hueElements[0]);
    this.hueReadout_ = hueElements[1];
    this.hueSlider_ = document.createElement('input');
    this.hueSlider_.type = 'range';
    this.hueSlider_.min = 0;
    this.hueSlider_.max = 360;
    this.hueSlider_.className = 'scratchColourSlider';
    div.appendChild(this.hueSlider_);

    var saturationElements =
        this.createLabelDom_(Blockly.Msg.COLOUR_SATURATION_LABEL);
    div.appendChild(saturationElements[0]);
    this.saturationReadout_ = saturationElements[1];
    this.saturationSlider_ = document.createElement('input');
    this.saturationSlider_.type = 'range';
    this.saturationSlider_.step = 0.001;
    this.saturationSlider_.min = 0;
    this.saturationSlider_.max = 1.0;
    this.saturationSlider_.className = 'scratchColourSlider';
    div.appendChild(this.saturationSlider_);

    var brightnessElements =
        this.createLabelDom_(Blockly.Msg.COLOUR_BRIGHTNESS_LABEL);
    div.appendChild(brightnessElements[0]);
    this.brightnessReadout_ = brightnessElements[1];
    this.brightnessSlider_ = document.createElement('input');
    this.brightnessSlider_.type = 'range';
    this.brightnessSlider_.min = 0;
    this.brightnessSlider_.max = 255;
    this.brightnessSlider_.className = 'scratchColourSlider';
    div.appendChild(this.brightnessSlider_);

    if (FieldColourSlider.activateEyedropper_) {
      var button = document.createElement('button');
      button.setAttribute('class', 'scratchEyedropper');
      var image = document.createElement('img');
      image.src = Blockly.getMainWorkspace().options.pathToMedia + this.EYEDROPPER_PATH;
      button.appendChild(image);
      div.appendChild(button);
      this.eyedropperEventData_ =
          Blockly.browserEvents.conditionalBind(button, 'click', this,
              this.activateEyedropperInternal_);
    }

    Blockly.DropDownDiv.setColour('#ffffff', '#dddddd');
    Blockly.DropDownDiv.showPositionedByBlock(this, this.sourceBlock_);

    // Set value updates the slider positions
    // Do this before attaching callbacks to avoid extra events from initial set
    this.setValue(this.getValue());

    this.hueChangeEventKey_ = Blockly.browserEvents.bind(
        this.hueSlider_, 'input', this, this.sliderCallbackFactory_('hue'));
    this.saturationChangeEventKey_ = Blockly.browserEvents.bind(
        this.saturationSlider_, 'input', this, this.sliderCallbackFactory_('saturation'));
    this.brightnessChangeEventKey_ = Blockly.browserEvents.bind(
        this.brightnessSlider_, 'input', this, this.sliderCallbackFactory_('brightness'));
  }

  dispose() {
    if (this.hueChangeEventKey_) {
      Blockly.browserEvents.unbind(this.hueChangeEventKey_);
    }
    if (this.saturationChangeEventKey_) {
      Blockly.browserEvents.unbind(this.saturationChangeEventKey_);
    }
    if (this.brightnessChangeEventKey_) {
      Blockly.browserEvents.unbind(this.brightnessChangeEventKey_);
    }
    if (this.eyedropperEventData_) {
      Blockly.browserEvents.unbind(this.eyedropperEventData_);
    }
    Blockly.Events.setGroup(false);
    super.dispose();
  }

  // From Closure
  rgbToHsv(red, green, blue) {
    const max = Math.max(Math.max(red, green), blue);
    const min = Math.min(Math.min(red, green), blue);
    let hue;
    let saturation;
    const value = max;
    if (min == max) {
      hue = 0;
      saturation = 0;
    } else {
      const delta = (max - min);
      saturation = delta / max;

      if (red == max) {
        hue = (green - blue) / delta;
      } else if (green == max) {
        hue = 2 + ((blue - red) / delta);
      } else {
        hue = 4 + ((red - green) / delta);
      }
      hue *= 60;
      if (hue < 0) {
        hue += 360;
      }
      if (hue > 360) {
        hue -= 360;
      }
    }

    return {hue, saturation, value};
  }
}

Blockly.fieldRegistry.register('field_colour_slider', FieldColourSlider);
