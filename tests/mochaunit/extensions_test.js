'use strict';

describe('Test extension', function () {
  it('Register JSON extension', function () {
    var workspace;
    var block;

    try {
      var numCallsToBefore = 0;
      var numCallsToAfter = 0;

      Blockly.Extensions.register('extensions_test_before', function () {
        numCallsToBefore++;
        this.extendedWithBefore = true;
      });
      Blockly.Extensions.register('extensions_test_after', function () {
        numCallsToAfter++;
        this.extendedWithAfter = true;
      });

      Blockly.defineBlocksWithJsonArray([{
        "type": "extension_test_block",
        "message0": "extension_test_block",
        "extensions": ["extensions_test_before", "extensions_test_after"]
      }]);

      assert.isFunction(Blockly.Extensions.ALL_['extensions_test_before']);
      assert.isFunction(Blockly.Extensions.ALL_['extensions_test_after']);
      assert.equal(numCallsToBefore, 0);
      assert.equal(numCallsToAfter, 0);

      Blockly.Events.disable();
      workspace = new Blockly.Workspace();
      block = new Blockly.Block(workspace, 'extension_test_block');

      assert.equal(numCallsToBefore, 1);
      assert.equal(numCallsToAfter, 1);
      assert.isTrue(block.extendedWithBefore);
      assert.isTrue(block.extendedWithAfter);
    } finally {
      block && block.dispose();
      workspace && workspace.dispose();
      Blockly.Events.enable();

      delete Blockly.Extensions.ALL_['extensions_test_before'];
      delete Blockly.Extensions.ALL_['extensions_test_after'];
      delete Blockly.Blocks['extension_test_block'];
    }
  });

  it('Test extension missing', function () {
    var workspace;
    var block;

    try {
      assert.notExists(Blockly.Extensions.ALL_['missing_extension']);
      assert.throws(function () {
        Blockly.defineBlocksWithJsonArray([{
          "type": "missing_extension_block",
          "message0": "missing_extension_block",
          "extensions": ["missing_extension"]
        }]);

        Blockly.Events.disable();
        workspace = new Blockly.Workspace();
        block = new Blockly.Block(workspace, 'missing_extension_block');
      }, Error);
    } finally {
      block && block.dispose();
      workspace && workspace.dispose();
      Blockly.Events.enable();

      delete Blockly.Extensions.ALL_['missing_extension'];
      delete Blockly.Blocks['missing_extension_block'];
    }
  });

  it('Extension is not function', function () {
    assert.throws(function () {
      Blockly.Extensions.register('extension_just_a_string', 'foo');
    }, Error);

    assert.throws(function () {
      Blockly.Extensions.register('extension_is_null', null);
    }, Error);
  });

  it('Test extension parent_tooltip_when_inline', function () {
    const defaultTooltip = "defaultTooltip";
    const parentTooltip = "parentTooltip";

    var workspace;
    var block, parent;

    try {
      Blockly.defineBlocksWithJsonArray([
        {
          "type": "test_parent_tooltip_when_inline",
          "message0": "test_parent_tooltip_when_inline",
          "output": true,
          "tooltip": defaultTooltip,
          "extensions": ["parent_tooltip_when_inline"]
        },
        {
          "type": "test_parent",
          "message0": "%1",
          "args0": [
            {
              "type": "input_value",
              "name": "INPUT"
            }
          ],
          "tooltip": parentTooltip
        }
      ]);

      Blockly.Events.disable();
      workspace = new Blockly.Workspace();
      block = new Blockly.Block(workspace, 'test_parent_tooltip_when_inline');

      // Tooltip is normal before connected to parent.
      assert.isFunction(block.tooltip);
      assert.equal(block.tooltip(), defaultTooltip);

      parent = new Blockly.Block(workspace, 'test_parent');
      parent.setInputsInline(false);
      assert.isFalse(parent.inputsInline);
      assert.equal(parent.tooltip, parentTooltip);

      // Tooltip is normal when parent is not inline.
      parent.getInput('INPUT').connection.connect(block.outputConnection);
      assert.equal(block.getParent(), parent);
      assert.equal(block.tooltip(), defaultTooltip);

      // Tooltip is parent's when parent is inline.
      parent.setInputsInline(true);
      assert.isTrue(parent.inputsInline);
      assert.equal(block.tooltip(), parentTooltip);

      // Tooltip revert when disconnected.
      parent.getInput('INPUT').connection.disconnect();
      assert.notExists(block.getParent());
      assert.equal(block.tooltip(), defaultTooltip);
    } finally {
      block && block.dispose();
      parent && parent.dispose();
      workspace && workspace.dispose();
      Blockly.Events.enable();

      delete Blockly.Blocks['test_parent_tooltip_when_inline'];
      delete Blockly.Blocks['test_parent'];
    }
  });

  it('Test mixin extension', function () {
    var TEST_MIXIN = {
      field: 'FIELD',
      method: function () {
        console.log('TEXT_MIXIN method()');
      }
    };

    var workspace;
    var block;

    try {
      // Extension defined before the block type is defined.
      assert.isUndefined(Blockly.Extensions.ALL_['mixin_test']);
      Blockly.Extensions.registerMixin('mixin_test', TEST_MIXIN);
      assert.isFunction(Blockly.Extensions.ALL_['mixin_test']);

      Blockly.defineBlocksWithJsonArray([{
        "type": "test_block_mixin",
        "message0": "test_block_mixin",
        "extensions": ["mixin_test"]
      }]);

      Blockly.Events.disable();
      workspace = new Blockly.Workspace();
      block = new Blockly.Block(workspace, 'test_block_mixin');

      assert.equal(block.field, TEST_MIXIN.field);
      assert.equal(block.method, TEST_MIXIN.method);
    } finally {
      block && block.dispose();
      workspace && workspace.dispose();
      Blockly.Events.enable();

      delete Blockly.Extensions.ALL_['mixin_test'];
      delete Blockly.Blocks['test_block_mixin'];
    }
  });

  it('Test bad mixin overwrites local property', function () {
    var TEST_MIXIN_BAD_INPUTLIST = {
      inputList: 'bad inputList'  // Defined in constructor
    };

    try {
      // Extension defined before the block type is defined.
      assert.isUndefined(Blockly.Extensions.ALL_['mixin_bad_inputList']);
      Blockly.Extensions.registerMixin('mixin_bad_inputList', TEST_MIXIN_BAD_INPUTLIST);
      assert.isFunction(Blockly.Extensions.ALL_['mixin_bad_inputList']);

      Blockly.defineBlocksWithJsonArray([{
        "type": "test_block_bad_inputList",
        "message0": "test_block_bad_inputList",
        "extensions": ["mixin_bad_inputList"]
      }]);

      assert.throws(function () {
        assert.notEqual(e.message.indexOf('inputList'), -1);
      }, Error);
    } finally {
      delete Blockly.Extensions.ALL_['mixin_bad_inputList'];
      delete Blockly.Blocks['test_block_bad_inputList'];
    }
  });

  it('Test bad mixin overwrites prototype', function () {
    var TEST_MIXIN_BAD_COLOUR = {
      colour_: 'bad colour_' // Defined on prototype
    };

    var workspace;
    var block;

    try {
      // Extension defined before the block type is defined.
      assert.isUndefined(Blockly.Extensions.ALL_['mixin_bad_colour_']);
      Blockly.Extensions.registerMixin('mixin_bad_colour_', TEST_MIXIN_BAD_COLOUR);
      assert.isFunction(Blockly.Extensions.ALL_['mixin_bad_colour_']);

      Blockly.defineBlocksWithJsonArray([{
        "type": "test_block_bad_colour",
        "message0": "test_block_bad_colour",
        "extensions": ["mixin_bad_colour_"]
      }]);

      Blockly.Events.disable();
      workspace = new Blockly.Workspace();
      assert.throws(function () {
        block = new Blockly.Block(workspace, 'test_block_bad_colour');
      }, Error);
    } finally {
      block && block.dispose();
      workspace && workspace.dispose();
      Blockly.Events.enable();

      delete Blockly.Extensions.ALL_['mixin_bad_colour_'];
      delete Blockly.Blocks['test_block_bad_colour'];
    }
  });

  it('Test mutator mixin no dialog', function () {
    var workspace;
    var block;

    try {
      Blockly.defineBlocksWithJsonArray([{
        "type": "mutator_test_block",
        "message0": "mutator_test_block",
        "mutator": "mutator_test"
      }]);

      assert.isUndefined(Blockly.Extensions.ALL_['mutator_test']);
      Blockly.Extensions.registerMutator('mutator_test', {
        domToMutation: function () {
          return 'domToMutationFn';
        },
        mutationToDom: function () {
          return 'mutationToDomFn';
        }
      });

      Blockly.Events.disable();
      workspace = new Blockly.Workspace();
      block = new Blockly.Block(workspace, 'mutator_test_block');

      // Make sure all of the functions were installed correctly.
      assert.equal(block.domToMutation(), 'domToMutationFn');
      assert.equal(block.mutationToDom(), 'mutationToDomFn');
      assert.isFalse(block.hasOwnProperty('compose'));
      assert.isFalse(block.hasOwnProperty('decompose'));
    } finally {
      block && block.dispose();
      workspace && workspace.dispose();
      Blockly.Events.enable();

      delete Blockly.Extensions.ALL_['mutator_test'];
      delete Blockly.Blocks['mutator_test_block'];
    }
  });

  it('Test mutator mixin no decompose fails', function () {
    assert.throws(function () {
      assert.isUndefined(Blockly.Extensions.ALL_['mutator_test']);
      Blockly.Extensions.registerMutator('mutator_test', {
        domToMutation: function () {
          return 'domToMutationFn';
        },
        mutationToDom: function () {
          return 'mutationToDomFn';
        },
        compose: function () {
          return 'composeFn';
        }
      });
    }, Error);
  });

  it('Test mutator mixin no compose fails', function () {
    assert.throws(function () {
      assert.isUndefined(Blockly.Extensions.ALL_['mutator_test']);
      Blockly.Extensions.registerMutator('mutator_test', {
        domToMutation: function () {
          return 'domToMutationFn';
        },
        mutationToDom: function () {
          return 'mutationToDomFn';
        },
        decompose: function () {
          return 'deComposeFn';
        }
      });
    }, Error);
  });

  it('Test mutator mixin no domToMutation fails', function () {
    assert.throws(function () {
      assert.isUndefined(Blockly.Extensions.ALL_['mutator_test']);
      Blockly.Extensions.registerMutator('mutator_test', {
        mutationToDom: function () {
          return 'mutationToDomFn';
        },
        compose: function () {
          return 'composeFn';
        },
        decompose: function () {
          return 'decomposeFn';
        }
      });
    }, Error);
  });

  it('Test mutator mixin no mutationToDom fails', function () {
    assert.throws(function () {
      assert.isUndefined(Blockly.Exrensions.ALL_['mutator_test']);
      Blockly.Extensions.registerMutator('mutator_test', {
        domToMutation: function () {
          return 'domToMutationFn';
        },
        compose: function () {
          return 'composeFn';
        },
        decompose: function () {
          return 'decomposeFn';
        }
      });
    }, Error);
  });

  it('Test mutator as extension fails', function () {
    var workspace;
    var block;

    Blockly.defineBlocksWithJsonArray([{
      "type": "mutator_test_block",
      "message0": "mutator_test_block",
      "extensions": ["mutator_test"]
    }]);

    assert.isUndefined(Blockly.Extensions.ALL_['mutator_test']);
    Blockly.Extensions.registerMutator('mutator_test', {
      domToMutation: function () {
        return 'domToMutationFn';
      },
      mutationToDom: function () {
        return 'mutationToDomFn';
      }
    });

    try {
      Blockly.Events.disable();
      workspace = new Blockly.Workspace();
      assert.throws(function () {
        // Should failed on apply, not on register.
        block = new Blockly.Block(workspace, 'mutator_test_block');
      }, Error);
    } finally {
      block && block.dispose();
      workspace && workspace.dispose();
      Blockly.Events.enable();

      delete Blockly.Extensions.ALL_['mutator_test'];
      delete Blockly.Blocks['mutator_test_block'];
    }
  });

  it('Test extension as mutator fails', function () {
    var workspace;
    var block;

    Blockly.defineBlocksWithJsonArray([{
      "type": "mutator_test_block",
      "message0": "mutator_test_block",
      "mutator": ["extensions_test"]
    }]);

    assert.isUndefined(Blockly.Extensions.ALL_['extensions_test']);
    Blockly.Extensions.register('extensions_test', function () {
      return 'extensions_test_fn';
    });

    try {
      Blockly.Events.disable();
      workspace = new Blockly.Workspace();
      assert.throws(function () {
        // Should failed on apply, not on register.
        block = new Blockly.Block(workspace, 'mutator_test_block');
      }, Error);
    } finally {
      block && block.dispose();
      workspace && workspace.dispose();
      Blockly.Events.enable();

      delete Blockly.Extensions.ALL_['extensions_test'];
      delete Blockly.Blocks['mutator_test_block'];
    }
  });

  it('Test mutator with plus function', function () {
    var workspace;
    var block;
    var fnWasCalled = false;

    Blockly.defineBlocksWithJsonArray([{
      "type": "mutator_test_block",
      "message0": "mutator_test_block",
      "mutator": ["extensions_test"]
    }]);

    assert.isUndefined(Blockly.Extensions.ALL_['extensions_test']);
    Blockly.Extensions.registerMutator('extensions_test', {
      domToMutation: function () {
        return 'domToMutationFn';
      },
      mutationToDom: function () {
        return 'mutationToDomFn';
      }
    }, function () {
      fnWasCalled = true;
    }
    );
    try {
      Blockly.Events.disable();
      workspace = new Blockly.Workspace();
      block = new Blockly.Block(workspace, 'mutator_test_block');
    } finally {
      block && block.dispose();
      workspace && workspace.dispose();
      Blockly.Events.enable();
      delete Blockly.Extensions.ALL_['extensions_test'];
      delete Blockly.Blocks['mutator_test_block'];
    }
    assert.isTrue(fnWasCalled);
  });
});
