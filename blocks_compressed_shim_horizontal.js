/**
 * Shim of blocks_compressed for use by blocks_compressed_horizontal. Provides
 * Blockly as blockly_compressed_horizontal + blocks_compressed.
**/
module.exports = require('imports?Blockly=./blockly_compressed_horizontal!exports?Blockly!./blocks_compressed');
