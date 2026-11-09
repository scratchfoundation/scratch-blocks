/**
 * Visual Blocks Editor
 *
 * Copyright 2016 Massachusetts Institute of Technology
 * All rights reserved.
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
 * @file 5x5 matrix input field.
 * Displays an editable 5x5 matrix for controlling LED arrays.
 * @author khanning@gmail.com (Kreg Hanning)
 */
import { FieldBitmap, FieldBitmapFromJsonConfig } from '@blockly/field-bitmap'
import * as Blockly from 'blockly/core'

enum LEDState {
  ON = '1',
  OFF = '0',
}

/**
 * Class for a matrix field.
 */
class FieldMatrix extends FieldBitmap {
  /**
   * Array of SVGElement<rect> for matrix thumbnail image on block field.
   */
  private ledThumbNodes_: SVGElement[] = []

  /**
   * SVG image for dropdown arrow.
   */
  private arrow_: SVGElement | null = null

  /**
   * The name of the block style applied to the parent block before this field's
   * dropdown was shown.
   */
  private originalStyle = ''

  /**
   * The flattened value of this field when the field editor was opened, before
   * any changes were made.
   */
  private oldValue: string | null = null

  /**
   * Construct a FieldMatrix from a JSON arg object.
   * @param options A JSON object with options (matrix).
   * @returns The new field instance.
   */
  static fromJson(options: FieldMatrixConfig): FieldMatrix {
    return new FieldMatrix(options.matrix)
  }

  /**
   * Fixed size of the matrix thumbnail in the input field, in px.
   */
  static readonly THUMBNAIL_SIZE = 26

  /**
   * Fixed size of each matrix thumbnail node, in px.
   */
  static readonly THUMBNAIL_NODE_SIZE = 4

  /**
   * Fixed size of each matrix thumbnail node, in px.
   */
  static readonly THUMBNAIL_NODE_PAD = 1

  /**
   * Fixed size of arrow icon in drop down menu, in px.
   */
  static readonly ARROW_SIZE = 12

  /**
   * Fixed size of each button inside the 5x5 matrix, in px.
   */
  static readonly MATRIX_NODE_SIZE = 18

  constructor(
    value: string | number[][] | typeof Blockly.Field.SKIP_SETUP,
    validator?: Blockly.FieldValidator<number[][]>,
    config?: FieldMatrixConfig,
  ) {
    const initialValue =
      Array.isArray(value) || value === Blockly.Field.SKIP_SETUP
        ? value
        : (FieldMatrix.arrayify(value) ?? Blockly.Field.SKIP_SETUP)

    super(initialValue, validator, {
      width: 5,
      height: 5,
      buttons: { randomize: false, clear: false },
      ...config,
    })
  }

  /**
   * Converts from a flattened string representation to a 2D array
   * representation of the state of this field.
   *
   * Projects store this field's value as a string with one character per LED,
   * row by row. Blockly's `FieldBitmap`, which this inherits from, represents
   * its value as a 2D array of numbers. As in the micro:bit extension, any
   * character other than '0' is a lit LED. Commas and whitespace are ignored,
   * and a short string is padded with unlit LEDs.
   * @param value The value for this field represented as a string of 1s and 0s.
   * @returns A 2D array representation of the same value, or null if the value
   *     is not a string.
   */
  private static arrayify(value: unknown): number[][] | null {
    if (typeof value !== 'string') return null
    const leds = value.replace(/[\s,]/g, '').padEnd(25, LEDState.OFF)
    const result = []
    for (let row = 0; row < 5; row++) {
      result.push([...leds.slice(row * 5, row * 5 + 5)].map((led) => ((led as LEDState) === LEDState.OFF ? 0 : 1)))
    }
    return result
  }

  /**
   * Converts from the 2D array representation of this field's state to the
   * flattened string representation that projects and scratch-vm use.
   * @param value A 2D array representation of this field's state.
   * @returns The same value as a string of 25 1s and 0s, or null.
   */
  private static flatten(value: number[][] | null): string | null {
    return value?.flat().join('') ?? null
  }

