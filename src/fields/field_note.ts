/**
 * Visual Blocks Editor
 *
 * Copyright 2018 Massachusetts Institute of Technology
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
 * @file Note input field, for selecting a musical note on a piano.
 * @author ericr@media.mit.edu (Eric Rosenbaum)
 */
import * as Blockly from 'blockly/core'

/**
 * Class for a note input field, for selecting a musical note on a piano.
 * @param opt_value The initial content of the field. The
 *     value should cast to a number, and if it does not, '0' will be used.
 * @param opt_validator An optional function that is called
 *     to validate any constraints on what the user entered.  Takes the new
 *     text as an argument and returns the accepted text or null to abort
 *     the change.
 */
export class FieldNote extends Blockly.FieldTextInput {
  /**
   * Width of the field. Computed when drawing it, and used for animation.
   */
  private fieldEditorWidth_ = 0

  /**
   * Height of the field. Computed when drawing it.
   */
  private fieldEditorHeight_ = 0

  /**
   * The piano SVG.
   */
  private pianoSVG_: SVGElement | null = null

  /**
   * Array of SVG elements representing the clickable piano keys.
   */
  private keySVGs_: SVGElement[] = []

  /**
   * Note name indicator at the top of the field.
   */
  private noteNameText_: SVGElement | null = null

  /**
   * Note name indicator on the low C key.
   */
  private lowCText_: SVGElement | null = null

  /**
   * Note name indicator on the low C key.
   */
  private highCText_: SVGElement | null = null

  /**
   * Octave number of the currently displayed range of keys.
   */
  private displayedOctave_: number | null = null

  /**
   * Current animation position of the piano SVG, as it shifts left or right to
   * change octaves.
   */
  private animationPos_ = 0

  /**
   * Target position for the animation as the piano SVG shifts left or right.
   */
  private animationTarget_ = 0

  /**
   * A flag indicating that the mouse is currently down. Used in combination with
   * mouse enter events to update the key selection while dragging.
   */
  private mouseIsDown_ = false

  /**
   * An array of wrappers for mouse down events on piano keys.
   */
  private mouseDownWrappers_: Blockly.browserEvents.Data[] = []

  /**
   * A wrapper for the mouse up event.
   */
  private mouseUpWrapper_: Blockly.browserEvents.Data | null = null

  /**
   * An array of wrappers for mouse enter events on piano keys.
   */
  private mouseEnterWrappers_: Blockly.browserEvents.Data[] = []

  /**
   * A wrapper for the mouse down event on the octave down button.
   */
  private octaveDownMouseDownWrapper_: Blockly.browserEvents.Data | null = null

  /**
   * A wrapper for the mouse down event on the octave up button.
   */
  private octaveUpMouseDownWrapper_: Blockly.browserEvents.Data | null = null

  /**
   * Inset in pixels of content displayed in the field, caused by parent properties.
   * The inset is actually determined by the CSS property blocklyDropDownDiv- it is
   * the sum of the padding and border thickness.
   */
  static INSET = 5

  /**
   * Height of the top area of the field, in px.
   */
  static readonly TOP_MENU_HEIGHT = 32 - FieldNote.INSET

  /**
   * Padding on the top and sides of the field, in px.
   */
  static readonly EDGE_PADDING = 1

  /**
   * Height of the drop shadow on the piano, in px.
   */
  static readonly SHADOW_HEIGHT = 4

  /**
   * Color for the shadow on the piano.
   */
  static readonly SHADOW_COLOR = '#000'

  /**
   * Opacity for the shadow on the piano.
   */
  static readonly SHADOW_OPACITY = 0.2

  /**
   * A color for the white piano keys.
   */
  static readonly WHITE_KEY_COLOR = '#FFFFFF'

  /**
   * A color for the black piano keys.
   */
  static readonly BLACK_KEY_COLOR = '#323133'

  /**
   * A color for stroke around black piano keys.
   */
  static readonly BLACK_KEY_STROKE = '#555555'

  /**
   * A color for the selected state of a piano key.
   */
  static readonly KEY_SELECTED_COLOR = '#b0d6ff'

  /**
   * The number of white keys in one octave on the piano.
   */
  static readonly NUM_WHITE_KEYS = 8

  /**
   * Height of a white piano key, in px.
   */
  static readonly WHITE_KEY_HEIGHT = 72

