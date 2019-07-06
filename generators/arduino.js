/**
 * Created by Riven on 7/14/2016.
 */

'use strict';

goog.provide('Blockly.Arduino');

goog.require('Blockly.Generator');


/**
 * Arduino code generator.
 * @type {!Blockly.Generator}
 */
Blockly.Arduino = new Blockly.Generator('Arduino');

/**
 * List of illegal variable names.
 * This is not intended to be a security feature.  Blockly is 100% client-side,
 * so bypassing this list is trivial.  This is intended to prevent users from
 * accidentally clobbering a built-in object or function.
 * @private
 */
Blockly.Arduino.addReservedWords(
    // Special character
    '_,' +
    'void,char' +
    ''
);

/**
 * Order of operation ENUMs.
 */
Blockly.Arduino.ORDER_ATOMIC = 0;          // literals
// The next level was not explicit in documentation and inferred by Ellen.
Blockly.Arduino.ORDER_HIGH = 1;            // Function calls, tables[]
Blockly.Arduino.ORDER_EXPONENTIATION = 2;  // ^
Blockly.Arduino.ORDER_UNARY = 3;           // not # - ~
Blockly.Arduino.ORDER_MULTIPLICATIVE = 4;  // * / %
Blockly.Arduino.ORDER_ADDITIVE = 5;        // + -
Blockly.Arduino.ORDER_CONCATENATION = 6;   // ..
Blockly.Arduino.ORDER_RELATIONAL = 7;      // < > <=  >= ~= ==
Blockly.Arduino.ORDER_AND = 8;             // and
Blockly.Arduino.ORDER_OR = 9;              // or
Blockly.Arduino.ORDER_NONE = 99;

Blockly.Arduino.Null = 0;
Blockly.Arduino.Setup = 1;
Blockly.Arduino.Loop = 2;

Blockly.Arduino.INDENT = "\t"; // all spacer should die
Blockly.Arduino.END = ";\n";
Blockly.Arduino.Header = "#include <Arduino.h>\n";

/**
 * Initialise the database of variable names.
 * @param {!Blockly.Workspace} workspace Workspace to generate code from.
 */
Blockly.Arduino.init = function(workspace) {
    // Create a dictionary of definitions to be printed before the code.
    Blockly.Arduino.definitions_ = Object.create(null);
    // Create a dictionary mapping desired function names in definitions_
    // to actual function names (to avoid collisions with user functions).
    Blockly.Arduino.includes_ = Object.create(null);

    Blockly.Arduino.codeStage = Blockly.Arduino.Setup;
    Blockly.Arduino.tabPos = 1;

    if (!Blockly.Arduino.variableDB_) {
        Blockly.Arduino.variableDB_ =
            new Blockly.Names(Blockly.Arduino.RESERVED_WORDS_);
    } else {
        Blockly.Arduino.variableDB_.reset();
    }
};

/**
 * Prepend the generated code with the variable definitions.
 * @param {string} code Generated code.
 * @return {string} Completed code.
 */
Blockly.Arduino.finish = function (code) {
    // Convert the definitions dictionary into a list.
    var definitions = [];
    for (var name in Blockly.Arduino.definitions_) {
        definitions.push(Blockly.Arduino.definitions_[name]);
    }
    // add including
    var including = [];
    for (var name in Blockly.Arduino.includes_) {
        including.push(Blockly.Arduino.includes_[name]);
    }

    var ret = "";
    ret = Blockly.Arduino.Header;
    ret += including.join('\n\n');
    ret += "\n\n";
    ret += definitions.join('\n\n');
    ret += "\n\n";
    ret += "void setup(){\n";
    ret += code;
    ret += "\n}\n";
    // add redundant loop
    if (Blockly.Arduino.codeStage == Blockly.Arduino.Setup) {
        ret += "\nvoid loop(){\n\n}\n"
    }

    // Clean up temporary data.
    delete Blockly.Arduino.definitions_;
    delete Blockly.Arduino.includes_;
    delete Blockly.Arduino.codeStage;
    Blockly.Arduino.variableDB_.reset();

    return ret;
};


Blockly.Arduino.scrub_ = function (block, code) {

    var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    var nextCode = Blockly.Arduino.blockToCode(nextBlock);
    return code + nextCode;
};

/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything.
 * @param {string} line Line of generated code.
 * @return {string} Legal line of code.
 */
Blockly.Arduino.scrubNakedValue = function (line) {
    return line + '\n';
};

/**
 * Encode a string as a properly escaped Python string, complete with quotes.
 * @param {string} string Text to encode.
 * @return {string} Python string.
 * @private
 */
Blockly.Arduino.quote_ = function (string) {
    // Can't use goog.string.quote since % must also be escaped.
    string = string.replace(/\\/g, '\\\\')
        .replace(/\n/g, '\\\n')
        .replace(/\%/g, '\\%')
        .replace(/'/g, '\\\'');
    return string;
};

Blockly.Arduino.tab = function () {
    return Blockly.Arduino.INDENT.repeat(Blockly.Arduino.tabPos);
};

