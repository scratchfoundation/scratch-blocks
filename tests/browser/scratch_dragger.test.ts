/**
 * Copyright 2026 Scratch Foundation
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { ScratchMsgs } from '../../msg/scratch_msgs'
import '../../src/css'
import { ScratchDragger } from '../../src/scratch_dragger'

beforeAll(() => {
  ScratchMsgs.setLocale('en')
  Blockly.Blocks.test_block = {
    init(this: Blockly.Block) {
      this.jsonInit({
        message0: 'test',
        previousStatement: null,
        nextStatement: null,
      })
    },
  }
})

afterAll(() => {
  delete Blockly.Blocks.test_block
})

let container: HTMLElement
let workspace: Blockly.WorkspaceSvg

beforeEach(() => {
  container = document.createElement('div')
  container.style.width = '800px'
  container.style.height = '600px'
  document.body.appendChild(container)
  workspace = Blockly.inject(container, {})
})

afterEach(() => {
  workspace.dispose()
  container.remove()
  vi.restoreAllMocks()
})

describe('ScratchDragger', () => {
  describe('wouldDeleteDraggable', () => {
    it('returns false when the block is outside the workspace, even over a delete area', () => {
      const block = workspace.newBlock('test_block')
      block.initSvg()
      block.render()

      const dragger = new ScratchDragger(block, workspace)
      dragger.draggedOutOfBounds = true

      // Mock getDragTarget to return a delete area (simulating the
      // flyout being at the pointer position).
      const fakeDragTarget = { id: 'fake-flyout', wouldDelete: () => true }
      vi.spyOn(workspace, 'getDragTarget').mockReturnValue(fakeDragTarget as unknown as Blockly.IDragTarget)
      vi.spyOn(workspace.getComponentManager(), 'hasCapability').mockReturnValue(true)

      const event = new PointerEvent('pointerup', { clientX: 100, clientY: 100 })
      expect(dragger.wouldDeleteDraggable(event, block)).toBe(false)
    })

    it('allows deletion when the block is inside the workspace over a delete area', () => {
      const block = workspace.newBlock('test_block')
      block.initSvg()
      block.render()

      const dragger = new ScratchDragger(block, workspace)
      dragger.draggedOutOfBounds = false

      const fakeDragTarget = { id: 'fake-flyout', wouldDelete: () => true }
      vi.spyOn(workspace, 'getDragTarget').mockReturnValue(fakeDragTarget as unknown as Blockly.IDragTarget)
      vi.spyOn(workspace.getComponentManager(), 'hasCapability').mockReturnValue(true)

      const event = new PointerEvent('pointerup', { clientX: 100, clientY: 100 })
      expect(dragger.wouldDeleteDraggable(event, block)).toBe(true)
    })
  })

  describe('pointer-events on drag surface', () => {
    it('overrides pointer-events:auto on dragged blocks', () => {
      const dragSurface = container.querySelector('.blocklyBlockDragSurface')
      expect(dragSurface).not.toBeNull()

      // Blockly core sets pointer-events:auto on .blocklyDragging so
      // the grab cursor works during drags. Our CSS rule overrides
      // this for children of the drag surface so that pointer events
      // pass through to elements underneath (backpack, sprite tiles).
      const child = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      child.setAttribute('class', 'blocklyDragging')
      const dragGroup = dragSurface?.querySelector('g')
      expect(dragGroup).not.toBeNull()
      dragGroup?.appendChild(child)

      const style = window.getComputedStyle(child)
      expect(style.pointerEvents).toBe('none')
    })
  })
})
