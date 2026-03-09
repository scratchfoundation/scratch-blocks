/**
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'
import { BowlerHat } from './bowler_hat'
import { ConstantProvider } from './constants'

export class RenderInfo extends Blockly.zelos.RenderInfo {
  declare constants_: ConstantProvider

  override populateTopRow_() {
    if (this.isBowlerHatBlock()) {
      const bowlerHat = this.makeBowlerHat()
      this.topRow.elements.push(new Blockly.blockRendering.SquareCorner(this.constants_))
      this.topRow.elements.push(bowlerHat)
      this.topRow.elements.push(new Blockly.blockRendering.SquareCorner(this.constants_))
      this.topRow.minHeight = 0
      this.topRow.capline = bowlerHat.ascenderHeight
    } else {
      super.populateTopRow_()
    }
  }

  override populateBottomRow_() {
    super.populateBottomRow_()
    if (this.isBowlerHatBlock()) {
      this.bottomRow.minHeight = this.constants_.MEDIUM_PADDING
    }
  }

  override computeBounds_() {
    super.computeBounds_()
    if (this.isBowlerHatBlock()) {
      // Resize the render info to the same width as the widest part of a
      // bowler hat block.
      // Bowler hat blocks always have exactly one statement row and one input
      // element, so these find() calls are guaranteed to succeed.
      const statementRow = this.rows.find((r) => r.hasStatement)!
      this.width =
        statementRow.widthWithConnectedBlocks -
        statementRow.elements.find((e) => Blockly.blockRendering.Types.isInput(e))!.width +
        this.constants_.MEDIUM_PADDING

      // The bowler hat's width is the same as the block's width, so it can't
      // be derived from the constants like a normal hat and has to be set here.
      // populateTopRow_ always adds a hat element for bowler hat blocks.
      const hat = this.topRow.elements.find((e) => Blockly.blockRendering.Types.isHat(e))!
      hat.width = this.width
      this.topRow.measure()
    }
  }

  override getInRowSpacing_(
    prev: Blockly.blockRendering.Measurable,
    next: Blockly.blockRendering.Measurable,
  ): number {
    if (
      this.isBowlerHatBlock() &&
      ((prev && Blockly.blockRendering.Types.isHat(prev)) || (next && Blockly.blockRendering.Types.isHat(next)))
    ) {
      // Bowler hat rows have no spacing/gaps, just the hat.
      return 0
    }

    return super.getInRowSpacing_(prev, next)
  }

  override getSpacerRowHeight_(prev: Blockly.blockRendering.Row, next: Blockly.blockRendering.Row): number {
    if (this.isBowlerHatBlock() && prev === this.topRow) {
      return 0
    }

    return super.getSpacerRowHeight_(prev, next)
  }

  override getElemCenterline_(row: Blockly.blockRendering.Row, elem: Blockly.blockRendering.Measurable): number {
    if (this.isBowlerHatBlock() && Blockly.blockRendering.Types.isField(elem)) {
      return row.yPos + row.height / 2
    } else if (
      'isScratchExtension' in this.block_ &&
      this.block_.isScratchExtension &&
      Blockly.blockRendering.Types.isField(elem) &&
      elem.field instanceof Blockly.FieldImage &&
      elem.field === this.block_.inputList[0].fieldRow[0] &&
      this.block_.previousConnection
    ) {
      // Vertically center the icon on extension blocks.
      return super.getElemCenterline_(row, elem) + this.constants_.GRID_UNIT
    }
    return super.getElemCenterline_(row, elem)
  }

  isBowlerHatBlock() {
    return this.block_.hat === 'bowler'
  }

  makeBowlerHat() {
    return new BowlerHat(this.constants_)
  }
}
