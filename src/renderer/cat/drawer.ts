/**
 * Copyright 2026 Scratch Foundation
 * SPDX-License-Identifier: Apache-2.0
 */
import { Drawer as ClassicDrawer } from '../drawer'
import { CatFace } from './cat_face'
import { type ConstantProvider } from './constants'
import { type PathObject } from './path_object'
import { type RenderInfo } from './render_info'

export class Drawer extends ClassicDrawer {
  declare constants_: ConstantProvider
  declare info_: RenderInfo

  override draw() {
    // Make sure the face exists if we need it.
    if (this.block_.hat) {
      const pathObject = this.block_.pathObject as PathObject

      if (!pathObject.catFace) {
        // Initialize the persistent face view.
        // Be aware of lifetimes:
        // Drawer and RenderInfo only exist during `Renderer.render(block)`.
        // Block, PathObject, and CatFace last for the lifetime of the block.
        // ConstantsProvider and the Renderer last for the lifetime of the workspace.
        pathObject.catFace = new CatFace(this.info_)
        pathObject.catFace.init(this.block_.getSvgRoot())
      }
    }

    super.draw()
  }

  override drawInternals_() {
    super.drawInternals_()

    const pathObject = this.block_.pathObject as PathObject
    const catFace = pathObject.catFace
    if (catFace) {
      // Update the transform for the whole group
      const transformParts: string[] = []
      if (this.info_.RTL) {
        transformParts.push('scale(-1 1)')
      }
      transformParts.push(`translate(0, ${this.info_.startY})`)
      catFace.setTransform(transformParts.join(' '))
    }
  }

  override makeReplacementTop_() {
    if (!this.block_.hat) {
      return super.makeReplacementTop_()
    }
    const pathObject = this.block_.pathObject as PathObject
    return this.constants_.makeCatPath(this.info_.width, pathObject.catFace!.pathEarState)
  }
}
