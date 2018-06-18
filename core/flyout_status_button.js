'use strict';

goog.provide('Blockly.FlyoutStatusButton');

goog.require('Blockly.FlyoutImageButton');

Blockly.FlyoutStatusButton = function(workspace, targetWorkspace, xml) {

  // xml.setAttribute('imageSrc',
  //     Blockly.mainWorkspace.options.pathToMedia + 'status-not-ready.svg');

  Blockly.FlyoutStatusButton.superClass_.constructor.call(this, workspace, targetWorkspace, xml);

  this.extensionId = xml.getAttribute('extensionId');

  this.height_ = 25;
  this.width_ = 25;

  this.setStatus('not ready');
};
goog.inherits(Blockly.FlyoutStatusButton, Blockly.FlyoutImageButton);

Blockly.FlyoutStatusButton.prototype.setStatus = function(status) {
  var basePath = Blockly.mainWorkspace.options.pathToMedia;
  if (status === 'ready') {
    this.setImageSrc(basePath + 'status-ready.svg');
  } else {
    this.setImageSrc(basePath + 'status-not-ready.svg');
  }
};
