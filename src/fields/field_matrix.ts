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
import * as Blockly from 'blockly/core'

enum PaintStyle {
  FILL = 'fill',
  CLEAR = 'clear',
}

enum LEDState {
  ON = '1',
  OFF = '0',
}

/**
 * Class for a matrix field.
 */
class FieldMatrix extends Blockly.Field<string> {
  private originalStyle = ''

  /**
   * Array of SVGElement<rect> for matrix thumbnail image on block field.
   */
  private ledThumbNodes_: SVGElement[] = []
  /**
   * Array of SVGElement<rect> for matrix editor in dropdown menu.
   */
  private ledButtons_: SVGElement[] = []

  /**
   * SVGElement for LED matrix in editor.
   */
  private matrixStage_: SVGElement | null = null

  /**
   * SVG image for dropdown arrow.
   */
  private arrow_: SVGElement | null = null

  /**
   * String indicating matrix paint style.
   * value can be [null, 'fill', 'clear'].
   */
  private paintStyle_: PaintStyle | null = null

  /**
   * Touch event wrapper.
   * Runs when the field is selected.
   */
  private mouseDownWrapper_: Blockly.browserEvents.Data | null = null

  /**
   * Touch event wrapper.
   * Runs when the clear button editor button is selected.
   */
  private clearButtonWrapper_: Blockly.browserEvents.Data | null = null

  /**
   * Touch event wrapper.
   * Runs when the fill button editor button is selected.
   */
  private fillButtonWrapper_: Blockly.browserEvents.Data | null = null

  /**
   * Touch event wrapper.
   * Runs when the matrix editor is touched.
   */
  private matrixTouchWrapper_: Blockly.browserEvents.Data | null = null

  /**
   * Touch event wrapper.
   * Runs when the matrix editor touch event moves.
   */
  private matrixMoveWrapper_: Blockly.browserEvents.Data | null = null

  /**
   * Touch event wrapper.
   * Runs when the matrix editor is released.
   */
  private matrixReleaseWrapper_: Blockly.browserEvents.Data | null = null

  SERIALIZABLE = true

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

  /**
   * Fixed corner radius for 5x5 matrix buttons, in px.
   */
  static readonly MATRIX_NODE_RADIUS = 4

  /**
   * Fixed padding for 5x5 matrix buttons, in px.
   */
  static readonly MATRIX_NODE_PAD = 5

  /**
   * String with 25 '0' chars.
   * Used for clearing a matrix or filling an LED node array.
   */
  static readonly ZEROS = '0000000000000000000000000'

