/**
 * Visual Blocks Editor
 *
 * Copyright 2013 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as Blockly from 'blockly/core'
import { Colours } from './colours'

const styles = `
  .blocklySvg {
    background-color: var(--colour-workspace);
  }

  .injectionDiv {
    --blockly-active-node-color: #fc3;
  }

  .scratch-renderer.high-contrast-theme.injectionDiv {
    --blockly-active-node-color: #000;
  }

  .injectionDiv.boundless {
    overflow: visible;
  }

  .blocklyBlockCanvas.blocklyCanvasTransitioning,
  .blocklyBubbleCanvas.blocklyCanvasTransitioning {
    transition: none;
  }

  .blocklyWidgetDiv.fieldTextInput {
    overflow: hidden;
    border: 1px solid;
    box-sizing: border-box;
    transform-origin: 0 0;
    -ms-transform-origin: 0 0;
    -moz-transform-origin: 0 0;
    -webkit-transform-origin: 0 0;
  }

  .blocklyWidgetDiv.fieldTextInput.removableTextInput {
    overflow: visible;
  }

  .blocklyTextRemoveIcon {
    position: absolute;
    width: 24px;
    height: 24px;
    top: -40px;
    left: 50%;
    margin-left: -12px;
    cursor: pointer;
  }

  .blocklyTooltipDiv {
    font-family: "Helvetica Neue", Helvetica, sans-serif;
  }

  .blocklyDropDownDiv {
    border-radius: 4px;
    box-shadow: 0px 0px 8px 1px var(--colour-dropDownShadow);
    -webkit-user-select: none;
    min-height: 15px
  }

  .blocklyDropDownContent {
    overflow: auto;
  }

  .blocklyNumPadButton {
    display: inline-block;
    float: left;
    padding: 0;
    width: 48px;
    height: 48px;
    margin: 4px;
    border-radius: 4px;
    background: var(--colour-numPadBackground);
    color: var(--colour-numPadText);
    outline: none;
    border: 1px solid var(--colour-numPadBorder);
    cursor: pointer;
    font-weight: 600;
    font-family: "Helvetica Neue", Helvetica, sans-serif;
    font-size: 12pt;
    -webkit-tap-highlight-color: rgba(0,0,0,0);
  }

  .blocklyNumPadButton > img {
    margin-top: 10%;
    width: 80%;
    height: 80%;
  }

  .blocklyNumPadButton:active {
    background: var(--colour-numPadActiveBackground);
    -webkit-tap-highlight-color: rgba(0,0,0,0);
  }

  .valueReportBox {
    min-width: 50px;
    max-width: 300px;
    max-height: 200px;
    overflow: auto;
    word-wrap: break-word;
    text-align: center;
    font-family: "Helvetica Neue", Helvetica, sans-serif;
    font-size: .8em;
    color: var(--colour-textFieldText);
  }


  .blocklyResizeLine {
    stroke: #888;
    stroke-width: 1;
  }

  .blocklyPath {
    stroke-width: 1px;
  }

  .blocklyDraggable {
    /* backup for browsers (e.g. IE11) that don't support grab */
    cursor: url("<<<PATH>>>/handopen.cur"), auto;
    cursor: grab;
    cursor: -webkit-grab;
    cursor: -moz-grab;
  }

   .blocklyDragging {
    /* backup for browsers (e.g. IE11) that don't support grabbing */
    cursor: url("<<<PATH>>>/handclosed.cur"), auto;
    cursor: grabbing;
    cursor: -webkit-grabbing;
    cursor: -moz-grabbing;
  }

  /* All the blocks being dragged get the blocklyDragging class, so match only the root one.
     Using a CSS drop-shadow rather than an SVG filter reference avoids a Safari bug where
     url("#blocklyDragShadowFilter") fails to resolve across SVG document boundaries when
     the block is on the drag surface (a separate <svg> from the main workspace). */
  :not(.blocklyDragging) > .blocklyDragging {
    filter: drop-shadow(0px 0px 6px rgba(0, 0, 0, ${Colours.dragShadowOpacity}));
  }

  /* Changes cursor on mouse down. Not effective in Firefox because of
    https://bugzilla.mozilla.org/show_bug.cgi?id=771241 */
  .blocklyDraggable:active {
    /* backup for browsers (e.g. IE11) that don't support grabbing */
    cursor: url("<<<PATH>>>/handclosed.cur"), auto;
    cursor: grabbing;
    cursor: -webkit-grabbing;
    cursor: -moz-grabbing;
  }
  /* Change the cursor on the whole drag surface in case the mouse gets
     ahead of block during a drag. This way the cursor is still a closed hand.
   */
  .blocklyBlockDragSurface .blocklyDraggable {
    /* backup for browsers (e.g. IE11) that don't support grabbing */
    cursor: url("<<<PATH>>>/handclosed.cur"), auto;
    cursor: grabbing;
    cursor: -webkit-grabbing;
    cursor: -moz-grabbing;
  }


  .blocklyToolboxDelete {
    cursor: url("<<<PATH>>>/handdelete.cur"), auto;
  }

  .blocklyToolboxGrab {
    cursor: url("<<<PATH>>>/handclosed.cur"), auto;
    cursor: grabbing;
    cursor: -webkit-grabbing;
  }

  .blocklyDragging>.blocklyPath,
  .blocklyDragging>.blocklyPathLight {
    fill-opacity: 1.0;
    stroke-opacity: 1.0;
  }

  .blocklyDisabled>.blocklyPath {
    fill-opacity: .5;
    stroke-opacity: .5;
  }

  .blocklyText {
    fill: var(--colour-text);
    font-family: "Helvetica Neue", Helvetica, sans-serif;
    font-size: 12pt;
    font-weight: 500;
  }

  .blocklyBubbleText {
    fill: var(--colour-textFieldText);
  }

  .blocklyFlyoutButton {
    fill: none;
    pointer-events: all;
  }

  .blocklyFlyoutButtonBackground {
      stroke: #c6c6c6;
  }

  .blocklyFlyoutButtonShadow {
    fill: transparent;
  }

  .blocklyFlyoutButton:hover {
    fill: white;
    cursor: pointer;
  }

  .blocklyFlyoutLabel {
    cursor: default;
  }

  .blocklyFlyoutLabelBackground {
    opacity: 0;
  }

  .blocklyTouchTargetBackground {
    fill: transparent;
    cursor: pointer;
  }

  .scratch-renderer.default-theme .blocklyFlyoutLabelText,
  .scratch-renderer.high-contrast-theme .blocklyFlyoutLabelText {
    font-family: "Helvetica Neue", Helvetica, sans-serif;
    font-size: 14pt;
    fill: #575E75;
    font-weight: bold;
  }

  .scratch-renderer.default-theme .blocklyText,
  .scratch-renderer.default-theme .blocklyHtmlInput,
  .scratch-renderer.high-contrast-theme .blocklyText,
  .scratch-renderer.high-contrast-theme .blocklyHtmlInput  {
    font-weight: 500;
  }

  .scratch-renderer.high-contrast-theme .blocklyText,
  .scratch-renderer.high-contrast-theme .blocklyEditableField .blocklyDropdownText {
    fill: #000 !important;
  }

  .scratch-renderer.high-contrast-theme .blocklyEditableField image:last-child {
    filter: invert(1);
  }

  .scratch-renderer.default-theme .blocklyFlyoutButton .blocklyText,
  .scratch-renderer.high-contrast-theme .blocklyFlyoutButton .blocklyText {
    fill: var(--colour-textFieldText);
  }

  .scratch-renderer.default-theme .blocklySelected>.blocklyPath.blocklyPathSelected,
  .scratch-renderer.high-contrast-theme .blocklySelected>.blocklyPath.blocklyPathSelected {
    filter: none;
    stroke: var(--blockly-active-node-color);
    stroke-width: var(--blockly-selection-width);
  }

  /*
    Don't allow users to select text.  It gets annoying when trying to
    drag a block and selected text moves instead.
  */
  .blocklySvg text, .blocklyBlockDragSurface text, .blocklyFlyout text, .blocklyToolboxDiv text {
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    cursor: inherit;
  }

  .blocklyCommentForeignObject {
    position: relative;
    z-index: 0;
  }

  .blocklyCommentText::placeholder {
    font-style: italic;
  }

  .blocklyHtmlInput {
    font-family: "Helvetica Neue", Helvetica, sans-serif;
    font-size: 12pt;
    color: var(--colour-textFieldText);
    font-weight: 500;
  }

  .blocklyFlyoutBackground {
    fill: var(--colour-flyout);
  }

  .blocklyScrollbarHandle {
    fill: var(--colour-scrollbar);
  }

  .blocklyScrollbarBackground:hover+.blocklyScrollbarHandle,
  .blocklyScrollbarHandle:hover {
    fill: var(--colour-scrollbarHover);
  }

  .blocklyZoom>image {
    opacity: 1;
  }

  .blocklyZoom>image:hover {
    opacity: 0.75;
  }

  .blocklyZoom>image:active {
    opacity: 0.6;
  }

  .blocklyAngleCircle {
    stroke-width: 1;
  }

  .blocklyAngleCenterPoint {
    stroke: var(--colour-text);
    stroke-width: 1;
    fill: var(--colour-text);
  }

  .blocklyAngleDragHandle {
    stroke: var(--colour-text);
    stroke-width: 5;
    stroke-opacity: 0.25;
    fill: var(--colour-text);
    cursor: pointer;
  }

  .blocklyAngleDragArrow {
    pointer-events: none
  }

  .blocklyAngleMarks {
    stroke: var(--colour-text);
    stroke-width: 1;
    stroke-opacity: 0.5;
  }

  .blocklyAngleGauge {
    fill: var(--colour-text);
    fill-opacity: 0.20;
  }

  .blocklyAngleLine {
    stroke: var(--colour-text);
    stroke-width: 1;
    stroke-linecap: round;
    pointer-events: none;
  }

  /* Category tree in Toolbox. */
  .blocklyToolbox {
    background-color: var(--colour-toolbox);
    border-right: 1px solid #ddd;
    color: var(--colour-toolboxText);
    overflow-x: visible;
    overflow-y: auto;
    position: absolute;
    font-family: "Helvetica Neue", Helvetica, sans-serif;
    z-index: 40; /* so blocks go over toolbox when dragging */
    -webkit-tap-highlight-color: transparent; /* issue #1345 */
    padding: 0;
  }

  .blocklyToolbox[dir="RTL"] {
    border-right: none;
    border-left: 1px solid #ddd;
  }

  .blocklyToolbox .blocklyToolboxCategory {
    line-height: 22px;
    margin: 0;
    padding: 0.375rem 0px;
    white-space: nowrap;
    cursor: pointer;
  }

  .blocklyToolbox[dir="RTL"] .blocklyToolboxCategory {
    margin-left: 0px;
  }

  .blocklyToolboxCategory:hover {
    color: var(--colour-toolboxHover);
  }

  .blocklyTreeSeparator {
    display: none;
  }

  .blocklyToolboxCategoryLabel {
    cursor: default;
    font-family: "Helvetica Neue", Helvetica, sans-serif;
    font-size: .65rem;
    padding: 0;
    vertical-align: middle;
    width: 60px;
    text-align: center;
    text-wrap: wrap;
  }

  .blocklyToolboxSelected .blocklyToolboxCategoryLabel {
    color: inherit;
  }

  .blocklyToolboxSelected {
    background-color: var(--colour-toolboxSelected);
  }

  .scratchEyedropper {
    background: none;
    outline: none;
    border: none;
    width: 100%;
    text-align: center;
    border-top: 1px solid #ddd;
    padding-top: 5px;
    cursor: pointer;
  }

  .scratchColourPicker {
    width: min-content;
  }

  .scratchColourPickerLabel {
    font-family: "Helvetica Neue", Helvetica, sans-serif;
    font-size: 0.65rem;
    color: var(--colour-toolboxText);
    margin: 8px;
  }

  .scratchColourPickerLabelText {
    font-weight: bold;
  }

  .scratchColourPickerReadout {
    margin-left: 10px;
  }

  .scratchColourSlider {
    appearance: none;
    margin: 8px;
    height: 22px;
    width: 150px;
    position: relative;
    outline: none;
    border-radius: 11px;
    margin-bottom: 20px;
  }

  /* Combining this and the -moz equivalent below with a comma break the webkit version */
  .scratchColourSlider::-webkit-slider-thumb {
    appearance: none;
    background-color: #fff;
    height: 26px;
    width: 26px;
    border-radius: 100%;
    box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.15);
  }

  .scratchColourSlider::-moz-range-thumb {
    appearance: none;
    background-color: #fff;
    height: 26px;
    width: 26px;
    border-radius: 100%;
    box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.15);
  }

  .scratchMatrixButtonDiv {
    width: 50%;
    text-align: center;
    float: left;
  }

  .scratchNotePickerKeyLabel {
    font-family: "Helvetica Neue", Helvetica, sans-serif;
    font-size: 0.75rem;
    fill: var(--colour-textFieldText);
    pointer-events: none;
  }

  .blocklyWidgetDiv .blocklyMenu {
    border-color: #ccc #666 #666 #ccc;
    cursor: default;
    font: normal 13px "Helvetica Neue", Helvetica, sans-serif;
    box-sizing: content-box;
    box-shadow: none;
  }

  .blocklyWidgetDiv .blocklyMenu:focus {
    box-shadow: none;
  }

  .blocklyDropDownDiv .blocklyMenu {
    cursor: default;
    font: normal 13px "Helvetica Neue", Helvetica, sans-serif;
  }

  .blocklyDropDownDiv .blocklyMenu .blocklyMenuItem.blocklyMenuItemHighlight {
    background-color: var(--colour-menuHover);
  }

  .blocklyWidgetDiv .blocklyMenu .blocklyMenuItem.blocklyMenuItemHighlight {
    background-color: var(--colour-contextualMenuHover);
  }

  .blocklyWidgetDiv .blocklyMenu .blocklyMenuItemDisabled.blocklyMenuItem:hover {
    background: none;
  }

  .blocklyFlyoutCheckbox {
    fill: white;
    stroke: #c8c8c8;
  }

  .checked .blocklyFlyoutCheckbox {
    fill: var(--colour-toolboxHover);
    stroke: rgba(0,0,0,0.2);
  }

  .blocklyFlyoutCheckboxPath {
    fill: transparent;
    stroke: white;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .categoryIconBubble {
    margin: 0 auto 0.125rem;
    width: 1.25rem;
    height: 1.25rem;
  }

  .blocklyComment {
    --colour-commentBorder: #bcA903;
  }

  .blocklyCommentTopbar {
    height: 32px;
    --commentBorderColour: #e2db96;
  }

  .blocklyCommentTopbarBackground {
    height: 32px;
  }

  .blocklyFoldoutIcon {
    width: 32px;
    height: 32px;
    transform-origin: 16px 16px;
  }

  .blocklyComment:not(.blocklyCollapsed) .blocklyCommentHighlight,
  .blocklySelected .blocklyCommentHighlight,
  .blocklyCollapsed .blocklyCommentTopbarBackground,
  .blocklyCollapsed.blocklySelected .blocklyCommentTopbarBackground {
    stroke: var(--colour-commentBorder);
    stroke-width: 1px;
  }

  .blocklyCollapsed.blocklyComment .blocklyFoldoutIcon {
    transform: rotate(-180deg);
  }

  .scratch-renderer.default-theme .blocklyComment .blocklyTextarea,
  .scratch-renderer.high-contrast-theme .blocklyComment .blocklyTextarea {
    border: none;
    --commentFillColour: #fef49c;
    font-size: 12pt;
    font-weight: 400;
    padding: 12px;
    color: #575e75;
  }

  .scratch-renderer.default-theme .blocklyCommentText.blocklyText,
  .scratch-renderer.high-contrast-theme .blocklyCommentText.blocklyText {
    font-weight: 400;
  }

  .blocklyToolboxCategory {
    height: auto;
    line-height: auto;
    margin-bottom: 0;
    padding: 0.375rem 0px;
    cursor: pointer;
  }
  .blocklyToolboxCategory:hover {
    color: #4c97ff;
  }
  .blocklyDropDownDiv .blocklyMenuItem {
    font-weight: bold;
    min-height: 32px;
    padding: 4px 7em 4px 28px;
  }
  .scratch-renderer.blocklyDropDownDiv .blocklyMenuItem .blocklyMenuItemContent {
    color: var(--colour-text);
  }

  .blocklyDeleteIcon {
    display: block;
    width: 32px;
    height: 32px;
  }

  .blocklyResizeHandle {
    height: 20px;
    width: 20px;
  }

  .scratch-renderer.default-theme .blocklyDraggable:not(.blocklyDisabled) .blocklyEditableField:not(.blocklyEditing):hover>rect,
  .scratch-renderer.default-theme .blocklyDraggable:not(.blocklyDisabled) .blocklyEditableField:not(.blocklyEditing):hover>.blocklyPath,
  .scratch-renderer.high-contrast-theme .blocklyDraggable:not(.blocklyDisabled) .blocklyEditableField:not(.blocklyEditing):hover>rect,
  .scratch-renderer.high-contrast-theme .blocklyDraggable:not(.blocklyDisabled) .blocklyEditableField:not(.blocklyEditing):hover>.blocklyPath {
    stroke: revert-layer;
    stroke-width: 1;
  }

  .blocklyInsertionMarker > g:not(:last-child) {
    visibility: hidden;
  }

  /* Safari does not expand SVG elements to fill their absolutely-positioned
     container using top/left/right/bottom alone — it uses the SVG intrinsic
     size (300x150) instead. Explicit width/height ensures the drag surface SVG
     fills the injection div so dragged blocks are not clipped. */
  .blocklyBlockDragSurface, .blocklyAnimationLayer {
    width: 100%;
    height: 100%;
  }

  /* Prevent children of the drag surface from intercepting pointer
     events. Blockly's field elements set pointer-events:auto for
     click/edit interactions, but during a drag, Blockly's gesture
     handler binds pointermove/pointerup on document so the dragged
     block does not need to receive pointer events. Without this rule,
     the field elements steal hover and pointer events from elements
     underneath the dragged block (e.g. sprite selector tiles, the
     backpack drop target). */
  .blocklyBlockDragSurface * {
    pointer-events: none;
  }
`

Blockly.Css.register(styles)
