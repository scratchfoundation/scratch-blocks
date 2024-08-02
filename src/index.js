/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from "blockly/core";
import { registerFieldAngle } from "@blockly/field-angle";
registerFieldAngle();
import "../blocks_common/colour.js";
import "../blocks_common/math.js";
import "../blocks_common/matrix.js";
import "../blocks_common/note.js";
import "../blocks_common/text.js";
import "../blocks_vertical/vertical_extensions.js";
import "../blocks_vertical/control.js";
import "../blocks_vertical/data.js";
import "../blocks_vertical/event.js";
import "../blocks_vertical/looks.js";
import "../blocks_vertical/motion.js";
import "../blocks_vertical/operators.js";
import "../blocks_vertical/procedures.js";
import "../blocks_vertical/sensing.js";
import "../blocks_vertical/sound.js";
import * as scratchBlocksUtils from "../core/scratch_blocks_utils.js";
import * as ScratchVariables from "./variables.js";
import "../core/css.js";
import "../core/field_vertical_separator.js";
import {
  ContinuousToolbox,
  ContinuousFlyout,
  ContinuousMetrics,
} from "@blockly/continuous-toolbox";
import { CheckableContinuousFlyout } from "./checkable_continuous_flyout.js";
import { buildGlowFilter, glowStack } from "./glows.js";
import { ScratchContinuousToolbox } from "./scratch_continuous_toolbox.js";
import "./scratch_continuous_category.js";
import "./scratch_comment_icon.js";
import "./scratch_variable_model.js";
import "./events_block_comment_change.js";
import "./events_block_comment_collapse.js";
import "./events_block_comment_create.js";
import "./events_block_comment_delete.js";
import "./events_block_comment_move.js";
import "./events_block_comment_resize.js";
import "./events_scratch_variable_create.js";
import "./field_variable.js";
import "./field_variable_getter.js";
import { buildShadowFilter } from "./shadows.js";

export * from "blockly";
export * from "./block_reporting.js";
export * from "./categories.js";
export * from "./procedures.js";
export * from "../core/colours.js";
export * from "../core/field_colour_slider.js";
export * from "../core/field_matrix.js";
export * from "../core/field_note.js";
export * from "../core/field_number.js";
export * from "../msg/scratch_msgs.js";
export * from "./constants.js";
export { glowStack };
export { scratchBlocksUtils };
export { CheckableContinuousFlyout };
export { ScratchVariables };

export function inject(container, options) {
  Object.assign(options, {
    plugins: {
      toolbox: ScratchContinuousToolbox,
      flyoutsVerticalToolbox: CheckableContinuousFlyout,
      metricsManager: ContinuousMetrics,
    },
  });
  const workspace = Blockly.inject(container, options);
  workspace.getRenderer().getConstants().selectedGlowFilterId = "";

  const flyout = workspace.getFlyout();
  if (flyout) {
    flyout.getWorkspace().getRenderer().getConstants().selectedGlowFilterId =
      "";
  }

  buildGlowFilter(workspace);
  buildShadowFilter(workspace);

  Blockly.config.dragRadius = 3;
  Blockly.config.snapRadius = 48;
  Blockly.config.connectingSnapRadius = 68;
  Blockly.config.currentConnectionPreference = 20;
  Blockly.config.bumpDelay = 0;

  return workspace;
}

Blockly.Scrollbar.scrollbarThickness = Blockly.Touch.TOUCH_ENABLED ? 14 : 11;
Blockly.FlyoutButton.TEXT_MARGIN_X = 40;
Blockly.FlyoutButton.TEXT_MARGIN_Y = 10;
Blockly.ContextMenuRegistry.registry.unregister("blockDisable");
Blockly.ContextMenuRegistry.registry.unregister("blockInline");
Blockly.ContextMenuItems.registerCommentOptions();
