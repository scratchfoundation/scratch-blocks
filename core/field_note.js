/**
 * @license
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
 * @fileoverview Note input field, for selecting a musical note on a piano.
 * @author ericr@media.mit.edu (Eric Rosenbaum)
 */
import * as Blockly from 'blockly/core';

/**
 * Class for a note input field, for selecting a musical note on a piano.
 * @param {(string|number)=} opt_value The initial content of the field. The
 *     value should cast to a number, and if it does not, '0' will be used.
 * @param {Function=} opt_validator An optional function that is called
 *     to validate any constraints on what the user entered.  Takes the new
 *     text as an argument and returns the accepted text or null to abort
 *     the change.
 * @extends {Blockly.FieldTextInput}
 * @constructor
 */
export class FieldNote extends Blockly.FieldTextInput {
  constructor(opt_value, opt_validator) {
    opt_value = (opt_value && !isNaN(opt_value)) ? String(opt_value) : '0';
    super(opt_value, opt_validator);

    /**
     * Width of the field. Computed when drawing it, and used for animation.
     * @type {number}
     * @private
     */
    this.fieldEditorWidth_ = 0;

    /**
     * Height of the field. Computed when drawing it.
     * @type {number}
     * @private
     */
    this.fieldEditorHeight_ = 0;

    /**
     * The piano SVG.
     * @type {SVGElement}
     * @private
     */
    this.pianoSVG_ = null;

    /**
     * Array of SVG elements representing the clickable piano keys.
     * @type {!Array<SVGElement>}
     * @private
     */
    this.keySVGs_ = [];

    /**
     * Note name indicator at the top of the field.
     * @type {SVGElement}
     * @private
     */
    this.noteNameText_ = null;

    /**
     * Note name indicator on the low C key.
     * @type {SVGElement}
     * @private
     */
    this.lowCText_ = null;

    /**
     * Note name indicator on the low C key.
     * @type {SVGElement}
     * @private
     */
    this.highCText_ = null;

    /**
     * Octave number of the currently displayed range of keys.
     * @type {number}
     * @private
     */
    this.displayedOctave_ = null;

    /**
     * Current animation position of the piano SVG, as it shifts left or right to
     * change octaves.
     * @type {number}
     * @private
     */
    this.animationPos_ = 0;

    /**
     * Target position for the animation as the piano SVG shifts left or right.
     * @type {number}
     * @private
     */
    this.animationTarget_ = 0;

    /**
     * A flag indicating that the mouse is currently down. Used in combination with
     * mouse enter events to update the key selection while dragging.
     * @type {boolean}
     * @private
     */
    this.mouseIsDown_ = false;

    /**
     * An array of wrappers for mouse down events on piano keys.
     * @type {!Array.<!Array>}
     * @private
     */
    this.mouseDownWrappers_ = [];

    /**
     * A wrapper for the mouse up event.
     * @type {!Array.<!Array>}
     * @private
     */
    this.mouseUpWrapper_ = null;

    /**
     * An array of wrappers for mouse enter events on piano keys.
     * @type {!Array.<!Array>}
     * @private
     */
    this.mouseEnterWrappers_ = [];

    /**
     * A wrapper for the mouse down event on the octave down button.
     * @type {!Array.<!Array>}
     * @private
     */
    this.octaveDownMouseDownWrapper_ = null;

    /**
     * A wrapper for the mouse down event on the octave up button.
     * @type {!Array.<!Array>}
     * @private
     */
    this.octaveUpMouseDownWrapper_ = null;
  }

  /**
   * Inset in pixels of content displayed in the field, caused by parent properties.
   * The inset is actually determined by the CSS property blocklyDropDownDiv- it is
   * the sum of the padding and border thickness.
   */
  static INSET = 5;

  /**
   * Height of the top area of the field, in px.
   * @type {number}
   * @const
   */
  static TOP_MENU_HEIGHT = 32 - FieldNote.INSET;

  /**
   * Padding on the top and sides of the field, in px.
   * @type {number}
   * @const
   */
  static EDGE_PADDING = 1;

  /**
   * Height of the drop shadow on the piano, in px.
   * @type {number}
   * @const
   */
  static SHADOW_HEIGHT = 4;

  /**
   * Color for the shadow on the piano.
   * @type {string}
   * @const
   */
  static SHADOW_COLOR = '#000';

  /**
   * Opacity for the shadow on the piano.
   * @type {string}
   * @const
   */
  static SHADOW_OPACITY = .2;

