/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from "blockly/core";

const blockStyles = {
  colours_motion: {
    colourPrimary: "#4C97FF",
    colourSecondary: "#4280D7",
    colourTertiary: "#3373CC",
    colourQuaternary: "#3373CC",
  },
  colours_looks: {
    colourPrimary: "#9966FF",
    colourSecondary: "#855CD6",
    colourTertiary: "#774DCB",
    colourQuaternary: "#774DCB",
  },
  colours_sounds: {
    colourPrimary: "#CF63CF",
    colourSecondary: "#C94FC9",
    colourTertiary: "#BD42BD",
    colourQuaternary: "#BD42BD",
  },
  colours_control: {
    colourPrimary: "#FFAB19",
    colourSecondary: "#EC9C13",
    colourTertiary: "#CF8B17",
    colourQuaternary: "#CF8B17",
  },
  colours_event: {
    colourPrimary: "#FFBF00",
    colourSecondary: "#E6AC00",
    colourTertiary: "#CC9900",
    colourQuaternary: "#CC9900",
  },
  colours_sensing: {
    colourPrimary: "#5CB1D6",
    colourSecondary: "#47A8D1",
    colourTertiary: "#2E8EB8",
    colourQuaternary: "#2E8EB8",
  },
  colours_pen: {
    colourPrimary: "#0fBD8C",
    colourSecondary: "#0DA57A",
    colourTertiary: "#0B8E69",
    colourQuaternary: "#0B8E69",
  },
  colours_operators: {
    colourPrimary: "#59C059",
    colourSecondary: "#46B946",
    colourTertiary: "#389438",
    colourQuaternary: "#389438",
  },
  colours_data: {
    colourPrimary: "#FF8C1A",
    colourSecondary: "#FF8000",
    colourTertiary: "#DB6E00",
    colourQuaternary: "#DB6E00",
  },
  colours_data_lists: {
    colourPrimary: "#FF661A",
    colourSecondary: "#FF5500",
    colourTertiary: "#E64D00",
    colourQuaternary: "#E64D00",
  },
  colours_more: {
    colourPrimary: "#FF6680",
    colourSecondary: "#FF4D6A",
    colourTertiary: "#FF3355",
    colourQuaternary: "#FF3355",
  },
  colours_textfield: {
    colourPrimary: "#FFFFFF",
    colourSecondary: "#FFFFFF",
    colourTertiary: "#FFFFFF",
    colourQuaternary: "#FFFFFF",
  },
};

export const ScratchTheme = new Blockly.Theme("scratch", blockStyles);
