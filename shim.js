/**
 * Webpack shim module
 *
 * webpack.config.js sets up a cascade of imports so that the Blockly object
 * in blocks_compressed_horizontal and blocks_compressed_vertical is retrieved
 * from blocks_compressed, which in turn retrieves its Blockly object from
 * blockly_compressed_horizontal or blockly_compressed_vertical, respectively
 * (via blocks_compressed_shim_vertical and blocks_compressed_horizontal).
 *
 * This is finally compiled into a single module at export.js, which is seen as
 * the main module by webpack when this package is imported.
**/
module.exports = {
    Horizontal: require('./blocks_compressed_horizontal'),
    Vertical: require('./blocks_compressed_vertical')
};
