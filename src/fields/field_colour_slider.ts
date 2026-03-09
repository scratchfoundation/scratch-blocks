/**
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
 * @file Colour input field.
 * @author fraser@google.com (Neil Fraser)
 */
import { FieldColour, FieldColourFromJsonConfig } from '@blockly/field-colour'
import * as Blockly from 'blockly/core'

enum ColourChannel {
  HUE = 'hue',
  SATURATION = 'saturation',
  BRIGHTNESS = 'brightness',
}

/**
 * Class for a slider-based colour input field.
 */
export class FieldColourSlider extends FieldColour {
  /**
   * Function to be called if eyedropper can be activated.
   * If defined, an eyedropper button will be added to the color picker.
   * The button calls this function with a callback to update the field value.
   * BEWARE: This is not a stable API. It may change.
   */
  static activateEyedropper_?: (callback: (colour: string) => void) => void

  /**
   * Path to the eyedropper svg icon.
   */
  EYEDROPPER_PATH = 'eyedropper.svg'
  SERIALIZABLE = true
  EDITABLE = true

  private hueChangeEventKey_?: Blockly.browserEvents.Data
  private saturationChangeEventKey_?: Blockly.browserEvents.Data
  private brightnessChangeEventKey_?: Blockly.browserEvents.Data
  private hueSlider_?: HTMLInputElement
  private saturationSlider_?: HTMLInputElement
  private brightnessSlider_?: HTMLInputElement
  private hueReadout_?: Element
  private saturationReadout_?: Element
  private brightnessReadout_?: Element
  private hue_ = 0
  private saturation_ = 0
  private brightness_ = 0
  private eyedropperEventData_?: Blockly.browserEvents.Data

  /**
   * Construct a FieldColourSlider from a JSON arg object.
   * @param options A JSON object with options (colour).
   * @returns The new field instance.
   */
  static fromJson(options: FieldColourFromJsonConfig): FieldColourSlider {
    return new FieldColourSlider(options.colour)
  }

  doValueUpdate_(newValue: string) {
    super.doValueUpdate_(newValue)
    this.updateSliderHandles_()
    this.updateDom_()
  }

  /**
   * Create the hue, saturation or value CSS gradient for the slide backgrounds.
   * @param channel – Either "hue", "saturation" or "value".
   * @returns Array colour hex colour stops for the given channel
   */
  private createColourStops_(channel: ColourChannel): string[] {
    const stops = []
    for (let n = 0; n <= 360; n += 20) {
      switch (channel) {
        case ColourChannel.HUE:
          stops.push(Blockly.utils.colour.hsvToHex(n, this.saturation_, this.brightness_))
          break
        case ColourChannel.SATURATION:
          stops.push(Blockly.utils.colour.hsvToHex(this.hue_, n / 360, this.brightness_))
          break
        case ColourChannel.BRIGHTNESS:
          stops.push(Blockly.utils.colour.hsvToHex(this.hue_, this.saturation_, (255 * n) / 360))
          break
        default:
          throw new Error('Unknown channel for colour sliders: ' + channel)
      }
    }
    return stops
  }

  /**
   * Set the gradient CSS properties for the given node and channel
   * @param node The DOM node the gradient will be set on.
   * @param channel Either "hue", "saturation" or "value".
   */
  private setGradient_(node: HTMLElement, channel: ColourChannel) {
    const gradient = this.createColourStops_(channel).join(',')
    node.style.background = `linear-gradient(to right, ${gradient})`
  }

  /**
   * Update the readouts and slider backgrounds after value has changed.
   */
  private updateDom_() {
    const hueSlider = this.hueSlider_
    const saturationSlider = this.saturationSlider_
    const brightnessSlider = this.brightnessSlider_
    const hueReadout = this.hueReadout_
    const saturationReadout = this.saturationReadout_
    const brightnessReadout = this.brightnessReadout_
    if (
      !hueSlider ||
      !saturationSlider ||
      !brightnessSlider ||
      !hueReadout ||
      !saturationReadout ||
      !brightnessReadout
    ) {
      console.warn('FieldColourSlider.updateDom_: slider/readout DOM is not fully initialized')
      return
    }

    this.setGradient_(hueSlider, ColourChannel.HUE)
    this.setGradient_(saturationSlider, ColourChannel.SATURATION)
    this.setGradient_(brightnessSlider, ColourChannel.BRIGHTNESS)

    hueReadout.textContent = Math.floor((100 * this.hue_) / 360).toFixed(0)
    saturationReadout.textContent = Math.floor(100 * this.saturation_).toFixed(0)
    brightnessReadout.textContent = Math.floor((100 * this.brightness_) / 255).toFixed(0)
  }