  /**
   * Normalizes the provided value to a 2D array of numbers.
   * @param newValue The new value for this field, as a 2D array or 0/1 string.
   * @returns The provided value as a 2D array, or null.
   */
  protected override doClassValidation_(newValue?: number[][] | string) {
    if (newValue === undefined) return null

    if (Array.isArray(newValue)) {
      return super.doClassValidation_(newValue) ?? null
    } else {
      return super.doClassValidation_(FieldMatrix.arrayify(newValue) ?? []) ?? null
    }
  }

  /**
   * Sets this field's value. This fires its own change event rather than
   * letting the superclass fire one, because scratch-vm stores the event's
   * value verbatim and needs the flattened string representation rather than
   * the internal 2D array.
   * @param newValue The new value, as a 2D array or a string of 1s and 0s.
   * @param fireChangeEvent Whether to fire a change event if the value changes.
   */
  override setValue(newValue: unknown, fireChangeEvent = true) {
    const oldValue = FieldMatrix.flatten(this.getValue())
    super.setValue(newValue, false)
    const value = FieldMatrix.flatten(this.getValue())

    const sourceBlock = this.getSourceBlock()
    if (fireChangeEvent && sourceBlock && Blockly.Events.isEnabled() && value !== oldValue) {
      Blockly.Events.fire(
        new (Blockly.Events.get(Blockly.Events.BLOCK_CHANGE))(
          sourceBlock,
          'field',
          this.name ?? null,
          oldValue,
          value,
        ),
      )
    }
  }

  /**
   * Serializes this field's value to XML as the flattened string
   * representation that projects and scratch-vm use.
   * @param fieldElement The element to populate with this field's value.
   * @returns The populated element.
   */
  override toXml(fieldElement: Element): Element {
    fieldElement.textContent = FieldMatrix.flatten(this.getValue())
    return fieldElement
  }

  /**
   * Serializes this field's value to JSON as the flattened string
   * representation that projects and scratch-vm use.
   * @returns This field's value as a string of 25 1s and 0s.
   */
  override saveState(): string | null {
    return FieldMatrix.flatten(this.getValue())
  }

  /**
   * Indicates that this is always a full-block field.
   * @returns True.
   */
  override isFullBlockField() {
    return true
  }

  /**
   * Called when the field is placed on a block.
   */
  initView() {
    // Build the DOM.
    this.updateSize_()
    const dropdownArrowPadding = (this.getConstants() as Blockly.zelos.ConstantProvider).GRID_UNIT * 2
    const thumbX = dropdownArrowPadding / 2
    const thumbY = (this.size_.height - FieldMatrix.THUMBNAIL_SIZE) / 2
    const thumbnail = Blockly.utils.dom.createSvgElement(
      'g',
      {
        transform: 'translate(' + thumbX + ', ' + thumbY + ')',
        'pointer-events': 'bounding-box',
        cursor: 'pointer',
      },
      this.fieldGroup_,
    )
    this.ledThumbNodes_ = []
    const nodeSize = FieldMatrix.THUMBNAIL_NODE_SIZE
    const nodePad = FieldMatrix.THUMBNAIL_NODE_PAD
    for (let i = 0; i < 5; i++) {
      for (let n = 0; n < 5; n++) {
        const attr = {
          x: (nodeSize + nodePad) * n + nodePad,
          y: (nodeSize + nodePad) * i + nodePad,
          width: nodeSize,
          height: nodeSize,
          rx: nodePad,
          ry: nodePad,
        }
        this.ledThumbNodes_.push(Blockly.utils.dom.createSvgElement('rect', attr, thumbnail))
      }
      thumbnail.style.cursor = 'default'
      this.updateMatrix_()
    }

    if (!this.arrow_) {
      const arrowX = FieldMatrix.THUMBNAIL_SIZE + dropdownArrowPadding * 1.5
      const arrowY = (this.size_.height - FieldMatrix.ARROW_SIZE) / 2
      this.arrow_ = Blockly.utils.dom.createSvgElement(
        'image',
        {
          height: FieldMatrix.ARROW_SIZE + 'px',
          width: FieldMatrix.ARROW_SIZE + 'px',
          transform: 'translate(' + arrowX + ', ' + arrowY + ')',
        },
        this.fieldGroup_,
      )
      this.arrow_.setAttributeNS(
        'http://www.w3.org/1999/xlink',
        'xlink:href',
        this.getConstants()?.FIELD_DROPDOWN_SVG_ARROW_DATAURI ?? '',
      )
      this.arrow_.style.cursor = 'default'
    }
  }

