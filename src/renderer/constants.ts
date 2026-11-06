/**
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'

export class ConstantProvider extends Blockly.zelos.ConstantProvider {
  REPLACEMENT_GLOW_COLOUR = '#ffffff'
  SELECTED_GLOW_COLOUR = '#ffffff'

  BOWLER_HAT_HEIGHT = 20

  /**
   * Sets the visual theme used to render the workspace.
   * This method also synthesizes a "selected" theme, used to color blocks with
   * dropdown menus when the menu is active. Additionally, if the theme's block
   * styles contain any raw color values, corresponding CSS variables will be
   * created/overridden so that those colors can be dynamically referenced in
   * stylesheets.
   * @param theme The new theme to apply.
   */
  override setTheme(theme: Blockly.Theme) {
    const root = document.documentElement
    for (const [key, colour] of Object.entries(theme.blockStyles)) {
      if (typeof colour !== 'object') {
        const varKey = `--colour-${key}`
        root.style.setProperty(varKey, colour)
      } else {
        const style = {
          colourPrimary: 'colourQuaternary' in colour ? String(colour.colourQuaternary) : colour.colourTertiary,
          colourSecondary: 'colourQuaternary' in colour ? String(colour.colourQuaternary) : colour.colourTertiary,
          colourTertiary: 'colourQuaternary' in colour ? String(colour.colourQuaternary) : colour.colourTertiary,
          colourQuaternary: 'colourQuaternary' in colour ? String(colour.colourQuaternary) : colour.colourTertiary,
          hat: '',
        }
        theme.setBlockStyle(`${key}_selected`, style)
      }
    }
    super.setTheme(theme)
  }

  /**
   * Returns the shape for the given connection.
   *
   * For OUTPUT_VALUE connections, the block's explicit output shape takes
   * priority (e.g. a Boolean reporter gets a hexagonal output connector).
   * For INPUT_VALUE connections, we use only the connection's type checks so
   * that input slots inside a Boolean reporter (like `<a = b>`) are still
   * drawn with the rounded shape that matches what they accept, not the
   * hexagonal shape of their parent block's output.
   * @param connection The connection whose shape to determine.
   * @returns The shape object for the given connection.
   */
  override shapeFor(connection: Blockly.RenderedConnection): ReturnType<Blockly.zelos.ConstantProvider['shapeFor']> {
    const connectionType: Blockly.ConnectionType = connection.type
    let checks = connection.getCheck()
    const hexagonal = this.HEXAGONAL
    const rounded = this.ROUNDED
    const squared = this.SQUARED
    if (!hexagonal || !rounded || !squared) return super.shapeFor(connection)
    if (!checks && connection.targetConnection) {
      checks = connection.targetConnection.getCheck()
    }

    if (connectionType === Blockly.ConnectionType.OUTPUT_VALUE) {
      const outputShape = connection.getSourceBlock().getOutputShape()
      if (outputShape !== null) {
        switch (outputShape) {
          case this.SHAPES.HEXAGONAL:
            return hexagonal
          case this.SHAPES.ROUND:
            return rounded
          case this.SHAPES.SQUARE:
            return squared
        }
      }
    }

    // For INPUT_VALUE (and OUTPUT_VALUE fallthrough), use connection checks.
    if (checks?.includes('Boolean')) return hexagonal
    if (checks?.includes('Number')) return rounded
    if (checks?.includes('String')) return rounded
    // For INPUT_VALUE or OUTPUT_VALUE with unrecognized checks, default to
    // ROUNDED. Don't call super.shapeFor() here: the base implementation
    // uses getSourceBlock().getOutputShape(), which would incorrectly return
    // HEXAGONAL for inputs inside Boolean reporters (e.g. `<a = b>`).
    if (
      connectionType === Blockly.ConnectionType.INPUT_VALUE ||
      connectionType === Blockly.ConnectionType.OUTPUT_VALUE
    ) {
      return rounded
    }
    return super.shapeFor(connection)
  }

  override createDom(svg: SVGElement, selector: string, injectionDivIfIsParent?: HTMLElement) {
    super.createDom(svg, selector, injectionDivIfIsParent)
    this.selectedGlowFilterId = ''
  }

  /**
   * Generate a bowler hat path string for a specific block.
   * @param width the `info_.width` of the block.
   * @returns The SVG path string for the bowler hat.
   */
  makeBowlerHatPath(width: number): string {
    const bowlerHatPath = `a20,20 0 0,1 20,-20 l ${width - 40} 0 a20,20 0 0,1 20,20`
    return bowlerHatPath
  }
}
