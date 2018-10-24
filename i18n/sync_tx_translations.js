const fs = require('fs');
const path = require('path');
const assert = require('assert');
const transifex = require('transifex');

// Globals
const PATH_OUTPUT = path.resolve(__dirname, '../msg');
const PROJECT = 'scratch-editor'
const RESOURCE = 'blocks';
const MODE = {mode: 'default'};

const TX = new transifex({
  project_slug: PROJECT,
  credential: 'api:' + process.env.TX_TOKEN
});

let en = fs.readFileSync(path.resolve(__dirname, '../msg/json/en.json'));
en = JSON.parse(en);
const enKeys = Object.keys(en).sort().toString();

// Check that translation is valid:
// entry: array [key, translation]  corresponding to a single string from <locale>.json
// - messages with placeholders have the same number of placeholders
// - messages must not have newlines embedded
const validateEntry = function (entry) {
    const re = /(%\d)/g;
    const [key, translation] = entry;
    const enMatch = en[key].match(re);
    const tMatch = translation.match(re);
    const enCount = enMatch ? enMatch.length : 0;
    const tCount = tMatch ? tMatch.length : 0;
    assert.strictEqual(tCount, enCount, `${key}:${en[key]} - "${translation}" placeholder mismatch`);
    if (enCount > 0) {

      assert.notStrictEqual(tMatch, null, `${key} is missing a placeholder: ${translation}`);
      assert.strictEqual(
          tMatch.sort().toString(),
          enMatch.sort().toString(),
          `${key} is missing or has duplicate placeholders: ${translation}`
      );
    }
    assert.strictEqual(translation.match(/[\n]/), null, `${key} contains a newline character ${translation}`);
};

const validate = function (json, name) {
    assert.strictEqual(Object.keys(json).sort().toString(), enKeys, `${name}: Locale json keys do not match en.json`);
    Object.entries(json).forEach(validateEntry);
};

let file = `// This file was automatically generated.  Do not modify.

'use strict';

goog.provide('Blockly.ScratchMsgs.allLocales');

goog.require('Blockly.ScratchMsgs');

`;

// add English strings
file += '\n';
file += `Blockly.ScratchMsgs.locales["en"] =\n`;
file += JSON.stringify(en, null, 4);
file += ';\n';

if (!process.env.TX_TOKEN) {
  assert.fail('ERROR: You must be a Scratch Team member and set your TX_TOKEN to sync with Transifex');
};

let locales = [
    'ab',
    'am',
    'ar',
    'az',
    'ca',
    'cs',
    'cy',
    'da',
    'de',
    'el',
    'es-419',
    'es',
    'et',
    'eu',
    'fi',
    'fr',
    'ga',
    'gd',
    'gl',
    'he',
    'hu',
    'id',
    'is',
    'it',
    'ja-Hira',
    'ja',
    'ko',
    'lt',
    'lv',
    'mi',
    'nb',
    'nl',
    'nn',
    'pl',
    'pt-br',
    'pt',
    'ro',
    'ru',
    'sk',
    'sl',
    'sr',
    'sv',
    'th',
    'tr',
    'uk',
    'vi',
    'zh-cn',
    'zh-tw'
];
let localeMap = {
  'aa-dj': 'aa_DJ',
  'es-419': 'es_419',
  'pt-br': 'pt_BR',
  'zh-cn': 'zh_CN',
  'zh-tw': 'zh_TW'
};

function getLocaleData (locale) {
  let txLocale = localeMap[locale] || locale;
  return new Promise (function (resolve, reject) {
    TX.translationInstanceMethod(PROJECT, RESOURCE, txLocale, MODE, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve({
          locale: locale,
          translations: JSON.parse(data)
        });
      }
    })
  })
};

Promise.all(locales.map(getLocaleData)).then(function (values) {
  values.forEach(function (translation) {
    validate(translation.translations, translation.locale);
    file += '\n';
    file += `Blockly.ScratchMsgs.locales["${translation.locale}"] =\n`;
    file += JSON.stringify(translation.translations, null, 4);
    file += ';\n';
  });
  // write combined file
  fs.writeFileSync(`${PATH_OUTPUT}/scratch_msgs.js`, file);
}).catch((err) => {
  console.log('Someing went wrong:', err);
  process.exit(1);
});