  /**
   * Update the slider handle positions from the current field value.
   */
  private updateSliderHandles_() {
    const hueSlider = this.hueSlider_
    const saturationSlider = this.saturationSlider_
    const brightnessSlider = this.brightnessSlider_
    if (!hueSlider || !saturationSlider || !brightnessSlider) {
      console.warn('FieldColourSlider.updateSliderHandles_: slider DOM is not fully initialized')
      return
    }

    hueSlider.value = `${this.hue_}`
    saturationSlider.value = `${this.saturation_}`
    brightnessSlider.value = `${this.brightness_}`
  }

  /**
   * Create label and readout DOM elements, returning the readout.
   * @param labelText Text for the label
   * @returns The container node and the readout node.
   */
  private createLabelDom_(labelText: string): Element[] {
    const labelContainer = document.createElement('div')
    labelContainer.setAttribute('class', 'scratchColourPickerLabel')
    const readout = document.createElement('span')
    readout.setAttribute('class', 'scratchColourPickerReadout')
    const label = document.createElement('span')
    label.setAttribute('class', 'scratchColourPickerLabelText')
    label.textContent = labelText
    labelContainer.appendChild(label)
    labelContainer.appendChild(readout)
    return [labelContainer, readout]
  }

  /**
   * Factory for creating the different slider callbacks
   * @param channel One of "hue", "saturation" or "brightness"
   * @returns The callback for slider update
   */
  private sliderCallbackFactory_(channel: ColourChannel): (event: PointerEvent) => void {
    return (event: PointerEvent) => {
      const channelValue = (event.target as HTMLInputElement).value
      switch (channel) {
        case ColourChannel.HUE:
          this.hue_ = Number(channelValue)
          break
        case ColourChannel.SATURATION:
          this.saturation_ = Number(channelValue)
          break
        case ColourChannel.BRIGHTNESS:
          this.brightness_ = Number(channelValue)
          break
      }
      const colour = Blockly.utils.colour.hsvToHex(this.hue_, this.saturation_, this.brightness_)
      if (colour !== null) {
        this.setValue(colour, true)
      }
    }
  }

  /**
   * Activate the eyedropper, passing in a callback for setting the field value.
   */
  private activateEyedropperInternal_() {
    FieldColourSlider.activateEyedropper_?.((chosenColour: string) => {
      // Update the internal hue/saturation/brightness values so sliders update.
      const components = Blockly.utils.colour.hexToRgb(chosenColour)
      const { hue, saturation, value } = this.rgbToHsv(components[0], components[1], components[2])
      this.hue_ = hue
      this.saturation_ = saturation
      this.brightness_ = value
      this.setValue(chosenColour)
    })
  }

