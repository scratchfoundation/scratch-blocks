/**
 * Copyright 2026 Scratch Foundation
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'
import { afterEach, assert, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
// Load scratch-specific messages (required before block registration).
import { ScratchMsgs } from '../../msg/scratch_msgs'
import '../../src/blocks/procedures'
// Import scratch-specific block registrations.
import '../../src/blocks/vertical_extensions'
import '../../src/scratch_connection_checker'

beforeAll(() => {
  ScratchMsgs.setLocale('en')
})

// Browser tests for procedure block behavior that requires BlockSvg
// (setDragStrategy, showContextMenu). These cover PRs #3492 and #3493.

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

// ---------------------------------------------------------------------------
// PR #3493 regression: skipArgumentReporters_ during XML deserialization
// ---------------------------------------------------------------------------

describe('skipArgumentReporters_ — XML round-trip', () => {
  it('loading a 1-argument procedure from XML produces exactly 1 reporter (not 2)', () => {
    // A procedures_definition with a procedures_prototype that has one <value>
    // child (the arg reporter). Without the skipArgumentReporters_ fix,
    // updateDisplay_() would also create a reporter, resulting in 2.
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
    `)

    // Total blocks: 1 definition + 1 prototype + 1 reporter = 3.
    // Before the fix: 1 definition + 1 prototype + 2 reporters (1 from XML,
    // 1 orphaned from updateDisplay_) = 4.
    expect(workspace.getAllBlocks(false)).toHaveLength(3)
  })

  it('loading a 2-argument procedure from XML produces exactly 2 reporters (not 4)', () => {
    loadXml(`
      <xml>
        <block type="procedures_definition">
          <statement name="custom_block">
            <block type="procedures_prototype">
              <mutation
                proccode="test %s %b"
                argumentids='["arg1","arg2"]'
                argumentnames='["x","flag"]'
                argumentdefaults='["","false"]'
                warp="false">
              </mutation>
              <value name="arg1">
                <block type="argument_reporter_string_number">
                  <field name="VALUE">x</field>
                </block>
              </value>
              <value name="arg2">
                <block type="argument_reporter_boolean">
                  <field name="VALUE">flag</field>
                </block>
              </value>
            </block>
          </statement>
        </block>
      </xml>
    `)

    // Total blocks: 1 definition + 1 prototype + 2 reporters = 4.
    // Before the fix: 1 + 1 + 4 (2 from XML, 2 orphaned) = 6.
    expect(workspace.getAllBlocks(false)).toHaveLength(4)
  })

  it('reporters are connected to prototype inputs, not floating', () => {
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
    `)

    const allBlocks = workspace.getAllBlocks(false)
    const reporters = allBlocks.filter((b) => b.type === 'argument_reporter_string_number')
    expect(reporters).toHaveLength(1)
    // The reporter must be connected to a parent (the prototype), not floating.
    expect(reporters[0].getParent()).not.toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Procedure call block mutation round-trip (generateshadows tolerance)
// ---------------------------------------------------------------------------

describe('procedure call mutation round-trip', () => {
  it('deserializing a call block without generateshadows does not throw', () => {
    // When dragging a procedure call from the flyout, Blockly serializes the
    // block (via callerMutationToDom, which omits generateshadows) then
    // deserializes the copy (via callerDomToMutation). Previously
    // callerDomToMutation required generateshadows, causing a crash.
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
          <block type="procedures_call">
            <mutation
              proccode="test %s"
              argumentids='["arg1"]'
              warp="false">
            </mutation>
          </block>
        </xml>
      `),
    ).not.toThrow()

    const callBlock = workspace.getAllBlocks(false).find((b) => b.type === 'procedures_call')
    assert(callBlock, 'Expected procedures_call block')
    // Without the generateshadows attribute, it should default to false.
    expect((callBlock as any).generateShadows_).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Legacy project XML tolerance (scratchfoundation/scratch-editor#532)
//
// Older saved projects may omit mutation attributes that the current serializer
// always writes. Treating every attribute as required breaks loading of
// projects that predate (or selectively elide) those attributes. `proccode`
// and the argument arrays (`argumentids`, `argumentnames`, `argumentdefaults`)
// stay required: `proccode` is the block's identity, and the argument arrays'
// lengths must match the proccode token count and each other, so silently
// defaulting any of them to `[]` would turn an N-arg procedure into a 0-arg
// block. `warp` is the one attribute recoverable with a sane default (`false`).
// ---------------------------------------------------------------------------

describe('legacy mutation tolerance', () => {
  it('procedures_prototype mutation without warp loads with warp=false', () => {
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
                  argumentdefaults='[""]'>
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

    const proto = workspace.getAllBlocks(false).find((b) => b.type === 'procedures_prototype')
    assert(proto, 'Expected procedures_prototype block')
    expect((proto as any).warp_).toBe(false)
  })

  it('procedures_call mutation without warp loads with warp=false', () => {
    expect(() =>
      loadXml(`
        <xml>
          <block type="procedures_call">
            <mutation
              proccode="test %s"
              argumentids='["arg1"]'>
            </mutation>
          </block>
        </xml>
      `),
    ).not.toThrow()

    const callBlock = workspace.getAllBlocks(false).find((b) => b.type === 'procedures_call')
    assert(callBlock, 'Expected procedures_call block')
    expect((callBlock as any).warp_).toBe(false)
  })

  it('procedures_prototype mutation without proccode still throws', () => {
    // proccode is the block's identity and cannot be defaulted.
    expect(() =>
      loadXml(`
        <xml>
          <block type="procedures_definition">
            <statement name="custom_block">
              <block type="procedures_prototype">
                <mutation warp="false"></mutation>
              </block>
            </statement>
          </block>
        </xml>
      `),
    ).toThrow(/proccode/)
  })

  // argumentdefaults in older projects can contain numbers alongside strings
  // (e.g. [1] or ["",1,1,1,1]). This regression case verifies those
  // mixed primitive values are preserved when loading legacy mutations.
  it('procedures_prototype mutation with numeric argumentdefaults preserves types', () => {
    expect(() =>
      loadXml(`
        <xml>
          <block type="procedures_definition">
            <statement name="custom_block">
              <block type="procedures_prototype">
                <mutation proccode="test %n" argumentids='["arg1"]' argumentnames='["x"]' argumentdefaults='[1]' warp="false"></mutation>
              </block>
            </statement>
          </block>
        </xml>
      `),
    ).not.toThrow()

    const proto = workspace.getAllBlocks(false).find((b) => b.type === 'procedures_prototype')
    assert(proto, 'Expected procedures_prototype block')
    expect((proto as any).argumentDefaults_).toEqual([1])
  })

  it('procedures_prototype mutation with mixed string/number argumentdefaults preserves types', () => {
    expect(() =>
      loadXml(`
        <xml>
          <block type="procedures_definition">
            <statement name="custom_block">
              <block type="procedures_prototype">
                <mutation proccode="test %s %n %n %n %n" argumentids='["a","b","c","d","e"]' argumentnames='["typ","x","y","sx","sy"]' argumentdefaults='["",1,1,1,1]' warp="true"></mutation>
              </block>
            </statement>
          </block>
        </xml>
      `),
    ).not.toThrow()

    const proto = workspace.getAllBlocks(false).find((b) => b.type === 'procedures_prototype')
    assert(proto, 'Expected procedures_prototype block')
    expect((proto as any).argumentDefaults_).toEqual(['', 1, 1, 1, 1])
  })

  it('procedures_call mutation with warp="null" loads as false', () => {
    // Project 10118230 has warp='null' on some call blocks.
    // JSON.parse("null") → null, which is not boolean. Should default to false.
    expect(() =>
      loadXml(`
        <xml>
          <block type="procedures_call">
            <mutation proccode="test %s" argumentids='["arg1"]' warp='null'></mutation>
          </block>
        </xml>
      `),
    ).not.toThrow()

    const callBlock = workspace.getAllBlocks(false).find((b) => b.type === 'procedures_call')
    assert(callBlock, 'Expected procedures_call block')
    expect((callBlock as any).warp_).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// PR #3492: context menu delegation
// ---------------------------------------------------------------------------

describe('context menu delegation', () => {
  it('right-clicking an arg reporter inside a prototype delegates to the definition', () => {
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
    `)

    const allBlocks = workspace.getAllBlocks(false)
    const defBlock = allBlocks.find((b) => b.type === 'procedures_definition')
    assert(defBlock, 'Expected procedures_definition block')
    const reporter = allBlocks.find((b) => b.type === 'argument_reporter_string_number')
    assert(reporter, 'Expected argument_reporter_string_number block')

    const defMenuSpy = vi.fn()
    defBlock.showContextMenu = defMenuSpy

    const mockEvent = new PointerEvent('pointerdown')
    reporter.showContextMenu(mockEvent)

    expect(defMenuSpy).toHaveBeenCalledWith(mockEvent)
  })

  it('right-clicking a prototype delegates to the definition', () => {
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
    `)

    const allBlocks = workspace.getAllBlocks(false)
    const defBlock = allBlocks.find((b) => b.type === 'procedures_definition')
    assert(defBlock, 'Expected procedures_definition block')
    const proto = allBlocks.find((b) => b.type === 'procedures_prototype')
    assert(proto, 'Expected procedures_prototype block')

    const defMenuSpy = vi.fn()
    defBlock.showContextMenu = defMenuSpy

    const mockEvent = new PointerEvent('pointerdown')
    proto.showContextMenu(mockEvent)

    expect(defMenuSpy).toHaveBeenCalledWith(mockEvent)
  })

  it('right-clicking a reporter that has been dragged out keeps its own context menu', () => {
    // Load a standalone reporter (not connected to a prototype).
    // argument_reporter_string_number is already registered via src/blocks/procedures.
    loadXml(`
      <xml>
        <block type="argument_reporter_string_number">
          <field name="VALUE">x</field>
        </block>
      </xml>
    `)

    const reporter = workspace.getAllBlocks(false).find((b) => b.type === 'argument_reporter_string_number')
    assert(reporter, 'Expected argument_reporter_string_number block')

    // The reporter has no prototype parent, so its own handler should run.
    expect(reporter.getParent()).toBeNull()

    // showContextMenu should not throw (calls original handler).
    const mockEvent = new PointerEvent('pointerdown')
    expect(() => reporter.showContextMenu(mockEvent)).not.toThrow()
  })
})