  /**
   * A color for the white piano keys.
   * @type {string}
   * @const
   */
  static WHITE_KEY_COLOR = '#FFFFFF';

  /**
   * A color for the black piano keys.
   * @type {string}
   * @const
   */
  static BLACK_KEY_COLOR = '#323133';

  /**
   * A color for stroke around black piano keys.
   * @type {string}
   * @const
   */
  static BLACK_KEY_STROKE = '#555555';

  /**
   * A color for the selected state of a piano key.
   * @type {string}
   * @const
   */
  static KEY_SELECTED_COLOR = '#b0d6ff';

  /**
   * The number of white keys in one octave on the piano.
   * @type {number}
   * @const
   */
  static NUM_WHITE_KEYS = 8;

  /**
   * Height of a white piano key, in px.
   * @type {string}
   * @const
   */
  static WHITE_KEY_HEIGHT = 72;

  /**
   * Width of a white piano key, in px.
   * @type {string}
   * @const
   */
  static WHITE_KEY_WIDTH = 40;

  /**
   * Height of a black piano key, in px.
   * @type {string}
   * @const
   */
  static BLACK_KEY_HEIGHT = 40;

  /**
   * Width of a black piano key, in px.
   * @type {string}
   * @const
   */
  static BLACK_KEY_WIDTH = 32;

  /**
   * Radius of the curved bottom corner of a piano key, in px.
   * @type {string}
   * @const
   */
  static KEY_RADIUS = 6;

  /**
   * Bottom padding for the labels on C keys.
   * @type {string}
   * @const
   */
  static KEY_LABEL_PADDING = 8;

  /**
   * An array of objects with data describing the keys on the piano.
   * @type {Array.<{name: String, pitch: Number, isBlack: boolean}>}
   * @const
   */
  static KEY_INFO = [
    {name: 'C', pitch: 0},
    {name: 'C♯', pitch: 1, isBlack: true},
    {name: 'D', pitch: 2},
    {name: 'E♭', pitch: 3, isBlack: true},
    {name: 'E', pitch: 4},
    {name: 'F', pitch: 5},
    {name: 'F♯', pitch: 6, isBlack: true},
    {name: 'G', pitch: 7},
    {name: 'G♯', pitch: 8, isBlack: true},
    {name: 'A', pitch: 9},
    {name: 'B♭', pitch: 10, isBlack: true},
    {name: 'B', pitch: 11},
    {name: 'C', pitch: 12}
  ];

  /**
   * The MIDI note number of the highest note selectable on the piano.
   * @type {number}
   * @const
   */
  static MAX_NOTE = 130;

  /**
   * The fraction of the distance to the target location to move the piano at each
   * step of the animation.
   * @type {number}
   * @const
   */
  static ANIMATION_FRACTION = 0.2;

  /**
   * Path to the arrow svg icon, used on the octave buttons.
   * @type {string}
   * @const
   */
  static ARROW_SVG_PATH = 'icons/arrow_button.svg';

  /**
   * The size of the square octave buttons.
   * @type {number}
   * @const
   */
  static OCTAVE_BUTTON_SIZE = 32;

  /**
   * Construct a FieldNote from a JSON arg object.
   * @param {!Object} options A JSON object with options.
   * @returns {!Blockly.FieldNote} The new field instance.
   * @package
   * @nocollapse
   */
  static fromJson(options) {
    return new FieldNote(options['note']);
  }

  /**
   * Clean up this FieldNote, as well as the inherited FieldTextInput.
   * @return {!Function} Closure to call on destruction of the WidgetDiv.
   * @private
   */
  dispose() {
    super.dispose();
    this.mouseDownWrappers_.forEach(function(wrapper) {
      Blockly.browserEvents.unbind(wrapper);
    });
    this.mouseEnterWrappers_.forEach(function(wrapper) {
      Blockly.browserEvents.unbind(wrapper);
    });
    if (this.mouseUpWrapper_) {
      Blockly.browserEvents.unbind(this.mouseUpWrapper_);
    }
    if (this.octaveDownMouseDownWrapper_) {
      Blockly.browserEvents.unbind(this.octaveDownMouseDownWrapper_);
    }
    if (this.octaveUpMouseDownWrapper_) {
      Blockly.browserEvents.unbind(this.octaveUpMouseDownWrapper_);
    }
    this.pianoSVG_ = null;
    this.keySVGs_.length = 0;
    this.noteNameText_ = null;
    this.lowCText_ = null;
    this.highCText_ = null;
  }

