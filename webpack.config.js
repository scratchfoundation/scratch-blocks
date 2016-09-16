const path = require('path');
module.exports = {
    entry: './shim.js',
    output: {
        library: 'ScratchBlocks',
        libraryTarget: 'commonjs2',
        path: path.resolve(__dirname),
        filename: 'export.js'
    },
    module: {
        loaders: [{
            test: require.resolve('./blockly_compressed_horizontal'),
            loader: 'exports?Blockly'
        }, {
            test: require.resolve('./blockly_compressed_vertical'),
            loader: 'exports?Blockly'
        }, {
            test: require.resolve('./blocks_compressed_horizontal'),
            loader: 'imports?Blockly=./blocks_compressed_shim_horizontal!exports?Blockly'
        }, {
            test: require.resolve('./blocks_compressed_vertical'),
            loader: 'imports?Blockly=./blocks_compressed_shim_vertical!exports?Blockly'
        }]
    }
};
