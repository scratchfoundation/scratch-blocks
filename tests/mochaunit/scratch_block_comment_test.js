'use strict';

describe('Test ScratchBlockComment', function () {
  var block;
  var workspace;
  var BLOCK_TYPE = 'test_json_minimal';

  function helper_setUp() {
    workspace = new Blockly.Workspace();
    // Mock the resizeContents function on the workspace
    workspace.resizeContents = function () {};
    
    Blockly.defineBlocksWithJsonArray([{
      "type": BLOCK_TYPE
    }]);
    
    block = new Blockly.BlockSvg(workspace, BLOCK_TYPE);

    // Mock createIcon function since it is not necessary for these tests
    // Blockly.ScratchBlockComment.prototype.createIcon = function () {};
    stub(Blockly.ScratchBlockComment.prototype, 'createIcon').callsFake(function () {});
  }

  function helper_tearDown() {
    block && block.dispose();
    workspace.dispose();
    
    delete Blockly.Blocks[BLOCK_TYPE];
    // Restore original createIcon function
    Blockly.ScratchBlockComment.prototype.createIcon.restore();
  }

  it('Test block without comments', function () {
    helper_setUp();
    
    assert.equal(workspace.getTopBlocks(false).length, 1, 'Workspace has a block.');
    assert.equal(workspace.getTopComments(false).length, 0, 'Workspace does not have a comment.');
    assert.equal(block.comment, null, 'Block does not have a comment');
    assert.equal(block.getCommentText(), '', 'Block does not have comment text');
    
    helper_tearDown();
  });

  it('Test block comment minimal arguments', function () {
    helper_setUp();
    
    var comment = new Blockly.ScratchBlockComment(block, 'Some comment text');
    assert.equal(workspace.getTopBlocks(false).length, 1, 'Workspace has a block.');
    assert.equal(workspace.getTopComments(false).length, 1, 'Workspace has a comment.');
    assert.equal(comment.workspace, workspace, 'Comment knows about workspace.');
    
    helper_tearDown();
  });

  it('Test block comment all arguments', function () {
    helper_setUp();

    var comment = new Blockly.ScratchBlockComment(block, 'Some comment text', 'aMockComment', 10, 20, true);
    assert.equal(workspace.getTopBlocks(false).length, 1, 'Workspace has a block.');
    assert.equal(workspace.getTopComments(false).length, 1, 'Workspace has a comment.');
    assert.equal(comment.workspace, workspace, 'Comment knows about workspace.');
    
    helper_tearDown();
  });

  it('Test add comment to block', function () {
    helper_setUp();

    block.setCommentText('Some comment text', 'aMockComment');
    assert.equal(workspace.getTopBlocks(false).length, 1, 'Workspace has a block.');
    assert.equal(workspace.getTopComments(false).length, 1, 'Workspace has a comment.');
    assert.exists(block.comment, 'Block has a comment');
    assert.equal(block.getCommentText(), 'Some comment text', 'Block has comment text');

    helper_tearDown();
  });

  it('Test comment position when provided', function () {
    helper_setUp();

    var comment = new Blockly.ScratchBlockComment(block, 'Some comment text', 'aMockComment', 10, 20);
    var commentXY = comment.getXY();
    var commentX = commentXY.x;
    var commentY = commentXY.y;
    assert.isNumber(commentX, 'Comment x position is type number');
    assert.isNumber(commentY, 'Comment y position is type number');

    assert.equal(commentX, 10, 'Comment x position is what was provided');
    assert.equal(commentY, 20, 'Comment y position is what was provided');

    helper_tearDown();
  });

  it('Test comment position when not provided', function () {
    helper_setUp();

    var comment = new Blockly.ScratchBlockComment(
      block, 'Some comment text', 'aMockComment');
    var commentXY = comment.getXY();
    var commentX = commentXY.x;
    var commentY = commentXY.y;

    assert.isNumber(commentX, 'Comment x position is type number');
    assert.isNumber(commentY, 'Comment y position is type number');

    assert.equal(commentX, 0, 'Comment default x position is not NaN');
    assert.equal(commentY, 0, 'Comment default y position is not NaN');

    helper_tearDown();
  });

  it('Test comment position when NaN provided', function () {
    helper_setUp();
  
    var comment = new Blockly.ScratchBlockComment(
      block, 'Some comment text', 'aMockComment', NaN, NaN);
    var commentXY = comment.getXY();
    var commentX = commentXY.x;
    var commentY = commentXY.y;

    assert.isNumber(commentX, 'Comment x position is type number', 'number');
    assert.isNumber(commentY, 'Comment y position is type number', 'number');

    assert.equal(commentX, 0, 'Comment default x position is not NaN');
    assert.equal(commentY, 0, 'Comment default y position is not NaN');
    
    helper_tearDown();
  });

  it('Test comment position when null provided', function () {
    helper_setUp();

    var comment = new Blockly.ScratchBlockComment(
      block, 'Some comment text', 'aMockComment', null, null);
    var commentXY = comment.getXY();
    var commentX = commentXY.x;
    var commentY = commentXY.y;

    assert.isNumber(commentX, 'Comment x position is type number', 'number');
    assert.isNumber(commentY, 'Comment y position is type number', 'number');

    assert.equal(commentX, 0, 'Comment default x position is not NaN');
    assert.equal(commentY, 0, 'Comment default y position is not NaN');

    helper_tearDown();
  });
});
