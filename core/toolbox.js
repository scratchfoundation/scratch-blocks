/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
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
 * @fileoverview Toolbox from whence to create blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Toolbox');

goog.require('Blockly.HorizontalFlyout');
goog.require('Blockly.Touch');
goog.require('Blockly.VerticalFlyout');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.events');
goog.require('goog.events.BrowserFeature');
goog.require('goog.html.SafeHtml');
goog.require('goog.html.SafeStyle');
goog.require('goog.math.Rect');
goog.require('goog.style');
goog.require('goog.ui.tree.TreeControl');
goog.require('goog.ui.tree.TreeNode');


/**
 * Class for a Toolbox.
 * Creates the toolbox's DOM.
 * @param {!Blockly.Workspace} workspace The workspace in which to create new
 *     blocks.
 * @constructor
 */
Blockly.Toolbox = function(workspace) {
  /**
   * @type {!Blockly.Workspace}
   * @private
   */
  this.workspace_ = workspace;

  /**
   * Whether toolbox categories should be represented by icons instead of text.
   * @type {boolean}
   * @private
   */
  this.iconic_ = false;

  /**
   * Is RTL vs LTR.
   * @type {boolean}
   */
  this.RTL = workspace.options.RTL;

  /**
   * Whether the toolbox should be laid out horizontally.
   * @type {boolean}
   * @private
   */
  this.horizontalLayout_ = workspace.options.horizontalLayout;

  /**
   * Position of the toolbox and flyout relative to the workspace.
   * @type {number}
   */
  this.toolboxPosition = workspace.options.toolboxPosition;

};

/**
 * Width of the toolbox, which changes only in vertical layout.
 * @type {number}
 */
Blockly.Toolbox.prototype.width = 250;

/**
 * Height of the toolbox, which changes only in horizontal layout.
 * @type {number}
 */
Blockly.Toolbox.prototype.height = 0;

Blockly.Toolbox.prototype.selectedItem_ = null;

/**
 * Initializes the toolbox.
 */
Blockly.Toolbox.prototype.init = function() {
  var workspace = this.workspace_;
  var svg = this.workspace_.getParentSvg();

  // Create an HTML container for the Toolbox menu.
  this.HtmlDiv =
      goog.dom.createDom(goog.dom.TagName.DIV, 'blocklyToolboxDiv');
  this.HtmlDiv.setAttribute('dir', workspace.RTL ? 'RTL' : 'LTR');
  svg.parentNode.insertBefore(this.HtmlDiv, svg);

  // Clicking on toolbox closes popups.
  Blockly.bindEvent_(this.HtmlDiv, 'mousedown', this,
      function(e) {
        Blockly.DropDownDiv.hide();
        if (Blockly.isRightButton(e) || e.target == this.HtmlDiv) {
          // Close flyout.
          Blockly.hideChaff(false);
        } else {
          // Just close popups.
          Blockly.hideChaff(true);
        }
        Blockly.Touch.clearTouchIdentifier();  // Don't block future drags.
      });

  this.createFlyout_();
  this.categoryMenu_ = new Blockly.Toolbox.CategoryMenu(this, this.HtmlDiv);
  this.populate_(workspace.options.languageTree);
  this.position();
};

/**
 * Dispose of this toolbox.
 */
Blockly.Toolbox.prototype.dispose = function() {
  this.flyout_.dispose();
  this.categoryMenu_.dispose();
  this.categoryMenu_ = null;
  goog.dom.removeNode(this.HtmlDiv);
  this.workspace_ = null;
  this.lastCategory_ = null;
};

/**
 * Create and configure a flyout based on the main workspace's options.
 * @private
 */
Blockly.Toolbox.prototype.createFlyout_ = function() {
  var workspace = this.workspace_;

  var options = {
    disabledPatternId: workspace.options.disabledPatternId,
    parentWorkspace: workspace,
    RTL: workspace.RTL,
    horizontalLayout: workspace.horizontalLayout,
    toolboxPosition: workspace.options.toolboxPosition
  };

  if (workspace.horizontalLayout) {
    this.flyout_ = new Blockly.HorizontalFlyout(options);
  } else {
    this.flyout_ = new Blockly.VerticalFlyout(options);
  }
  this.flyout_.setParentToolbox(this);

  goog.dom.insertSiblingAfter(this.flyout_.createDom(), workspace.svgGroup_);
  this.flyout_.init(workspace);
};

/**
 * Fill the toolbox with categories and blocks.
 * @param {!Node} newTree DOM tree of blocks.
 * @return {Node} Tree node to open at startup (or null).
 * @private
 */
