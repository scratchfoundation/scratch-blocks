/**
 * Copyright 2026 Scratch Foundation
 * SPDX-License-Identifier: Apache-2.0
 */
// Regression test for an accidentally-removed `previousConnection` guard in
// RenderInfo.getElemCenterline_.
//
// Extension blocks render a leading icon (FieldImage) which is vertically
// offset by GRID_UNIT so that it appears centered in the taller extension-block
// body.  That offset must only apply to stack-style extension blocks (those with
// a previousConnection), NOT hat-style extension blocks, which have their own
// height calculations.  The guard was removed during a style cleanup and needs
// to be restored.
import * as Blockly from 'blockly/core'
import { afterAll, afterEach, assert, beforeAll, describe, expect, it } from 'vitest'
import '../../src/blocks/vertical_extensions'
import '../../src/renderer/renderer'
import { ScratchMsgs } from '../../src/scratch_msgs'

const ICON_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
const BLOCK_TYPES = ['test_ext_stack', 'test_ext_hat']

let container: HTMLElement
let workspace: Blockly.WorkspaceSvg

beforeAll(() => {
  ScratchMsgs.setLocale('en')
  container = document.createElement('div')
  container.style.width = '800px'
  container.style.height = '600px'
  document.body.appendChild(container)
  workspace = Blockly.inject(container, { renderer: 'scratch_classic' })

  Blockly.defineBlocksWithJsonArray([
    {
      type: 'test_ext_stack',
      message0: '%1 stack extension',
      args0: [{ type: 'field_image', src: ICON_URL, width: 40, height: 40 }],
      previousStatement: null,
      nextStatement: null,
      extensions: ['scratch_extension'],
    },
    {
      type: 'test_ext_hat',
      message0: '%1 hat extension',
      args0: [{ type: 'field_image', src: ICON_URL, width: 40, height: 40 }],
      extensions: ['scratch_extension', 'shape_hat'],
    },
  ])
})

afterAll(() => {
  for (const type of BLOCK_TYPES) {
    delete Blockly.Blocks[type]
  }
  workspace.dispose()
  container.remove()
})

afterEach(() => {
  workspace.clear()
})

/**
 * Call getElemCenterline_ for the icon (FieldImage) element of a block and also
 * compute the "base" centerline via the superclass method.
 * @param block The rendered block to inspect.
 * @returns The difference (the offset our override applies).
 */
function getIconOffset(block: Blockly.BlockSvg): number {
  const renderer = workspace.getRenderer()
  const info = renderer.makeRenderInfo_(block)
  info.measure()

  for (const row of info.rows) {
    for (const elem of row.elements) {
      if (Blockly.blockRendering.Types.isField(elem) && elem.field instanceof Blockly.FieldImage) {
        const actual = (info as any).getElemCenterline_(row, elem) as number
        // Call the grandparent (zelos) implementation to get the base value.
        // Our override adds GRID_UNIT for stack-style extensions.
        const base: number = Blockly.zelos.RenderInfo.prototype.getElemCenterline_.call(info, row, elem)
        return actual - base
      }
    }
  }
  throw new Error('Block has no FieldImage element')
}

describe('extension block icon centering — getElemCenterline_', () => {
  it('stack-style extension block icon gets extra GRID_UNIT offset', () => {
    const block = workspace.newBlock('test_ext_stack')
    block.initSvg()
    block.render()

    assert(block.previousConnection, 'stack extension should have previousConnection')

    const constants = workspace.getRenderer().getConstants() as Blockly.zelos.ConstantProvider
    expect(getIconOffset(block)).toBeCloseTo(constants.GRID_UNIT, 1)
  })

  it('hat-style extension block icon does NOT get extra offset', () => {
    const block = workspace.newBlock('test_ext_hat')
    block.initSvg()
    block.render()

    expect(block.previousConnection).toBeNull()

    // Without the previousConnection guard, this would be GRID_UNIT instead of 0.
    expect(getIconOffset(block)).toBe(0)
  })
})
