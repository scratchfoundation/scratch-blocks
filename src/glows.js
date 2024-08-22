import * as Blockly from "blockly/core";
import { Colours } from "./colours.js";

/**
 * Glow/unglow a stack in the workspace.
 * @param {?string} id ID of block which starts the stack.
 * @param {boolean} isGlowingStack Whether to glow the stack.
 */
export function glowStack(id, isGlowingStack) {
  if (id) {
    const block =
      Blockly.getMainWorkspace().getBlockById(id) ||
      Blockly.getMainWorkspace().getFlyout().getWorkspace().getBlockById(id);
    if (!block) {
      throw "Tried to glow block that does not exist.";
    }

    const svg = block.getSvgRoot();
    if (isGlowingStack && !svg.hasAttribute("filter")) {
      svg.setAttribute("filter", "url(#blocklyStackGlowFilter)");
    } else if (!isGlowingStack && svg.hasAttribute("filter")) {
      svg.removeAttribute("filter");
    }
  }
}

export function buildGlowFilter(workspace) {
  const svg = workspace.getParentSvg();
  const defs = Blockly.utils.dom.createSvgElement(
    Blockly.utils.Svg.DEFS,
    {},
    svg
  );
  // Using a dilate distorts the block shape.
  // Instead use a gaussian blur, and then set all alpha to 1 with a transfer.
  const stackGlowFilter = Blockly.utils.dom.createSvgElement(
    "filter",
    {
      id: "blocklyStackGlowFilter",
      height: "160%",
      width: "180%",
      y: "-30%",
      x: "-40%",
    },
    defs
  );
  Blockly.utils.dom.createSvgElement(
    "feGaussianBlur",
    {
      in: "SourceGraphic",
      stdDeviation: Colours.stackGlowSize,
    },
    stackGlowFilter
  );
  // Set all gaussian blur pixels to 1 opacity before applying flood
  const componentTransfer = Blockly.utils.dom.createSvgElement(
    "feComponentTransfer",
    { result: "outBlur" },
    stackGlowFilter
  );
  Blockly.utils.dom.createSvgElement(
    "feFuncA",
    {
      type: "table",
      tableValues: "0" + " 1".repeat(16),
    },
    componentTransfer
  );
  // Color the highlight
  Blockly.utils.dom.createSvgElement(
    "feFlood",
    {
      "flood-color": Colours.stackGlow,
      "flood-opacity": Colours.stackGlowOpacity,
      result: "outColor",
    },
    stackGlowFilter
  );
  Blockly.utils.dom.createSvgElement(
    "feComposite",
    {
      in: "outColor",
      in2: "outBlur",
      operator: "in",
      result: "outGlow",
    },
    stackGlowFilter
  );
  Blockly.utils.dom.createSvgElement(
    "feComposite",
    {
      in: "SourceGraphic",
      in2: "outGlow",
      operator: "over",
    },
    stackGlowFilter
  );
}
