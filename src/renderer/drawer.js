/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from "blockly/core";

export class Drawer extends Blockly.zelos.Drawer {
  drawStatementInput_(row) {
    if (this.info_.isBowlerHatBlock()) {
      // Bowler hat blocks have straight sides with no C-shape/indentation for
      // statement blocks.
      this.drawRightSideRow_(row);
      this.positionStatementInputConnection_(row);
    } else {
      super.drawStatementInput_(row);
    }
  }

  drawRightSideRow_(row) {
    if (
      this.info_.isBowlerHatBlock() &&
      Blockly.blockRendering.Types.isSpacer(row)
    ) {
      // Multi-row bowler hat blocks are not supported, this may need
      // adjustment to do so.
      Blockly.blockRendering.Drawer.prototype.drawRightSideRow_.call(this, row);
    } else {
      super.drawRightSideRow_(row);
    }
  }

  drawTop_() {
    super.drawTop_();
    // This is a horrible hack, but the superclass' implementation of drawTop_()
    // provides no way to cleanly override a hat's path without copying and
    // pasting the entire implementation here. We know that there will only be
    // one hat on a block, and its path is a known constant, so we just find and
    // replace it with the desired bowler hat path here.
    // If https://github.com/google/blockly/issues/7292 is resolved, this should
    // be revisited.
    if (this.info_.isBowlerHatBlock()) {
      const capHatPath = this.constants_.START_HAT.path;
      const bowlerHatPath = `a20,20 0 0,1 20,-20 l ${
        this.info_.width - 40
      } 0 a20,20 0 0,1 20,20`;
      this.outlinePath_ = this.outlinePath_.replace(capHatPath, bowlerHatPath);
    }
  }
}
