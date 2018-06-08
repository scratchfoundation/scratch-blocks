const fs = require('fs');
const path = require('path');
const glob = require('glob');
const assert = require('assert');

// Globals
const PATH_INPUT = path.resolve(__dirname, '../msg/json/*.json');
const PATH_OUTPUT = path.resolve(__dirname, '../msg');

let en = fs.readFileSync(path.resolve(__dirname, '../msg/json/en.json'));
en = JSON.parse(en);
const enKeys = Object.keys(en).sort().toString();

// Check that translation is valid:
// elt: array [key, translation] from <locale>.json
// - messages with placeholders have the same number of placeholders
const validatePlaceholders = function (elt) {
    const re = /(%\d)/g;
    const [key, translation] = elt;
    const placeholdersCount = en[key].match(re) ? en[key].match(re).length : 0;
    if (placeholdersCount > 0) {
      const tMatch = translation.match(re);
      const enMatch = en[key].match(re);
      assert.notStrictEqual(tMatch, null, `${key} is missing a placeholder: ${translation}`);
      assert.strictEqual(
          tMatch.sort().toString(),
          enMatch.sort().toString(),
          `${key} is missing or has duplicate placeholders: ${translation}`
      );
    }
};

const validate = function (json, name) {
    // this is a little stricter than we need - it would be harmless if the translation had extra keys
    assert.strictEqual(Object.keys(json).sort().toString(), enKeys, `${name}: Locale json keys do not match en.json`);
    Object.entries(json).forEach(validatePlaceholders);
};

let file = '';
file += '// This file was automatically generated.  Do not modify.\n';
file += '\n';
file += '\'use strict\';\n';
file += '\n';
file += `goog.provide(\'Blockly.ScratchMsgs.locales\');\n`;
file += `goog.require(\'Blockly.ScratchMsgs\');\n`;
file += '\n';

let files = glob.sync(PATH_INPUT);
files.forEach(function (uri) {
    const name = path.parse(uri).name;
    if (name !== 'qqq' && name !== 'synonyms') {
      let body = fs.readFileSync(uri);
      // Convert file body into an object (let this throw if invalid JSON)
      body = JSON.parse(body);
      validate(body, name);
      file += '\n';
      file += `Blockly.ScratchMsgs.locales["${name}"] =\n`;
      file += JSON.stringify(body, null, 4);
      file += ';\n';
    }
});

// write combined file
fs.writeFileSync(`${PATH_OUTPUT}/scratch_msgs.js`, file);
