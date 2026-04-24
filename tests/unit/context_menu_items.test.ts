/**
 * Copyright 2026 Scratch Foundation
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'
import { afterAll, afterEach, assert, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { deleteBlock, registerDeleteBlock } from '../../src/context_menu_items'

// Tests for the scratch-specific delete context menu override (registerDeleteBlock).
// The copy/cut/paste override (registerDuplicateBlock, issue #3470) is tested
// in tests/browser/context_menu_items.test.ts.

let workspace: Blockly.Workspace
let originalDeleteBlock: string
let originalDeleteXBlocks: string
let originalDeleteItem: Blockly.ContextMenuRegistry.RegistryItem | null = null

function asBlockSvg(block: unknown): Blockly.BlockSvg {
  return block as Blockly.BlockSvg
}

beforeAll(() => {
  // Save and override messages used by the delete option's displayText.
  // Restored in afterAll to avoid polluting other test files.
  originalDeleteBlock = Blockly.Msg.DELETE_BLOCK
  originalDeleteXBlocks = Blockly.Msg.DELETE_X_BLOCKS
  Blockly.Msg.DELETE_BLOCK = 'Delete Block'
  Blockly.Msg.DELETE_X_BLOCKS = 'Delete %1 Blocks'
  // Capture and unregister the default 'blockDelete' item so we can register
  // the scratch-specific override. Restored in afterAll.
  originalDeleteItem = Blockly.ContextMenuRegistry.registry.getItem('blockDelete')
  if (originalDeleteItem) {
    Blockly.ContextMenuRegistry.registry.unregister('blockDelete')
  }
  registerDeleteBlock()
})

afterAll(() => {
  Blockly.ContextMenuRegistry.registry.unregister('blockDelete')
  if (originalDeleteItem) {
    Blockly.ContextMenuRegistry.registry.register(originalDeleteItem)
  }
  Blockly.Msg.DELETE_BLOCK = originalDeleteBlock
  Blockly.Msg.DELETE_X_BLOCKS = originalDeleteXBlocks
})

beforeEach(() => {
  workspace = new Blockly.Workspace()
  Blockly.defineBlocksWithJsonArray([
    {
      type: 'test_stack_block',
      message0: 'test',
      previousStatement: null,
      nextStatement: null,
    },
  ])
})

afterEach(() => {
  workspace.dispose()
  delete Blockly.Blocks.test_stack_block
})

// ---------------------------------------------------------------------------
// registerDeleteBlock — shadow exclusion and next-block exclusion
// ---------------------------------------------------------------------------

describe('registerDeleteBlock', () => {
  it('registers an item with id "blockDelete"', () => {
    expect(Blockly.ContextMenuRegistry.registry.getItem('blockDelete')).not.toBeNull()
  })

  it('displayText uses singular form for a single deletable block', () => {
    const block = workspace.newBlock('test_stack_block')
    const item = Blockly.ContextMenuRegistry.registry.getItem('blockDelete')
    assert(item, 'Expected blockDelete item to be registered')
    const displayFn = item.displayText as (scope: Blockly.ContextMenuRegistry.Scope) => string
    const text = displayFn({ block: asBlockSvg(block) })
    expect(text).toBe('Delete Block')
  })

  it('displayText excludes shadow blocks from count (shadow is not deletable)', () => {
    Blockly.defineBlocksWithJsonArray([
      {
        type: 'test_value_block',
        message0: '%1',
        args0: [{ type: 'input_value', name: 'VALUE' }],
        previousStatement: null,
        nextStatement: null,
      },
      {
        type: 'test_output_block',
        message0: 'output',
        output: null,
      },
    ])
    try {
      const parent = workspace.newBlock('test_value_block')
      const shadow = workspace.newBlock('test_output_block')
      shadow.setShadow(true)
      const shadowInputConn = parent.getInput('VALUE')?.connection
      const shadowOutputConn = shadow.outputConnection
      assert(shadowInputConn, 'Expected VALUE input connection')
      assert(shadowOutputConn, 'Expected shadow output connection')
      shadowInputConn.connect(shadowOutputConn)

      // getAllBlocks returns 2 (parent + shadow), but the scratch delete option
      // excludes shadows — getDeletableBlocksInStack counts only 1.
      expect(workspace.getAllBlocks(false)).toHaveLength(2)
      const item = Blockly.ContextMenuRegistry.registry.getItem('blockDelete')
      assert(item, 'Expected blockDelete item to be registered')
      const displayFn = item.displayText as (scope: Blockly.ContextMenuRegistry.Scope) => string
      const text = displayFn({ block: asBlockSvg(parent) })
      expect(text).toBe('Delete Block')
    } finally {
      delete Blockly.Blocks.test_value_block
      delete Blockly.Blocks.test_output_block
    }
  })

  it('displayText excludes next-block descendants from count', () => {
    const first = workspace.newBlock('test_stack_block')
    const second = workspace.newBlock('test_stack_block')
    const nextConn = first.nextConnection
    const prevConn = second.previousConnection
    assert(nextConn, 'Expected next connection')
    assert(prevConn, 'Expected previous connection')
    nextConn.connect(prevConn)

    // first + second = 2 deletable blocks connected via next.
    // getDeletableBlocksInStack excludes next-block descendants → count = 1.
    const item = Blockly.ContextMenuRegistry.registry.getItem('blockDelete')
    assert(item, 'Expected blockDelete item to be registered')
    const displayFn = item.displayText as (scope: Blockly.ContextMenuRegistry.Scope) => string
    const text = displayFn({ block: asBlockSvg(first) })
    expect(text).toBe('Delete Block')
  })

  it('displayText uses plural form when stack has multiple deletable blocks', () => {
    Blockly.defineBlocksWithJsonArray([
      {
        type: 'test_value_block',
        message0: '%1',
        args0: [{ type: 'input_value', name: 'VALUE' }],
        previousStatement: null,
        nextStatement: null,
      },
      {
        type: 'test_output_block',
        message0: 'output',
        output: null,
      },
    ])
    try {
      // A non-shadow child attached to a value input → 2 deletable blocks.
      const parent = workspace.newBlock('test_value_block')
      const child = workspace.newBlock('test_output_block')
      const childInputConn = parent.getInput('VALUE')?.connection
      const childOutputConn = child.outputConnection
      assert(childInputConn, 'Expected VALUE input connection')
      assert(childOutputConn, 'Expected child output connection')
      childInputConn.connect(childOutputConn)

      const item = Blockly.ContextMenuRegistry.registry.getItem('blockDelete')
      assert(item, 'Expected blockDelete item to be registered')
      const displayFn = item.displayText as (scope: Blockly.ContextMenuRegistry.Scope) => string
      const text = displayFn({ block: asBlockSvg(parent) })
      expect(text).toBe('Delete 2 Blocks')
    } finally {
      delete Blockly.Blocks.test_value_block
      delete Blockly.Blocks.test_output_block
    }
  })

  it('callback deletes only a top stack block and preserves its next block', () => {
    const first = workspace.newBlock('test_stack_block')
    const second = workspace.newBlock('test_stack_block')
    const nextConn = first.nextConnection
    const prevConn = second.previousConnection
    assert(nextConn, 'Expected next connection')
    assert(prevConn, 'Expected previous connection')
    nextConn.connect(prevConn)

    const item = Blockly.ContextMenuRegistry.registry.getItem('blockDelete')
    assert(item, 'Expected blockDelete item to be registered')
    const callback = item.callback as (scope: Blockly.ContextMenuRegistry.Scope) => void
    callback({ block: asBlockSvg(first) })

    expect(workspace.getAllBlocks(false)).toEqual([second])
    expect(second.getParent()).toBeNull()
  })

  it('checkAndDelete override routes through deleteBlock and preserves next block', () => {
    const first = workspace.newBlock('test_stack_block')
    const second = workspace.newBlock('test_stack_block')
    const nextConn = first.nextConnection
    const prevConn = second.previousConnection
    assert(nextConn, 'Expected next connection')
    assert(prevConn, 'Expected previous connection')
    nextConn.connect(prevConn)

    // Mirror the wiring in src/index.ts so we cover the keyboard-delete path.
    // Tests use plain Workspace (not WorkspaceSvg), so blocks aren't BlockSvg
    // instances — invoke the override via prototype to simulate the call site.
    const originalCheckAndDelete = Blockly.BlockSvg.prototype.checkAndDelete
    Blockly.BlockSvg.prototype.checkAndDelete = function () {
      deleteBlock(this)
    }
    try {
      Blockly.BlockSvg.prototype.checkAndDelete.call(first)
    } finally {
      Blockly.BlockSvg.prototype.checkAndDelete = originalCheckAndDelete
    }

    expect(workspace.getAllBlocks(false)).toEqual([second])
    expect(second.getParent()).toBeNull()
  })
})