  /**
   * Width of a white piano key, in px.
   */
  static readonly WHITE_KEY_WIDTH = 40

  /**
   * Height of a black piano key, in px.
   */
  static readonly BLACK_KEY_HEIGHT = 40

  /**
   * Width of a black piano key, in px.
   */
  static readonly BLACK_KEY_WIDTH = 32

  /**
   * Radius of the curved bottom corner of a piano key, in px.
   */
  static readonly KEY_RADIUS = 6

  /**
   * Bottom padding for the labels on C keys.
   */
  static readonly KEY_LABEL_PADDING = 8

  /**
   * An array of objects with data describing the keys on the piano.
   */
  static readonly KEY_INFO = [
    { name: 'C', pitch: 0 },
    { name: 'C♯', pitch: 1, isBlack: true },
    { name: 'D', pitch: 2 },
    { name: 'E♭', pitch: 3, isBlack: true },
    { name: 'E', pitch: 4 },
    { name: 'F', pitch: 5 },
    { name: 'F♯', pitch: 6, isBlack: true },
    { name: 'G', pitch: 7 },
    { name: 'G♯', pitch: 8, isBlack: true },
    { name: 'A', pitch: 9 },
    { name: 'B♭', pitch: 10, isBlack: true },
    { name: 'B', pitch: 11 },
    { name: 'C', pitch: 12 },
  ]

  /**
   * The MIDI note number of the highest note selectable on the piano.
   */
  static readonly MAX_NOTE = 130

  /**
   * The fraction of the distance to the target location to move the piano at each
   * step of the animation.
   */
  static readonly ANIMATION_FRACTION = 0.2

  /**
   * Path to the arrow svg icon, used on the octave buttons.
   */
  static readonly ARROW_SVG_PATH = 'icons/arrow_button.svg'

  /**
   * The size of the square octave buttons.
   */
  static readonly OCTAVE_BUTTON_SIZE = 32

  /**
   * Construct a FieldNote from a JSON arg object.
   * @param options A JSON object with options.
   * @returns The new field instance.
   */
  static fromJson(options: FieldNoteJsonConfig): FieldNote {
    return new FieldNote(options.note)
  }

  /**
   * Clean up this FieldNote, as well as the inherited FieldTextInput.
   */
  dispose() {
    super.dispose()
    this.mouseDownWrappers_.forEach((wrapper) => {
      Blockly.browserEvents.unbind(wrapper)
    })
    this.mouseEnterWrappers_.forEach((wrapper) => {
      Blockly.browserEvents.unbind(wrapper)
    })
    if (this.mouseUpWrapper_) {
      Blockly.browserEvents.unbind(this.mouseUpWrapper_)
    }
    if (this.octaveDownMouseDownWrapper_) {
      Blockly.browserEvents.unbind(this.octaveDownMouseDownWrapper_)
    }
    if (this.octaveUpMouseDownWrapper_) {
      Blockly.browserEvents.unbind(this.octaveUpMouseDownWrapper_)
    }
    this.pianoSVG_ = null
    this.keySVGs_.length = 0
    this.noteNameText_ = null
    this.lowCText_ = null
    this.highCText_ = null
  }

  /**
   * Show a field with piano keys.
   * @param event The triggering pointer event.
   * @param quietInput If true, suppress the sound preview while the editor opens.
   */
  showEditor_(event: PointerEvent, quietInput = false) {
    super.showEditor_(event, quietInput, false)

    // Build the SVG DOM.
    const div = Blockly.DropDownDiv.getContentDiv()

    this.fieldEditorWidth_ = FieldNote.NUM_WHITE_KEYS * FieldNote.WHITE_KEY_WIDTH + FieldNote.EDGE_PADDING
    this.fieldEditorHeight_ = FieldNote.TOP_MENU_HEIGHT + FieldNote.WHITE_KEY_HEIGHT + FieldNote.EDGE_PADDING

    const svg = Blockly.utils.dom.createSvgElement(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        'xmlns:html': 'http://www.w3.org/1999/xhtml',
        'xmlns:xlink': 'http://www.w3.org/1999/xlink',
        version: '1.1',
        height: this.fieldEditorHeight_ + 'px',
        width: this.fieldEditorWidth_ + 'px',
      },
      div,
    )