  /**
   * Show a field with piano keys.
   * @private
   */
  showEditor_(event, quietInput = false) {
    super.showEditor_(event, quietInput);

    // Build the SVG DOM.
    var div = Blockly.DropDownDiv.getContentDiv();

    this.fieldEditorWidth_ = FieldNote.NUM_WHITE_KEYS * FieldNote.WHITE_KEY_WIDTH +
      FieldNote.EDGE_PADDING;
    this.fieldEditorHeight_ = FieldNote.TOP_MENU_HEIGHT +
      FieldNote.WHITE_KEY_HEIGHT +
      FieldNote.EDGE_PADDING;

    var svg = Blockly.utils.dom.createSvgElement('svg', {
      'xmlns': 'http://www.w3.org/2000/svg',
      'xmlns:html': 'http://www.w3.org/1999/xhtml',
      'xmlns:xlink': 'http://www.w3.org/1999/xlink',
      'version': '1.1',
      'height': this.fieldEditorHeight_ + 'px',
      'width': this.fieldEditorWidth_ + 'px'
    }, div);

    // Add the white and black keys
    // Since we are adding the keys from left to right in order, they need
    // to be in two groups in order to layer correctly.
    this.pianoSVG_ = Blockly.utils.dom.createSvgElement('g', {}, svg);
    var whiteKeyGroup = Blockly.utils.dom.createSvgElement('g', {}, this.pianoSVG_);
    var blackKeyGroup = Blockly.utils.dom.createSvgElement('g', {}, this.pianoSVG_);

    // Add three piano octaves, so we can animate moving up or down an octave.
    // Only the middle octave gets bound to events.
    this.keySVGs_ = [];
    this.addPianoOctave_(-this.fieldEditorWidth_ + FieldNote.EDGE_PADDING,
        whiteKeyGroup, blackKeyGroup, null);
    this.addPianoOctave_(0, whiteKeyGroup, blackKeyGroup, this.keySVGs_);
    this.addPianoOctave_(this.fieldEditorWidth_ - FieldNote.EDGE_PADDING,
        whiteKeyGroup, blackKeyGroup, null);

    // Note name indicator at the top of the field
    this.noteNameText_ = Blockly.utils.dom.createSvgElement('text',
        {
          'x': this.fieldEditorWidth_ / 2,
          'y': FieldNote.TOP_MENU_HEIGHT / 2,
          'class': 'blocklyText',
          'text-anchor': 'middle',
          'dominant-baseline': 'middle',
        }, svg);

    // Note names on the low and high C keys
    var lowCX = FieldNote.WHITE_KEY_WIDTH / 2;
    this.lowCText_ = this.addCKeyLabel_(lowCX, svg);
    var highCX = lowCX + (FieldNote.WHITE_KEY_WIDTH *
      (FieldNote.NUM_WHITE_KEYS - 1));
    this.highCText_ = this.addCKeyLabel_(highCX, svg);

    // Horizontal line at the top of the keys
    Blockly.utils.dom.createSvgElement('line',
        {
          'stroke': this.sourceBlock_.parentBlock_.getColourTertiary(),
          'x1': 0,
          'y1': FieldNote.TOP_MENU_HEIGHT,
          'x2': this.fieldEditorWidth_,
          'y2': FieldNote.TOP_MENU_HEIGHT
        }, svg);

    // Drop shadow at the top of the keys
    Blockly.utils.dom.createSvgElement('rect',
        {
          'x': 0,
          'y': FieldNote.TOP_MENU_HEIGHT,
          'width': this.fieldEditorWidth_,
          'height': FieldNote.SHADOW_HEIGHT,
          'fill': FieldNote.SHADOW_COLOR,
          'fill-opacity': FieldNote.SHADOW_OPACITY
        }, svg);

    // Octave buttons
    this.octaveDownButton = this.addOctaveButton_(0, true, svg);
    this.octaveUpButton = this.addOctaveButton_(
        (this.fieldEditorWidth_ + FieldNote.INSET * 2) -
        FieldNote.OCTAVE_BUTTON_SIZE, false, svg);

    this.octaveDownMouseDownWrapper_ =
      Blockly.browserEvents.bind(this.octaveDownButton, 'mousedown', this, function() {
        this.changeOctaveBy_(-1);
      });
    this.octaveUpMouseDownWrapper_ =
        Blockly.browserEvents.bind(this.octaveUpButton, 'mousedown', this,function() {
          this.changeOctaveBy_(1);
        });
    Blockly.DropDownDiv.setColour(this.sourceBlock_.parentBlock_.getColour(),
        this.sourceBlock_.parentBlock_.getColourTertiary());
    Blockly.DropDownDiv.showPositionedByBlock(this, this.sourceBlock_);

    this.updateSelection_();
  }

