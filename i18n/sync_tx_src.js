const fs = require('fs');
const path = require('path');
const transifex = require('transifex');

// Globals
const PROJECT = 'scratch-editor';
const RESOURCE = 'blocks';
const TX = new transifex({
  project_slug: PROJECT,
  credential: 'api:' + process.env.TX_TOKEN
});

let en = fs.readFileSync(path.resolve(__dirname, '../msg/json/en.json'));
en = JSON.parse(en);

if (!process.env.TX_TOKEN) {
  console.log('ERROR: You must be a Scratch Team member and set your TX_TOKEN to sync with Transifex');
  process.exit(1);
};

// update Transifex with English source
TX.uploadSourceLanguageMethod(PROJECT, RESOURCE, {content: JSON.stringify(en)}, (err, status) => {
  if (err) {
    console.log('ERROR: ', err.message);
    process.exit(1);
  }
  process.exit(0);
});