    // Add the white and black keys
    // Since we are adding the keys from left to right in order, they need
    // to be in two groups in order to layer correctly.
    this.pianoSVG_ = Blockly.utils.dom.createSvgElement('g', {}, svg)
    const whiteKeyGroup = Blockly.utils.dom.createSvgElement('g', {}, this.pianoSVG_)
    const blackKeyGroup = Blockly.utils.dom.createSvgElement('g', {}, this.pianoSVG_)

    // Add three piano octaves, so we can animate moving up or down an octave.
    // Only the middle octave gets bound to events.
    this.keySVGs_ = []
    this.addPianoOctave_(-this.fieldEditorWidth_ + FieldNote.EDGE_PADDING, whiteKeyGroup, blackKeyGroup, null)
    this.addPianoOctave_(0, whiteKeyGroup, blackKeyGroup, this.keySVGs_)
    this.addPianoOctave_(this.fieldEditorWidth_ - FieldNote.EDGE_PADDING, whiteKeyGroup, blackKeyGroup, null)

    // Note name indicator at the top of the field
    this.noteNameText_ = Blockly.utils.dom.createSvgElement(
      'text',
      {
        x: this.fieldEditorWidth_ / 2,
        y: FieldNote.TOP_MENU_HEIGHT / 2,
        class: 'blocklyText',
        'text-anchor': 'middle',
        'dominant-baseline': 'middle',
      },
      svg,
    )

    // Note names on the low and high C keys
    const lowCX = FieldNote.WHITE_KEY_WIDTH / 2
    this.lowCText_ = this.addCKeyLabel_(lowCX, svg)
    const highCX = lowCX + FieldNote.WHITE_KEY_WIDTH * (FieldNote.NUM_WHITE_KEYS - 1)
    this.highCText_ = this.addCKeyLabel_(highCX, svg)

    // Horizontal line at the top of the keys
    Blockly.utils.dom.createSvgElement(
      'line',
      {
        stroke: (this.sourceBlock_!.getParent() as Blockly.BlockSvg).getColourTertiary(),
        x1: 0,
        y1: FieldNote.TOP_MENU_HEIGHT,
        x2: this.fieldEditorWidth_,
        y2: FieldNote.TOP_MENU_HEIGHT,
      },
      svg,
    )

    // Drop shadow at the top of the keys
    Blockly.utils.dom.createSvgElement(
      'rect',
      {
        x: 0,
        y: FieldNote.TOP_MENU_HEIGHT,
        width: this.fieldEditorWidth_,
        height: FieldNote.SHADOW_HEIGHT,
        fill: FieldNote.SHADOW_COLOR,
        'fill-opacity': FieldNote.SHADOW_OPACITY,
      },
      svg,
    )

    // Octave buttons
    const octaveDownButton = this.addOctaveButton_(0, true, svg)
    const octaveUpButton = this.addOctaveButton_(
      this.fieldEditorWidth_ + FieldNote.INSET * 2 - FieldNote.OCTAVE_BUTTON_SIZE,
      false,
      svg,
    )

    this.octaveDownMouseDownWrapper_ = Blockly.browserEvents.bind(octaveDownButton, 'mousedown', this, () => {
      this.changeOctaveBy_(-1)
    })
    this.octaveUpMouseDownWrapper_ = Blockly.browserEvents.bind(octaveUpButton, 'mousedown', this, () => {
      this.changeOctaveBy_(1)
    })
    const sourceBlock = this.getSourceBlock() as Blockly.BlockSvg
    Blockly.DropDownDiv.setColour(sourceBlock.getParent()!.getColour(), sourceBlock.getParent()!.getColourTertiary())
    Blockly.DropDownDiv.showPositionedByBlock(this, sourceBlock)

