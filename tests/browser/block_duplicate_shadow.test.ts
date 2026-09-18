/**
 * Copyright 2026 Scratch Foundation
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'
import { afterAll, afterEach, assert, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { ScratchMsgs } from '../../msg/scratch_msgs'
import { CheckableContinuousFlyout } from '../../src/checkable_continuous_flyout'
import { registerRecyclableBlockFlyoutInflater } from '../../src/recyclable_block_flyout_inflater'
import { registerScratchBlockPaster } from '../../src/scratch_block_paster'

// Browser tests for the shared-shadow-ID bug (forum topic 878291).
// Both the duplicate/paste path and the flyout copy path must produce
// blocks with unique shadow IDs. Without stripIds, disposed shadows
// from the original reuse their IDs in the copy, causing the VM to
// think both blocks share the same shadow.

const BLOCK_TYPES = ['test_value_block', 'test_text_shadow', 'test_reporter']

let container: HTMLElement | undefined
let workspace: Blockly.WorkspaceSvg | undefined

beforeEach(() => {
  container = document.createElement('div')
  container.style.width = '800px'
  container.style.height = '600px'
  document.body.appendChild(container)
  ScratchMsgs.setLocale('en')
  Blockly.defineBlocksWithJsonArray([
    {
      type: 'test_value_block',
      message0: 'set to %1',
      args0: [{ type: 'input_value', name: 'VALUE' }],
      previousStatement: null,
      nextStatement: null,
    },
    {
      type: 'test_text_shadow',
      message0: '%1',
      args0: [{ type: 'field_input', name: 'TEXT' }],
      output: 'String',
    },
    {
      type: 'test_reporter',
      message0: 'answer',
      output: 'String',
    },
  ])
})

// Save the default Blockly implementations so we can restore them after
// all tests, preventing cross-suite leakage of Scratch-specific overrides.
const DefaultInflater = Blockly.registry.getClass(Blockly.registry.Type.FLYOUT_INFLATER, 'block')

beforeAll(() => {
  registerScratchBlockPaster()
  registerRecyclableBlockFlyoutInflater()
})

afterAll(() => {
  // Restore the default block paster
  Blockly.clipboard.registry.unregister(Blockly.clipboard.BlockPaster.TYPE)
  Blockly.clipboard.registry.register(Blockly.clipboard.BlockPaster.TYPE, new Blockly.clipboard.BlockPaster())
  // Restore the default flyout inflater
  if (DefaultInflater) {
    Blockly.registry.unregister(Blockly.registry.Type.FLYOUT_INFLATER, 'block')
    Blockly.registry.register(Blockly.registry.Type.FLYOUT_INFLATER, 'block', DefaultInflater)
  }
})

afterEach(() => {
  workspace?.dispose()
  container?.remove()
  for (const t of BLOCK_TYPES) {
    delete Blockly.Blocks[t]
  }
})

describe('duplicate block shadow IDs (forum topic 878291)', () => {
  it('duplicated block gets unique shadow IDs, not shared with original', () => {
    assert(container, 'Expected container from beforeEach')
    workspace = Blockly.inject(container, {})

    // Create the original block with a shadow on VALUE
    let original: Blockly.BlockSvg
    let reporter: Blockly.BlockSvg
    Blockly.Events.disable()
    try {
      original = Blockly.serialization.blocks.append(
        {
          type: 'test_value_block',
          inputs: {
            VALUE: {
              shadow: {
                type: 'test_text_shadow',
                fields: { TEXT: '0' },
              },
            },
          },
        },
        workspace,
      ) as Blockly.BlockSvg

      // Connect a reporter to obscure the shadow
      reporter = workspace.newBlock('test_reporter')
    } finally {
      Blockly.Events.enable()
    }

    const conn = original.getInput('VALUE')?.connection
    assert(conn, 'Expected VALUE connection')
    const reporterOutput = reporter.outputConnection
    assert(reporterOutput, 'Expected reporter output connection')
    conn.connect(reporterOutput)

    // Capture the original's shadow state before duplication
    const originalShadowState = conn.getShadowState()
    assert(originalShadowState, 'Expected shadow state on original after connecting reporter')
    const originalShadowId = originalShadowState.id
    assert(originalShadowId, 'Expected shadow state to have an ID')

    // Duplicate via the actual clipboard path (toCopyData + paste)
    const copyData = original.toCopyData()
    assert(copyData, 'Expected toCopyData to return data')
    const copyResult = Blockly.clipboard.paste(copyData, workspace)
    assert(copyResult, 'Expected paste to return a block')
    const copy = copyResult as unknown as Blockly.BlockSvg

    // The copy's shadow should have a DIFFERENT ID than the original's
    const copyConn = copy.getInput('VALUE')?.connection
    assert(copyConn, 'Expected VALUE connection on copy')
    const copyShadowState = copyConn.getShadowState()
    assert(copyShadowState, 'Expected shadow state on copy')

    expect(copyShadowState.id).not.toBe(originalShadowId)

    // Verify: deleting the copy does not affect the original's shadow
    copy.dispose()
    reporterOutput.disconnect()
    const respawned = conn.targetBlock()
    assert(respawned, 'Original shadow should respawn after copy is deleted')
    expect(respawned.isShadow()).toBe(true)
    expect(respawned.type).toBe('test_text_shadow')
  })

  function pressEnter(workspace: Blockly.WorkspaceSvg, times: number) {
    for (let i = 0; i < times; i++) {
      workspace.getInjectionDiv().dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Enter',
          keyCode: 13,
          bubbles: true,
        }),
      )
    }
  }

  it('two flyout copies get unique shadow IDs when first copy shadow is obscured', () => {
    assert(container, 'Expected container from beforeEach')
    // Inject with CheckableContinuousFlyout (which has the stripIds fix)
    // and a toolbox that includes a block with a shadow input.
    workspace = Blockly.inject(container, {
      toolbox: {
        kind: 'flyoutToolbox',
        contents: [
          {
            kind: 'block',
            type: 'test_value_block',
            inputs: {
              VALUE: {
                shadow: {
                  type: 'test_text_shadow',
                  fields: { TEXT: '0' },
                },
              },
            },
          },
        ],
      },
      plugins: {
        flyoutsVerticalToolbox: CheckableContinuousFlyout,
      },
    })

    const flyout = workspace.getFlyout()
    assert(flyout, 'Expected workspace to have a flyout')

    // Find the template block in the flyout
    const flyoutBlocks = flyout.getWorkspace().getAllBlocks(false)
    const template = flyoutBlocks.find((b) => b.type === 'test_value_block')
    assert(template, 'Expected template block in flyout')

    // First copy from flyout
    Blockly.getFocusManager().focusNode(template)
    // Press enter twice, once to start an insert/move and then to commit it
    pressEnter(workspace, 2)
    const copy1 = workspace.getTopBlocks()[0]
    const conn1 = copy1.getInput('VALUE')?.connection
    assert(conn1, 'Expected VALUE connection on first copy')
    const shadow1 = conn1.targetBlock()
    assert(shadow1, 'Expected shadow on first copy')
    expect(shadow1.isShadow()).toBe(true)
    const shadow1Id = shadow1.id

    // Obscure the first copy's shadow by connecting a reporter
    let reporter: Blockly.BlockSvg
    Blockly.Events.disable()
    try {
      reporter = workspace.newBlock('test_reporter')
    } finally {
      Blockly.Events.enable()
    }
    const reporterOutput = reporter.outputConnection
    assert(reporterOutput, 'Expected reporter output connection')
    conn1.connect(reporterOutput)

    // Second copy from flyout — its shadow must get a different ID
    Blockly.getFocusManager().focusNode(template)
    pressEnter(workspace, 2)
    const copy2 = workspace.getTopBlocks().find((b) => b !== copy1 && b !== reporter)
    const conn2 = copy2.getInput('VALUE')?.connection
    assert(conn2, 'Expected VALUE connection on second copy')
    const shadow2 = conn2.targetBlock()
    assert(shadow2, 'Expected shadow on second copy')
    expect(shadow2.isShadow()).toBe(true)

    expect(shadow2.id).not.toBe(shadow1Id)
  })
})