  /**
   * Updates the field's thumbnail when the value changes.
   * @param newValue The new value for this field.
   */
  doValueUpdate_(newValue: number[][]) {
    super.doValueUpdate_(newValue)
    this.updateMatrix_()
  }

  /**
   * Show the drop-down menu for editing this field.
   */
  showEditor_() {
    const sourceBlock = this.getSourceBlock() as Blockly.BlockSvg
    this.pixelColours = { empty: sourceBlock.getColourSecondary(), filled: 'var(--colour-text)' }
    Blockly.DropDownDiv.setColour(sourceBlock.getColour(), sourceBlock.getColourTertiary())

    const style = sourceBlock.style
    this.originalStyle = sourceBlock.getStyleName()
    this.oldValue = FieldMatrix.flatten(this.getValue())
    if (sourceBlock.isShadow()) {
      sourceBlock.setStyle(`${this.originalStyle}_selected`)
    } else if (this.borderRect_) {
      this.borderRect_.setAttribute(
        'fill',
        'colourQuaternary' in style ? String(style.colourQuaternary) : style.colourTertiary,
      )
    }

    super.showEditor_()

    const div = Blockly.DropDownDiv.getContentDiv()

    // Div for lower button menu
    const buttonDiv = document.createElement('div')
    buttonDiv.className = 'scratchMatrixButtonContainer'

    // Button to clear matrix
    const clearButton = this.createButton_(sourceBlock.getColourSecondary())
    Blockly.utils.aria.setState(
      clearButton,
      Blockly.utils.aria.State.LABEL,
      Blockly.Msg.FIELD_BITMAP_BUTTON_LABEL_CLEAR,
    )
    clearButton.addEventListener('click', () => {
      this.setAllLeds(0)
    })

    // Button to fill matrix
    const fillButton = this.createButton_('var(--colour-text)')
    Blockly.utils.aria.setState(fillButton, Blockly.utils.aria.State.LABEL, Blockly.Msg.ARIA_LABEL_TURN_ON_ALL)
    fillButton.addEventListener('click', () => {
      this.setAllLeds(1)
    })

    buttonDiv.appendChild(clearButton)
    buttonDiv.appendChild(fillButton)
    div.appendChild(buttonDiv)

    this.updateMatrix_()
  }

  /**
   * Turns every LED on or off from the editor. Like individual LED edits, this
   * fires an intermediate change event, and the change is committed as a single
   * change event when the editor closes.
   * @param state 1 to turn every LED on, or 0 to turn every LED off.
   */
  private setAllLeds(state: 0 | 1) {
    const matrix = Array.from({ length: 5 }, () => new Array<number>(5).fill(state))
    this.fireIntermediateChangeEvent(matrix)
    this.setValue(matrix, false)
  }

  protected override dropdownDispose() {
    const sourceBlock = this.getSourceBlock()
    const value = FieldMatrix.flatten(this.getValue())

    if (sourceBlock && this.oldValue !== null && this.oldValue !== value) {
      // Fire a change event with a flattened string representation of this
      // field's value as the VM expects rather than the internal 2D array
      // representation.
      Blockly.Events.fire(
        new (Blockly.Events.get(Blockly.Events.BLOCK_CHANGE))(
          sourceBlock,
          'field',
          this.name ?? null,
          this.oldValue,
          value,
        ),
      )
    }

    if (sourceBlock?.isShadow()) {
      sourceBlock.setStyle(this.originalStyle)
    }

    // Prevent super's implementation from firing a change event as well with
    // the 2D array representation.
    Blockly.Events.disable()
    try {
      super.dropdownDispose()
    } finally {
      Blockly.Events.enable()
    }

    this.updateMatrix_()
  }

