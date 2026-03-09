/**
 * Copyright 2026 Scratch Foundation
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'
import { type ConstantProvider, type CatPathState, PathCapType, PathEarState } from './constants'
import { type RenderInfo } from './render_info'
import { type CatScratchRenderer } from './renderer'

const Svg = Blockly.utils.Svg

enum FacePart {
  MOUTH,
  EYE_1_OPEN,
  EYE_2_OPEN,
  EYE_1_CLOSED,
  EYE_2_CLOSED,
  EAR_1_INSIDE,
  EAR_2_INSIDE,
}

const setVisibility = (element: SVGElement, visible: boolean) => {
  if (visible) {
    element.style.removeProperty('visibility')
  } else {
    element.style.setProperty('visibility', 'hidden')
  }
}

/**
 * Manages the SVG elements for the cat face.
 * This class holds the persistent SVG elements and manages events (blinking, etc.)
 * Owned by the PathObject with similar lifetime.
 */
export class CatFace {
  faceGroup_!: SVGElement
  parts_ = {} as Record<FacePart, SVGElement>
  pathEarState: CatPathState
  constants_: ConstantProvider
  renderer_: CatScratchRenderer
  block_: Blockly.BlockSvg

  constructor(info: RenderInfo) {
    this.constants_ = info.constants_
    this.renderer_ = info.renderer_
    this.block_ = info.block_
    this.pathEarState = {
      capType: info.isBowlerHatBlock() ? PathCapType.BOWLER : PathCapType.CAP,
      ear1State: PathEarState.UP,
      ear2State: PathEarState.UP,
    }
  }

  /**
   * Initializes the face SVG elements if they haven't been created yet.
   * @param parent The SVG element to attach the face geometry to.
   */
  init(parent: SVGElement) {
    if (this.faceGroup_) return
    this.buildFaceGeometry_(parent)
    this.setupBlinking_()
    this.setupEarFlicks_()
  }

  /**
   * Updates the transform of the entire face group.
   * @param transform The SVG transform attribute value to apply.
   */
  setTransform(transform: string) {
    if (this.faceGroup_) {
      this.faceGroup_.setAttribute('transform', transform)
    }
  }

  private setupBlinking_() {
    const blinkDuration = 100
    let ignoreBlink = false

    // TODO: Would it be better to use CSS for this?
    Blockly.browserEvents.bind(this.block_.pathObject.svgPath, 'mouseenter', this, () => {
      if (ignoreBlink) return
      ignoreBlink = true
      setVisibility(this.parts_[FacePart.EYE_1_OPEN], false)
      setVisibility(this.parts_[FacePart.EYE_2_OPEN], false)
      setVisibility(this.parts_[FacePart.EYE_1_CLOSED], true)
      setVisibility(this.parts_[FacePart.EYE_2_CLOSED], true)
      setTimeout(() => {
        setVisibility(this.parts_[FacePart.EYE_1_OPEN], true)
        setVisibility(this.parts_[FacePart.EYE_2_OPEN], true)
        setVisibility(this.parts_[FacePart.EYE_1_CLOSED], false)
        setVisibility(this.parts_[FacePart.EYE_2_CLOSED], false)
      }, blinkDuration)
      setTimeout(() => {
        ignoreBlink = false
      }, 2 * blinkDuration)
    })
  }

  /**
   * Asks the renderer to re-render the block at a time when it normally wouldn't.
   * Necessary if the path geometry has changed (ear flicks).
   * Not necessary for face changes (blinking).
   */
  private triggerRedraw() {
    this.renderer_.render(this.block_)
  }

