/**
 * @license
 * Copyright 2026 Raspberry Pi Foundation
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'
import { ScratchCommentBubble } from '../scratch_comment_bubble'
import { ScratchCommentIcon } from '../scratch_comment_icon'

/**
 * Set of rules controlling keyboard navigation to and from a block.
 */
export class ScratchBlockNavigationPolicy extends Blockly.BlockNavigationPolicy {
  /**
   * Returns the first child element of the given block.
   *
   * @param current The block to retrieve the first child of.
   * @returns The first child element of the given block.
   */
  override getFirstChild(current: Blockly.BlockSvg): Blockly.IFocusableNode | null {
    return getBlockNavigationCandidates(current)[0]
  }

  /**
   * Returns the next peer node of the given block.
   *
   * @param current The block to find the following element of.
   * @returns The next item after the given block.
   */
  override getNextSibling(current: Blockly.BlockSvg): Blockly.IFocusableNode | null {
    if (current.outputConnection?.targetConnection) {
      const parent = this.getParent(current)
      if (parent instanceof Blockly.BlockSvg) {
        return navigateBlock(parent, current, 1)
      }
    }

    return super.getNextSibling(current)
  }

  /**
   * Returns the previous peer node of the given block.
   *
   * @param current The block to find the preceding element of.
   * @returns The previous item before the given block.
   */
  override getPreviousSibling(current: Blockly.BlockSvg): Blockly.IFocusableNode | null {
    const target = current.outputConnection?.targetBlock()
    if (target) {
      return navigateBlock(target, current, -1)
    }

    return super.getPreviousSibling(current)
  }
}

/**
 * Returns a list of the navigable children of the given block.
 *
 * @param block The block to retrieve the navigable children of.
 * @returns A list of navigable/focusable children of the given block.
 */
function getBlockNavigationCandidates(block: Blockly.BlockSvg): Blockly.IFocusableNode[] {
  const candidates: Blockly.IFocusableNode[] = []

  let commentBubble: ScratchCommentBubble | null = null

  // Icons and open bubbles are navigable.
  for (const icon of block.getIcons()) {
    // Icons hidden when the block is collapsed shouldn't be navigable.
    if (block.isCollapsed() && !icon.isShownWhenCollapsed()) {
      continue
    } else if (icon instanceof ScratchCommentIcon) {
      commentBubble = icon.getBubble()
      continue
    }
    candidates.push(icon)
    let bubble
    if (Blockly.hasBubble(icon) && icon.bubbleIsVisible() && (bubble = icon.getBubble())) {
      candidates.push(bubble)
    }
  }

  for (const input of block.inputList) {
    // Invisible inputs are not valid navigation candidates.
    if (!input.isVisible()) continue

    // Fields are navigable.
    candidates.push(...input.fieldRow)

    // Connections on inputs are navigable.
    const connection = input.connection
    if (!connection) continue
    candidates.push(connection as Blockly.RenderedConnection)

    // Child blocks attached to inputs are navigable.
    const attachedBlock = connection.targetBlock()
    if (!attachedBlock) continue
    candidates.push(attachedBlock as Blockly.BlockSvg)

    // The last (empty) next connection in a child statement block stack is
    // navigable.
    const lastConnection = attachedBlock.lastConnectionInStack(false)
    if (!lastConnection) continue
    candidates.push(lastConnection as Blockly.RenderedConnection)
  }

  // Comment bubbles and their collapse/delete buttons are navigable.
  if (commentBubble) {
    candidates.push(commentBubble)
    candidates.push(...commentBubble.getCommentBarButtons())
  }

  // The block's next connection is navigable.
  if (block.nextConnection && !block.isCollapsed()) {
    candidates.push(block.nextConnection)
  }

  return candidates
}

/**
 * Returns the next navigable item relative to the provided block child.
 *
 * @param block The block whose children should be navigated.
 * @param current The navigable block child item to navigate relative to.
 * @param delta The difference in index to navigate; positive values navigate
 *     forward by n, while negative values navigate backwards by n.
 * @returns The navigable block child offset by `delta` relative to `current`.
 */
export function navigateBlock(
  block: Blockly.BlockSvg,
  current: Blockly.IFocusableNode,
  delta: number,
): Blockly.IFocusableNode | null {
  const candidates = getBlockNavigationCandidates(block)
  const currentIndex = candidates.indexOf(current)
  if (currentIndex === -1) return null

  const targetIndex = currentIndex + delta
  if (targetIndex >= 0 && targetIndex < candidates.length) {
    return candidates[targetIndex]
  }

  return null
}
