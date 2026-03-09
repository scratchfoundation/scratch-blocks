/**
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'
import { StatusIndicatorLabel } from './status_indicator_label'

export const STATUS_INDICATOR_LABEL_TYPE = 'status_indicator_label'

/**
 * Flyout inflater responsible for creating status indicator labels.
 */
class StatusIndicatorLabelFlyoutInflater extends Blockly.LabelFlyoutInflater {
  /**
   * Creates a status indicator label on the flyout from the given state.
   * @param state JSON representation of a status indicator label.
   * @param flyout The flyout on which to create the label.
   * @returns The newly created status indicator label.
   */
  load(state: Blockly.utils.toolbox.LabelInfo, flyout: Blockly.IFlyout): Blockly.FlyoutItem {
    const label = new StatusIndicatorLabel(flyout.getWorkspace(), flyout.targetWorkspace!, state)
    label.show()
    return new Blockly.FlyoutItem(label, STATUS_INDICATOR_LABEL_TYPE)
  }
}

/**
 * Adds the status indicator label flyout inflater to the Blockly component registry.
 */
export function registerStatusIndicatorLabelFlyoutInflater() {
  Blockly.registry.register(
    Blockly.registry.Type.FLYOUT_INFLATER,
    STATUS_INDICATOR_LABEL_TYPE,
    StatusIndicatorLabelFlyoutInflater,
  )
}
