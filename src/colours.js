/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Massachusetts Institute of Technology
 * All rights reserved.
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
import * as Blockly from "blockly/core";

const Colours = {
  // SVG colours: these must be specified in #RRGGBB style
  // To add an opacity, this must be specified as a separate property (for SVG fill-opacity)
  text: "#FFFFFF",
  workspace: "#F9F9F9",
  toolboxHover: "#4C97FF",
  toolboxSelected: "#e9eef2",
  toolboxText: "#575E75",
  toolbox: "#FFFFFF",
  flyout: "#F9F9F9",
  scrollbar: "#CECDCE",
  scrollbarHover: "#CECDCE",
  textField: "#FFFFFF",
  textFieldText: "#575E75",
  insertionMarker: "#000000",
  insertionMarkerOpacity: 0.2,
  dragShadowOpacity: 0.6,
  stackGlow: "#FFF200",
  stackGlowSize: 4,
  stackGlowOpacity: 1,
  replacementGlow: "#FFFFFF",
  replacementGlowSize: 2,
  replacementGlowOpacity: 1,
  colourPickerStroke: "#FFFFFF",
  // CSS colours: support RGBA
  fieldShadow: "rgba(0,0,0,0.1)",
  dropDownShadow: "rgba(0, 0, 0, .3)",
  numPadBackground: "#547AB2",
  numPadBorder: "#435F91",
  numPadActiveBackground: "#435F91",
  numPadText: "white", // Do not use hex here, it cannot be inlined with data-uri SVG
  valueReportBackground: "#FFFFFF",
  valueReportBorder: "#AAAAAA",
  contextualMenuHover: "rgba(77, 151, 255, .25)",
};

function varify(coloursObj, prefix = "--colour") {
  return Object.keys(coloursObj)
    .map((key) => {
      const colour = coloursObj[key];
      if (typeof colour === "string") {
        return `${prefix}-${key}: ${colour};`;
      } else {
        return varify(colour, `${prefix}-${key}`);
      }
    })
    .join("\n");
}

const cssVariables = `:root {
  ${varify(Colours)}
}`;

Blockly.Css.register(cssVariables);

export { Colours };
