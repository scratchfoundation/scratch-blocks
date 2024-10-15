/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from "blockly/core";
import "./blocks/colour.js";
import "./blocks/math.js";
import "./blocks/matrix.js";
import "./blocks/note.js";
import "./blocks/text.js";
import "./blocks/vertical_extensions.js";
import "./blocks/control.js";
import "./blocks/data.js";
import "./blocks/event.js";
import "./blocks/looks.js";
import "./blocks/motion.js";
import "./blocks/operators.js";
import "./blocks/procedures.js";
import "./blocks/sensing.js";
import "./blocks/sound.js";
import * as scratchBlocksUtils from "./scratch_blocks_utils.js";
import * as ScratchVariables from "./variables.js";
import "./css.js";
import "./renderer/renderer.js";
import * as contextMenuItems from "./context_menu_items.js";
import {
  ContinuousToolbox,
  ContinuousFlyout,
  ContinuousMetrics,
} from "@blockly/continuous-toolbox";
import { CheckableContinuousFlyout } from "./checkable_continuous_flyout.js";
import { buildGlowFilter, glowStack } from "./glows.js";
import { ScratchContinuousToolbox } from "./scratch_continuous_toolbox.js";
import "./scratch_comment_icon.js";
import "./scratch_dragger.js";
import "./scratch_variable_map.js";
import "./scratch_variable_model.js";
import "./scratch_connection_checker.js";
import "./flyout_checkbox_icon.js";
import "./events/events_block_comment_change.js";
import "./events/events_block_comment_collapse.js";
import "./events/events_block_comment_create.js";
import "./events/events_block_comment_delete.js";
import "./events/events_block_comment_move.js";
import "./events/events_block_comment_resize.js";
import "./events/events_scratch_variable_create.js";
import { buildShadowFilter } from "./shadows.js";
import { registerFieldAngle } from "./fields/field_angle.js";
import {
  registerFieldColourSlider,
  FieldColourSlider,
} from "./fields/field_colour_slider.js";
import { registerFieldDropdown } from "./fields/field_dropdown.js";
import { registerFieldMatrix } from "./fields/field_matrix.js";
import { registerFieldNote, FieldNote } from "./fields/field_note.js";
import { registerFieldNumber } from "./fields/field_number.js";
import { registerFieldTextInputRemovable } from "./fields/field_textinput_removable.js";
import { registerFieldVariableGetter } from "./fields/field_variable_getter.js";
import { registerFieldVariable } from "./fields/field_variable.js";
import { registerFieldVerticalSeparator } from "./fields/field_vertical_separator.js";
import { registerRecyclableBlockFlyoutInflater } from "./recyclable_block_flyout_inflater.js";
import { registerStatusIndicatorLabelFlyoutInflater } from "./status_indicator_label_flyout_inflater.js";
import { registerScratchContinuousCategory } from "./scratch_continuous_category.js";

export * from "blockly/core";
export * from "./block_reporting.js";
export * from "./categories.js";
export * from "./procedures.js";
export * from "../msg/scratch_msgs.js";
export * from "./constants.js";
export { glowStack };
export { scratchBlocksUtils };
export { CheckableContinuousFlyout };
export { ScratchVariables };
export { contextMenuItems };
export { FieldColourSlider, FieldNote };
export { CheckboxBubble } from "./checkbox_bubble.js";
export {
  StatusIndicatorLabel,
  StatusButtonState,
} from "./status_indicator_label.js";

export function inject(container, options) {
  registerFieldAngle();
  registerFieldColourSlider();
  registerFieldDropdown();
  registerFieldMatrix();
  registerFieldNote();
  registerFieldNumber();
  registerFieldTextInputRemovable();
  registerFieldVariableGetter();
  registerFieldVariable();
  registerFieldVerticalSeparator();
  registerRecyclableBlockFlyoutInflater();
  registerStatusIndicatorLabelFlyoutInflater();
  registerScratchContinuousCategory();

  Object.assign(options, {
    renderer: "scratch",
    plugins: {
      toolbox: ScratchContinuousToolbox,
      flyoutsVerticalToolbox: CheckableContinuousFlyout,
      metricsManager: ContinuousMetrics,
    },
  });
  const workspace = Blockly.inject(container, options);

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
Blockly.ContextMenuRegistry.registry.unregister("blockDelete");
contextMenuItems.registerDeleteBlock();
Blockly.ContextMenuRegistry.registry.unregister("workspaceDelete");
contextMenuItems.registerDeleteAll();
Blockly.comments.CommentView.defaultCommentSize = new Blockly.utils.Size(
  200,
  200
);
