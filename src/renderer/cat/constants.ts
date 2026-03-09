/**
 * Copyright 2026 Scratch Foundation
 * SPDX-License-Identifier: Apache-2.0
 */
import { ConstantProvider as ClassicConstantProvider } from '../constants'

export enum PathCapType {
  CAP = 'CAP',
  BOWLER = 'BOWLER',
}

export enum PathEarState {
  DOWN = 'DOWN',
  UP = 'UP',
}

export interface CatPathState {
  capType: PathCapType
  ear1State: PathEarState // Left ear in LTR, right in RTL
  ear2State: PathEarState // Right ear in LTR, left in RTL
}

export class ConstantProvider extends ClassicConstantProvider {
  START_HAT_HEIGHT = 31.5
  START_HAT_WIDTH = 96

  BOWLER_HAT_HEIGHT = 35

  FACE_OPACITY = 0.6

  EYE_1_X = 59.2
  EYE_1_Y = -3.3
  EYE_2_X = 29.1
  EYE_2_Y = -3.3
  OPEN_EYE_RADIUS = 3.4
  CLOSED_EYE_1_PATH =
    'M25.2-1.1c0.1,0,0.2,0,0.2,0l8.3-2.1l-7-4.8' +
    'c-0.5-0.3-1.1-0.2-1.4,0.3s-0.2,1.1,0.3,1.4L29-4.1l-4,1' +
    'c-0.5,0.1-0.9,0.7-0.7,1.2C24.3-1.4,24.7-1.1,25.2-1.1z'
  CLOSED_EYE_2_PATH =
    'M62.4-1.1c-0.1,0-0.2,0-0.2,0l-8.3-2.1l7-4.8' +
    'c0.5-0.3,1.1-0.2,1.4,0.3s0.2,1.1-0.3,1.4l-3.4,2.3l4,1' +
    'c0.5,0.1,0.9,0.7,0.7,1.2C63.2-1.4,62.8-1.1,62.4-1.1z'

  MOUTH_PATH =
    'M45.6,0.1c-0.9,0-1.7-0.3-2.3-0.9' +
    'c-0.6,0.6-1.3,0.9-2.2,0.9c-0.9,0-1.8-0.3-2.3-0.9c-1-1.1-1.1-2.6-1.1-2.8' +
    'c0-0.5,0.5-1,1-1l0,0c0.6,0,1,0.5,1,1c0,0.4,0.1,1.7,1.4,1.7' +
    'c0.5,0,0.7-0.2,0.8-0.3c0.3-0.3,0.4-1,0.4-1.3c0-0.1,0-0.1,0-0.2' +
    'c0-0.5,0.5-1,1-1l0,0c0.5,0,1,0.4,1,1c0,0,0,0.1,0,0.2' +
    'c0,0.3,0.1,0.9,0.4,1.2C44.8-2.2,45-2,45.5-2s0.7-0.2,0.8-0.3' +
    'c0.3-0.4,0.4-1.1,0.3-1.3c0-0.5,0.4-1,0.9-1.1c0.5,0,1,0.4,1.1,0.9' +
    'c0,0.2,0.1,1.8-0.8,2.8C47.5-0.4,46.8,0.1,45.6,0.1z'

  EAR_INSIDE_COLOR = '#FFD5E6'
  EAR_1_INSIDE_PATH =
    'M22.4-15.6c-1.7-4.2-4.5-9.1-5.8-8.5' +
    'c-1.6,0.8-5.4,7.9-5,15.4c0,0.6,0.7,0.7,1.1,0.5c3-1.6,6.4-2.8,8.6-3.6' +
    'C22.8-12.3,23.2-13.7,22.4-15.6z'
  EAR_2_INSIDE_PATH =
    'M73.1-15.6c1.7-4.2,4.5-9.1,5.8-8.5' +
    'c1.6,0.8,5.4,7.9,5,15.4c0,0.6-0.7,0.7-1.1,0.5c-3-1.6-6.4-2.8-8.6-3.6' +
    'C72.8-12.3,72.4-13.7,73.1-15.6z'