  private setupEarFlicks_() {
    const flickDuration = 50
    let ignoreFlick1 = false
    let ignoreFlick2 = false

    Blockly.browserEvents.bind(this.parts_[FacePart.EAR_1_INSIDE], 'mouseenter', this, () => {
      if (ignoreFlick1) return
      ignoreFlick1 = true
      setVisibility(this.parts_[FacePart.EAR_1_INSIDE], false)
      this.pathEarState.ear1State = PathEarState.DOWN
      this.triggerRedraw()
      setTimeout(() => {
        setVisibility(this.parts_[FacePart.EAR_1_INSIDE], true)
        this.pathEarState.ear1State = PathEarState.UP
        this.triggerRedraw()
      }, flickDuration)
      setTimeout(() => {
        ignoreFlick1 = false
      }, 2 * flickDuration)
    })
    Blockly.browserEvents.bind(this.parts_[FacePart.EAR_2_INSIDE], 'mouseenter', this, () => {
      if (ignoreFlick2) return
      ignoreFlick2 = true
      setVisibility(this.parts_[FacePart.EAR_2_INSIDE], false)
      this.pathEarState.ear2State = PathEarState.DOWN
      this.triggerRedraw()
      setTimeout(() => {
        setVisibility(this.parts_[FacePart.EAR_2_INSIDE], true)
        this.pathEarState.ear2State = PathEarState.UP
        this.triggerRedraw()
      }, flickDuration)
      setTimeout(() => {
        ignoreFlick2 = false
      }, 2 * flickDuration)
    })
  }

  private buildFaceGeometry_(parent: SVGElement) {
    const face = Blockly.utils.dom.createSvgElement(
      Svg.G,
      {
        fill: '#000000',
        // transform set in setTransform()
      },
      parent,
    )
    this.faceGroup_ = face

    this.parts_[FacePart.MOUTH] = Blockly.utils.dom.createSvgElement(
      Svg.PATH,
      {
        'fill-opacity': this.constants_.FACE_OPACITY,
        d: this.constants_.MOUTH_PATH,
      },
      face,
    )

    this.parts_[FacePart.EAR_1_INSIDE] = Blockly.utils.dom.createSvgElement(
      Svg.PATH,
      {
        fill: this.constants_.EAR_INSIDE_COLOR,
        d: this.constants_.EAR_1_INSIDE_PATH,
      },
      face,
    )

    this.parts_[FacePart.EAR_2_INSIDE] = Blockly.utils.dom.createSvgElement(
      Svg.PATH,
      {
        fill: this.constants_.EAR_INSIDE_COLOR,
        d: this.constants_.EAR_2_INSIDE_PATH,
      },
      face,
    )

    this.parts_[FacePart.EYE_1_OPEN] = Blockly.utils.dom.createSvgElement(
      Svg.CIRCLE,
      {
        'fill-opacity': this.constants_.FACE_OPACITY,
        cx: this.constants_.EYE_1_X,
        cy: this.constants_.EYE_1_Y,
        r: this.constants_.OPEN_EYE_RADIUS,
      },
      face,
    )

    this.parts_[FacePart.EYE_1_CLOSED] = Blockly.utils.dom.createSvgElement(
      Svg.PATH,
      {
        'fill-opacity': this.constants_.FACE_OPACITY,
        d: this.constants_.CLOSED_EYE_1_PATH,
      },
      face,
    )
    setVisibility(this.parts_[FacePart.EYE_1_CLOSED], false)

    this.parts_[FacePart.EYE_2_OPEN] = Blockly.utils.dom.createSvgElement(
      Svg.CIRCLE,
      {
        'fill-opacity': this.constants_.FACE_OPACITY,
        cx: this.constants_.EYE_2_X,
        cy: this.constants_.EYE_2_Y,
        r: this.constants_.OPEN_EYE_RADIUS,
      },
      face,
    )

    this.parts_[FacePart.EYE_2_CLOSED] = Blockly.utils.dom.createSvgElement(
      Svg.PATH,
      {
        'fill-opacity': this.constants_.FACE_OPACITY,
        d: this.constants_.CLOSED_EYE_2_PATH,
      },
      face,
    )
    setVisibility(this.parts_[FacePart.EYE_2_CLOSED], false)
  }
}
