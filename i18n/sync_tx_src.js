#!/usr/bin/env node

/**
 * @fileoverview
 * Script to upload a source en.json file to a particular transifex project resource.
 * Expects that the project and resource have already been defined in Transifex, and that
 * the person running the script has the the TX_TOKEN environment variable set to an api
 * token that has developer access.
 */

const fs = require('fs');
const path = require('path');
const transifex = require('transifex');

const args = process.argv.slice(2);

const usage = `
Sync English source strings with Transifex. Usage:
  node sync_tx_src.js tx-project tx-resource english-json-file
      tx-project:        the project slug on transifex
      tx-resource:       the resource slug on transifex
      english-json-file: path to the en.json source
  NOTE: TX_TOKEN environment variable needs to be set with a Transifex API token. See
  the Localization page on the GUI wiki for information about setting up Transifex.
`;

// Exit if missing arguments or TX_TOKEN
if (args.length < 3 || !process.env.TX_TOKEN) {
    process.stdout.write(usage);
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
