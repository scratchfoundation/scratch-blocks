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

goog.require('Blockly.Events.Ui');
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
 * This is the sum of the width of the flyout (250) and the category menu (60).
 * @type {number}
 */
Blockly.Toolbox.prototype.width = 310;

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
        // Cancel any gestures in progress.
        this.workspace_.cancelCurrentGesture();
        if (Blockly.utils.isRightButton(e) || e.target == this.HtmlDiv) {
          // Close flyout.
          Blockly.hideChaff(false);
        } else {
          // Just close popups.
          Blockly.hideChaff(true);
        }
        Blockly.Touch.clearTouchIdentifier();  // Don't block future drags.
      }, /*opt_noCaptureIdentifier*/ false, /*opt_noPreventDefault*/ true);

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
    oneBasedIndex: workspace.options.oneBasedIndex,
    horizontalLayout: workspace.horizontalLayout,
    toolboxPosition: workspace.options.toolboxPosition,
    stackGlowFilterId: workspace.options.stackGlowFilterId
  };

  if (workspace.horizontalLayout) {
    this.flyout_ = new Blockly.HorizontalFlyout(options);
  } else {
    this.flyout_ = new Blockly.VerticalFlyout(options);
  }
  this.flyout_.setParentToolbox(this);

  goog.dom.insertSiblingAfter(
      this.flyout_.createDom('svg'), this.workspace_.getParentSvg());
  this.flyout_.init(workspace);
};

/**
 * Fill the toolbox with categories and blocks.
 * @param {!Node} newTree DOM tree of blocks.
 * @private
 */
Blockly.Toolbox.prototype.populate_ = function(newTree) {
  this.categoryMenu_.populate(newTree);
  this.showAll_();
  this.setSelectedItem(this.categoryMenu_.categories_[0], false);
};

/**
 * Show all blocks for all categories in the flyout
 * @private
 */
