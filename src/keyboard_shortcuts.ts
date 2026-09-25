/**
 * Copyright 2026 Raspberry Pi Foundation
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'

/**
 * Overrides the disconnect keyboard shortcut to disallow procedure-related
 * blocks.
 */
export function registerDisconnectBlock() {
  const original = Blockly.ShortcutRegistry.registry.getRegistry()[Blockly.ShortcutItems.names.DISCONNECT]

  Blockly.ShortcutRegistry.registry.register(
    {
      ...original,
      allowCollision: true,
      preconditionFn(workspace, scope) {
        return (
          !!original.preconditionFn?.(workspace, scope) &&
          scope.focusedNode instanceof Blockly.BlockSvg &&
          !['procedures_prototype', 'argument_reporter_boolean', 'argument_reporter_string_number'].includes(
            scope.focusedNode.type,
          )
        )
      },
    },
    true,
  )
}

/**
 * Overrides the duplicate keyboard shortcut to disallow shadow blocks.
 */
export function registerDuplicate() {
  const original = Blockly.ShortcutRegistry.registry.getRegistry()[Blockly.ShortcutItems.names.DUPLICATE]

  Blockly.ShortcutRegistry.registry.register(
    {
      ...original,
      allowCollision: true,
      preconditionFn(workspace, scope) {
        const allowed = !!original.preconditionFn?.(workspace, scope)
        if (!(scope.focusedNode instanceof Blockly.BlockSvg)) {
          return allowed
        }

        return allowed && !scope.focusedNode.isShadow()
      },
    },
    true,
  )
}

/**
 * Overrides the copy keyboard shortcut so that it includes subsequent blocks
 * in the stack (via the next connection) when copying a block.
 */
export function registerCopy() {
  const original = Blockly.ShortcutRegistry.registry.getRegistry()[Blockly.ShortcutItems.names.COPY]
  Blockly.ShortcutRegistry.registry.register(
    {
      ...original,
      allowCollision: true, // we're intentionally overriding the default handler
      preconditionFn(workspace, scope) {
        const allowed = !!original.preconditionFn?.(workspace, scope)
        if (!(scope.focusedNode instanceof Blockly.BlockSvg)) {
          return allowed
        }

        return allowed && !scope.focusedNode.isShadow()
      },
      callback(workspace, e, shortcut, scope) {
        const focused = scope.focusedNode
        if (focused instanceof Blockly.BlockSvg && !focused.isInFlyout) {
          e.preventDefault()
          const copyData = focused.toCopyData(true)
          if (copyData) {
            Blockly.clipboard.setLastCopiedData(copyData)
            Blockly.clipboard.setLastCopiedWorkspace(focused.workspace)
            Blockly.clipboard.setLastCopiedLocation(focused.getRelativeToSurfaceXY())
            return true
          }
        }
        return original.callback?.(workspace, e, shortcut, scope) ?? false
      },
    },
    true, // allowOverrides: we're intentionally overriding the default handler
  )
}

/**
 * Overrides the cut keyboard shortcut so that it includes subsequent blocks
 * in the stack (via the next connection) when cutting a block.
 */
export function registerCut() {
  const original = Blockly.ShortcutRegistry.registry.getRegistry()[Blockly.ShortcutItems.names.CUT]
  Blockly.ShortcutRegistry.registry.register(
    {
      ...original,
      allowCollision: true, // we're intentionally overriding the default handler
      callback(workspace, e, shortcut, scope) {
        const focused = scope.focusedNode
        if (focused instanceof Blockly.BlockSvg && !focused.isInFlyout) {
          e.preventDefault()
          const copyData = focused.toCopyData(true)
          if (copyData && focused.isDeletable()) {
            Blockly.clipboard.setLastCopiedData(copyData)
            Blockly.clipboard.setLastCopiedWorkspace(focused.workspace)
            Blockly.clipboard.setLastCopiedLocation(focused.getRelativeToSurfaceXY())
            focused.checkAndDelete()
            return true
          }
        }
        return original.callback?.(workspace, e, shortcut, scope) ?? false
      },
    },
    true, // allowOverrides: we're intentionally overriding the default handler
  )
}
