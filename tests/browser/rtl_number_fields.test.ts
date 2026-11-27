/**
 * Copyright 2026 Scratch Foundation
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import * as ScratchBlocks from '../../src/index'

// Numbers read left to right in every language, so a right-to-left workspace still edits them left to right and
// keeps the minus sign of a negative number on the left.

let container: HTMLElement
let workspace: Blockly.WorkspaceSvg

const cases = [
  { blockType: 'motion_movesteps', inputName: 'STEPS', shadowType: 'math_number' },
  { blockType: 'motion_pointindirection', inputName: 'DIRECTION', shadowType: 'math_angle' },
]

beforeAll(() => {
  ScratchBlocks.ScratchMsgs.setLocale('en')
  container = document.createElement('div')
  container.style.width = '800px'
  container.style.height = '600px'
  document.body.appendChild(container)
  workspace = ScratchBlocks.inject(container, { rtl: true, sounds: false })
})

afterEach(() => {
  Blockly.WidgetDiv.hide()
  Blockly.DropDownDiv.hideWithoutAnimation()
  workspace.clear()
})

afterAll(() => {
  workspace.dispose()
  container.remove()
})

describe('number fields in a right-to-left workspace', () => {
  for (const { blockType, inputName, shadowType } of cases) {
    it(`edits ${shadowType} left to right`, () => {
      const block = Blockly.serialization.blocks.append(
        { type: blockType, inputs: { [inputName]: { shadow: { type: shadowType, fields: { NUM: -90 } } } } },
        workspace,
      )
      const field = block.getInputTargetBlock(inputName)?.getField('NUM')
      if (!field) throw new Error(`Missing NUM field on ${shadowType}`)

      field.showEditor(new PointerEvent('pointerdown'))

      const input = document.querySelector<HTMLInputElement>('.blocklyHtmlInput')
      if (!input) throw new Error('Missing field editor input')
      expect(input.value).toBe('-90')
      expect(getComputedStyle(input).direction).toBe('ltr')
    })
  }
})
