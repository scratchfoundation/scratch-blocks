/**
 * Shim of blocks_compressed for use by blocks_compressed_vertical. Provides
 * Blockly as blockly_compressed_vertical + blocks_compressed.
**/
module.exports = require('imports?Blockly=./blockly_compressed_vertical!exports?Blockly!./blocks_compressed');
