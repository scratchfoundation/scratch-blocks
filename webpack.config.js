const path = require('path');
const defaultsDeep = require('lodash.defaultsDeep');
const GoogClosureLibraryPlugin = require('google-closure-library-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
var CopyPlugin = require('copy-webpack-plugin');
const googConfig = require('./goog.config.json');

const MODE = process.env.NODE_ENV === 'production' ? 'production' : 'development';

const base = {
  mode: MODE,
  devtool: 'cheap-module-source-map',
  output: {
    path: path.resolve('dist'),
    filename: '[name].js',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  module: {
    rules: [{
      test: /\.(svg|png|wav|gif|jpg)$/,
      loader: 'file-loader',
      options: {
        outputPath: `static/assets/`,
      }
    }]
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          ecma: 2017,
        },
      })
    ]
  },
  plugins: [
  ]
};

module.exports = googConfig.googEntries.map(googEntry => {
  var append = {
    entry: {
      [googEntry.name]: path.resolve(googEntry.moduleMapPath)
    },
    output: {
      // using the goog top level name as bundle name.
      library: googEntry.exportModule
    }
  };

  var options = {};
  if (googEntry.goog) {
    options.goog = googEntry.goog;
  }
  if (googEntry.sources) {
    const sources = Array.isArray(googEntry.sources) ?
      googEntry.sources : [googEntry.sources];
    options.sources = sources;
  }
  if (googEntry.excludes) {
    const excludes = Array.isArray(googEntry.excludes) ?
      googEntry.excludes : [googEntry.excludes];
    options.excludes = excludes;
  }
  append.plugins = base.plugins.concat([
    new GoogClosureLibraryPlugin(options)
  ]);

  return defaultsDeep({}, base, append);
}).concat([{
  mode: MODE,
  entry: path.resolve('shim/gh-pages.js'),
  output: {
    path: path.resolve('gh-pages')
  },
  plugins: base.plugins.concat([
    new CopyPlugin({
      patterns: [
        { from: 'tests/*.html', to: 'playgrounds/', flatten: true },
        { from: 'media', to: 'media' }
      ]
    })
  ])
}]);
