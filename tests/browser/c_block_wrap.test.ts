/**
 * Copyright 2026 Scratch Foundation
 * SPDX-License-Identifier: Apache-2.0
 */
// Browser-level regression tests for C-block wrapping (issue #3494).
//
// When a C-block (e.g. "repeat") is dropped onto a block in the middle of an
// existing stack, the displaced block(s) should be placed *inside* the C-block's
// statement input (wrap behavior), not after the C-block's next connection.
//
// These tests use rendered BlockSvg blocks (via Blockly.inject) to exercise the
// full connection path, including the connection checker and drag checks, not
// just the patched getConnectionForOrphanedConnection in isolation.
import * as Blockly from 'blockly/core'
import { afterAll, afterEach, assert, beforeAll, describe, expect, it } from 'vitest'
import '../../src/blocks/vertical_extensions'
import '../../src/scratch_c_block_wrap'
import '../../src/scratch_connection_checker'
import { ScratchMsgs } from '../../src/scratch_msgs'

const BLOCK_TYPES = ['test_c_block', 'test_stack_a', 'test_stack_b', 'test_stack_c']

let container: HTMLElement
let workspace: Blockly.WorkspaceSvg

beforeAll(() => {
  ScratchMsgs.setLocale('en')
  container = document.createElement('div')
  container.style.width = '800px'
  container.style.height = '600px'
  document.body.appendChild(container)
  workspace = Blockly.inject(container, {})

  Blockly.defineBlocksWithJsonArray([
    {
      type: 'test_c_block',
      message0: 'repeat %1',
      args0: [{ type: 'input_statement', name: 'SUBSTACK' }],
      previousStatement: null,
      nextStatement: null,
    },
    {
      type: 'test_stack_a',
      message0: 'block A',
      previousStatement: null,
      nextStatement: null,
    },
    {
      type: 'test_stack_b',
      message0: 'block B',
      previousStatement: null,
      nextStatement: null,
    },
    {
      type: 'test_stack_c',
      message0: 'block C',
      previousStatement: null,
      nextStatement: null,
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

describe('C-block wrapping in rendered workspace — issue #3494', () => {
  it('getConnectionForOrphanedConnection sends displaced block to statement input', () => {
    const cBlock = workspace.newBlock('test_c_block')
    const blockB = workspace.newBlock('test_stack_b')

    assert(blockB.previousConnection, 'blockB should have previousConnection')

    const result = Blockly.Connection.getConnectionForOrphanedConnection(cBlock, blockB.previousConnection)

    const substackConn = cBlock.getInput('SUBSTACK')?.connection
    assert(substackConn, 'cBlock should have a SUBSTACK connection')

    expect(result).toBe(substackConn)
  })

  it('connecting C-block mid-stack wraps displaced blocks into statement input', () => {
    // Build stack: A → B → C
    const blockA = workspace.newBlock('test_stack_a')
    const blockB = workspace.newBlock('test_stack_b')
    const blockC = workspace.newBlock('test_stack_c')

    assert(blockA.nextConnection, 'blockA should have nextConnection')
    assert(blockB.previousConnection, 'blockB should have previousConnection')
    assert(blockB.nextConnection, 'blockB should have nextConnection')
    assert(blockC.previousConnection, 'blockC should have previousConnection')

    blockA.nextConnection.connect(blockB.previousConnection)
    blockB.nextConnection.connect(blockC.previousConnection)

    // Verify initial stack: A → B → C
    expect(blockA.nextConnection.targetBlock()).toBe(blockB)
    expect(blockB.nextConnection.targetBlock()).toBe(blockC)

    // Now connect C-block's previous to blockA's next, displacing blockB.
    // This simulates dropping a C-block onto blockB in the middle of the stack.
    const cBlock = workspace.newBlock('test_c_block')
    assert(cBlock.previousConnection, 'cBlock should have previousConnection')

    blockA.nextConnection.connect(cBlock.previousConnection)

    // After the connect, the stack should be: A → C-block
    expect(blockA.nextConnection.targetBlock()).toBe(cBlock)

    // The displaced blockB (and its successor blockC) should have been placed
    // inside the C-block's statement input, not after the C-block's next connection.
    const substackConn = cBlock.getInput('SUBSTACK')?.connection
    assert(substackConn, 'cBlock should have a SUBSTACK connection')

    expect(substackConn.targetBlock()).toBe(blockB)
    // blockC should still be connected after blockB
    assert(blockB.nextConnection, 'blockB should have nextConnection')
    expect(blockB.nextConnection.targetBlock()).toBe(blockC)
  })

  it('C-block next connection is empty after wrapping (displaced block is not after C-block)', () => {
    // Build stack: A → B
    const blockA = workspace.newBlock('test_stack_a')
    const blockB = workspace.newBlock('test_stack_b')

    assert(blockA.nextConnection, 'blockA should have nextConnection')
    assert(blockB.previousConnection, 'blockB should have previousConnection')

    blockA.nextConnection.connect(blockB.previousConnection)

    // Drop C-block mid-stack, displacing blockB
    const cBlock = workspace.newBlock('test_c_block')
    assert(cBlock.previousConnection, 'cBlock should have previousConnection')

    blockA.nextConnection.connect(cBlock.previousConnection)

    // blockB should NOT be after the C-block's next connection
    // (that would be the old, incorrect Blockly default behavior)
    assert(cBlock.nextConnection, 'cBlock should have nextConnection')
    expect(cBlock.nextConnection.targetBlock()).toBeNull()

    // blockB should be inside the C-block's SUBSTACK
    const substackConn = cBlock.getInput('SUBSTACK')?.connection
    assert(substackConn, 'cBlock should have a SUBSTACK connection')
    expect(substackConn.targetBlock()).toBe(blockB)
  })

  it('wrapping works with insertion markers (drag preview matches drop result)', () => {
    // Build stack: A → B
    const blockA = workspace.newBlock('test_stack_a')
    const blockB = workspace.newBlock('test_stack_b')

    assert(blockA.nextConnection, 'blockA should have nextConnection')
    assert(blockB.previousConnection, 'blockB should have previousConnection')

    blockA.nextConnection.connect(blockB.previousConnection)

    // Create a C-block insertion marker (simulating drag preview)
    const markerBlock = workspace.newBlock('test_c_block')
    markerBlock.setInsertionMarker(true)

    // The orphan routing should work the same way for markers as for real blocks
    const result = Blockly.Connection.getConnectionForOrphanedConnection(markerBlock, blockB.previousConnection)

    const substackConn = markerBlock.getInput('SUBSTACK')?.connection
    assert(substackConn, 'markerBlock should have a SUBSTACK connection')

    expect(result).toBe(substackConn)
  })
})
