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

// Match function
const match = function (str) {
    if (str.indexOf('Blockly.ScratchMsgs.locales') !== 0) return true;
    if (str.indexOf('": "') !== 0) return true;
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
          // locale changed, validate the current collection of keys
          try {
              validateKeys();
          }
          catch (err) {
            console.log('Key validation FAILED:', err.message);
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
        if (err) throw new Error(err);
        process.exit(0)
    }));
