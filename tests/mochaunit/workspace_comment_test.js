'use strict';

describe('Test WorkspaceComment', function () {
  var workspace;

  function helper_setUp() {
    workspace = new Blockly.Workspace();
  }

  function helper_tearDown() {
    workspace.dispose();
  }

  it('Test no workspace comment', function () {
    helper_setUp();

    assert.equal(workspace.getTopComments(true).length, 0, 'Empty workspace: no comments (1).');
    assert.equal(workspace.getTopComments(false).length, 0, 'Empty workspace: no comments (2).');
    workspace.clear();
    assert.equal(workspace.getTopComments(true).length, 0, 'Empty workspace: no comments (3).');
    assert.equal(workspace.getTopComments(false).length, 0, 'Empty workspace: no comments (4).');

    helper_tearDown();
  });

  it('Test one workspace comment', function () {
    helper_setUp();

    var comment = new Blockly.WorkspaceComment(workspace, 'comment text', 0, 0, false, 'comment id');
    assert.equal(workspace.getTopComments(true).length, 1, 'One comment on workspace (1).');
    assert.equal(workspace.getTopComments(false).length, 1, 'One comment on workspace  (2).');
    assert.equal(workspace.commentDB_['comment id'], comment, 'Comment db contains this comment.');
    workspace.clear();
    assert.equal(workspace.getTopComments(true).length, 0, 'Cleared workspace: no comments (3).');
    assert.equal(workspace.getTopComments(false).length, 0, 'Cleared workspace: no comments (4).');
    assert.isFalse('comment id' in workspace.commentDB_, 'Comment DB does not contain this comment.');

    helper_tearDown();
  });

  it('Test get workspace comment by id', function () {
    helper_setUp();

    var comment = new Blockly.WorkspaceComment(workspace, 'comment text', 0, 0, false, 'comment id');
    assert.equal(workspace.getCommentById('comment id'), comment, 'Getting a comment by id.');
    assert.equal(workspace.getCommentById('not a comment'), null, 'No comment found.');
    comment.dispose();
    assert.equal(workspace.getCommentById('comment id'), null, 'Can\'t find the comment.');

    helper_tearDown();
  });

  it('Test dispose workspace comment twice', function () {
    helper_setUp();

    var comment = new Blockly.WorkspaceComment(workspace, 'comment text', 0, 0, false, 'comment id');
    comment.dispose();
    // Nothing should go wrong the second time dispose is called.
    assert.doesNotThrow(function () {
      comment.dispose();
    }, Error);

    helper_tearDown();
  });

  it('Test workspace comment height witdh', function () {
    helper_setUp();

    var comment = new Blockly.WorkspaceComment(workspace, 'comment text',
      10, 20, false, 'comment id');
    assert.equal(comment.getWidth(), 20, 'Initial width');
    assert.equal(comment.getHeight(), 10, 'Initial height');

    comment.setWidth(30);
    assert.equal(comment.getWidth(), 30, 'New width should be different');
    assert.equal(comment.getHeight(), 10, 'New height should not be different');

    comment.setHeight(40);
    assert.equal(comment.getWidth(), 30, 'New width should not be different');
    assert.equal(comment.getHeight(), 40, 'New height should be different');
    comment.dispose();

    helper_tearDown();
  });

  it('Test workspace comment xY', function () {
    helper_setUp();

    var comment = new Blockly.WorkspaceComment(workspace, 'comment text',
      10, 20, false, 'comment id');
    var xy = comment.getXY();
    assert.equal(xy.x, 0, 'Initial X position');
    assert.equal(xy.y, 0, 'Initial Y position');

    comment.moveBy(10, 100);
    xy = comment.getXY();
    assert.equal(xy.x, 10, 'New X position');
    assert.equal(xy.y, 100, 'New Y position');
    comment.dispose();

    helper_tearDown();
  });

  it('Test workspace comment text', function () {
    helper_setUp();
    var stub_fire = stub(Blockly.Events, 'fire').callsFake(function (event) {
      if (!Blockly.Events.isEnabled()) {
        return;
      }
      Blockly.Events.FIRE_QUEUE_.push(event);
      Blockly.Events.fireNow_();
    });

    var comment = new Blockly.WorkspaceComment(workspace, 'comment text', 10, 20, false, 'comment id');
    assert.equal(comment.getText(), 'comment text', 'Check comment text');
    assert.equal(workspace.undoStack_.length, 1, 'Workspace undo stack has one event');

    comment.setText('comment text');
    assert.equal(comment.getText(), 'comment text', 'Comment text has not changed');
    // Setting the text to the old value does not fire an event.
    assert.equal(workspace.undoStack_.length, 1, 'Workspace undo stack has one event');

    comment.setText('new comment text');
    assert.equal(comment.getText(), 'new comment text', 'Comment text has changed');
    assert.equal(workspace.undoStack_.length, 2, 'Workspace undo stack has two events');
    comment.dispose();

    helper_tearDown();
    stub_fire.restore();
  });

  it('Test workspace comment minimized', function () {
    helper_setUp();

    var comment = new Blockly.WorkspaceComment(workspace, 'comment text', 0, 0, true, 'comment id');
    assert.isTrue(comment.isMinimized(), 'Comment is minimized');

    helper_tearDown();
  });

  it('Test workspace comment minimized from xml', function () {
    helper_setUp();

    var comment = new Blockly.WorkspaceComment(workspace, 'comment text', 0, 0, true, 'comment id');
    var commentXml = comment.toXml();
    var xml = goog.dom.createDom('xml');
    xml.appendChild(commentXml);
    comment.dispose();
    assert.equal(workspace.getCommentById('comment id'), null, 'Comment is no longer on workspace');
    Blockly.Xml.domToWorkspace(xml, workspace);
    var importedComment = workspace.getCommentById('comment id');
    assert.exists(importedComment, 'Comment loaded from xml is on workspace');
    assert.isTrue(importedComment.isMinimized(), 'Imported comment is minimized');

    helper_tearDown();
  });
});
