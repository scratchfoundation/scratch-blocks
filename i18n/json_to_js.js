const async = require('async');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Globals
const PATH_INPUT = path.resolve(__dirname, '../msg/json/*.json');
const PATH_OUTPUT = path.resolve(__dirname, '../msg/js');
const CONCURRENCY_LIMIT = 4;

// Processing task
const work = function (uri, callback) {
    fs.readFile(uri, function (err, body) {
        if (err) return callback(err);

        // Convert file body into an object (let this throw if invalid JSON)
        body = JSON.parse(body);

        // File storage object and preamble
        let file = '';
        file += '// This file was automatically generated.  Do not modify.\n';
        file += '\n';
        file += '\'use strict\';\n';
        file += '\n';
        file += 'goog.provide(\'Blockly.Msg.en\');\n';
        file += 'goog.require(\'Blockly.Msg\');\n';
        file += '\n';

        // Iterate over object and build up file
        for (let i in body) {
            file += `Blockly.Msg["${i}"] = "${body[i]}";\n`
        }

        // Write file to disk
        const name = path.parse(uri).name;
        fs.writeFile(`${PATH_OUTPUT}/${name}.js`, file, callback);
    });
};

// Create async processing queue
const q = async.queue(work, CONCURRENCY_LIMIT);

// Handle errors
q.error = function (err) {
    throw new Error(err);
};

// Get all JSON files in input directory and add to queue
q.push(glob.sync(PATH_INPUT));