    this.updateSelection_()
  }

  /**
   * Add one octave of piano keys drawn using SVG.
   * @param x The x position of the left edge of this octave of keys.
   * @param whiteKeyGroup The group for all white piano keys.
   * @param blackKeyGroup The group for all black piano keys.
   * @param keySVGarray An array containing all the key SVGs.
   */
  private addPianoOctave_(
    x: number,
    whiteKeyGroup: SVGElement,
    blackKeyGroup: SVGElement,
    keySVGarray: SVGElement[] | null,
  ) {
    let xIncrement, width, height, fill, stroke, group
    x += FieldNote.EDGE_PADDING / 2
    const y = FieldNote.TOP_MENU_HEIGHT
    for (let i = 0; i < FieldNote.KEY_INFO.length; i++) {
      // Draw a black or white key
      if (FieldNote.KEY_INFO[i].isBlack) {
        // Black keys are shifted back half a key
        x -= FieldNote.BLACK_KEY_WIDTH / 2
        xIncrement = FieldNote.BLACK_KEY_WIDTH / 2
        width = FieldNote.BLACK_KEY_WIDTH
        height = FieldNote.BLACK_KEY_HEIGHT
        fill = FieldNote.BLACK_KEY_COLOR
        stroke = FieldNote.BLACK_KEY_STROKE
        group = blackKeyGroup
      } else {
        xIncrement = FieldNote.WHITE_KEY_WIDTH
        width = FieldNote.WHITE_KEY_WIDTH
        height = FieldNote.WHITE_KEY_HEIGHT
        fill = FieldNote.WHITE_KEY_COLOR
        stroke = (this.sourceBlock_!.getParent() as Blockly.BlockSvg).getColourTertiary()
        group = whiteKeyGroup
      }
      const attr = {
        d: this.getPianoKeyPath_(x, y, width, height),
        fill: fill,
        stroke: stroke,
      }
      x += xIncrement

      const keySVG = Blockly.utils.dom.createSvgElement('path', attr, group)

      if (keySVGarray) {
        keySVGarray[i] = keySVG
        keySVG.setAttribute('data-pitch', `${FieldNote.KEY_INFO[i].pitch}`)
        keySVG.setAttribute('data-name', `${FieldNote.KEY_INFO[i].name}`)
        keySVG.setAttribute('data-isBlack', `${FieldNote.KEY_INFO[i].isBlack}`)

        this.mouseDownWrappers_[i] = Blockly.browserEvents.bind(keySVG, 'mousedown', this, this.onMouseDownOnKey_)
        this.mouseEnterWrappers_[i] = Blockly.browserEvents.bind(keySVG, 'mouseenter', this, this.onMouseEnter_)
      }
    }
  }

  /**
   * Construct the SVG path string for a piano key shape: a rectangle with rounded
   * corners at the bottom.
   * @param x the x position for the key.
   * @param y the y position for the key.
   * @param width the horizontal extent of the key in pixels.
   * @param height the vertical extent of the key in pixels.
   * @returns the SVG path as a string.
   */
  private getPianoKeyPath_(x: number, y: number, width: number, height: number): string {
    return (
      'M' +
      x +
      ' ' +
      y +
      ' ' +
      'L' +
      x +
      ' ' +
      (y + height - FieldNote.KEY_RADIUS) +
      ' ' +
      'Q' +
      x +
      ' ' +
      (y + height) +
      ' ' +
      (x + FieldNote.KEY_RADIUS) +
      ' ' +
      (y + height) +
      ' ' +
      'L' +
      (x + width - FieldNote.KEY_RADIUS) +
      ' ' +
      (y + height) +
      ' ' +
      'Q' +
      (x + width) +
      ' ' +
      (y + height) +
      ' ' +
      (x + width) +
      ' ' +
      (y + height - FieldNote.KEY_RADIUS) +
      ' ' +
      'L' +
      (x + width) +
      ' ' +
      y +
      ' ' +
      'L' +
      x +
      ' ' +
      y
    )
  }

  /**
   * Add a button for switching the displayed octave of the piano up or down.
   * @param x The x position of the button.
   * @param flipped If true, the icon should be flipped.
   * @param svg The svg element to add the buttons to.
   * @returns A group containing the button SVG elements.
   */
  private addOctaveButton_(x: number, flipped: boolean, svg: SVGElement): SVGElement {
    const group = Blockly.utils.dom.createSvgElement('g', {}, svg)
    const imageSize = FieldNote.OCTAVE_BUTTON_SIZE
    const arrow = Blockly.utils.dom.createSvgElement(
      'image',
      {
        width: imageSize,
        height: imageSize,
        x: x - FieldNote.INSET,
        y: -1 * FieldNote.INSET,
      },
      group,
    )
    arrow.setAttributeNS(
      'http://www.w3.org/1999/xlink',
      'xlink:href',
      Blockly.getMainWorkspace().options.pathToMedia + FieldNote.ARROW_SVG_PATH,
    )
    Blockly.utils.dom.createSvgElement(
      'line',
      {
        stroke: (this.sourceBlock_!.getParent() as Blockly.BlockSvg).getColourTertiary(),
        x1: x - FieldNote.INSET,
        y1: 0,
        x2: x - FieldNote.INSET,
        y2: FieldNote.TOP_MENU_HEIGHT - FieldNote.INSET,
      },
      group,
    )
    if (flipped) {
      const translateX = -1 * FieldNote.OCTAVE_BUTTON_SIZE + FieldNote.INSET * 2
      group.setAttribute('transform', 'scale(-1, 1) ' + 'translate(' + translateX + ', 0)')
    }
    return group
  }

  /**
   * Add an SVG text label for display on the C keys of the piano.
   * @param x The x position for the label.
   * @param svg The SVG element to add the label to.
   * @returns The SVG element containing the label.
   */
  private addCKeyLabel_(x: number, svg: SVGElement): SVGElement {
    return Blockly.utils.dom.createSvgElement(
      'text',
      {
        x: x,
        y: FieldNote.TOP_MENU_HEIGHT + FieldNote.WHITE_KEY_HEIGHT - FieldNote.KEY_LABEL_PADDING,
        class: 'scratchNotePickerKeyLabel',
        'text-anchor': 'middle',
      },
      svg,
    )
  }

  /**
   * Set the visibility of the C key labels.
   * @param visible If true, set labels to be visible.
   */
  private setCKeyLabelsVisible_(visible: boolean) {
    if (!this.lowCText_ || !this.highCText_) {
      console.warn('FieldNote.setCKeyLabelsVisible_: C-key label DOM is not fully initialized')
      return
    }
    const opacity = visible ? 1 : 0
    this.fadeSvgToOpacity_(this.lowCText_, opacity)
    this.fadeSvgToOpacity_(this.highCText_, opacity)
  }

  /**
   * Animate an SVG to fade it in or out to a target opacity.
   * @param svg The SVG element to apply the fade to.
   * @param opacity The target opacity.
   */
  private fadeSvgToOpacity_(svg: SVGElement, opacity: number) {
    svg.setAttribute('style', 'opacity: ' + opacity + '; transition: opacity 0.1s;')
  }

  /**
   * Handle the mouse down event on a piano key.
   * @param e Mouse down event.
   */
  private onMouseDownOnKey_(e: PointerEvent) {
    this.mouseIsDown_ = true
    this.mouseUpWrapper_ = Blockly.browserEvents.bind(document.body, 'mouseup', this, this.onMouseUp_)
    this.selectNoteWithMouseEvent_(e)
  }

  /**
   * Handle the mouse up event following a mouse down on a piano key.
   */
  private onMouseUp_() {
    this.mouseIsDown_ = false
    if (this.mouseUpWrapper_) {
      Blockly.browserEvents.unbind(this.mouseUpWrapper_)
      this.mouseUpWrapper_ = null
    }
  }

  /**
   * Handle the event when the mouse enters a piano key.
   * @param e Mouse enter event.
   */
  private onMouseEnter_(e: PointerEvent) {
    if (this.mouseIsDown_) {
      this.selectNoteWithMouseEvent_(e)
    }
  }

  /**
   * Use the data in a mouse event to select a new note, and play it.
   * @param e Mouse event.
   */
  private selectNoteWithMouseEvent_(e: PointerEvent) {
    const newNoteNum =
      Number((e.target as HTMLElement).getAttribute('data-pitch')) + (this.displayedOctave_ ?? 0) * 12
    this.setEditorValue_(newNoteNum)
    this.playNoteInternal_()
  }

  /**
   * Play a note, by calling the externally overriden play note function.
   */
  private playNoteInternal_() {
    if (FieldNote.playNote_) {
      FieldNote.playNote_(Number(this.getValue()!), 'Music')
    }
  }

  /**
   * Function to play a musical note corresponding to the key selected.
   * Overridden externally.
   * @param noteNum the MIDI note number to play.
   * @param id An id to select a scratch extension to play the note.
   */
  static playNote_ = function (noteNum: number, id: string) {
    return
  }

  /**
   * Change the selected note by a number of octaves, and start the animation.
   * @param octaves The number of octaves to change by.
   */
  private changeOctaveBy_(octaves: number) {
    this.displayedOctave_ = (this.displayedOctave_ ?? 0) + octaves
    if (this.displayedOctave_ < 0) {
      this.displayedOctave_ = 0
      return
    }
    const maxOctave = Math.floor(FieldNote.MAX_NOTE / 12)
    if (this.displayedOctave_ > maxOctave) {
      this.displayedOctave_ = maxOctave
      return
    }

    const newNote = Number(this.getText()) + octaves * 12
    this.setEditorValue_(newNote)

    this.animationTarget_ = this.fieldEditorWidth_ * octaves * -1
    this.animationPos_ = 0
    this.stepOctaveAnimation_()
    this.setCKeyLabelsVisible_(false)
  }

  /**
   * Animate the piano up or down an octave by sliding it to the left or right.
   */
  private stepOctaveAnimation_() {
    const absDiff = Math.abs(this.animationPos_ - this.animationTarget_)
    if (absDiff < 1) {
      this.pianoSVG_?.setAttribute('transform', 'translate(0, 0)')
      this.setCKeyLabelsVisible_(true)
      this.playNoteInternal_()
      return
    }
    this.animationPos_ += (this.animationTarget_ - this.animationPos_) * FieldNote.ANIMATION_FRACTION
    this.pianoSVG_?.setAttribute('transform', 'translate(' + this.animationPos_ + ',0)')
    requestAnimationFrame(this.stepOctaveAnimation_.bind(this))
  }

  doValueUpdate_(newValue: string) {
    super.doValueUpdate_(newValue)

    if (!this.textElement_) {
      // Not rendered yet.
      return
    }

    this.updateSelection_()
  }

  /**
   * For a MIDI note number, find the index of the corresponding piano key.
   * @param noteNum The note number.
   * @returns The index of the piano key.
   */
  private noteNumToKeyIndex_(noteNum: number): number {
    return Math.floor(noteNum) - (this.displayedOctave_ ?? 0) * 12
  }

  /**
   * Update the selected note and labels on the field.
   */
  private updateSelection_() {
    const noteNum = Number(this.getText())

    // If the note is outside the currently displayed octave, update it
    if (
      this.displayedOctave_ == null ||
      noteNum > this.displayedOctave_ * 12 + 12 ||
      noteNum < this.displayedOctave_ * 12
    ) {
      this.displayedOctave_ = Math.floor(noteNum / 12)
    }

    const index = this.noteNumToKeyIndex_(noteNum)

    // Clear the highlight on all keys
    this.keySVGs_.forEach((svg) => {
      const isBlack = svg.getAttribute('data-isBlack')
      if (isBlack === 'true') {
        svg.setAttribute('fill', FieldNote.BLACK_KEY_COLOR)
      } else {
        svg.setAttribute('fill', FieldNote.WHITE_KEY_COLOR)
      }
    })
    // Set the highlight on the selected key
    if (this.keySVGs_[index]) {
      this.keySVGs_[index].setAttribute('fill', FieldNote.KEY_SELECTED_COLOR)
      // Update the note name text
      const noteName = FieldNote.KEY_INFO[index].name
      if (this.noteNameText_) {
        this.noteNameText_.textContent = noteName + ' (' + Math.floor(noteNum) + ')'
      }
      // Update the low and high C note names
      const lowCNum = (this.displayedOctave_ ?? 0) * 12
      if (this.lowCText_) this.lowCText_.textContent = 'C(' + lowCNum + ')'
      if (this.highCText_) this.highCText_.textContent = 'C(' + (lowCNum + 12) + ')'
    }
  }

  /**
   * Ensure that only a valid MIDI note number may be entered.
   * @param text The user's text.
   * @returns A string representing a valid note number, or null if invalid.
   */
  doClassValidation_(text: string): string | null {
    if (text === null) {
      return null
    }
    let n = parseFloat(text || '0')
    if (isNaN(n)) {
      return null
    }
    if (n < 0) {
      n = 0
    }
    if (n > FieldNote.MAX_NOTE) {
      n = FieldNote.MAX_NOTE
    }
    return String(n)
  }
}

interface FieldNoteJsonConfig extends Blockly.FieldTextInputFromJsonConfig {
  note: string
}

/**
 * Register the field and any dependencies.
 */
export function registerFieldNote() {
  Blockly.fieldRegistry.register('field_note', FieldNote)
}
