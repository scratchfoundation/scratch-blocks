/**
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'

class ScratchFieldDropdown extends Blockly.FieldDropdown {
  private originalStyle!: string

  showEditor_(event: PointerEvent) {
    super.showEditor_(event)
    const sourceBlock = this.getSourceBlock() as Blockly.BlockSvg
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
  }

  dropdownDispose_() {
    super.dropdownDispose_()
    const sourceBlock = this.getSourceBlock()!
    if (sourceBlock.isShadow()) {
      sourceBlock.setStyle(this.originalStyle)
    }
  }
}

/**
 * Register the field and any dependencies.
 */
export function registerScratchFieldDropdown() {
  Blockly.fieldRegistry.unregister('field_dropdown')
  Blockly.fieldRegistry.register('field_dropdown', ScratchFieldDropdown)
}