  /**
   * Create hue, saturation and brightness sliders under the colour field.
   */
  showEditor_() {
    Blockly.DropDownDiv.hideWithoutAnimation()
    Blockly.DropDownDiv.clearContent()
    const div = Blockly.DropDownDiv.getContentDiv()
    div.className = 'scratchColourPicker'

    // Init color component values that are used while the editor is open
    // in order to keep the slider values stable.
    const currentValue = this.getValue() ?? '#000000'
    const components = Blockly.utils.colour.hexToRgb(currentValue)
    const { hue, saturation, value } = this.rgbToHsv(components[0], components[1], components[2])
    this.hue_ = hue
    this.saturation_ = saturation
    this.brightness_ = value

    const hueElements = this.createLabelDom_(Blockly.Msg.COLOUR_HUE_LABEL)
    div.appendChild(hueElements[0])
    this.hueReadout_ = hueElements[1]
    this.hueSlider_ = document.createElement('input')
    this.hueSlider_.type = 'range'
    this.hueSlider_.min = '0'
    this.hueSlider_.max = '360'
    this.hueSlider_.className = 'scratchColourSlider'
    div.appendChild(this.hueSlider_)

    const saturationElements = this.createLabelDom_(Blockly.Msg.COLOUR_SATURATION_LABEL)
    div.appendChild(saturationElements[0])
    this.saturationReadout_ = saturationElements[1]
    this.saturationSlider_ = document.createElement('input')
    this.saturationSlider_.type = 'range'
    this.saturationSlider_.step = '0.001'
    this.saturationSlider_.min = '0'
    this.saturationSlider_.max = '1.0'
    this.saturationSlider_.className = 'scratchColourSlider'
    div.appendChild(this.saturationSlider_)

    const brightnessElements = this.createLabelDom_(Blockly.Msg.COLOUR_BRIGHTNESS_LABEL)
    div.appendChild(brightnessElements[0])
    this.brightnessReadout_ = brightnessElements[1]
    this.brightnessSlider_ = document.createElement('input')
    this.brightnessSlider_.type = 'range'
    this.brightnessSlider_.min = '0'
    this.brightnessSlider_.max = '255'
    this.brightnessSlider_.className = 'scratchColourSlider'
    div.appendChild(this.brightnessSlider_)

    if (FieldColourSlider.activateEyedropper_) {
      const button = document.createElement('button')
      button.setAttribute('class', 'scratchEyedropper')
      const image = document.createElement('img')
      image.src = Blockly.getMainWorkspace().options.pathToMedia + this.EYEDROPPER_PATH
      button.appendChild(image)
      div.appendChild(button)
      this.eyedropperEventData_ = Blockly.browserEvents.conditionalBind(
        button,
        'click',
        this,
        this.activateEyedropperInternal_,
      )
    }

    Blockly.DropDownDiv.setColour('#ffffff', '#dddddd')
    Blockly.DropDownDiv.showPositionedByBlock(this, this.getSourceBlock() as Blockly.BlockSvg)

    // Set value updates the slider positions
    // Do this before attaching callbacks to avoid extra events from initial set
    this.setValue(this.getValue() ?? currentValue)

    this.hueChangeEventKey_ = Blockly.browserEvents.bind(
      this.hueSlider_,
      'input',
      this,
      this.sliderCallbackFactory_(ColourChannel.HUE),
    )
    this.saturationChangeEventKey_ = Blockly.browserEvents.bind(
      this.saturationSlider_,
      'input',
      this,
      this.sliderCallbackFactory_(ColourChannel.SATURATION),
    )
    this.brightnessChangeEventKey_ = Blockly.browserEvents.bind(
      this.brightnessSlider_,
      'input',
      this,
      this.sliderCallbackFactory_(ColourChannel.BRIGHTNESS),
    )
  }

  dispose() {
    if (this.hueChangeEventKey_) {
      Blockly.browserEvents.unbind(this.hueChangeEventKey_)
    }
    if (this.saturationChangeEventKey_) {
      Blockly.browserEvents.unbind(this.saturationChangeEventKey_)
    }
    if (this.brightnessChangeEventKey_) {
      Blockly.browserEvents.unbind(this.brightnessChangeEventKey_)
    }
    if (this.eyedropperEventData_) {
      Blockly.browserEvents.unbind(this.eyedropperEventData_)
    }
    Blockly.Events.setGroup(false)
    super.dispose()
  }

  // From Closure
  rgbToHsv(red: number, green: number, blue: number): { hue: number; saturation: number; value: number } {
    const max = Math.max(Math.max(red, green), blue)
    const min = Math.min(Math.min(red, green), blue)
    let hue
    let saturation
    const value = max
    if (min == max) {
      hue = 0
      saturation = 0
    } else {
      const delta = max - min
      saturation = delta / max

      if (red == max) {
        hue = (green - blue) / delta
      } else if (green == max) {
        hue = 2 + (blue - red) / delta
      } else {
        hue = 4 + (red - green) / delta
      }
      hue *= 60
      if (hue < 0) {
        hue += 360
      }
      if (hue > 360) {
        hue -= 360
      }
    }

    return { hue, saturation, value }
  }
}

/**
 * Register the field and any dependencies.
 */
export function registerFieldColourSlider() {
  Blockly.fieldRegistry.register('field_colour_slider', FieldColourSlider)
}
