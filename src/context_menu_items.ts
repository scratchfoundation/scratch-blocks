/**
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'

type ActionRegistryItem = Extract<Blockly.ContextMenuRegistry.RegistryItem, { callback: unknown }>

function isActionRegistryItem(item: Blockly.ContextMenuRegistry.RegistryItem): item is ActionRegistryItem {
  return 'callback' in item && 'displayText' in item && 'preconditionFn' in item
}

/**
 * Registers a block delete option that ignores shadows in the block count.
 */
export function registerDeleteBlock() {
  const deleteOption = {
    displayText(scope: Blockly.ContextMenuRegistry.Scope) {
      if (!scope.block) {
        return Blockly.Msg.DELETE_BLOCK
      }
      const descendantCount = getDeletableBlocksInStack(scope.block).length
      return descendantCount === 1
        ? Blockly.Msg.DELETE_BLOCK
        : Blockly.Msg.DELETE_X_BLOCKS.replace('%1', `${descendantCount}`)
    },
    preconditionFn(scope: Blockly.ContextMenuRegistry.Scope) {
      if (scope.block && !scope.block.isInFlyout && scope.block.isDeletable()) {
        return 'enabled'
      }
      return 'hidden'
    },
    callback(scope: Blockly.ContextMenuRegistry.Scope) {
      if (!scope.block) {
        return
      }
      deleteBlock(scope.block)
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'blockDelete',
    weight: 6,
  }
  Blockly.ContextMenuRegistry.registry.register(deleteOption)
}

export function deleteBlock(block: Blockly.Block) {
  if (block.workspace.isFlyout) return

  const priorGroup = Blockly.Events.getGroup()
  Blockly.Events.setGroup(true)
  try {
    if (!block.outputConnection && !block.previousConnection?.isConnected() && block.nextConnection?.isConnected()) {
      block.nextConnection.disconnect()
    }
    if (block.workspace instanceof Blockly.WorkspaceSvg) {
      block.workspace.hideChaff()
    }
    if (block instanceof Blockly.BlockSvg) {
      block.dispose(!block.outputConnection, true)
    } else {
      block.dispose(!block.outputConnection)
    }
  } finally {
    Blockly.Events.setGroup(priorGroup)
  }
}

function getDeletableBlocksInStack(block: Blockly.Block): Blockly.Block[] {
  let descendants = block.getDescendants(false).filter(isDeletable)
  const nextBlock = block.getNextBlock()
  if (nextBlock) {
    // Next blocks are not deleted.
    const nextDescendants = nextBlock.getDescendants(false).filter(isDeletable)
    descendants = descendants.filter((b) => !nextDescendants.includes(b))
  }
  return descendants
}

function isDeletable(block: Blockly.Block): boolean {
  return block.isDeletable() && !block.isShadow()
}

/**
 * Option to delete all blocks.
 */
export function registerDeleteAll() {
  const deleteOption = {
    displayText(scope: Blockly.ContextMenuRegistry.Scope) {
      if (!scope.workspace) {
        return ''
      }
      const deletableBlocksLength = getDeletableBlocksInWorkspace(scope.workspace).length
      if (deletableBlocksLength === 1) {
        return Blockly.Msg.DELETE_BLOCK
      }
      return Blockly.Msg.DELETE_X_BLOCKS.replace('%1', `${deletableBlocksLength}`)
    },
    preconditionFn(scope: Blockly.ContextMenuRegistry.Scope) {
      if (!scope.workspace) {
        return 'disabled'
      }
      const deletableBlocksLength = getDeletableBlocksInWorkspace(scope.workspace).length
      return deletableBlocksLength > 0 ? 'enabled' : 'disabled'
    },
    callback(scope: Blockly.ContextMenuRegistry.Scope) {
      if (!scope.workspace) {
        return
      }
      scope.workspace.cancelCurrentGesture()
      const deletableBlocks = getDeletableBlocksInWorkspace(scope.workspace)
      if (deletableBlocks.length < 2) {
        deleteNext(deletableBlocks)
      } else {
        Blockly.dialog.confirm(
          Blockly.Msg.DELETE_ALL_BLOCKS.replace('%1', String(deletableBlocks.length)),
          (ok: boolean) => {
            if (ok) {
              deleteNext(deletableBlocks)
            }
          },
        )
      }
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
    id: 'workspaceDelete',
    weight: 6,
  }
  Blockly.ContextMenuRegistry.registry.register(deleteOption)
}

/*
 * Constructs a list of blocks that can be deleted in the given workspace.
 *
 * @param workspace to delete all blocks from.
 * @returns list of blocks to delete.
 */
function getDeletableBlocksInWorkspace(workspace: Blockly.Workspace): Blockly.Block[] {
  return workspace.getTopBlocks(true).flatMap((b) => b.getDescendants(false).filter(isDeletable))
}

/**
 * Deletes the given blocks. Used to delete all blocks in the workspace.
 * @param deleteList List of blocks to delete.
 * @param eventGroup Event group ID with which all delete events should be
 *     associated.  If not specified, create a new group.
 */
function deleteNext(deleteList: Blockly.Block[], eventGroup?: string) {
  const DELAY = 10
  if (eventGroup) {
    Blockly.Events.setGroup(eventGroup)
  } else {
    Blockly.Events.setGroup(true)
    eventGroup = Blockly.Events.getGroup()
  }
  const block = deleteList.shift()
  if (block) {
    if (!block.isDeadOrDying()) {
      if (block instanceof Blockly.BlockSvg) {
        block.dispose(false, true)
      } else {
        block.dispose(false)
      }
      setTimeout(() => deleteNext(deleteList, eventGroup), DELAY)
    } else {
      deleteNext(deleteList, eventGroup)
    }
  }
  Blockly.Events.setGroup(false)
}

/**
 * Registers a block duplicate option that duplicates the selected block and
 * all subsequent blocks in the stack.
 */
export function registerDuplicateBlock() {
  const original = Blockly.ContextMenuRegistry.registry.getItem('blockDuplicate')
  if (!original) {
    console.error('[context_menu_items] Missing required blockDuplicate menu item')
    return
  }
  if (!isActionRegistryItem(original)) {
    console.error('[context_menu_items] Expected blockDuplicate to be an action item')
    return
  }
  const duplicateOption: ActionRegistryItem = {
    displayText: original.displayText,
    preconditionFn: original.preconditionFn,
    callback(scope: Blockly.ContextMenuRegistry.Scope) {
      if (!scope.block) return
      const data = scope.block.toCopyData(true)
      if (!data) return
      Blockly.clipboard.paste(data, scope.block.workspace)
    },
    scopeType: original.scopeType,
    id: original.id,
    weight: original.weight,
  }
  Blockly.ContextMenuRegistry.registry.unregister(duplicateOption.id)
  Blockly.ContextMenuRegistry.registry.register(duplicateOption)
}

/**
 * Overrides the copy keyboard shortcut so that it includes subsequent blocks
 * in the stack (via the next connection) when copying a block.
 */
export function registerCopyShortcut() {
  const original = Blockly.ShortcutRegistry.registry.getRegistry()[Blockly.ShortcutItems.names.COPY]
  Blockly.ShortcutRegistry.registry.register(
    {
      ...original,
      allowCollision: true, // we're intentionally overriding the default handler
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
export function registerCutShortcut() {
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
