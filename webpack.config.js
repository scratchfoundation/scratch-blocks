var CopyWebpackPlugin = require('copy-webpack-plugin');
var path = require('path');

module.exports = [{
  entry: {
    horizontal: './shim/horizontal.js',
    vertical: './shim/vertical.js'
  },
  output: {
    library: 'ScratchBlocks',
    libraryTarget: 'commonjs2',
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  }
}, {
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'gh-pages')
  },
  plugins: [
      new CopyWebpackPlugin([{
        from: 'node_modules/google-closure-library',
        to: 'closure-library'
      }, {
        from: 'blocks_common',
        to: 'playgrounds/blocks_common',
      }, {
        from: 'blocks_horizontal',
        to: 'playgrounds/blocks_horizontal',
      }, {
        from: 'blocks_vertical',
        to: 'playgrounds/blocks_vertical',
      }, {
        from: 'core',
        to: 'playgrounds/core'
      }, {
        from: 'media',
        to: 'playgrounds/media'
      }, {
        from: 'msg',
        to: 'playgrounds/msg'
      }, {
        from: 'tests',
        to: 'playgrounds/tests'
      }, {
        from: '*.js',
        ignore: 'webpack.config.js',
        to: 'playgrounds'
      }])
  ]
}];
