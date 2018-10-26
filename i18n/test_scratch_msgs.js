const es = require('event-stream');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

// current locale and keys for the locale
let locale = '';
let keys = [];

// current English keys
let en = fs.readFileSync(path.resolve(__dirname, '../msg/json/en.json'));
en = JSON.parse(en);
const enKeys = Object.keys(en);

// File paths
const PATH_INPUT = path.resolve(__dirname, '../msg/scratch_msgs.js');

// Match lines of the scratch_msgs file
// Blockly.ScratchMsgs.locales indicates the start of a new locale
// ": " marks a "key": "value" pair
// Also match the end of the generated file so the last set of keys can be checked
const match = function (str) {
    if (str.indexOf('Blockly.ScratchMsgs.locales') !== 0) return true;
    if (str.indexOf('": "') !== 0) return true;
    if (str.indexOf('End of combined translations') !== 0) return true;
    return false;
}

// Extract key and value from message definition, or locale when it changes
const extract = function (str) {
    let m = str.match(/locales\["(.+)"\]/);
    if (m) {
      // locale changed
      return m[1];
    }
    m = str.match(/"(.*)": "(.*)",?$/);
    if (m) {
      return {
        key: m[1],
        value: m[2]
      }
    }
    // return a string for the end of the file so that validate will check the last set of keys
    m = str.match(/^\/\/ End of combined translations$/);
    if (m) return 'last';
    return null;
};

const validateKeys = function () {
    // ignore empty keys first time through
    if (keys.length === 0) return;
    assert.strictEqual(keys.length, Object.keys(en).length, `scratch_msgs-${locale}: number of keys doesn't match`);
    keys.map(item => assert(enKeys.includes(item), `scratch_msgs-${locale}: has key ${item} not in en`));
    enKeys.map(item => assert(keys.includes(item), `scratch_msgs-${locale}: is missing key ${item}`));
}

// Stream input and push each match to the storage object
const stream = fs.createReadStream(PATH_INPUT);
stream
    .pipe(es.split('\n'))
    .pipe(es.mapSync(function (str) {
        if (!match(str)) return;
        const result = extract(str);
        if (!result) return;
        if (typeof result === 'string') {
          // locale changed or end of file, validate the current collection of keys
          try {
              validateKeys();
          }
          catch (err) {
            console.error('Key validation FAILED: %O', err);
            process.exit(1);
          }
          // change locale, and reset keys array
          locale = result;
          keys = [];
        } else {
          keys.push(result.key);
        }
    }))
    .pipe(es.wait(function (err) {
        if (err) {
          console.err(err);
          process.exit(1);
        }
        process.exit(0)
    }));
