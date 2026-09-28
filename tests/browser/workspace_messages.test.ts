/**
 * Copyright 2026 Scratch Foundation
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import * as ScratchBlocks from '../../src/index'

// Blockly core UI that scratch-blocks shows reads some messages that only scratch-blocks can provide. A missing
// message makes Blockly throw while building a context menu, so these tests render the real menus.

let container: HTMLElement
let workspace: Blockly.WorkspaceSvg

function menuItemTexts(): (string | null)[] {
  return [...document.querySelectorAll('.blocklyContextMenu .blocklyMenuItem')].map((item) => item.textContent)
}

beforeAll(() => {
  ScratchBlocks.ScratchMsgs.setLocale('en')
  container = document.createElement('div')
  container.style.width = '800px'
  container.style.height = '600px'
  document.body.appendChild(container)
  // The same options scratch-gui uses for its main workspace.
  workspace = ScratchBlocks.inject(container, { comments: true, collapse: false, sounds: false })
})

afterEach(() => {
  Blockly.ContextMenu.hide()
  workspace.clear()
  ScratchBlocks.ScratchMsgs.setLocale('en')
})

afterAll(() => {
  workspace.dispose()
  container.remove()
})

describe('workspace UI messages', () => {
  it('labels the workspace for assistive technology', () => {
    expect(workspace.getSvgGroup().getAttribute('aria-label')).toBe('Code Area')
  })

  it('shows a context menu for a workspace comment', () => {
    const comment = new Blockly.comments.RenderedWorkspaceComment(workspace)
    comment.showContextMenu(new PointerEvent('pointerdown'))
    expect(menuItemTexts()).toEqual(['Duplicate', 'Remove Comment'])
  })

  it('translates the block context menu', () => {
    ScratchBlocks.ScratchMsgs.setLocale('de')
    const block = workspace.newBlock('motion_movesteps')
    block.initSvg()
    block.render()
    block.showContextMenu(new PointerEvent('pointerdown'))
    expect(menuItemTexts()).toContain(ScratchBlocks.ScratchMsgs.locales.de.DUPLICATE)
  })
})