  /**
   * String with 25 '1' chars.
   * Used for filling a matrix.
   */
  static readonly ONES = '1111111111111111111111111'

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
        this.getConstants()!.FIELD_DROPDOWN_SVG_ARROW_DATAURI,
      )
      this.arrow_.style.cursor = 'default'
    }
  }

  doClassValidation_(matrix: string) {
    return matrix ? matrix + FieldMatrix.ZEROS.substr(0, 25 - matrix.length) : matrix
  }

  doValueUpdate_(newValue: string) {
    super.doValueUpdate_(newValue)
    if (newValue) {
      this.updateMatrix_()
    }
  }

  /**
   * Show the drop-down menu for editing this field.
   */
  showEditor_() {
    const sourceBlock = this.getSourceBlock() as Blockly.BlockSvg
    Blockly.DropDownDiv.setColour(sourceBlock.getColour(), sourceBlock.getColourTertiary())

    const style = sourceBlock.style
    if (sourceBlock.isShadow()) {
      this.originalStyle = sourceBlock.getStyleName()
      sourceBlock.setStyle(`${this.originalStyle}_selected`)
    } else if (this.borderRect_) {
      this.borderRect_.setAttribute(
        'fill',
        'colourQuaternary' in style ? `${style.colourQuaternary}` : style.colourTertiary,
      )
    }

    const div = Blockly.DropDownDiv.getContentDiv()
    // Build the SVG DOM.
    const matrixSize = FieldMatrix.MATRIX_NODE_SIZE * 5 + FieldMatrix.MATRIX_NODE_PAD * 6
    this.matrixStage_ = Blockly.utils.dom.createSvgElement(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        'xmlns:html': 'http://www.w3.org/1999/xhtml',
        'xmlns:xlink': 'http://www.w3.org/1999/xlink',
        version: '1.1',
        height: matrixSize + 'px',
        width: matrixSize + 'px',
      },
      div,
    )
    // Create the 5x5 matrix
    this.ledButtons_ = []
    for (let i = 0; i < 5; i++) {
      for (let n = 0; n < 5; n++) {
        const x = FieldMatrix.MATRIX_NODE_SIZE * n + FieldMatrix.MATRIX_NODE_PAD * (n + 1)
        const y = FieldMatrix.MATRIX_NODE_SIZE * i + FieldMatrix.MATRIX_NODE_PAD * (i + 1)
        const attr = {
          x: x + 'px',
          y: y + 'px',
          width: FieldMatrix.MATRIX_NODE_SIZE,
          height: FieldMatrix.MATRIX_NODE_SIZE,
          rx: FieldMatrix.MATRIX_NODE_RADIUS,
          ry: FieldMatrix.MATRIX_NODE_RADIUS,
        }
        const led = Blockly.utils.dom.createSvgElement('rect', attr, this.matrixStage_)
        this.matrixStage_.appendChild(led)
        this.ledButtons_.push(led)
      }
    }
    // Div for lower button menu
    const buttonDiv = document.createElement('div')
    // Button to clear matrix
    const clearButtonDiv = document.createElement('div')
    clearButtonDiv.className = 'scratchMatrixButtonDiv'

    const clearButton = this.createButton_(sourceBlock.getColourSecondary())
    clearButtonDiv.appendChild(clearButton)
    // Button to fill matrix
    const fillButtonDiv = document.createElement('div')
    fillButtonDiv.className = 'scratchMatrixButtonDiv'
    const fillButton = this.createButton_('var(--colour-text)')
    fillButtonDiv.appendChild(fillButton)

    buttonDiv.appendChild(clearButtonDiv)
    buttonDiv.appendChild(fillButtonDiv)
    div.appendChild(buttonDiv)

    Blockly.DropDownDiv.showPositionedByBlock(this, sourceBlock, this.dropdownDispose_.bind(this))

    this.matrixTouchWrapper_ = Blockly.browserEvents.bind(this.matrixStage_, 'mousedown', this, this.onMouseDown)
    this.clearButtonWrapper_ = Blockly.browserEvents.bind(clearButton, 'click', this, this.clearMatrix_)
    this.fillButtonWrapper_ = Blockly.browserEvents.bind(fillButton, 'click', this, this.fillMatrix_)

    // Update the matrix for the current value
    this.updateMatrix_()
  }

  dropdownDispose_() {
    const sourceBlock = this.getSourceBlock()!
    if (sourceBlock.isShadow()) {
      sourceBlock.setStyle(this.originalStyle)
    }
    this.updateMatrix_()
  }

  /**
   * Make an svg object that resembles a 3x3 matrix to be used as a button.
   * @param fill The color to fill the matrix nodes.
   * @returns The button svg element.
   */
  createButton_(fill: string): SVGElement {
    const button = Blockly.utils.dom.createSvgElement('svg', {
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
          button,
        )
      }
    }
    return button
  }

  /**
   * Redraw the matrix with the current value.
   */
  private updateMatrix_() {
    const matrix = this.getValue()!
    const sourceBlock = this.getSourceBlock()! as Blockly.BlockSvg
    for (let i = 0; i < matrix.length; i++) {
      if (matrix[i] === LEDState.OFF) {
        this.fillMatrixNode_(this.ledButtons_, i, sourceBlock.getColourTertiary())
        this.fillMatrixNode_(this.ledThumbNodes_, i, sourceBlock.getColourSecondary())
      } else {
        this.fillMatrixNode_(this.ledButtons_, i, 'var(--colour-text)')
        this.fillMatrixNode_(this.ledThumbNodes_, i, 'var(--colour-text)')
      }
    }
  }

  /**
   * Resets all LED values to zero.
   * @param e Checked to allow only left-button clicks (button 0).
   */
  clearMatrix_(e: PointerEvent) {
    if (e.button != 0) return
    this.setValue(FieldMatrix.ZEROS)
  }

  /**
   * Sets all LED values to one.
   * @param e Checked to allow only left-button clicks (button 0).
   */
  fillMatrix_(e: PointerEvent) {
    if (e.button != 0) return
    this.setValue(FieldMatrix.ONES)
  }

  /**
   * Fill matrix node with specified colour.
   * @param node The array of matrix nodes.
   * @param index The index of the matrix node.
   * @param fill The fill colour in '#rrggbb' format.
   */
  fillMatrixNode_(node: SVGElement[], index: number, fill: string) {
    if (!node?.[index] || !fill) return
    node[index].setAttribute('fill', fill)
  }

  setLEDNode_(led: number, state: LEDState) {
    if (led < 0 || led > 24) return
    const oldMatrix = this.getValue()!
    const newMatrix = oldMatrix.substr(0, led) + state + oldMatrix.substr(led + 1)
    this.setValue(newMatrix)
  }

  fillLEDNode_(led: number) {
    if (led < 0 || led > 24) return
    this.setLEDNode_(led, LEDState.ON)
  }

  clearLEDNode_(led: number) {
    if (led < 0 || led > 24) return
    this.setLEDNode_(led, LEDState.OFF)
  }

  toggleLEDNode_(led: number) {
    if (led < 0 || led > 24) return
    if (this.getValue()!.charAt(led) === LEDState.OFF) {
      this.setLEDNode_(led, LEDState.ON)
    } else {
      this.setLEDNode_(led, LEDState.OFF)
    }
  }

  /**
   * Toggle matrix nodes on and off.
   * @param e Mouse event.
   */
  onMouseDown(e: PointerEvent) {
    this.matrixMoveWrapper_ = Blockly.browserEvents.bind(document.body, 'mousemove', this, this.onMouseMove)
    this.matrixReleaseWrapper_ = Blockly.browserEvents.bind(document.body, 'mouseup', this, this.onMouseUp)
    const ledHit = this.checkForLED_(e)
    if (ledHit > -1) {
      if (this.getValue()!.charAt(ledHit) === LEDState.OFF) {
        this.paintStyle_ = PaintStyle.FILL
      } else {
        this.paintStyle_ = PaintStyle.CLEAR
      }
      this.toggleLEDNode_(ledHit)
      this.updateMatrix_()
    } else {
      this.paintStyle_ = null
    }
  }

  /**
   * Unbind mouse move event and clear the paint style.
   */
  onMouseUp() {
    if (this.matrixMoveWrapper_) {
      Blockly.browserEvents.unbind(this.matrixMoveWrapper_)
      this.matrixMoveWrapper_ = null
    }
    if (this.matrixReleaseWrapper_) {
      Blockly.browserEvents.unbind(this.matrixReleaseWrapper_)
      this.matrixReleaseWrapper_ = null
    }
    this.paintStyle_ = null
  }

  /**
   * Toggle matrix nodes on and off by dragging mouse.
   * @param e Mouse move event.
   */
  onMouseMove(e: PointerEvent) {
    e.preventDefault()
    if (this.paintStyle_) {
      const led = this.checkForLED_(e)
      if (led < 0) return
      if (this.paintStyle_ === PaintStyle.CLEAR) {
        this.clearLEDNode_(led)
      } else if (this.paintStyle_ === PaintStyle.FILL) {
        this.fillLEDNode_(led)
      }
    }
  }

  /**
   * Check if mouse coordinates collide with a matrix node.
   * @param e Mouse move event.
   * @returns The matching matrix node or -1 for none.
   */
  checkForLED_(e: PointerEvent): number {
    if (!this.matrixStage_) return -1
    const bBox = this.matrixStage_.getBoundingClientRect()
    const nodeSize = FieldMatrix.MATRIX_NODE_SIZE
    const nodePad = FieldMatrix.MATRIX_NODE_PAD
    const dx = e.clientX - bBox.left
    const dy = e.clientY - bBox.top
    const min = nodePad / 2
    const max = bBox.width - nodePad / 2
    if (dx < min || dx > max || dy < min || dy > max) {
      return -1
    }
    const xDiv = Math.trunc((dx - nodePad / 2) / (nodeSize + nodePad))
    const yDiv = Math.trunc((dy - nodePad / 2) / (nodeSize + nodePad))
    return xDiv + yDiv * nodePad
  }

  /**
   * Clean up this FieldMatrix, as well as the inherited Field.
   */
  dispose() {
    super.dispose()
    this.matrixStage_ = null
    if (this.mouseDownWrapper_) {
      Blockly.browserEvents.unbind(this.mouseDownWrapper_)
    }
    if (this.matrixTouchWrapper_) {
      Blockly.browserEvents.unbind(this.matrixTouchWrapper_)
    }
    if (this.matrixReleaseWrapper_) {
      Blockly.browserEvents.unbind(this.matrixReleaseWrapper_)
    }
    if (this.matrixMoveWrapper_) {
      Blockly.browserEvents.unbind(this.matrixMoveWrapper_)
    }
    if (this.clearButtonWrapper_) {
      Blockly.browserEvents.unbind(this.clearButtonWrapper_)
    }
    if (this.fillButtonWrapper_) {
      Blockly.browserEvents.unbind(this.fillButtonWrapper_)
    }
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
}

interface FieldMatrixConfig extends Blockly.FieldConfig {
  matrix: string
}

/**
 * Register the field and any dependencies.
 */
export function registerFieldMatrix() {
  Blockly.fieldRegistry.register('field_matrix', FieldMatrix)
}
