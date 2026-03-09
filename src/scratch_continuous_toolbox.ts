/**
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { ContinuousToolbox } from '@blockly/continuous-toolbox'
import * as Blockly from 'blockly/core'
import { ScratchContinuousCategory } from './scratch_continuous_category'
import { STATUS_INDICATOR_LABEL_TYPE } from './status_indicator_label_flyout_inflater'

/**
 * A toolbox that displays items from all categories in one scrolling list.
 */
export class ScratchContinuousToolbox extends ContinuousToolbox {
  /**
   * List of functions to run after the next time the toolbox renders.
   */
  private postRenderCallbacks: (() => void)[] = []

  refreshSelection() {
    // Intentionally a no-op, Scratch manually manages refreshing the toolbox
    // via forceRerender().
  }

  /**
   * Converts the given toolbox item to a corresponding array of items that
   * should appear in the flyout.
   * @param toolboxItem The toolbox item to translate into flyout content.
   * @returns An array of flyout item definitions.
   */
  protected convertToolboxItemToFlyoutItems(
    toolboxItem: Blockly.IToolboxItem,
  ): Blockly.utils.toolbox.FlyoutItemInfoArray {
    const contents = super.convertToolboxItemToFlyoutItems(toolboxItem)
    if (toolboxItem instanceof ScratchContinuousCategory && toolboxItem.shouldShowStatusButton()) {
      contents.splice(0, 1, {
        kind: STATUS_INDICATOR_LABEL_TYPE,
        id: toolboxItem.getId(),
        text: toolboxItem.getName(),
      })
    }
    return contents
  }

  /**
   * Forcibly rerenders the toolbox, preserving selection when possible.
   */
  forceRerender() {
    const selectedCategoryName = this.selectedItem_?.getName()
    this.getFlyout().show(this.getInitialFlyoutContents())
    this.selectCategoryByName(selectedCategoryName)
    let callback
    while ((callback = this.postRenderCallbacks.shift())) {
      callback()
    }
  }

  /**
   * Runs the specified callback after the next rerender.
   * @param callback A callback to run whenever the toolbox next rerenders.
   */
  runAfterRerender(callback: () => void) {
    this.postRenderCallbacks.push(callback)
  }

  /**
   * Returns whether or not the given item should be deselected.
   * Prevents items from being deselected without a replacement.
   * @param oldItem The item that was previously selected.
   * @param newItem The item that is proposed to be selected instead.
   * @returns True if the old item should be allowed to be deselected.
   */
  shouldDeselectItem_(
    oldItem: Blockly.ISelectableToolboxItem | null,
    newItem: Blockly.ISelectableToolboxItem | null,
  ) {
    if (!newItem) return false
    return super.shouldDeselectItem_(oldItem, newItem)
  }
}
