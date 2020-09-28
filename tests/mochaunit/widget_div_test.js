'use strict';

describe('Test WidgetDiv', function () {
  function helper_makeBBox(left, top, width, height) {
    return {
      left: left,
      right: left + width,
      top: top,
      bottom: top + height
    };
  }

  function helper_makeSize(width, height) {
    return {
      width: width,
      height: height
    };
  }

  var viewport = helper_makeBBox(0, 0, 1000, 1000);
  var widgetSize = helper_makeSize(100, 100);

  // Anchor is always 90 px wide and 90 px tall for this test.
  var ANCHOR_SIZE = 90;

  function helper_makeAnchor(left, top) {
    return {
      left: left,
      right: left + ANCHOR_SIZE,
      top: top,
      bottom: top + ANCHOR_SIZE
    };
  }

  it('Test widget top conflict', function () {
    var anchorTop = 50;
    // Anchor placed close to the top.
    var anchorBox = helper_makeAnchor(500, anchorTop);

    // The widget div should be placed just below the anchor.
    var calculated = Blockly.WidgetDiv.calculateY_(viewport, anchorBox, widgetSize);
    assert.equal(calculated, anchorTop + ANCHOR_SIZE);
  });

  it('Test widget bottom conflict', function () {
    var anchorTop = 900;
    // Anchor placed close to the bottom.
    var anchorBox = helper_makeAnchor(500, anchorTop);

    // The widget div should be placed just above the anchor.
    var calculated = Blockly.WidgetDiv.calculateY_(viewport, anchorBox, widgetSize);
    assert.equal(calculated, anchorTop - widgetSize.height);
  });

  it('Test widget no y confilict', function () {
    var anchorTop = 500;
    // Anchor placed in the middle.
    var anchorBox = helper_makeAnchor(500, anchorTop);

    // The widget div should be placed just below the anchor.
    var calculated = Blockly.WidgetDiv.calculateY_(viewport, anchorBox, widgetSize);
    assert.equal(calculated, anchorTop + ANCHOR_SIZE);
  });

  it('Test LTR widget left conflict', function () {
    var anchorLeft = 50;
    // Anchor placed close to the left side.
    var anchorBBox = helper_makeAnchor(anchorLeft, 500);

    // The widget div should be placed at the anchor.
    var calculated = Blockly.WidgetDiv.calculateX_(viewport, anchorBBox, widgetSize, false /* rtl */);
    assert.equal(calculated, anchorLeft);
  });

  it('Test LTR widget right conflict', function () {
    var anchorLeft = 950;
    // Anchor placed close to the right side.
    var anchorBBox = helper_makeAnchor(anchorLeft, 500);

    // The widget div should be placed as far right as possible--at the edge of
    // the screen.
    var calculated = Blockly.WidgetDiv.calculateX_(viewport, anchorBBox, widgetSize, false /* rtl */);
    assert.equal(calculated, 1000 - widgetSize.width);
  });

  it('Test LTR widget no x conflict', function () {
    var anchorLeft = 500;
    // Anchor in the middle
    var anchorBBox = helper_makeAnchor(anchorLeft, 500);
    // The widget div should be placed just at the left side of the anchor.
    var calculated = Blockly.WidgetDiv.calculateX_(viewport, anchorBBox, widgetSize, false /* rtl */);
    assert.equal(calculated, anchorLeft);
  });

  it('Test RTL widget left conflict', function () {
    var anchorLeft = 10;
    // Anchor placed close to the left side.
    var anchorBBox = helper_makeAnchor(anchorLeft, 500);
    // The widget div should be placed as far left as possible--at the edge of
    // the screen.
    var calculated = Blockly.WidgetDiv.calculateX_(viewport, anchorBBox, widgetSize, true /* rtl */);
    assert.equal(calculated, 0);
  });

  it('Test RTL widget right conflict', function () {
    var anchorLeft = 950;
    // Anchor placed close to the right side.
    var anchorBBox = helper_makeAnchor(anchorLeft, 500);

    // The widget div should be placed as far right as possible--at the edge of
    // the screen.
    var calculated = Blockly.WidgetDiv.calculateX_(viewport, anchorBBox, widgetSize, true /* rtl */);
    assert.equal(calculated, 1000 - widgetSize.width);
  });

  it('Test RTL widget no x conflict', function () {
    var anchorLeft = 500;
    // anchor placed in the middle
    var anchorBBox = helper_makeAnchor(anchorLeft, 500);
    // The widget div should be placed at the right side of the anchor.
    var calculated = Blockly.WidgetDiv.calculateX_(viewport, anchorBBox, widgetSize, true /* rtl */);
    assert.equal(calculated, anchorBBox.right - widgetSize.width);
  });
});
