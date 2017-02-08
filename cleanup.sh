#!/bin/bash

# Script for cleaning up blockly-specific files when merging blockly into scratch-blocks
# Removes files and directories that scratch-blocks doesn't want.
# Rachel Fenichel (fenichel@google.com)

# On separate lines so that a failure to find one doesn't block removal of the other directories.
git rm -rf accessible
git rm -rf demos
git rm -rf tests/generators
git rm -rf appengine
git rm -rf blocks
git rm blockly_compressed.js
git rm blockly_uncompressed.js
git rm blocks_compressed.js
git rm -f tests/playground.html core/block_render_svg.js

# Turn on more powerful globbing
shopt -s extglob

# Having trouble with directories.  Let's just go there.
cd msg/json
git rm -f !(en.json)
cd ../..

# Having trouble with directories.  Let's just go there.
cd msg/js
git rm -f !(en.js)
cd ../..

# Turn powerful globbing off again
shopt -u extglob
