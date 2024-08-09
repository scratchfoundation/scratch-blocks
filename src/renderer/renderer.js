/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from "blockly/core";
import { Drawer } from "./drawer.js";
import { RenderInfo } from "./render_info.js";
import { ConstantProvider } from "./constants.js";

export class ScratchRenderer extends Blockly.zelos.Renderer {
  makeDrawer_(block, info) {
    return new Drawer(block, info);
  }

  makeRenderInfo_(block) {
    return new RenderInfo(this, block);
  }

  makeConstants_() {
    return new ConstantProvider();
  }

  shouldHighlightConnection(connection) {
    return false;
  }
}

Blockly.blockRendering.register("scratch", ScratchRenderer);