Blockly.Toolbox.prototype.showAll_ = function() {
  var allContents = [];
  for (var i = 0; i < this.categoryMenu_.categories_.length; i++) {
    var category = this.categoryMenu_.categories_[i];

    // create a label node to go at the top of the category
    var labelString = '<xml><label text="' + category.name_ + '"' +
      ' id="' + category.id_ + '"' +
      ' category-label="true"' +
      ' showStatusButton="' + category.showStatusButton_ + '"' +
      ' web-class="categoryLabel">' +
      '</label></xml>';
    var labelXML = Blockly.Xml.textToDom(labelString);

    allContents.push(labelXML.firstChild);

    allContents = allContents.concat(category.getContents());
  }
  this.flyout_.show(allContents);
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
    treeDiv.style.height = '100%';
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
 * Adds a style on the toolbox. Usually used to change the cursor.
 * @param {string} style The name of the class to add.
 * @package
 */
Blockly.Toolbox.prototype.addStyle = function(style) {
  Blockly.utils.addClass(/** @type {!Element} */ (this.HtmlDiv), style);
};

/**
 * Removes a style from the toolbox. Usually used to change the cursor.
 * @param {string} style The name of the class to remove.
 * @package
 */
Blockly.Toolbox.prototype.removeStyle = function(style) {
  Blockly.utils.removeClass(/** @type {!Element} */ (this.HtmlDiv), style);
};

/**
 * Return the deletion rectangle for this toolbox.
 * @return {goog.math.Rect} Rectangle in which to delete.
 */
Blockly.Toolbox.prototype.getClientRect = function() {
  if (!this.HtmlDiv) {
    return null;
  }

  // If not an auto closing flyout, always use the (larger) flyout client rect
  if (!this.flyout_.autoClose) {
    return this.flyout_.getClientRect();
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
    return new goog.math.Rect(toolboxRect.right - width, -BIG_NUM, BIG_NUM + width, 2 * BIG_NUM);
  } else if (this.toolboxPosition == Blockly.TOOLBOX_AT_TOP) {
    return new goog.math.Rect(-BIG_NUM, -BIG_NUM, 2 * BIG_NUM,
        BIG_NUM + y + height);
  } else {  // Bottom
    return new goog.math.Rect(0, y, 2 * BIG_NUM, BIG_NUM);
  }
};

/**
 * Update the flyout's contents without closing it.  Should be used in response
 * to a change in one of the dynamic categories, such as variables or
 * procedures.
 */
Blockly.Toolbox.prototype.refreshSelection = function() {
  this.showAll_();
};

/**
 * @return {Blockly.Toolbox.Category} the currently selected category.
 */
Blockly.Toolbox.prototype.getSelectedItem = function() {
  return this.selectedItem_;
};

/**
 * @return {string} The name of the currently selected category.
 */
Blockly.Toolbox.prototype.getSelectedCategoryName = function() {
  return this.selectedItem_.name_;
};

/**
 * @return {string} The id of the currently selected category.
 * @public
 */
Blockly.Toolbox.prototype.getSelectedCategoryId = function() {
  return this.selectedItem_.id_;
};

/**
 * @return {number} The distance flyout is scrolled below the top of the currently
 * selected category.
 */
Blockly.Toolbox.prototype.getCategoryScrollOffset = function() {
  var categoryPos = this.getCategoryPositionById(this.getSelectedCategoryId());
  return this.flyout_.getScrollPos() - categoryPos;
};

/**
 * Get the position of a category by name.
 * @param  {string} name The name of the category.
 * @return {number} The position of the category.
 */
Blockly.Toolbox.prototype.getCategoryPositionByName = function(name) {
  var scrollPositions = this.flyout_.categoryScrollPositions;
  for (var i = 0; i < scrollPositions.length; i++) {
    if (name === scrollPositions[i].categoryName) {
      return scrollPositions[i].position;
    }
  }
};

/**
 * Get the position of a category by id.
 * @param  {string} id The id of the category.
 * @return {number} The position of the category.
 * @public
 */
Blockly.Toolbox.prototype.getCategoryPositionById = function(id) {
  var scrollPositions = this.flyout_.categoryScrollPositions;
  for (var i = 0; i < scrollPositions.length; i++) {
    if (id === scrollPositions[i].categoryId) {
      return scrollPositions[i].position;
    }
  }
};

/**
 * Get the length of a category by name.
 * @param  {string} name The name of the category.
 * @return {number} The length of the category.
 */
Blockly.Toolbox.prototype.getCategoryLengthByName = function(name) {
  var scrollPositions = this.flyout_.categoryScrollPositions;
  for (var i = 0; i < scrollPositions.length; i++) {
    if (name === scrollPositions[i].categoryName) {
      return scrollPositions[i].length;
    }
  }
};

/**
 * Get the length of a category by id.
 * @param  {string} id The id of the category.
 * @return {number} The length of the category.
 * @public
 */
Blockly.Toolbox.prototype.getCategoryLengthById = function(id) {
  var scrollPositions = this.flyout_.categoryScrollPositions;
  for (var i = 0; i < scrollPositions.length; i++) {
    if (id === scrollPositions[i].categoryId) {
      return scrollPositions[i].length;
    }
  }
};

/**
 * Set the scroll position of the flyout.
 * @param {number} pos The position to set.
 */
Blockly.Toolbox.prototype.setFlyoutScrollPos = function(pos) {
  this.flyout_.setScrollPos(pos);
};


/**
 * Set the currently selected category.
 * @param {Blockly.Toolbox.Category} item The category to select.
 * @param {boolean=} opt_shouldScroll Whether to scroll to the selected category. Defaults to true.
 */
Blockly.Toolbox.prototype.setSelectedItem = function(item, opt_shouldScroll) {
  if (typeof opt_shouldScroll === 'undefined') {
    opt_shouldScroll = true;
  }
  if (this.selectedItem_) {
    // They selected a different category but one was already open.  Close it.
    this.selectedItem_.setSelected(false);
  }
  this.selectedItem_ = item;
  if (this.selectedItem_ != null) {
    this.selectedItem_.setSelected(true);
    // Scroll flyout to the top of the selected category
    var categoryId = item.id_;
    if (opt_shouldScroll) {
      this.scrollToCategoryById(categoryId);
    }
  }
};

/**
 * Select and scroll to a category by name.
 * @param {string} name The name of the category to select and scroll to.
 */
Blockly.Toolbox.prototype.setSelectedCategoryByName = function(name) {
  this.selectCategoryByName(name);
  this.scrollToCategoryByName(name);
};

/**
 * Select and scroll to a category by id.
 * @param {string} id The id of the category to select and scroll to.
 * @public
 */
Blockly.Toolbox.prototype.setSelectedCategoryById = function(id) {
  this.selectCategoryById(id);
  this.scrollToCategoryById(id);
};

/**
 * Scroll to a category by name.
 * @param {string} name The name of the category to scroll to.
 * @package
 */
Blockly.Toolbox.prototype.scrollToCategoryByName = function(name) {
  var scrollPositions = this.flyout_.categoryScrollPositions;
  for (var i = 0; i < scrollPositions.length; i++) {
    if (name === scrollPositions[i].categoryName) {
      this.flyout_.setVisible(true);
      this.flyout_.scrollTo(scrollPositions[i].position);
      return;
    }
  }
};

/**
 * Scroll to a category by id.
 * @param {string} id The id of the category to scroll to.
 * @public
 */
Blockly.Toolbox.prototype.scrollToCategoryById = function(id) {
  var scrollPositions = this.flyout_.categoryScrollPositions;
  for (var i = 0; i < scrollPositions.length; i++) {
    if (id === scrollPositions[i].categoryId) {
      this.flyout_.setVisible(true);
      this.flyout_.scrollTo(scrollPositions[i].position);
      return;
    }
  }
};

/**
 * Get a category by its index.
 * @param  {number} index The index of the category.
 * @return {Blockly.Toolbox.Category} the category, or null if there are no categories.
 * @package
 */
Blockly.Toolbox.prototype.getCategoryByIndex = function(index) {
  if (!this.categoryMenu_.categories_) return null;
  return this.categoryMenu_.categories_[index];
};

/**
 * Select a category by name.
 * @param {string} name The name of the category to select.
 * @package
 */
Blockly.Toolbox.prototype.selectCategoryByName = function(name) {
  for (var i = 0; i < this.categoryMenu_.categories_.length; i++) {
    var category = this.categoryMenu_.categories_[i];
    if (name === category.name_) {
      this.selectedItem_.setSelected(false);
      this.selectedItem_ = category;
      this.selectedItem_.setSelected(true);
    }
  }
};

/**
 * Select a category by id.
 * @param {string} id The id of the category to select.
 * @package
 */
Blockly.Toolbox.prototype.selectCategoryById = function(id) {
  for (var i = 0; i < this.categoryMenu_.categories_.length; i++) {
    var category = this.categoryMenu_.categories_[i];
    if (id === category.id_) {
      this.selectedItem_.setSelected(false);
      this.selectedItem_ = category;
      this.selectedItem_.setSelected(true);
    }
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
  this.table = goog.dom.createDom('div', this.parent_.horizontalLayout_ ?
    'scratchCategoryMenuHorizontal' : 'scratchCategoryMenu');
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

  // Create a single column of categories
  for (var i = 0; i < categories.length; i++) {
    var child = categories[i];
    var row = goog.dom.createDom('div', 'scratchCategoryMenuRow');
    this.table.appendChild(row);
    if (child) {
      this.categories_.push(new Blockly.Toolbox.Category(this, row,
          child));
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
  this.id_ = domTree.getAttribute('id');
  this.setColour(domTree);
  this.custom_ = domTree.getAttribute('custom');
  this.iconURI_ = domTree.getAttribute('iconURI');
  this.showStatusButton_ = domTree.getAttribute('showStatusButton');
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
  this.item_ = goog.dom.createDom('div',
      {'class': 'scratchCategoryMenuItem'});
  this.label_ = goog.dom.createDom('div',
      {'class': 'scratchCategoryMenuItemLabel'},
      Blockly.utils.replaceMessageReferences(this.name_));
  if (this.iconURI_) {
    this.bubble_ = goog.dom.createDom('div',
        {'class': 'scratchCategoryItemIcon'});
    this.bubble_.style.backgroundImage = 'url(' + this.iconURI_ + ')';
  } else {
    this.bubble_ = goog.dom.createDom('div',
        {'class': 'scratchCategoryItemBubble'});
    this.bubble_.style.backgroundColor = this.colour_;
    this.bubble_.style.borderColor = this.secondaryColour_;
  }
  this.item_.appendChild(this.bubble_);
  this.item_.appendChild(this.label_);
  this.parentHtml_.appendChild(this.item_);
  Blockly.bindEvent_(
      this.item_, 'mouseup', toolbox, toolbox.setSelectedItemFactory(this));
};

/**
 * Set the selected state of this category.
 * @param {boolean} selected Whether this category is selected.
 */
Blockly.Toolbox.Category.prototype.setSelected = function(selected) {
  if (selected) {
    this.item_.className = 'scratchCategoryMenuItem categorySelected';
  } else {
    this.item_.className = 'scratchCategoryMenuItem';
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
