/**
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'
import { ConstantProvider } from './constants'

export class BowlerHat extends Blockly.blockRendering.Hat {
  constructor(constants: ConstantProvider) {
    super(constants)
    // Calculated dynamically by computeBounds_().
    this.width = 0
    this.height = constants.BOWLER_HAT_HEIGHT
    this.ascenderHeight = this.height
  }
}
