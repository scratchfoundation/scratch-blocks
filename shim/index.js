/**
 * Webpack shim module
 *
 * Uses webpack imports-loader and exports-loader to provide the horizontal and
 * vertical flavors of Blockly.  All of the other files in this directory shim
 * Blockly and goog between blockly_compressed_* and blocks_compressed*.
 *
 * Horizontal and Vertical export Blockly out of
 *     blockly_compressed_[horizontal, vertical] +
 *     blocks_compressed +
 *     blocks_compressed_[horizontal, vertical] +
 *     msg/messages
**/
module.exports = {
    Horizontal: require('imports?Blockly=../shim/blocks_compressed_horizontal,goog=../shim/blockly_compressed_horizontal.goog!exports?Blockly!../msg/messages'),
    Vertical: require('imports?Blockly=../shim/blocks_compressed_vertical,goog=../shim/blockly_compressed_vertical.goog!exports?Blockly!../msg/messages')
};
