/**
 * Copyright 2026 Scratch Foundation
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'
import { afterAll, afterEach, assert, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { BlockDragEnd } from '../../src/events/events_block_drag_end'
import * as ScratchBlocks from '../../src/index'

// scratch-vm stores the matrix field's value verbatim from change events and
// block XML, and the micro:bit extension treats every character other than '0'
// as a lit LED. FieldMatrix holds a 2D array internally, so everything that
// leaves the field (events, XML, JSON) must use the flat 25-character string.

const HEART = '0101010101100010101000100'
const HEART_ROWS = [
  [0, 1, 0, 1, 0],
  [1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1],
  [0, 1, 0, 1, 0],
  [0, 0, 1, 0, 0],
]
const ONES = '1'.repeat(25)
const FLAT_MATRIX = /^[01]{25}$/

let container: HTMLElement
let workspace: Blockly.WorkspaceSvg
let events: Blockly.Events.Abstract[]

// ScratchBlocks.inject sets up Scratch's theme and registrations, which don't
// tolerate repeated injection, so share one workspace and clear it per test.
beforeAll(() => {
  ScratchBlocks.ScratchMsgs.setLocale('en')
  Blockly.defineBlocksWithJsonArray([
    {
      type: 'test_matrix_display',
      message0: 'display %1',
      args0: [{ type: 'input_value', name: 'MATRIX' }],
      previousStatement: null,
      nextStatement: null,
      colour: 120,
    },
  ])
  container = document.createElement('div')
  container.style.width = '800px'
  container.style.height = '600px'
  document.body.appendChild(container)
  workspace = ScratchBlocks.inject(container, { comments: true, collapse: false, sounds: false })
  workspace.addChangeListener((e) => events.push(e))
})

afterAll(() => {
  workspace.dispose()
  container.remove()
  delete Blockly.Blocks.test_matrix_display
})

beforeEach(() => {
  events = []
})

afterEach(() => {
  Blockly.DropDownDiv.hideWithoutAnimation()
  workspace.clear()
  workspace.clearUndo()
})

// Blockly delivers events, and re-renders, after the next animation frame.
const flushEvents = () => new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)))

function loadDisplayBlock(value: string): { parent: Blockly.BlockSvg; field: Blockly.Field } {
  Blockly.Xml.domToWorkspace(
    Blockly.utils.xml.textToDom(
      `<xml><block type="test_matrix_display" id="display" x="10" y="10">` +
        `<value name="MATRIX"><shadow type="matrix" id="matrix"><field name="MATRIX">${value}</field></shadow></value>` +
        `</block></xml>`,
    ),
    workspace,
  )
  const parent = workspace.getBlockById('display')
  const field = workspace.getBlockById('matrix')?.getField('MATRIX')
  assert(parent, 'Expected display block')
  assert(field, 'Expected MATRIX field')
  return { parent, field }
}

// Opens the editor without recording the setup in the event log or undo stack.
async function openEditor(field: Blockly.Field) {
  await flushEvents()
  workspace.clearUndo()
  events.length = 0
  field.showEditor()
}

function clickMatrixButton(which: 'clear' | 'fill') {
  const buttons = document.querySelectorAll<HTMLButtonElement>('.scratchMatrixButton')
  expect(buttons).toHaveLength(2)
  buttons[which === 'clear' ? 0 : 1].click()
}

function changeEvents() {
  return events
    .filter((e) => e instanceof Blockly.Events.BlockChange)
    .map((e) => ({ oldValue: e.oldValue, newValue: e.newValue, recordUndo: e.recordUndo }))
}

function intermediateChangeValues() {
  return events
    .filter((e) => e instanceof Blockly.Events.BlockFieldIntermediateChange)
    .flatMap((e) => [e.oldValue, e.newValue])
}

describe('FieldMatrix loading', () => {
  it('loads a flat string', () => {
    expect(loadDisplayBlock(HEART).field.getValue()).toEqual(HEART_ROWS)
  })

  it('loads a comma-separated string', () => {
    expect(loadDisplayBlock(HEART.split('').join(',')).field.getValue()).toEqual(HEART_ROWS)
  })

  it('pads a short string with unlit LEDs', () => {
    expect(loadDisplayBlock('11111').field.getValue()).toEqual([
      [1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ])
  })
})

describe('FieldMatrix serialization', () => {
  it('writes a flat string to XML', () => {
    const { parent } = loadDisplayBlock(HEART)
    const field = Blockly.Xml.blockToDom(parent).querySelector('field[name=MATRIX]')
    expect(field?.textContent).toBe(HEART)
  })

  it('writes a flat string to drag-end XML', () => {
    const { parent } = loadDisplayBlock(HEART)
    // Dragging a block onto another sprite or the backpack sends this XML to the VM.
    const field = new BlockDragEnd(parent, true).xml.querySelector('field[name=MATRIX]')
    expect(field?.textContent).toBe(HEART)
  })

  it('saves a flat string to JSON', () => {
    const { parent } = loadDisplayBlock(HEART)
    const state = Blockly.serialization.blocks.save(parent)
    expect(state?.inputs?.MATRIX.shadow?.fields?.MATRIX).toBe(HEART)
  })
})

describe('FieldMatrix change events', () => {
  it('fires flat-string change events from setValue', async () => {
    const { field } = loadDisplayBlock(HEART)
    await flushEvents()
    events.length = 0
    field.setValue(ONES)
    await flushEvents()
    expect(changeEvents()).toEqual([{ oldValue: HEART, newValue: ONES, recordUndo: true }])
  })

  it('fires no change event when setValue does not change the value', async () => {
    const { field } = loadDisplayBlock(HEART)
    await flushEvents()
    events.length = 0
    field.setValue(HEART)
    await flushEvents()
    expect(changeEvents()).toEqual([])
  })

  it('fill fires one flat-string change, recorded as one undo step', async () => {
    const { field } = loadDisplayBlock(HEART)
    await openEditor(field)
    clickMatrixButton('fill')
    Blockly.DropDownDiv.hideWithoutAnimation()
    await flushEvents()

    expect(changeEvents()).toEqual([{ oldValue: HEART, newValue: ONES, recordUndo: true }])
    for (const value of intermediateChangeValues()) {
      expect(value).toMatch(FLAT_MATRIX)
    }

    workspace.undo(false)
    await flushEvents()
    expect(field.getValue()).toEqual(HEART_ROWS)
  })

  it('clear updates the editor and fires one flat-string change', async () => {
    const { field } = loadDisplayBlock(HEART)
    await openEditor(field)
    clickMatrixButton('clear')
    await flushEvents()
    const pressed = document.querySelectorAll('.blocklyDropDownContent .pixelButton[aria-pressed="true"]')
    expect(pressed).toHaveLength(0)
    Blockly.DropDownDiv.hideWithoutAnimation()
    await flushEvents()

    expect(changeEvents()).toEqual([{ oldValue: HEART, newValue: '0'.repeat(25), recordUndo: true }])
  })

  it('undo and redo fire flat-string change events', async () => {
    const { field } = loadDisplayBlock(HEART)
    await openEditor(field)
    clickMatrixButton('fill')
    Blockly.DropDownDiv.hideWithoutAnimation()
    await flushEvents()

    events.length = 0
    workspace.undo(false)
    await flushEvents()
    workspace.undo(true)
    await flushEvents()

    expect(changeEvents()).toEqual([
      { oldValue: ONES, newValue: HEART, recordUndo: false },
      { oldValue: HEART, newValue: ONES, recordUndo: false },
    ])
  })
})