  /**
   * Make a button containing an svg object that resembles a 3x3 matrix.
   * @param fill The color to fill the matrix nodes.
   * @returns The button element.
   */
  createButton_(fill: string): HTMLButtonElement {
    const button = document.createElement('button')
    button.className = 'scratchMatrixButton'
    const icon = Blockly.utils.dom.createSvgElement('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      'xmlns:html': 'http://www.w3.org/1999/xhtml',
      'xmlns:xlink': 'http://www.w3.org/1999/xlink',
      version: '1.1',
      height: FieldMatrix.MATRIX_NODE_SIZE + 'px',
      width: FieldMatrix.MATRIX_NODE_SIZE + 'px',
    })
    const nodeSize = FieldMatrix.MATRIX_NODE_SIZE / 4
    const nodePad = FieldMatrix.MATRIX_NODE_SIZE / 16
    for (let i = 0; i < 3; i++) {
      for (let n = 0; n < 3; n++) {
        Blockly.utils.dom.createSvgElement(
          'rect',
          {
            x: (nodeSize + nodePad) * n + nodePad,
            y: (nodeSize + nodePad) * i + nodePad,
            width: nodeSize,
            height: nodeSize,
            rx: nodePad,
            ry: nodePad,
            fill: fill,
          },
          icon,
        )
      }
    }
    button.appendChild(icon)
    return button
  }

  /**
   * Redraw the matrix with the current value.
   */
  private updateMatrix_() {
    const matrix = this.getValue()?.flat().join('')
    if (!matrix) return
    const sourceBlock = this.getSourceBlock() as Blockly.BlockSvg | null
    if (!sourceBlock) return
    const selected = sourceBlock.getStyleName().endsWith('_selected')
    const style = selected
      ? sourceBlock.workspace.getRenderer().getConstants().getBlockStyle(this.originalStyle)
      : sourceBlock.getStyle()

    for (let i = 0; i < matrix.length; i++) {
      if ((matrix[i] as LEDState) === LEDState.OFF) {
        this.fillMatrixNode_(this.ledThumbNodes_, i, style.colourPrimary)
      } else {
        this.fillMatrixNode_(this.ledThumbNodes_, i, 'var(--colour-text)')
      }
    }
  }

  /**
   * Fill matrix node with specified colour.
   * @param node The array of matrix nodes.
   * @param index The index of the matrix node.
   * @param fill The fill colour in '#rrggbb' format.
   */
  fillMatrixNode_(node: SVGElement[], index: number, fill: string) {
    if (!node[index] || !fill) return
    node[index].setAttribute('fill', fill)
  }

  updateSize_() {
    const constants = this.getConstants() as Blockly.zelos.ConstantProvider
    const totalHeight = constants.FIELD_TEXT_HEIGHT

    this.size_.height = totalHeight
    this.size_.width = FieldMatrix.THUMBNAIL_SIZE + FieldMatrix.ARROW_SIZE + constants.GRID_UNIT * 2 * 1.5

    this.positionBorderRect_()
  }

  getClickTarget_() {
    return (this.getSourceBlock() as Blockly.BlockSvg).getSvgRoot()
  }

  /**
   * Fires an intermediate change event reflecting a cell being toggled before
   * the final state change has been committed. This explicitly does not call
   * super, because we need to emit an event with a flattened string
   * representation of this field's value as expected by the VM, rather than the
   * internal 2D array representation.
   * @param newValue The new value of this field.
   */
  protected override fireIntermediateChangeEvent(newValue: number[][]) {
    if (this.getSourceBlock()) {
      Blockly.Events.fire(
        new (Blockly.Events.get(Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE))(
          this.getSourceBlock(),
          this.name ?? null,
          FieldMatrix.flatten(this.getValue()),
          FieldMatrix.flatten(newValue),
        ),
      )
    }
  }
}

interface FieldMatrixConfig extends FieldBitmapFromJsonConfig {
  matrix: string
}

/**
 * Register the field and any dependencies.
 */
export function registerFieldMatrix() {
  Blockly.Css.register(`
    .bitmapPixelGrid {
      gap: 5px;
      margin: 5px;
      margin-bottom: 10px;
    }
    .pixelButton {
      border: none;
      border-radius: 4px;
      width: 18px;
      height: 18px;
    }
    .scratchMatrixButtonContainer {
      display: flex;
      justify-content: space-evenly;
    }
    .scratchMatrixButton {
      border: none;
      background: none;
      padding: 3px;
      padding-bottom: 1px;
    }
    .scratchMatrixButton:focus {
      outline-width: var(--blockly-selection-width);
      outline-color: var(--blockly-active-node-color);
      outline-style: solid;
      border-radius: 4px;
    }`)
  Blockly.fieldRegistry.register('field_matrix', FieldMatrix)
}
