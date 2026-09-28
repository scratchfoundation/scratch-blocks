/**
 * Copyright 2026 Scratch Foundation
 * SPDX-License-Identifier: Apache-2.0
 */
// Regression tests for the null-argument crash in RenderInfo.getInRowSpacing_
// when rendering a bowler-hat (procedures_definition) block with the scratch
// renderer.
//
// Blockly's addElemSpacing_ iterates over row elements and calls
//   getInRowSpacing_(prev, elem)
// where `prev` is null for the very first element of each row.  The override
// in RenderInfo called Types.isHat(null) without guarding for null, which
// threw "Cannot read properties of null (reading 'type')".
import * as Blockly from 'blockly/core'
import { afterAll, afterEach, assert, beforeAll, describe, expect, it } from 'vitest'
import '../../src/blocks/procedures'
import '../../src/blocks/vertical_extensions'
// Registering the scratch renderer is the key difference from the other
// browser/procedures.test.ts — that test uses the default renderer and never
// exercises our RenderInfo override.
import '../../src/renderer/renderer'
import { ScratchMsgs } from '../../src/scratch_msgs'

let container: HTMLElement
let workspace: Blockly.WorkspaceSvg

beforeAll(() => {
  ScratchMsgs.setLocale('en')
  container = document.createElement('div')
  container.style.width = '800px'
  container.style.height = '600px'
  document.body.appendChild(container)
  // Inject once: ConstantProvider.setTheme mutates the shared Blockly default
  // theme (adding _selected variants), so re-injecting in each test causes
  // "Invalid colour" failures on the second and later calls.
  workspace = Blockly.inject(container, { renderer: 'scratch_classic' })
})

afterAll(() => {
  workspace.dispose()
  container.remove()
})

afterEach(() => {
  workspace.clear()
})

function loadXml(xml: string): void {
  Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), workspace)
}

describe('bowler hat block rendering — scratch renderer', () => {
  it('renders a no-argument procedures_definition without throwing', () => {
    // Before the fix this threw:
    // TypeError: Cannot read properties of null (reading 'type')
    //   at TypesContainer.isHat
    //   at RenderInfo.getInRowSpacing_
    expect(() =>
      loadXml(`
        <xml>
          <block type="procedures_definition">
            <statement name="custom_block">
              <block type="procedures_prototype">
                <mutation
                  proccode="test block"
                  argumentids='[]'
                  argumentnames='[]'
                  argumentdefaults='[]'
                  warp="false">
                </mutation>
              </block>
            </statement>
          </block>
        </xml>
      `),
    ).not.toThrow()
  })

  it('renders a one-argument procedures_definition without throwing', () => {
    expect(() =>
      loadXml(`
        <xml>
          <block type="procedures_definition">
            <statement name="custom_block">
              <block type="procedures_prototype">
                <mutation
                  proccode="test %s"
                  argumentids='["arg1"]'
                  argumentnames='["x"]'
                  argumentdefaults='[""]'
                  warp="false">
                </mutation>
                <value name="arg1">
                  <block type="argument_reporter_string_number">
                    <field name="VALUE">x</field>
                  </block>
                </value>
              </block>
            </statement>
          </block>
        </xml>
      `),
    ).not.toThrow()
  })

  it('procedures_definition block has positive dimensions after rendering', () => {
    loadXml(`
      <xml>
        <block type="procedures_definition">
          <statement name="custom_block">
            <block type="procedures_prototype">
              <mutation
                proccode="my block"
                argumentids='[]'
                argumentnames='[]'
                argumentdefaults='[]'
                warp="false">
              </mutation>
            </block>
          </statement>
        </block>
      </xml>
    `)

    const allBlocks = workspace.getAllBlocks(false)
    const defBlock = allBlocks.find((b) => b.type === 'procedures_definition')
    assert(defBlock, 'Expected procedures_definition block')
    // If rendering succeeds the block must have real, positive dimensions.
    expect(defBlock.width).toBeGreaterThan(0)
    expect(defBlock.height).toBeGreaterThan(0)
  })
})
