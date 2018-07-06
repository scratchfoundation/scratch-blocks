const es = require('event-stream');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Storage object
const storage = {};

// File paths
const PATH_INPUT = path.resolve(__dirname, '../msg/messages.js');
const PATH_OUTPUT = path.resolve(__dirname, '../msg/json/en.json');

// Match function
const match = function (str) {
    if (str.indexOf('Blockly.Msg.') !== 0) return false;
    assert.notStrictEqual(str.indexOf('";'), str.length - 2, `[${str}] uses double quoted string, should use single quotes.`);
    if (str.indexOf("';") !== str.length - 2) return false;
    return true;
}

// Extract key and value from message definition
const extract = function (str) {
    str = str.split('Blockly.Msg.')[1].split(' ');
    return {
        key: str[0],
        value: str
            .splice(2, str.length)
            .join(' ')
            .slice(1, -2) // strip off initial ', and ending ';
            .replace(/\\'/g, "'")
    };
};

// Stream input and push each match to the storage object
const stream = fs.createReadStream(PATH_INPUT);
stream
    .pipe(es.split('\n'))
    .pipe(es.mapSync(function (str) {
        if (!match(str)) return;
        const result = extract(str);
        storage[result.key] = result.value;
    }))
    .pipe(es.wait(function (err) {
        if (err) throw new Error(err);
        fs.writeFileSync(PATH_OUTPUT, JSON.stringify(storage, null, 4));
    }));
