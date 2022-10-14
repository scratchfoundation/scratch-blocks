#!/usr/bin/env node

/**
 * @fileoverview
 * Script to pull translations for blocks from transifex and generate the scratch_msgs file.
 * Expects that the project and resource have already been defined in Transifex, and that
 * the person running the script has the the TX_TOKEN environment variable set to an api
 * token that has developer access.
 */

 const usage = `
 Pull supported language translations from Transifex. Usage:
   node sync_tx_translations.js
   NOTE: TX_TOKEN environment variable needs to be set with a Transifex API token. See
   the Localization page on the GUI wiki for information about setting up Transifex.
 `;
// Fail immediately if the TX_TOKEN is not defined
if (!process.env.TX_TOKEN || process.argv.length !== 2) {
  process.stdout.write(usage);
  process.exit(1);
};

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const locales = require('scratch-l10n').default;
const {txPull} = require('scratch-l10n/lib/transifex.js');

// Globals
const PATH_OUTPUT = path.resolve(__dirname, '../msg');
const PROJECT = 'scratch-editor'
const RESOURCE = 'blocks';
const MODE = 'reviewed';



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

let localeMap = {
  'aa-dj': 'aa_DJ',
  'es-419': 'es_419',
  'pt-br': 'pt_BR',
  'zh-cn': 'zh_CN',
  'zh-tw': 'zh_TW'
};

const getLocaleData = async function (locale) {
    let txLocale = localeMap[locale] || locale;
    const data = await txPull(PROJECT, RESOURCE, txLocale, MODE);
    return {
        locale: locale,
        translations: data
    };
};

Promise.all(Object.keys(locales).map(getLocaleData)).then(function (values) {
  values.forEach(function (translation) {
    validate(translation.translations, translation.locale);
    file += '\n';
    file += `Blockly.ScratchMsgs.locales["${translation.locale}"] =\n`;
    file += JSON.stringify(translation.translations, null, 4);
    file += ';\n';
  });
  file += '// End of combined translations\n';
  // write combined file
  fs.writeFileSync(`${PATH_OUTPUT}/scratch_msgs.js`, file);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