Blockly.Toolbox.prototype.populate_ = function(newTree) {
  this.categoryMenu_.populate(newTree);
  this.setSelectedItem(this.categoryMenu_.categories_[0]);
};

/**
 * Get the width of the toolbox.
 * @return {number} The width of the toolbox.
 */
Blockly.Toolbox.prototype.getWidth = function() {
  return this.width;
};

/**
 * Get the height of the toolbox, not including the block menu.
 * @return {number} The height of the toolbox.
 */
Blockly.Toolbox.prototype.getHeight = function() {
  return this.categoryMenu_ ? this.categoryMenu_.getHeight() : 0;
};

/**
 * Move the toolbox to the edge.
 */
Blockly.Toolbox.prototype.position = function() {
  var treeDiv = this.HtmlDiv;
  if (!treeDiv) {
    // Not initialized yet.
    return;
  }
  var svg = this.workspace_.getParentSvg();
  var svgSize = Blockly.svgSize(svg);
  if (this.horizontalLayout_) {
    treeDiv.style.left = '0';
    treeDiv.style.height = 'auto';
    treeDiv.style.width = svgSize.width + 'px';
    this.height = treeDiv.offsetHeight;
    if (this.toolboxPosition == Blockly.TOOLBOX_AT_TOP) {  // Top
      treeDiv.style.top = '0';
    } else {  // Bottom
      treeDiv.style.bottom = '0';
    }
  } else {
    if (this.toolboxPosition == Blockly.TOOLBOX_AT_RIGHT) {  // Right
      treeDiv.style.right = '0';
    } else {  // Left
      treeDiv.style.left = '0';
    }
    treeDiv.style.height = this.getHeight() + 'px';
    treeDiv.style.width = this.width + 'px';
  }
  this.flyout_.position();
};

/**
 * Unhighlight any previously specified option.
 */
Blockly.Toolbox.prototype.clearSelection = function() {
  this.setSelectedItem(null);
};

/**
 * Return the deletion rectangle for this toolbar in viewport coordinates.\
 * @return {goog.math.Rect} Rectangle in which to delete.
 */
Blockly.Toolbox.prototype.getClientRect = function() {
  if (!this.HtmlDiv) {
    return null;
  }

  // BIG_NUM is offscreen padding so that blocks dragged beyond the toolbox
  // area are still deleted.  Must be smaller than Infinity, but larger than
  // the largest screen size.
  var BIG_NUM = 10000000;
  var toolboxRect = this.HtmlDiv.getBoundingClientRect();

  var x = toolboxRect.left;
  var y = toolboxRect.top;
  var width = toolboxRect.width;
  var height = toolboxRect.height;

  // Assumes that the toolbox is on the SVG edge.  If this changes
  // (e.g. toolboxes in mutators) then this code will need to be more complex.
  if (this.toolboxPosition == Blockly.TOOLBOX_AT_LEFT) {
    return new goog.math.Rect(-BIG_NUM, -BIG_NUM, BIG_NUM + x + width,
        2 * BIG_NUM);
  } else if (this.toolboxPosition == Blockly.TOOLBOX_AT_RIGHT) {
    return new goog.math.Rect(x, -BIG_NUM, BIG_NUM + width, 2 * BIG_NUM);
  } else if (this.toolboxPosition == Blockly.TOOLBOX_AT_TOP) {
    return new goog.math.Rect(-BIG_NUM, -BIG_NUM, 2 * BIG_NUM,
        BIG_NUM + y + height);
  } else {  // Bottom
    return new goog.math.Rect(0, y, 2 * BIG_NUM, BIG_NUM + width);
  }
};

/**
 * Update the flyout's contents without closing it.  Should be used in response
 * to a change in one of the dynamic categories, such as variables or
 * procedures.
 */
Blockly.Toolbox.prototype.refreshSelection = function() {
  var selectedItem = this.getSelectedItem();
  if (selectedItem && selectedItem.getContents()) {
    this.flyout_.show(selectedItem.getContents());
  }
};

Blockly.Toolbox.prototype.getSelectedItem = function() {
  return this.selectedItem_;
};

Blockly.Toolbox.prototype.setSelectedItem = function(item) {
  // item is a category
  this.selectedItem_ = item;
  if (this.selectedItem_ != null) {
    this.flyout_.show(item.getContents());
  }
};

