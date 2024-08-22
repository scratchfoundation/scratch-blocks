/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
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

/**
 * @fileoverview Utility methods for Scratch Blocks but not Blockly.
 * @author fenichel@google.com (Rachel Fenichel)
 */
import * as Blockly from "blockly/core";

/**
 * Re-assign obscured shadow blocks new IDs to prevent collisions
 * Scratch specific to help the VM handle deleting obscured shadows.
 * @param {Blockly.Block} block the root block to be processed.
 * @package
 */
export function changeObscuredShadowIds(block) {
  var blocks = block.getDescendants(false);
  for (var i = blocks.length - 1; i >= 0; i--) {
    var descendant = blocks[i];
    for (var j = 0; j < descendant.inputList.length; j++) {
      var connection = descendant.inputList[j].connection;
      if (connection) {
        var shadowDom = connection.getShadowDom();
        if (shadowDom) {
          shadowDom.setAttribute("id", Blockly.utils.genUid());
          connection.setShadowDom(shadowDom);
        }
      }
    }
  }
}

/**
 * Compare strings with natural number sorting.
 * @param {string} str1 First input.
 * @param {string} str2 Second input.
 * @return {number} -1, 0, or 1 to signify greater than, equality, or less than.
 */
export function compareStrings(str1, str2) {
  return str1.localeCompare(str2, [], {
    sensitivity: "base",
    numeric: true,
  });
}

/**
 * Creates a callback function for a click on the "duplicate" context menu
 * option in Scratch Blocks.  The block is duplicated and attached to the mouse,
 * which acts as though it were pressed and mid-drag.  Clicking the mouse
 * releases the new dragging block.
 * @param {!Blockly.BlockSvg} oldBlock The block that will be duplicated.
 * @param {!Event} event Event that caused the context menu to open.
 * @return {Function} A callback function that duplicates the block and starts a
 *     drag.
 * @package
 */
export function duplicateAndDragCallback(oldBlock, event) {
  var isMouseEvent =
    Blockly.Touch.getTouchIdentifierFromEvent(event) === "mouse";
  return function (e) {
    // Give the context menu a chance to close.
    setTimeout(function () {
      var ws = oldBlock.workspace;
      var svgRootOld = oldBlock.getSvgRoot();
      if (!svgRootOld) {
        throw new Error("oldBlock is not rendered.");
      }

      // Create the new block by cloning the block in the flyout (via XML).
      var xml = Blockly.Xml.blockToDom(oldBlock);
      // The target workspace would normally resize during domToBlock, which
      // will lead to weird jumps.
      // Resizing will be enabled when the drag ends.
      ws.setResizesEnabled(false);

      // Disable events and manually emit events after the block has been
      // positioned and has had its shadow IDs fixed (Scratch-specific).
      Blockly.Events.disable();
      try {
        // Using domToBlock instead of domToWorkspace means that the new block
        // will be placed at position (0, 0) in main workspace units.
        var newBlock = Blockly.Xml.domToBlock(xml, ws);

        // Scratch-specific: Give shadow dom new IDs to prevent duplicating on paste
        changeObscuredShadowIds(newBlock);

        var svgRootNew = newBlock.getSvgRoot();
        if (!svgRootNew) {
          throw new Error("newBlock is not rendered.");
        }

        // The position of the old block in workspace coordinates.
        var oldBlockPosWs = oldBlock.getRelativeToSurfaceXY();

        // Place the new block as the same position as the old block.
        // TODO: Offset by the difference between the mouse position and the upper
        // left corner of the block.
        newBlock.moveBy(oldBlockPosWs.x, oldBlockPosWs.y);
        if (!isMouseEvent) {
          var offsetX = ws.RTL ? -100 : 100;
          var offsetY = 100;
          newBlock.moveBy(offsetX, offsetY); // Just offset the block for touch.
        }
      } finally {
        Blockly.Events.enable();
      }
      if (Blockly.Events.isEnabled()) {
        Blockly.Events.fire(new Blockly.Events.BlockCreate(newBlock));
      }

      if (isMouseEvent) {
        // e is not a real mouseEvent/touchEvent/pointerEvent.  It's an event
        // created by the context menu and has the coordinates of the mouse
        // click that opened the context menu.
        var fakeEvent = {
          clientX: event.clientX,
          clientY: event.clientY,
          type: "mousedown",
          preventDefault: function () {
            e.preventDefault();
          },
          stopPropagation: function () {
            e.stopPropagation();
          },
          target: e.target,
        };
        ws.startDragWithFakeEvent(fakeEvent, newBlock);
      }
    }, 0);
  };
}