  /**
   * Add one octave of piano keys drawn using SVG.
   * @param {number} x The x position of the left edge of this octave of keys.
   * @param {SVGElement} whiteKeyGroup The group for all white piano keys.
   * @param {SvgElement} blackKeyGroup The group for all black piano keys.
   * @param {!Array.<SvgElement>} keySVGarray An array containing all the key SVGs.
   * @private
   */
  addPianoOctave_(x, whiteKeyGroup, blackKeyGroup, keySVGarray) {
    var xIncrement, width, height, fill, stroke, group;
    x += FieldNote.EDGE_PADDING / 2;
    var y = FieldNote.TOP_MENU_HEIGHT;
    for (var i = 0; i < FieldNote.KEY_INFO.length; i++) {
      // Draw a black or white key
      if (FieldNote.KEY_INFO[i].isBlack) {
        // Black keys are shifted back half a key
        x -= FieldNote.BLACK_KEY_WIDTH / 2;
        xIncrement = FieldNote.BLACK_KEY_WIDTH / 2;
        width = FieldNote.BLACK_KEY_WIDTH;
        height = FieldNote.BLACK_KEY_HEIGHT;
        fill = FieldNote.BLACK_KEY_COLOR;
        stroke = FieldNote.BLACK_KEY_STROKE;
        group = blackKeyGroup;
      } else {
        xIncrement = FieldNote.WHITE_KEY_WIDTH;
        width = FieldNote.WHITE_KEY_WIDTH;
        height = FieldNote.WHITE_KEY_HEIGHT;
        fill = FieldNote.WHITE_KEY_COLOR;
        stroke = this.sourceBlock_.parentBlock_.getColourTertiary();
        group = whiteKeyGroup;
      }
      var attr = {
        'd': this.getPianoKeyPath_(x, y, width, height),
        'fill': fill,
        'stroke': stroke
      };
      x += xIncrement;

      var keySVG = Blockly.utils.dom.createSvgElement('path', attr, group);

      if (keySVGarray) {
        keySVGarray[i] = keySVG;
        keySVG.setAttribute('data-pitch', FieldNote.KEY_INFO[i].pitch);
        keySVG.setAttribute('data-name', FieldNote.KEY_INFO[i].name);
        keySVG.setAttribute('data-isBlack', FieldNote.KEY_INFO[i].isBlack);

        this.mouseDownWrappers_[i] =
            Blockly.browserEvents.bind(keySVG, 'mousedown', this, this.onMouseDownOnKey_);
        this.mouseEnterWrappers_[i] =
            Blockly.browserEvents.bind(keySVG, 'mouseenter', this, this.onMouseEnter_);
      }
    }
  }

  /**
   * Construct the SVG path string for a piano key shape: a rectangle with rounded
   * corners at the bottom.
   * @param {number} x the x position for the key.
   * @param {number} y the y position for the key.
   * @param {number} width the width of the key.
   * @param {number} height the height of the key.
   * @returns {string} the SVG path as a string.
   * @private
   */
  getPianoKeyPath_(x, y, width, height) {
    return  'M' + x + ' ' + y + ' ' +
      'L' + x + ' ' + (y + height -  FieldNote.KEY_RADIUS) + ' ' +
      'Q' + x + ' ' + (y + height) + ' ' +
      (x + FieldNote.KEY_RADIUS) + ' ' + (y + height) + ' ' +
      'L' + (x + width - FieldNote.KEY_RADIUS) + ' ' + (y + height) + ' ' +
      'Q' + (x + width) + ' ' + (y + height) + ' ' +
      (x + width) + ' ' + (y + height - FieldNote.KEY_RADIUS) + ' ' +
      'L' + (x + width) + ' ' + y + ' ' +
      'L' + x +  ' ' + y;
  }

