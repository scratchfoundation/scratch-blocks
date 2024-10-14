/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from "blockly/core";
import { StatusIndicatorLabel } from "./status_indicator_label.js";

/**
 * Flyout inflater responsible for creating status indicator labels.
 */
class StatusIndicatorLabelFlyoutInflater extends Blockly.LabelFlyoutInflater {
  /**
   * Creates a status indicator label on the flyout from the given state.
   * @param {!Object} state JSON representation of a status indicator label.
   * @param {!Blockly.WorkspaceSvg} flyoutWorkspace The workspace to create the
   *     label on.
   * @returns {!StatusIndicatorLabel} The newly created status indicator label.
   */
  load(state, flyoutWorkspace) {
    const label = new StatusIndicatorLabel(
      flyoutWorkspace,
      flyoutWorkspace.targetWorkspace,
      state,
      true
    );
    label.show();
    return label;
  }
}

/**
 * Register the status indicator label flyout inflater.
 */
export function registerStatusIndicatorLabelFlyoutInflater() {
  Blockly.registry.register(
    Blockly.registry.Type.FLYOUT_INFLATER,
    "status_indicator_label",
    StatusIndicatorLabelFlyoutInflater
  );
}
