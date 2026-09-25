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
import { FieldColourHsvSliders } from '@blockly/field-colour-hsv-sliders'
import * as Blockly from 'blockly/core'

/**
 * Class for a slider-based colour input field.
 */
export class FieldColourSlider extends FieldColourHsvSliders {
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

  protected override showEditor_() {
    super.showEditor_()

    // Blockly's field labels the first slider as "Hue"; relabel to "Color".
    const div = Blockly.DropDownDiv.getContentDiv()
    const colorLabel = div.querySelector('.fieldColourSliderLabel span')
    if (colorLabel) {
      colorLabel.textContent = Blockly.Msg.COLOUR_HUE_LABEL
    }
    const colorSlider = div.querySelector('.fieldColourSlider')
    if (colorSlider) {
      Blockly.utils.aria.setState(colorSlider, Blockly.utils.aria.State.LABEL, Blockly.Msg.COLOUR_HUE_LABEL)
    }

    if (FieldColourSlider.activateEyedropper_) {
      const button = document.createElement('button')
      button.setAttribute('class', 'scratchEyedropper')
      const image = document.createElement('img')
      image.src = Blockly.getMainWorkspace().options.pathToMedia + this.EYEDROPPER_PATH
      button.appendChild(image)
      div.appendChild(button)
      button.addEventListener('click', () => {
        this.activateEyedropperInternal_()
      })
    }
  }

  /**
   * Activate the eyedropper, passing in a callback for setting the field value.
   */
  private activateEyedropperInternal_() {
    FieldColourSlider.activateEyedropper_?.((chosenColour: string) => {
      this.setValue(chosenColour)
    })
  }
}

/**
 * Register the field and any dependencies.
 */
export function registerFieldColourSlider() {
  Blockly.Css.register(`
    .fieldColourSliderContainer .fieldColourEyedropper,
    .fieldColourSliderContainer hr {
      display: none;
    }
    .fieldColourSliderLabel {
      justify-content: flex-start;
      gap: 8px;
      font-family: "Helvetica Neue", Helvetica, sans-serif;
      font-size: 0.65rem;
      color: var(--colour-toolboxText);
      padding: 8px;
    }
    .fieldColourSliderLabel span:first-child {
      font-weight: bold;
    }
    .scratchEyedropper:focus img {
      outline-width: var(--blockly-selection-width);
      outline-color: var(--blockly-active-node-color);
      outline-style: solid;
    }
    `)
  Blockly.fieldRegistry.register('field_colour_slider', FieldColourSlider)
}