  CAP_START_PATH = 'c2.6,-2.3 5.5,-4.3 8.5,-6.2'
  CAP_MIDDLE_PATH = 'c8.4,-1.3 17,-1.3 25.4,0'
  CAP_END_PATH = 'c3,1.8 5.9,3.9 8.5,6.1'

  CAP_EAR_1_UP_PATH = 'c-1,-12.5 5.3,-23.3 8.4,-24.8' + 'c3.7,-1.8 16.5,13.1 18.4,15.4'
  CAP_EAR_2_UP_PATH = 'c1.9,-2.3 14.7,-17.2 18.4,-15.4' + 'c3.1,1.5 9.4,12.3 8.4,24.8'
  CAP_EAR_1_DOWN_PATH = 'c-5.8,-4.8 -8,-18 -4.9,-19.5' + 'c3.7,-1.8 24.5,11.1 31.7,10.1'
  CAP_EAR_2_DOWN_PATH = 'c7.2,1 28,-11.9 31.7,-10.1' + 'c3.1,1.5 0.9,14.7 -4.9,19.5'

  BOWLER_START_PATH = '' // opening curve depends on whether ear 1 is up or down
  BOWLER_MIDDLE_PATH = 'h33'
  BOWLER_END_PATH = 'a 20,20 0 0,1 20,20'
  BOWLER_EAR_1_UP_PATH = 'c0,-7.1 3.7,-13.3 9.3,-16.9' + 'c1.7,-7.5 5.4,-13.2 7.6,-14.2' + 'c2.6,-1.3 10,6 14.6,11.1'
  BOWLER_EAR_2_UP_PATH = 'c4.6,-5.1 11.9,-12.4 14.6,-11.1' + 'c1.9,0.9 4.9,5.2 6.8,11.1' + 'h7.8'
  BOWLER_EAR_1_DOWN_PATH =
    'c0,-4.6 1.6,-8.9 4.3,-12.3' + 'c-2.4,-5.6 -2.9,-12.4 -0.7,-13.4' + 'c2.1,-1 9.6,2.6 17,5.8' + 'h10.9'
  BOWLER_EAR_2_DOWN_PATH = 'h11' + 'c7.4,-3.2 14.8,-6.8 16.9,-5.8' + 'c1.2,0.6 1.6,2.9 1.3,5.8'

  // This number was determined experimentally:
  // - The 17 came from zooming in on a "define" block and iterating to get a near-vertical edge.
  // - The .7 came from measuring the width of the other parts of the SVG path.
  BOWLER_WIDTH_MAGIC = 17.7

  /**
   * Make the starting portion of a block's hat.
   * The return value will be stored as START_HAT.
   * In the case of cat blocks, this is just a placeholder for sizing.
   * @returns An object containing the hat's height and width dimensions.
   */
  override makeStartHat() {
    return {
      height: this.START_HAT_HEIGHT,
      width: this.START_HAT_WIDTH,
      path: this.makeCatPath(0, {
        capType: PathCapType.CAP,
        ear1State: PathEarState.UP,
        ear2State: PathEarState.UP,
      }),
    }
  }

  makeCatPath(width: number, state: CatPathState) {
    const pathStart = this[`${state.capType}_START_PATH`]
    const pathEar1 = this[`${state.capType}_EAR_1_${state.ear1State}_PATH`]
    const pathMiddle = this[`${state.capType}_MIDDLE_PATH`]
    const pathEar2 = this[`${state.capType}_EAR_2_${state.ear2State}_PATH`]
    const spacer =
      state.capType === PathCapType.BOWLER ? `l ${width - this.START_HAT_WIDTH - this.BOWLER_WIDTH_MAGIC} 0` : '' // caps don't need an internal spacer like bowlers do
    const pathEnd = this[`${state.capType}_END_PATH`]
    return `${pathStart}${pathEar1}${pathMiddle}${pathEar2}${spacer}${pathEnd}`
  }
}
