/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from "blockly/core";
import { Drawer } from "./drawer.js";
import { RenderInfo } from "./render_info.js";
import { ConstantProvider } from "./constants.js";
import { PathObject } from "./path_object.js";

/**
 * Custom renderer for Scratch-style blocks.
 */
export class ScratchRenderer extends Blockly.zelos.Renderer {
  /**
   * Create a new instance of the renderer's drawer.
   *
   * @param {!Blockly.BlockSvg} block The block to render.
   * @param info {!Blockly.blockRendering.RenderInfo} An object containing all
   *     information needed to render this block.
   * @returns {!Drawer} The drawer.
   */
  makeDrawer_(block, info) {
    return new Drawer(block, info);
  }

  /**
   * Create a new instance of the renderer's render info object.
   *
   * @param {!Blockly.BlockSvg} block The block to measure.
   * @returns {!RenderInfo} The render info object.
   */
  makeRenderInfo_(block) {
    return new RenderInfo(this, block);
  }

  /**
   * Create a new instance of the renderer's constant provider.
   *
   * @returns {!ConstantProvider} The constant provider.
   */
  makeConstants_() {
    return new ConstantProvider();
  }

  /**
   * Create a new instance of a renderer path object.
   *
   * @param {!SVGElement} root The root SVG element.
   * @param {!Blockly.BlockStyle} style The style object to use for colouring.
   * @returns {!PathObject} The renderer path object.
   */
  makePathObject(root, style) {
    return new PathObject(root, style, this.getConstants());
  }

  /**
   * Determine whether or not to highlight a connection.
   *
   * @param {!Blockly.RenderedConnection} connection The connection to determine
   *     whether or not to highlight.
   * @returns {boolean} True if we should highlight the connection.
   */
  shouldHighlightConnection(connection) {
    return (
      connection.type === Blockly.ConnectionType.INPUT_VALUE &&
      connection.getCheck()?.includes("Boolean")
    );
  }
}

Blockly.blockRendering.register("scratch", ScratchRenderer);
