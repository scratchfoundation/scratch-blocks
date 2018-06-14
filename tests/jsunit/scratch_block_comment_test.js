/**
 * @license
 * Blockly Tests
 *
 * Copyright 2017 Google Inc.
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
'use strict';

goog.require('goog.testing');

var block;
var workspace;
var originalCreateIcon = Blockly.ScratchBlockComment.createIcon;

function scratchBlockCommentTest_setUp() {
  workspace = new Blockly.Workspace();
  // Mock the resizeContents function on the workspace
  workspace.resizeContents = function () {};

  var BLOCK_TYPE = 'test_json_minimal';

  Blockly.defineBlocksWithJsonArray([{
    "type": BLOCK_TYPE
  }]);

  block = new Blockly.BlockSvg(workspace, BLOCK_TYPE);

  // Mock createIcon function since it is not necessary for these tests
  Blockly.ScratchBlockComment.prototype.createIcon = function () {};
}

function scratchBlockCommentTest_tearDown() {
  workspace.dispose();
  block.dispose();

  // Restore original createIcon function
  Blockly.ScratchBlockComment.prototype.createIcon = originalCreateIcon;
}

function test_blockWithNoBlockComments() {
  scratchBlockCommentTest_setUp();
  try {
    assertEquals('Workspace has a block.', 1, workspace.getTopBlocks(false).length);
    assertEquals('Workspace does not have a comment.', 0, workspace.getTopComments(false).length);
    assertEquals('Block does not have a comment', null, block.comment);
    assertEquals('Block does not have comment text', '', block.getCommentText());
  } finally {
    scratchBlockCommentTest_tearDown();
  }
}

function test_createBlockCommentMinimalArguments() {
  scratchBlockCommentTest_setUp();
  try {
    var comment = new Blockly.ScratchBlockComment(block, 'Some comment text');
    assertEquals('Workspace has a block.', 1, workspace.getTopBlocks(false).length);
    assertEquals('Workspace has a comment.', 1, workspace.getTopComments(false).length);
    assertEquals('Comment knows about workspace.', workspace, comment.workspace);
  } finally {
    scratchBlockCommentTest_tearDown();
  }
}

function test_createBlockCommentAllArguments() {
  scratchBlockCommentTest_setUp();
  try {
    var comment = new Blockly.ScratchBlockComment(block, 'Some comment text', 'aMockComment', 10, 20, true);
    assertEquals('Workspace has a block.', 1, workspace.getTopBlocks(false).length);
    assertEquals('Workspace has a comment.', 1, workspace.getTopComments(false).length);
    assertEquals('Comment knows about workspace.', workspace, comment.workspace);
  } finally {
    scratchBlockCommentTest_tearDown();
  }
}

function test_addCommentToBlock() {
  scratchBlockCommentTest_setUp();
  try {
    block.setCommentText('Some comment text', 'aMockComment');
    assertEquals('Workspace has a block.', 1, workspace.getTopBlocks(false).length);
    assertEquals('Workspace has a comment.', 1, workspace.getTopComments(false).length);
    assertNotEquals('Block has a comment', null, block.comment);
    assertEquals('Block has comment text', 'Some comment text', block.getCommentText());
  } finally {
    scratchBlockCommentTest_tearDown();
  }
}

function test_blockCommentXYWhenPositionProvided() {
  scratchBlockCommentTest_setUp();
  try {
    var comment = new Blockly.ScratchBlockComment(block, 'Some comment text', 'aMockComment', 10, 20);
    var commentXY = comment.getXY();
    var commentX = commentXY.x;
    var commentY = commentXY.y;
    assertEquals('Comment x position is type number', 'number', typeof commentX);
    assertEquals('Comment y position is type number', 'number', typeof commentY);

    assertEquals('Comment x position is what was provided', 10, commentX);
    assertEquals('Comment y position is what was provided', 20, commentY);
  } finally {
    scratchBlockCommentTest_tearDown();
  }
}

function test_blockCommentXYWhenPositionNotProvided() {
  scratchBlockCommentTest_setUp();
  try {
    var comment = new Blockly.ScratchBlockComment(
        block, 'Some comment text', 'aMockComment');
    var commentXY = comment.getXY();
    var commentX = commentXY.x;
    var commentY = commentXY.y;

    console.log("COMMENT X: " + commentX);
    console.log("COMMENT Y: " + commentY);

    assertEquals('Comment x position is type number', 'number', typeof commentX);
    assertEquals('Comment y position is type number', 'number', typeof commentY);

    assertFalse('Comment x position is not NaN', isNaN(commentX));
    assertFalse('Comment y position is not NaN', isNaN(commentY));
  } finally {
    scratchBlockCommentTest_tearDown();
  }
}

function test_blockCommentXYNaNPositionProvided() {
  scratchBlockCommentTest_setUp();
  try {
    var comment = new Blockly.ScratchBlockComment(
        block, 'Some comment text', 'aMockComment', NaN, NaN);
    var commentXY = comment.getXY();
    var commentX = commentXY.x;
    var commentY = commentXY.y;

    assertEquals('Comment x position is type number', 'number', typeof commentX);
    assertEquals('Comment y position is type number', 'number', typeof commentY);

    assertFalse('Comment x position is not NaN', isNaN(commentX));
    assertFalse('Comment y position is not NaN', isNaN(commentY));
  } finally {
    scratchBlockCommentTest_tearDown();
  }
}

function test_blockCommentXYNullPositionProvided() {
  scratchBlockCommentTest_setUp();
  try {
    var comment = new Blockly.ScratchBlockComment(
        block, 'Some comment text', 'aMockComment', null, null);
    var commentXY = comment.getXY();
    var commentX = commentXY.x;
    var commentY = commentXY.y;

    assertEquals('Comment x position is type number', 'number', typeof commentX);
    assertEquals('Comment y position is type number', 'number', typeof commentY);

    assertFalse('Comment x position is not NaN', isNaN(commentX));
    assertFalse('Comment y position is not NaN', isNaN(commentY));
  } finally {
    scratchBlockCommentTest_tearDown();
  }
}
