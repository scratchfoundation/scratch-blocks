/**
 * Copyright 2026 Scratch Foundation
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'
import { ScratchRenderer } from '../renderer'
import { ConstantProvider } from './constants'
import { Drawer } from './drawer'
import { PathObject } from './path_object'
import { RenderInfo } from './render_info'

export class CatScratchRenderer extends ScratchRenderer {
  override makeConstants_() {
    return new ConstantProvider()
  }

  override makeDrawer_(block: Blockly.BlockSvg, info: Blockly.blockRendering.RenderInfo) {
    return new Drawer(block, info as RenderInfo)
  }

  override makeRenderInfo_(block: Blockly.BlockSvg): RenderInfo {
    return new RenderInfo(this, block)
  }

  override makePathObject(root: SVGElement, style: Blockly.Theme.BlockStyle): PathObject {
    return new PathObject(root, style, this.getConstants())
  }
}

Blockly.blockRendering.register('scratch_catblocks', CatScratchRenderer)
