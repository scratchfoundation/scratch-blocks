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

  /**
   * HTML container for the Toolbox menu.
   * @type {Element}
   */
  this.HtmlDiv =
      goog.dom.createDom(goog.dom.TagName.DIV, 'blocklyToolboxDiv');
  this.HtmlDiv.setAttribute('dir', workspace.RTL ? 'RTL' : 'LTR');
  svg.parentNode.insertBefore(this.HtmlDiv, svg);

  // Clicking on toolbox closes popups.
  Blockly.bindEventWithChecks_(this.HtmlDiv, 'mousedown', this,
      function(e) {
        if (Blockly.utils.isRightButton(e) || e.target == this.HtmlDiv) {
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
  this.populate_(workspace.options);
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
    oneBasedIndex: workspace.options.oneBasedIndex,
    horizontalLayout: workspace.horizontalLayout,
    toolboxPosition: workspace.options.toolboxPosition
  };

  if (workspace.horizontalLayout) {
    this.flyout_ = new Blockly.HorizontalFlyout(options);
  } else {
    this.flyout_ = new Blockly.VerticalFlyout(options);
  }
  this.flyout_.setParentToolbox(this);

  goog.dom.insertSiblingAfter(this.flyout_.createDom('svg'),
                              this.workspace_.getParentSvg());
  this.flyout_.init(workspace);
};

/**
 * Fill the toolbox with categories and blocks.
 * @param {!Node} newTree DOM tree of blocks.
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
    //treeDiv.style.height = 'auto';
    //treeDiv.style.width = svgSize.width + 'px';
    this.height = treeDiv.offsetHeight;
    if (this.toolboxPosition == Blockly.TOOLBOX_AT_TOP) {  // Top
      treeDiv.style.top = '0';
      treeDiv.style.width = '100%';
      //treeDiv.style.height = '10px';
    } else {  // Bottom
      console.log('bottomm positioning')
      treeDiv.style.bottom = '0';
      treeDiv.style.width = '100%';
      //treeDiv.style.height = '30px';
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
 * Adds styles on the toolbox indicating blocks will be deleted.
 * @package
 */
Blockly.Toolbox.prototype.addDeleteStyle = function() {
  Blockly.utils.addClass(/** @type {!Element} */ (this.HtmlDiv),
                         'blocklyToolboxDelete');
};

/**
 * Remove styles from the toolbox that indicate blocks will be deleted.
 * @package
 */
Blockly.Toolbox.prototype.removeDeleteStyle = function() {
  Blockly.utils.removeClass(/** @type {!Element} */ (this.HtmlDiv),
                            'blocklyToolboxDelete');
};

/**
 * Return the deletion rectangle for this toolbox.
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

/**
 * @return {Blockly.Toolbox.Category} the currently selected category.
 */
Blockly.Toolbox.prototype.getSelectedItem = function() {
  return this.selectedItem_;
};

/**
 * Set the currently selected category.
 * @param {Blockly.Toolbox.Category} item The category to select.
 */
Blockly.Toolbox.prototype.setSelectedItem = function(item) {
  if (this.selectedItem_) {
    // Don't do anything if they selected the already-open category.
    if (this.selectedItem_ == item) {
      return;
    }
    // They selected a different category but one was already open.  Close it.
    this.selectedItem_.setSelected(false);
  }
  this.selectedItem_ = item;
  if (this.selectedItem_ != null) {
    this.selectedItem_.setSelected(true);
    this.flyout_.show(item.getContents());
    this.flyout_.scrollToStart();
  }
};

/**
 * Wrapper function for calling setSelectedItem from a touch handler.
 * @param {Blockly.Toolbox.Category} item The category to select.
 * @return {function} A function that can be passed to bindEvent.
 */
Blockly.Toolbox.prototype.setSelectedItemFactory = function(item) {
  var selectedItem = item;
  return function() {
    this.setSelectedItem(selectedItem);
    Blockly.Touch.clearTouchIdentifier();
  };
};

// Category menu
/**
 * Class for a table of category titles that will control which category is
 * displayed.
 * @param {Blockly.Toolbox} parent The toolbox that owns the category menu.
 * @param {Element} parentHtml The containing html div.
 * @constructor
 */
Blockly.Toolbox.CategoryMenu = function(parent, parentHtml) {
  this.parent_ = parent;
  this.height_ = 0;
  this.parentHtml_ = parentHtml;
  this.createDom();
  this.categories_ = [];
};

/**
 * @return {number} the height of the category menu.
 */
Blockly.Toolbox.CategoryMenu.prototype.getHeight = function() {
  return this.height_;
};

/**
 * Create the DOM for the category menu.
 */
Blockly.Toolbox.CategoryMenu.prototype.createDom = function() {
  /*
  <table class="scratchCategoryMenu">
  </table>
  */
  var toolbox = this.parent_;
  if (toolbox.horizontalLayout_) {
    this.table = goog.dom.createDom('table', 'scratchCategoryMenuH');
  } else {
    this.table = goog.dom.createDom('table', 'scratchCategoryMenu');
  }
  this.parentHtml_.appendChild(this.table);
};

/**
 * Fill the toolbox with categories and blocks by creating a new
 * {Blockly.Toolbox.Category} for every category tag in the toolbox xml.
 * @param {Node} domTree DOM tree of blocks, or null.
 */
Blockly.Toolbox.CategoryMenu.prototype.populate = function(options) {
  var domTree = options.languageTree;
  if (!domTree) {
    return;
  }

  // Remove old categories
  this.dispose();
  this.createDom();
  var categories = [];
  // Find actual categories from the DOM tree.
  for (var i = 0, child; child = domTree.childNodes[i]; i++) {
    if (!child.tagName || child.tagName.toUpperCase() != 'CATEGORY') {
      continue;
    }
    categories.push(child);
  }
  // Create categories one row at a time.
  // Note that this involves skipping around by `columnSeparator` in the DOM tree.
  if (options.horizontalLayout) {
    var columnSeparator = categories.length;
    var row = goog.dom.createDom('tr', 'scratchCategoryMenuRow');
    this.table.appendChild(row);
    for (var i = 0; i < columnSeparator; i += 1) {
      child = categories[i];
      
      if (child) {
        this.categories_.push(new Blockly.Toolbox.Category(this, row,
            child));
      }
    }
  } else {
    var columnSeparator = Math.ceil(categories.length / 2);
    for (var i = 0; i < columnSeparator; i += 1) {
      child = categories[i];
      var row = goog.dom.createDom('tr', 'scratchCategoryMenuRow');
      this.table.appendChild(row);
      if (child) {
        this.categories_.push(new Blockly.Toolbox.Category(this, row,
            child));
      }
      if (categories[i + columnSeparator]) {
        this.categories_.push(new Blockly.Toolbox.Category(this, row,
            categories[i + columnSeparator]));
      }
    }
  }
  this.height_ = this.table.offsetHeight;
};

/**
 * Dispose of this Category Menu and all of its children.
 */
Blockly.Toolbox.CategoryMenu.prototype.dispose = function() {
  for (var i = 0, category; category = this.categories_[i]; i++) {
    category.dispose();
  }
  this.categories_ = [];
  if (this.table) {
    goog.dom.removeNode(this.table);
    this.table = null;
  }
};


// Category
/**
 * Class for the data model of a category in the toolbox.
 * @param {Blockly.Toolbox.CategoryMenu} parent The category menu that owns this
 *     category.
 * @param {Element} parentHtml The containing html div.
 * @param {Node} domTree DOM tree of blocks.
 * @constructor
 */
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

/**
 * Dispose of this category and all of its contents.
 */
Blockly.Toolbox.Category.prototype.dispose = function() {
  if (this.item_) {
    goog.dom.removeNode(this.item_);
    this.item = null;
  }
  this.parent_ = null;
  this.parentHtml_ = null;
  this.contents_ = null;
};

/**
 * Create the DOM for a category in the toolbox.
 */
Blockly.Toolbox.Category.prototype.createDom = function() {
  var toolbox = this.parent_.parent_;
  if (toolbox.horizontalLayout_) {
    this.item_ = goog.dom.createDom('td',
      {'class': 'scratchCategoryMenuItemH'},
      this.name_);  
  } else {
    this.item_ = goog.dom.createDom('td',
      {'class': 'scratchCategoryMenuItem'},
      this.name_);
  }
  this.bubble_ = goog.dom.createDom('div', {
    'class': (toolbox.RTL) ? 'scratchCategoryItemBubbleRTL' :
    'scratchCategoryItemBubbleLTR'});
  this.bubble_.style.backgroundColor = this.colour_;
  this.bubble_.style.borderColor = this.secondaryColour_;
  this.item_.appendChild(this.bubble_);
  this.parentHtml_.appendChild(this.item_);
  Blockly.bindEvent_(this.item_, 'mousedown', toolbox,
    toolbox.setSelectedItemFactory(this));
};

/**
 * Set the selected state of this category.
 * @param {boolean} selected Whether this category is selected.
 */
Blockly.Toolbox.Category.prototype.setSelected = function(selected) {
  var toolbox = this.parent_.parent_;
  if (selected) {
    if (toolbox.horizontalLayout_) {
      this.item_.className = 'scratchCategoryMenuItemH categorySelected';
    }else{
      this.item_.className = 'scratchCategoryMenuItem categorySelected';
    }
  } else {
    if (toolbox.horizontalLayout_) {
      this.item_.className = 'scratchCategoryMenuItemH';
    }else{
      this.item_.className = 'scratchCategoryMenuItem';
    }
  }
};

/**
 * Set the contents of this category from DOM.
 * @param {Node} domTree DOM tree of blocks.
 * @constructor
 */
Blockly.Toolbox.Category.prototype.parseContents_ = function(domTree) {
  for (var i = 0, child; child = domTree.childNodes[i]; i++) {
    if (!child.tagName) {
      // Skip
      continue;
    }
    switch (child.tagName.toUpperCase()) {
      case 'BLOCK':
      case 'SHADOW':
      case 'LABEL':
      case 'BUTTON':
      case 'SEP':
      case 'TEXT':
        this.contents_.push(child);
        break;
      default:
        break;
    }
  }
};

/**
 * Get the contents of this category.
 * @return {!Array|string} xmlList List of blocks to show, or a string with the
 *     name of a custom category.
 */
Blockly.Toolbox.Category.prototype.getContents = function() {
  return this.custom_ ? this.custom_ : this.contents_;
};

/**
 * Set the colour of the category's background from a DOM node.
 * @param {Node} node DOM node with "colour" and "secondaryColour" attribute.
 *     Colours are a hex string or hue on a colour wheel (0-360).
 */
Blockly.Toolbox.Category.prototype.setColour = function(node) {
  var colour = node.getAttribute('colour');
  var secondaryColour = node.getAttribute('secondaryColour');
  if (goog.isString(colour)) {
    if (colour.match(/^#[0-9a-fA-F]{6}$/)) {
      this.colour_ = colour;
    } else {
      this.colour_ = Blockly.hueToRgb(colour);
    }
    if (secondaryColour.match(/^#[0-9a-fA-F]{6}$/)) {
      this.secondaryColour_ = secondaryColour;
    } else {
      this.secondaryColour_ = Blockly.hueToRgb(secondaryColour);
    }
    this.hasColours_ = true;
  } else {
    this.colour_ = '#000000';
    this.secondaryColour_ = '#000000';
  }
};