  /**
   * Add a button for switching the displayed octave of the piano up or down.
   * @param {number} x The x position of the button.
   * @param {boolean} flipped If true, the icon should be flipped.
   * @param {SvgElement} svg The svg element to add the buttons to.
   * @returns {SvgElement} A group containing the button SVG elements.
   * @private
   */
  addOctaveButton_(x, flipped, svg) {
    var group = Blockly.utils.dom.createSvgElement('g', {}, svg);
    var imageSize = FieldNote.OCTAVE_BUTTON_SIZE;
    var arrow = Blockly.utils.dom.createSvgElement('image',
        {
          'width': imageSize,
          'height': imageSize,
          'x': x - FieldNote.INSET,
          'y': -1 * FieldNote.INSET
        }, group);
    arrow.setAttributeNS(
        'http://www.w3.org/1999/xlink',
        'xlink:href',
        Blockly.getMainWorkspace().options.pathToMedia + FieldNote.ARROW_SVG_PATH
    );
    Blockly.utils.dom.createSvgElement('line',
        {
          'stroke': this.sourceBlock_.parentBlock_.getColourTertiary(),
          'x1': x - FieldNote.INSET,
          'y1': 0,
          'x2': x - FieldNote.INSET,
          'y2': FieldNote.TOP_MENU_HEIGHT - FieldNote.INSET
        }, group);
    if (flipped) {
      var translateX = -1 * FieldNote.OCTAVE_BUTTON_SIZE + (FieldNote.INSET * 2);
      group.setAttribute('transform', 'scale(-1, 1) ' +
        'translate(' + translateX + ', 0)');
    }
    return group;
  }

  /**
   * Add an SVG text label for display on the C keys of the piano.
   * @param {number} x The x position for the label.
   * @param {SvgElement} svg The SVG element to add the label to.
   * @returns {SvgElement} The SVG element containing the label.
   * @private
   */
  addCKeyLabel_(x, svg) {
    return Blockly.utils.dom.createSvgElement('text',
        {
          'x': x,
          'y': FieldNote.TOP_MENU_HEIGHT + FieldNote.WHITE_KEY_HEIGHT -
            FieldNote.KEY_LABEL_PADDING,
          'class': 'scratchNotePickerKeyLabel',
          'text-anchor': 'middle'
        }, svg);
  }

  /**
   * Set the visibility of the C key labels.
   * @param {boolean} visible If true, set labels to be visible.
   * @private
   */
  setCKeyLabelsVisible_(visible) {
    if (visible) {
      this.fadeSvgToOpacity_(this.lowCText_, 1);
      this.fadeSvgToOpacity_(this.highCText_, 1);
    } else {
      this.fadeSvgToOpacity_(this.lowCText_, 0);
      this.fadeSvgToOpacity_(this.highCText_, 0);
    }
  }

  /**
   * Animate an SVG to fade it in or out to a target opacity.
   * @param {SvgElement} svg The SVG element to apply the fade to.
   * @param {number} opacity The target opacity.
   * @private
   */
  fadeSvgToOpacity_(svg, opacity) {
    svg.setAttribute('style', 'opacity: ' + opacity + '; transition: opacity 0.1s;');
  }

  /**
   * Handle the mouse down event on a piano key.
   * @param {!Event} e Mouse down event.
   * @private
   */
  onMouseDownOnKey_(e) {
    this.mouseIsDown_ = true;
    this.mouseUpWrapper_ = Blockly.browserEvents.bind(document.body, 'mouseup', this, this.onMouseUp_);
    this.selectNoteWithMouseEvent_(e);
  }

  /**
   * Handle the mouse up event following a mouse down on a piano key.
   * @private
   */
  onMouseUp_() {
    this.mouseIsDown_ = false;
    Blockly.browserEvents.unbind(this.mouseUpWrapper_);
    this.mouseUpWrapper_ = null;
  }

  /**
   * Handle the event when the mouse enters a piano key.
   * @param {!Event} e Mouse enter event.
   * @private
   */
  onMouseEnter_(e) {
    if (this.mouseIsDown_) {
      this.selectNoteWithMouseEvent_(e);
    }
  }

  /**
   * Use the data in a mouse event to select a new note, and play it.
   * @param {!Event} e Mouse event.
   * @private
   */
  selectNoteWithMouseEvent_(e) {
    var newNoteNum = Number(e.target.getAttribute('data-pitch')) + this.displayedOctave_ * 12;
    this.setEditorValue_(newNoteNum);
    this.playNoteInternal_();
  }

  /**
   * Play a note, by calling the externally overriden play note function.
   * @private
   */
  playNoteInternal_() {
    if (FieldNote.playNote_) {
      FieldNote.playNote_(
          Number(this.getValue()),
          'Music',
      );
    }
  }

