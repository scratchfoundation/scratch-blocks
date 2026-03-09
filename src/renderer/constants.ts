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
          colourPrimary: 'colourQuaternary' in colour ? `${colour.colourQuaternary}` : colour.colourTertiary,
          colourSecondary: 'colourQuaternary' in colour ? `${colour.colourQuaternary}` : colour.colourTertiary,
          colourTertiary: 'colourQuaternary' in colour ? `${colour.colourQuaternary}` : colour.colourTertiary,
          colourQuaternary: 'colourQuaternary' in colour ? `${colour.colourQuaternary}` : colour.colourTertiary,
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
    let checks = connection.getCheck()
    if (!checks && connection.targetConnection) {
      checks = connection.targetConnection.getCheck()
    }

    if (connection.type === Blockly.ConnectionType.OUTPUT_VALUE) {
      const outputShape = connection.getSourceBlock().getOutputShape()
      if (outputShape !== null) {
        switch (outputShape) {
          case this.SHAPES.HEXAGONAL:
            return this.HEXAGONAL!
          case this.SHAPES.ROUND:
            return this.ROUNDED!
          case this.SHAPES.SQUARE:
            return this.SQUARED!
        }
      }
    }

    // For INPUT_VALUE (and OUTPUT_VALUE fallthrough), use connection checks.
    if (checks?.includes('Boolean')) return this.HEXAGONAL!
    if (checks?.includes('Number')) return this.ROUNDED!
    if (checks?.includes('String')) return this.ROUNDED!
    // For INPUT_VALUE or OUTPUT_VALUE with unrecognized checks, default to
    // ROUNDED. Don't call super.shapeFor() here: the base implementation
    // uses getSourceBlock().getOutputShape(), which would incorrectly return
    // HEXAGONAL for inputs inside Boolean reporters (e.g. `<a = b>`).
    if (
      connection.type === Blockly.ConnectionType.INPUT_VALUE ||
      connection.type === Blockly.ConnectionType.OUTPUT_VALUE
    ) {
      return this.ROUNDED!
    }
    return super.shapeFor(connection)
  }

  override createDom(svg: SVGElement, tagName: string, selector: string) {
    super.createDom(svg, tagName, selector)
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
