/**
 * Copyright 2026 Scratch Foundation
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'
import { afterAll, afterEach, assert, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { ScratchMsgs } from '../../msg/scratch_msgs'
import '../../src/css'
// The scratch field registrations fire inside the scratch-specific inject();
// this test drives Blockly directly, so register the scratch dropdown
// explicitly so its overrides are the ones under test.
import { registerScratchFieldDropdown } from '../../src/fields/scratch_field_dropdown'

// Scratch lists for "target sprite" dropdowns (e.g. motion_goto_menu,
// motion_pointtowards_menu, sensing_touchingobject_menu) are populated by
// scratch-gui at runtime and deliberately exclude the currently editing
// sprite. When a block is copied from another sprite into the sprite it now
// references, the stored field value is no longer in the option list for the
// current editing context. The dropdown must still display and preserve that
// value so the block visually matches what scratch-vm runs.
//
// Regression: https://scratch.mit.edu/discuss/topic/878311/

// Capture the default FieldDropdown class before mutating the global registry
// so we can restore it in afterAll, preventing state leakage into other suites.
let originalFieldDropdown: (new (...args: unknown[]) => Blockly.Field) | null = null

beforeAll(() => {
  ScratchMsgs.setLocale('en')
  originalFieldDropdown = Blockly.registry.getClass(Blockly.registry.Type.FIELD, 'field_dropdown')
  registerScratchFieldDropdown()
  Blockly.Blocks.test_target_menu = {
    init(this: Blockly.Block) {
      this.jsonInit({
        message0: '%1',
        args0: [
          {
            type: 'field_dropdown',
            name: 'TARGET',
            options: [
              ['random position', '_random_'],
              ['mouse-pointer', '_mouse_'],
              ['Sprite2', 'Sprite2'],
            ],
          },
        ],
        output: 'String',
        outputShape: 2, // OUTPUT_SHAPE_ROUND
      })
    },
  }
})

afterAll(() => {
  Blockly.fieldRegistry.unregister('field_dropdown')
  if (originalFieldDropdown) {
    // `register` expects a RegistrableField; the captured class satisfies that
    // contract by construction (it was registered originally).
    Blockly.fieldRegistry.register(
      'field_dropdown',
      originalFieldDropdown as unknown as Parameters<typeof Blockly.fieldRegistry.register>[1],
    )
  }
  delete Blockly.Blocks.test_target_menu
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

function loadXml(xml: string): void {
  Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), workspace)
}

describe('ScratchFieldDropdown — value outside current options', () => {
  it('preserves a stored value that is not in the current options list', () => {
    // "Sprite1" is not among the test_target_menu options — mirroring the case
    // where the editing sprite is excluded from the dropdown.
    loadXml(`
      <xml>
        <block type="test_target_menu">
          <field name="TARGET">Sprite1</field>
        </block>
      </xml>
    `)

    const block = workspace.getAllBlocks(false).find((b) => b.type === 'test_target_menu')
    assert(block, 'Expected test_target_menu block')
    expect(block.getFieldValue('TARGET')).toBe('Sprite1')
  })

  it('displays the stored value even when it is not in the current options list', () => {
    loadXml(`
      <xml>
        <block type="test_target_menu">
          <field name="TARGET">Sprite1</field>
        </block>
      </xml>
    `)

    const block = workspace.getAllBlocks(false).find((b) => b.type === 'test_target_menu')
    assert(block, 'Expected test_target_menu block')
    const field = block.getField('TARGET')
    assert(field, 'Expected TARGET field')
    // Before the fix, the field reverts to the first option's display text
    // ('random position') because Blockly.FieldDropdown rejects values that
    // are not in the current option list. The displayed text must reflect
    // the stored value so the user sees what the block actually targets.
    expect(field.getText()).not.toBe('random position')
    expect(field.getText()).toBe('Sprite1')
  })

  it('setValue directly with an out-of-options value keeps that value', () => {
    const block = workspace.newBlock('test_target_menu')
    block.initSvg()
    block.render()
    const field = block.getField('TARGET')
    assert(field, 'Expected TARGET field')
    field.setValue('Sprite1')
    expect(field.getValue()).toBe('Sprite1')
  })
})

describe('ScratchFieldDropdown — value inside current options', () => {
  // Guard the happy path: when the value IS in the options list, the overrides
  // must still route to the base implementation so display text uses the
  // option's human-readable label rather than the language-neutral value.
  it('stores the selected value and renders its human-readable label', () => {
    loadXml(`
      <xml>
        <block type="test_target_menu">
          <field name="TARGET">_random_</field>
        </block>
      </xml>
    `)

    const block = workspace.getAllBlocks(false).find((b) => b.type === 'test_target_menu')
    assert(block, 'Expected test_target_menu block')
    const field = block.getField('TARGET')
    assert(field, 'Expected TARGET field')
    expect(field.getValue()).toBe('_random_')
    expect(field.getText()).toBe('random position')
  })
})
