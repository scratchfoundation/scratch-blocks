/**
 * @fileoverview
 * Script to upload a source en.json file to a particular transifex project resource.
 * Expects that the project and resource have already been defined in Transifex, and that
 * the person running the script has the the TX_TOKEN environment variable set to an api
 * token that has developer access.
 */

// Fail immediately if the TX_TOKEN is not defined
if (!process.env.TX_TOKEN) {
  console.error(new Error('You must be a Scratch Team member and set your TX_TOKEN to sync with Transifex'));
  process.exit(1);
};

const fs = require('fs');
const path = require('path');
const transifex = require('transifex');

const args = process.argv.slice(2);

if (args.length < 3) {
    process.stdout.write('Usage:\n');
    process.stdout.write(
      '    node sync_tx_src.js tx-project tx-resource english-json-file\n' +
      '      tx-project: the project slug on transifex\n' +
      '      tx-resource: the resource slug on transifex\n' +
      '      english-json-file: path to the en.json source\n'
    );
    process.exit(1);
}

// Globals
const PROJECT = args[0];
const RESOURCE = args[1];
const TX = new transifex({
  project_slug: PROJECT,
  credential: 'api:' + process.env.TX_TOKEN
});

let en = fs.readFileSync(path.resolve(args[2]));
en = JSON.parse(en);

// update Transifex with English source
TX.uploadSourceLanguageMethod(PROJECT, RESOURCE, {content: JSON.stringify(en)}, (err, status) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  process.exit(0);
});
