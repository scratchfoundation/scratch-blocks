/**
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { registerContinuousToolbox, ContinuousMetrics } from '@blockly/continuous-toolbox'
import * as Blockly from 'blockly/core'
import './blocks/colour'
import './blocks/control'
import './blocks/data'
import './blocks/event'
import './blocks/looks'
import './blocks/math'
import './blocks/matrix'
import './blocks/motion'
import './blocks/note'
import './blocks/operators'
import './blocks/procedures'
import './blocks/sensing'
import './blocks/sound'
import './blocks/text'
import './blocks/vertical_extensions'
import { CheckableContinuousFlyout } from './checkable_continuous_flyout'
import { ScratchBlocksTheme } from './constants'
import * as contextMenuItems from './context_menu_items'
import './css'
import './events/events_block_comment_change'
import './events/events_block_comment_collapse'
import './events/events_block_comment_create'
import './events/events_block_comment_delete'
import './events/events_block_comment_move'
import './events/events_block_comment_resize'
import './events/events_scratch_variable_create'
import { registerFieldColourSlider, FieldColourSlider } from './fields/field_colour_slider'
import { registerFieldMatrix } from './fields/field_matrix'
import { registerFieldNote, FieldNote } from './fields/field_note'
import { registerFieldTextInputRemovable } from './fields/field_textinput_removable'
import { registerFieldVariableGetter } from './fields/field_variable_getter'
import { registerFieldVerticalSeparator } from './fields/field_vertical_separator'
import { registerScratchFieldAngle } from './fields/scratch_field_angle'
import { registerScratchFieldDropdown } from './fields/scratch_field_dropdown'
import { registerScratchFieldNumber } from './fields/scratch_field_number'
import { registerScratchFieldVariable } from './fields/scratch_field_variable'
import './flyout_checkbox_icon'
import { buildGlowFilter, glowStack } from './glows'
import { registerRecyclableBlockFlyoutInflater } from './recyclable_block_flyout_inflater'
import './renderer/cat/renderer'
import './renderer/renderer'
import { registerScratchBlockPaster } from './scratch_block_paster'
import * as scratchBlocksUtils from './scratch_blocks_utils'
import './scratch_comment_icon'
import './scratch_connection_checker'
import { registerScratchContinuousCategory } from './scratch_continuous_category'
import { ScratchContinuousToolbox } from './scratch_continuous_toolbox'
import './scratch_dragger'
import './scratch_insertion_marker_previewer'
import './scratch_variable_map'
import './scratch_variable_model'
import { ScratchZoomControls } from './scratch_zoom_controls'
import { buildShadowFilter } from './shadows'
import { registerStatusIndicatorLabelFlyoutInflater } from './status_indicator_label_flyout_inflater'
import * as ScratchVariables from './variables'

export * from 'blockly/core'
export * from './block_reporting'
export * from './procedures'
export * from '../msg/scratch_msgs.js'
export * from './constants'
export { glowStack }
export { scratchBlocksUtils }
export { CheckableContinuousFlyout }
export { ScratchVariables }
export { contextMenuItems }
export { FieldColourSlider, FieldNote }
export { CheckboxBubble } from './checkbox_bubble'
export { ScratchZoomControls } from './scratch_zoom_controls'
export { StatusIndicatorLabel, StatusButtonState } from './status_indicator_label'
export * from './xml'

interface ScratchBlocksOptions extends Blockly.BlocklyOptions {
  /**
   * Scratch uses "theme" to talk about the shape of blocks. The Blockly concept of a theme affects CSS properties and
   * aligns more closely with "color mode" in Scratch.
   */
  scratchTheme?: ScratchBlocksTheme
}

function sanitizeTheme(theme?: ScratchBlocksTheme) {
  if (theme === ScratchBlocksTheme.CAT_BLOCKS) {
    return theme
  }
  return ScratchBlocksTheme.CLASSIC
}

export function inject(container: Element, options: ScratchBlocksOptions) {
  registerScratchFieldAngle()
  registerFieldColourSlider()
  registerScratchFieldDropdown()
  registerFieldMatrix()
  registerFieldNote()
  registerScratchFieldNumber()
  registerFieldTextInputRemovable()
  registerFieldVariableGetter()
  registerScratchFieldVariable()
  registerFieldVerticalSeparator()
  registerRecyclableBlockFlyoutInflater()
  registerScratchBlockPaster()
  registerStatusIndicatorLabelFlyoutInflater()
  registerScratchContinuousCategory()

  const scratchTheme = sanitizeTheme(options.scratchTheme)

  Object.assign(options, {
    renderer: `scratch_${scratchTheme}`,
    plugins: {
      toolbox: ScratchContinuousToolbox,
      flyoutsVerticalToolbox: CheckableContinuousFlyout,
      metricsManager: ContinuousMetrics,
    },
  })
  const workspace = Blockly.inject(container, options)

  buildGlowFilter(workspace)
  buildShadowFilter(workspace)

  // Replace Blockly's sprite-sheet zoom controls with SVG-file-based ones so
  // each button is a separate file and the correct set is picked up via
  // pathToMedia (which varies by Scratch color mode).
  const originalZoomControls = workspace.zoomControls_
  if (originalZoomControls) {
    originalZoomControls.dispose()

    const scratchZoomControls = new ScratchZoomControls(workspace)
    const zoomControlsSvg = scratchZoomControls.createDom()
    workspace.svgGroup_.appendChild(zoomControlsSvg)
    scratchZoomControls.init()
  }

  Blockly.config.dragRadius = 3
  Blockly.config.snapRadius = 48
  Blockly.config.connectingSnapRadius = 68
  Blockly.config.currentConnectionPreference = 20
  Blockly.config.bumpDelay = 0

  return workspace
}

registerContinuousToolbox()
Blockly.Scrollbar.scrollbarThickness = Blockly.Touch.TOUCH_ENABLED ? 14 : 11
Blockly.FlyoutButton.TEXT_MARGIN_X = 40
Blockly.FlyoutButton.TEXT_MARGIN_Y = 10
Blockly.ContextMenuRegistry.registry.unregister('blockDisable')
Blockly.ContextMenuRegistry.registry.unregister('blockInline')
Blockly.ContextMenuItems.registerCommentOptions()
Blockly.ContextMenuRegistry.registry.unregister('blockDelete')
contextMenuItems.registerDeleteBlock()
contextMenuItems.registerDuplicateBlock()
Blockly.ContextMenuRegistry.registry.unregister('workspaceDelete')
contextMenuItems.registerDeleteAll()
Blockly.comments.CommentView.defaultCommentSize = new Blockly.utils.Size(200, 200)
