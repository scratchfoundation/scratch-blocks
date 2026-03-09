/**
 * Copyright 2026 Scratch Foundation
 * SPDX-License-Identifier: Apache-2.0
 */
import { PathObject as ClassicPathObject } from '../path_object'
import { type CatFace } from './cat_face'

export class PathObject extends ClassicPathObject {
  /**
   * The face view for this block.
   * Only valid if this block has a hat and therefore should have a face.
   */
  catFace?: CatFace
}
