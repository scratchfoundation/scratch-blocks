'use strict';

//dummy block.
Blockly.Blocks['jibo_say'] = {
  /**
   * Dummy block
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "id": "jibo_say",
      "message0": "Say: %1",
      "args0": [
        {
          "type": "input_value",
          "name" : "TEXT2SAY",
          "check" : "String",
        }
        
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "category": Blockly.Categories.jibo,
      "colour": "#295BE2",
      "colourSecondary": "#1842b4",
      
    });
  }
};