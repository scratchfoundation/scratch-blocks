/**
 * Copyright 2026 Scratch Foundation
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'
import { afterAll, afterEach, assert, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { ScratchMsgs } from '../../msg/scratch_msgs'
import { registerDuplicateBlock } from '../../src/context_menu_items'

// Browser test for registerDuplicateBlock — verifies that the scratch-specific
// duplicate behavior includes blocks connected via the "next" connection.
// Covers issue #3470: "Next" blocks not picked up by copy/cut and paste.

let container: HTMLElement
let workspace: Blockly.WorkspaceSvg
let originalDuplicateItem: Blockly.ContextMenuRegistry.RegistryItem | null = null

beforeAll(() => {
  ScratchMsgs.setLocale('en')
  // Blockly.inject registers the default 'blockDuplicate' item; capture it
  // first so we can restore it after the suite.
  // We use a temporary container to force item registration.
  const tmp = document.createElement('div')
  document.body.appendChild(tmp)
  const tmpWs = Blockly.inject(tmp, {})
  originalDuplicateItem = Blockly.ContextMenuRegistry.registry.getItem('blockDuplicate')
  tmpWs.dispose()
  tmp.remove()

  registerDuplicateBlock()
})

afterAll(() => {
  Blockly.ContextMenuRegistry.registry.unregister('blockDuplicate')
  if (originalDuplicateItem) {
    Blockly.ContextMenuRegistry.registry.register(originalDuplicateItem)
  }
})

beforeEach(() => {
  container = document.createElement('div')
  container.style.width = '800px'
  container.style.height = '600px'
  document.body.appendChild(container)
  workspace = Blockly.inject(container, {})

  Blockly.defineBlocksWithJsonArray([
    {
      type: 'test_stack_block',
      message0: 'block %1',
      args0: [{ type: 'field_number', name: 'NUM', value: 0 }],
      previousStatement: null,
      nextStatement: null,
    },
  ])
})

afterEach(() => {
  workspace.dispose()
  container.remove()
  delete Blockly.Blocks.test_stack_block
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// registerDuplicateBlock — callback calls toCopyData(true)
// ---------------------------------------------------------------------------

describe('registerDuplicateBlock — scratch override (issue #3470)', () => {
  it('the registered callback calls toCopyData(true) on the block', () => {
    Blockly.Xml.domToWorkspace(
      Blockly.utils.xml.textToDom(`
        <xml>
          <block type="test_stack_block">
            <field name="NUM">1</field>
          </block>
        </xml>
      `),
      workspace,
    )

    const block = workspace.getAllBlocks(false)[0]
    const toCopyDataSpy = vi.spyOn(block, 'toCopyData').mockReturnValue(null)

    const item = Blockly.ContextMenuRegistry.registry.getItem('blockDuplicate')
    assert(item, 'Expected blockDuplicate item to be registered')
    const callback = item.callback as (scope: Blockly.ContextMenuRegistry.Scope) => void
    callback({ block })

    expect(toCopyDataSpy).toHaveBeenCalledWith(true)
  })

  it('toCopyData(true) serialises the next block; toCopyData(false) does not', () => {
    Blockly.Xml.domToWorkspace(
      Blockly.utils.xml.textToDom(`
        <xml>
          <block type="test_stack_block">
            <field name="NUM">1</field>
            <next>
              <block type="test_stack_block">
                <field name="NUM">2</field>
              </block>
            </next>
          </block>
        </xml>
      `),
      workspace,
    )

    const blocks = workspace.getAllBlocks(false)
    const first = blocks.find((b) => b.getNextBlock() !== null)
    assert(first, 'Expected a block with a next connection')

    const withNext = first.toCopyData(true)
    const withoutNext = first.toCopyData(false)

    expect(withNext).not.toBeNull()
    expect(withoutNext).not.toBeNull()

    // BlockCopyData stores the serialised block state as blockState (JSON).
    // When addNextBlocks=true, blockState includes a "next" key.
    const withNextState = JSON.stringify((withNext as { blockState: unknown }).blockState)
    const withoutNextState = JSON.stringify((withoutNext as { blockState: unknown }).blockState)

    expect(withNextState).toContain('"next"')
    expect(withoutNextState).not.toContain('"next"')
  })
})