  /**
   * Function to play a musical note corresponding to the key selected.
   * Overridden externally.
   * @param {number} noteNum the MIDI note number to play.
   * @param {string} id An id to select a scratch extension to play the note.
   * @private
   */
  static playNote_ = function(/* noteNum, id*/) {
    return;
  };

  /**
   * Change the selected note by a number of octaves, and start the animation.
   * @param {number} octaves The number of octaves to change by.
   * @private
   */
  changeOctaveBy_(octaves) {
    this.displayedOctave_ += octaves;
    if (this.displayedOctave_ < 0) {
      this.displayedOctave_ = 0;
      return;
    }
    var maxOctave = Math.floor(FieldNote.MAX_NOTE / 12);
    if (this.displayedOctave_ > maxOctave) {
      this.displayedOctave_ = maxOctave;
      return;
    }

    var newNote = Number(this.getText()) + (octaves * 12);
    this.setEditorValue_(newNote);

    this.animationTarget_ = this.fieldEditorWidth_ * octaves * -1;
    this.animationPos_ = 0;
    this.stepOctaveAnimation_();
    this.setCKeyLabelsVisible_(false);
  }

  /**
   * Animate the piano up or down an octave by sliding it to the left or right.
   * @private
   */
  stepOctaveAnimation_() {
    var absDiff = Math.abs(this.animationPos_ - this.animationTarget_);
    if (absDiff < 1) {
      this.pianoSVG_.setAttribute('transform', 'translate(0, 0)');
      this.setCKeyLabelsVisible_(true);
      this.playNoteInternal_();
      return;
    }
    this.animationPos_ += (this.animationTarget_ - this.animationPos_) *
      FieldNote.ANIMATION_FRACTION;
    this.pianoSVG_.setAttribute('transform', 'translate(' + this.animationPos_ + ',0)');
    requestAnimationFrame(this.stepOctaveAnimation_.bind(this));
  }

  doValueUpdate_(newValue) {
    super.doValueUpdate_(newValue);

    if (!this.textElement_) {
      // Not rendered yet.
      return;
    }

    this.updateSelection_();
  }

  /**
   * For a MIDI note number, find the index of the corresponding piano key.
   * @param {number} noteNum The note number.
   * @returns {number} The index of the piano key.
   * @private
   */
  noteNumToKeyIndex_(noteNum) {
    return Math.floor(noteNum) - (this.displayedOctave_ * 12);
  }

  /**
   * Update the selected note and labels on the field.
   * @private
   */
  updateSelection_() {
    var noteNum = Number(this.getText());

    // If the note is outside the currently displayed octave, update it
    if (this.displayedOctave_ == null ||
        noteNum > ((this.displayedOctave_ * 12) + 12) ||
        noteNum < (this.displayedOctave_ * 12)) {
      this.displayedOctave_ = Math.floor(noteNum / 12);
    }

    var index = this.noteNumToKeyIndex_(noteNum);

    // Clear the highlight on all keys
    this.keySVGs_.forEach(function(svg) {
      var isBlack = svg.getAttribute('data-isBlack');
      if (isBlack === 'true') {
        svg.setAttribute('fill', FieldNote.BLACK_KEY_COLOR);
      } else {
        svg.setAttribute('fill', FieldNote.WHITE_KEY_COLOR);
      }
    });
    // Set the highlight on the selected key
    if (this.keySVGs_[index]) {
      this.keySVGs_[index].setAttribute('fill', FieldNote.KEY_SELECTED_COLOR);
      // Update the note name text
      var noteName =  FieldNote.KEY_INFO[index].name;
      this.noteNameText_.textContent = noteName + ' (' + Math.floor(noteNum) + ')';
      // Update the low and high C note names
      var lowCNum = this.displayedOctave_ * 12;
      this.lowCText_.textContent = 'C(' + lowCNum + ')';
      this.highCText_.textContent = 'C(' + (lowCNum + 12) + ')';
    }
  }

  /**
   * Ensure that only a valid MIDI note number may be entered.
   * @param {string} text The user's text.
   * @return {?string} A string representing a valid note number, or null if invalid.
   */
  doClassValidation_(text) {
    if (text === null) {
      return null;
    }
    var n = parseFloat(text || 0);
    if (isNaN(n)) {
      return null;
    }
    if (n < 0) {
      n = 0;
    }
    if (n > FieldNote.MAX_NOTE) {
      n = FieldNote.MAX_NOTE;
    }
    return String(n);
  }
}

Blockly.fieldRegistry.register('field_note', FieldNote);
