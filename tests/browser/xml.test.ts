/**
 * Copyright 2026 Scratch Foundation
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import '../../src/events/events_scratch_variable_create'
import { ScratchMsgs } from '../../src/scratch_msgs'
import '../../src/scratch_variable_map'
import { ScratchVariableModel } from '../../src/scratch_variable_model'
import { clearWorkspaceAndLoadFromXml } from '../../src/xml'

// Tests for clearWorkspaceAndLoadFromXml — scratch-specific XML loading that
// preserves isLocal and isCloud attributes from <variable> elements, which
// core Blockly is unaware of.

let container: HTMLElement
let workspace: Blockly.WorkspaceSvg

beforeAll(() => {
  ScratchMsgs.setLocale('en')
})

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
})

function parseXml(xmlText: string): Element {
  return Blockly.utils.xml.textToDom(xmlText)
}

describe('clearWorkspaceAndLoadFromXml — isLocal and isCloud preservation', () => {
  it('creates a local variable with isLocal=true', () => {
    clearWorkspaceAndLoadFromXml(
      parseXml(`
        <xml>
          <variables>
            <variable id="var1" type="" islocal="true" iscloud="false">myVar</variable>
          </variables>
        </xml>
      `),
      workspace,
    )

    const variable = workspace.getVariableMap().getVariableById('var1') as ScratchVariableModel
    expect(variable).not.toBeNull()
    expect(variable.isLocal).toBe(true)
    expect(variable.isCloud).toBe(false)
  })

  it('creates a cloud variable with isCloud=true', () => {
    clearWorkspaceAndLoadFromXml(
      parseXml(`
        <xml>
          <variables>
            <variable id="var2" type="" islocal="false" iscloud="true">☁ score</variable>
          </variables>
        </xml>
      `),
      workspace,
    )

    const variable = workspace.getVariableMap().getVariableById('var2') as ScratchVariableModel
    expect(variable).not.toBeNull()
    expect(variable.isLocal).toBe(false)
    expect(variable.isCloud).toBe(true)
  })

  it('creates a normal (non-local, non-cloud) variable when both flags are false', () => {
    clearWorkspaceAndLoadFromXml(
      parseXml(`
        <xml>
          <variables>
            <variable id="var3" type="" islocal="false" iscloud="false">score</variable>
          </variables>
        </xml>
      `),
      workspace,
    )

    const variable = workspace.getVariableMap().getVariableById('var3') as ScratchVariableModel
    expect(variable).not.toBeNull()
    expect(variable.isLocal).toBe(false)
    expect(variable.isCloud).toBe(false)
  })

  it('loads multiple variables with distinct flags', () => {
    clearWorkspaceAndLoadFromXml(
      parseXml(`
        <xml>
          <variables>
            <variable id="local1" type="" islocal="true" iscloud="false">localVar</variable>
            <variable id="cloud1" type="" islocal="false" iscloud="true">☁ cloudVar</variable>
            <variable id="global1" type="" islocal="false" iscloud="false">globalVar</variable>
          </variables>
        </xml>
      `),
      workspace,
    )

    const local = workspace.getVariableMap().getVariableById('local1') as ScratchVariableModel
    const cloud = workspace.getVariableMap().getVariableById('cloud1') as ScratchVariableModel
    const global_ = workspace.getVariableMap().getVariableById('global1') as ScratchVariableModel

    expect(local.isLocal).toBe(true)
    expect(cloud.isCloud).toBe(true)
    expect(global_.isLocal).toBe(false)
    expect(global_.isCloud).toBe(false)
  })

  it('wraps domToWorkspace errors with top-level element context', () => {
    // A top-level <shadow> will cause Blockly to throw.
    const xml = parseXml(`
      <xml>
        <shadow type="looks_costume" id="badShadow" x="0" y="0"></shadow>
      </xml>
    `)

    let caught: unknown
    try {
      clearWorkspaceAndLoadFromXml(xml, workspace)
    } catch (e) {
      caught = e
    }
    expect(caught).toBeDefined()
    expect((caught as Error).message).toMatch(/Failed to load workspace XML/)
    expect((caught as Error).message).toMatch(/badShadow/)
  })

  it('closes the event group and re-enables resizes after a load failure', () => {
    const xml = parseXml(`
      <xml>
        <shadow type="looks_costume" id="badShadow" x="0" y="0"></shadow>
      </xml>
    `)

    try {
      clearWorkspaceAndLoadFromXml(xml, workspace)
    } catch (_e) {
      // expected
    }

    // The event group opened by clearWorkspaceAndLoadFromXml should be closed.
    // Firing an event outside of a group verifies that setGroup(false) was called.
    // If the group were still open, this event would be part of it.
    const event = new (Blockly.Events.get(Blockly.Events.VAR_CREATE))(
      workspace.getVariableMap().createVariable('testVar', '', 'testId'),
    )
    expect(event.group).toBeFalsy()

    // Resizes should be re-enabled after a load failure.
    expect((workspace as unknown as { resizesEnabled: boolean }).resizesEnabled).toBe(true)
  })

  it('clears the existing workspace before loading', () => {
    // Pre-load a variable.
    workspace.getVariableMap().createVariable('old', '', 'oldId')
    expect(workspace.getVariableMap().getVariableById('oldId')).not.toBeNull()

    clearWorkspaceAndLoadFromXml(
      parseXml(`
        <xml>
          <variables>
            <variable id="newId" type="" islocal="false" iscloud="false">new</variable>
          </variables>
        </xml>
      `),
      workspace,
    )

    // Old variable is gone; new one is present.
    expect(workspace.getVariableMap().getVariableById('oldId')).toBeNull()
    expect(workspace.getVariableMap().getVariableById('newId')).not.toBeNull()
  })
})