Blockly.Toolbox.prototype.setSelectedItemFactory = function(item) {
  var selectedItem = item;
  return function() {
    this.setSelectedItem(selectedItem);
    Blockly.Touch.clearTouchIdentifier();
  };
};



// Category menu

Blockly.Toolbox.CategoryMenu = function(parent, parentHtml) {
  this.parent_ = parent;
  this.parentHtml_ = parentHtml;
  this.createDom();
  this.categories_ = [];
};

Blockly.Toolbox.CategoryMenu.prototype.getHeight = function() {
  return this.table.offsetHeight;
};

Blockly.Toolbox.CategoryMenu.prototype.createDom = function() {
  /*
  <table class="scratchCategoryMenu">
  </table>
  */
  this.table = goog.dom.createDom('table', 'scratchCategoryMenu');
  this.parentHtml_.appendChild(this.table);
};

/**
 * Fill the toolbox with categories and blocks by creating a new
 * {Blockly.Toolbox.Category} for every category tag in the toolbox xml.
 * @param {Node} domTree DOM tree of blocks, or null.
 */
Blockly.Toolbox.CategoryMenu.prototype.populate = function(domTree) {
  if (!domTree) {
    return;
  }

  // TODO: Clean up/make sure things are clean.
  // TODO: Track last element, maybe.
  for (var i = 0, child; child = domTree.childNodes[i]; i++) {
    if (!child.tagName) {
      // skip it
      continue;
    }
    switch (child.tagName.toUpperCase()) {
      case 'CATEGORY':
        if (!(this.categories_.length % 2)) {
          var row = goog.dom.createDom('tr', 'scratchCategoryMenuRow');
          this.table.appendChild(row);
        }
        this.categories_.push(new Blockly.Toolbox.Category(this, row,
            child));
        break;
      case 'SEP':
        // TODO: deal with separators.
        break;
    }
  }
};

Blockly.Toolbox.CategoryMenu.prototype.dispose = function() {
  for (var i = 0, category; category = this.categories_[i]; i++) {
    category.dispose();
  }
  if (this.table) {
    goog.dom.removeNode(this.table);
    this.table = null;
  }
};


// Category

Blockly.Toolbox.Category = function(parent, parentHtml, domTree) {
  this.parent_ = parent;
  this.parentHtml_ = parentHtml;
  this.name_ = domTree.getAttribute('name');
  this.setColour(domTree);
  this.custom_ = domTree.getAttribute('custom');
  this.contents_ = [];
  if (!this.custom_) {
    this.parseContents_(domTree);
  }
  this.createDom();
};

Blockly.Toolbox.Category.prototype.dispose = function() {
  if (this.item_) {
    goog.dom.removeNode(this.item_);
    this.item = null;
  }
  this.parent_ = null;
  this.parentHtml_ = null;
  this.contents_ = null;
};

Blockly.Toolbox.Category.prototype.createDom = function() {
  this.item_ = goog.dom.createDom('td',
      {'class': 'scratchCategoryMenuItem',
       'style': 'background-color:' + this.colour_
      },
      this.name_);
  this.parentHtml_.appendChild(this.item_);

// this.parent_.parent_ should be the toolbox.  Don't leave this line in this
// state. (TODO)
  Blockly.bindEvent_(this.item_, 'mousedown', this.parent_.parent_,
    this.parent_.parent_.setSelectedItemFactory(this));
};

Blockly.Toolbox.Category.prototype.parseContents_ = function(domTree) {
  for (var i = 0, child; child = domTree.childNodes[i]; i++) {
    if (!child.tagName) {
      // Skip
      continue;
    }
    switch (child.tagName.toUpperCase()) {
      case 'BLOCK':
      case 'SHADOW':
      case 'BUTTON':
      case 'TEXT':
        this.contents_.push(child);
        break;
      default:
        break;
    }
  }
};

Blockly.Toolbox.Category.prototype.getContents = function() {
  return this.custom_ ? this.custom_ : this.contents_;
};

/**
 * Set the colour of the category's background from a DOM node.
 * @param {Node} node DOM node with "colour" attribute.  Colour is a hex string
 *     or hue on a colour wheel (0-360).
 */
Blockly.Toolbox.Category.prototype.setColour = function(node) {
  var colour = node.getAttribute('colour');
  if (goog.isString(colour)) {
    if (colour.match(/^#[0-9a-fA-F]{6}$/)) {
      this.colour_ = colour;
    } else {
      this.colour_ = Blockly.hueToRgb(colour);
    }
    this.hasColours_ = true;
  } else {
    this.colour_ = '#000000';
  }
};
