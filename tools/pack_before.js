const fs = require('fs');
const path = require('path');
const GoogModuleMap = require('google-closure-library-webpack-plugin/src/goog-module-map');
const googConfig = require('../goog.config.json');

googConfig.googEntries.forEach(googEntry => {
  var options = {};
  if (googEntry.goog) {
    options.goog = googEntry.goog;
  } else {
    options.goog = path.resolve('node_modules/google-closure-library/closure/goog/base.js');
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

  var CONTENTS = [`// 注意: 这是编译生成的文件,不要编辑!!\n`];
  var moduleMap = new GoogModuleMap(options);
  for (let [sourcePath, moduleData] of moduleMap.path2Module) {
    if (
      typeof sourcePath === 'string' &&
      !(/node_modules[\\/]google-closure-library/).test(sourcePath)
    ) {
      moduleData.provides.forEach(provide => {
        CONTENTS.push(`goog.require('${provide}');`);
      });
    }
  }
  CONTENTS.push(`\nmodule.exports = ${googEntry.exportModule};\n`);
  var CONTENTS = CONTENTS.join('\n');

  const moduleMapPath = path.resolve(googEntry.moduleMapPath);
  fs.writeFileSync(moduleMapPath, CONTENTS, { encoding: 'utf8' });
});
