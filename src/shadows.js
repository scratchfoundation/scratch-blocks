/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from "blockly/core";
import { Colours } from "./colours.js";

export function buildShadowFilter(workspace) {
  const svg = workspace.getParentSvg();
  const defs = Blockly.utils.dom.createSvgElement(
    Blockly.utils.Svg.DEFS,
    {},
    svg
  );
  // Adjust these width/height, x/y properties to stop the shadow from clipping
  var dragShadowFilter = Blockly.utils.dom.createSvgElement(
    "filter",
    {
      id: "blocklyDragShadowFilter",
      height: "140%",
      width: "140%",
      y: "-20%",
      x: "-20%",
    },
    defs
  );
  Blockly.utils.dom.createSvgElement(
    "feGaussianBlur",
    {
      in: "SourceAlpha",
      stdDeviation: "6",
    },
    dragShadowFilter
  );
  var componentTransfer = Blockly.utils.dom.createSvgElement(
    "feComponentTransfer",
    { result: "offsetBlur" },
    dragShadowFilter
  );
  // Shadow opacity is specified in the adjustable colour library,
  // since the darkness of the shadow largely depends on the workspace colour.
  Blockly.utils.dom.createSvgElement(
    "feFuncA",
    {
      type: "linear",
      slope: Colours.dragShadowOpacity,
    },
    componentTransfer
  );
  Blockly.utils.dom.createSvgElement(
    "feComposite",
    {
      in: "SourceGraphic",
      in2: "offsetBlur",
      operator: "over",
    },
    dragShadowFilter
  );
}
