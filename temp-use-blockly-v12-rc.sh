#!/usr/bin/env bash
# vim: set tw=118 ts=2 sw=2 expandtab

# This script is intended to be run from the root of the scratch-blocks repo.
# This will check out the Blockly v12 Release Candidate branch,
# build it, and link it into node_modules/

# TODO: Remove this script once Blockly v12 is available from https://www.npmjs.com/package/blockly

# WARNING: This uses `npm link`, which causes system-wide changes!

set -e -x

if [ ! -d "blockly-rc" ]; then
  git clone --branch rc/v12.0.0 --single-branch --depth 1 https://github.com/google/blockly.git blockly-rc
else
  git -C blockly-rc checkout rc/v12.0.0
  git -C blockly-rc pull
fi
npm -C blockly-rc ci
npm -C blockly-rc run package

# --legacy-peer-deps can be removed once the Blockly plugins used by scratch-blocks support Blockly v12
# --prefer-offline speeds this up by roughly 2x on my computer (!!)
# --prefer-offline should be OK since we're probably running immediately after a non-offline `npm i` or `npm ci`
npm link --prefer-offline --legacy-peer-deps blockly-rc/dist/
