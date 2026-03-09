/**
 * Copyright 2026 Scratch Foundation
 * SPDX-License-Identifier: Apache-2.0
 */
import { RenderInfo as ClassicRenderInfo } from '../render_info'
import { ConstantProvider } from './constants'
import { CatScratchRenderer } from './renderer'

export class RenderInfo extends ClassicRenderInfo {
  declare constants_: ConstantProvider
  declare renderer_: CatScratchRenderer
}
