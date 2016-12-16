#!/bin/bash

# Script for cleaning up blockly-specific files when merging blockly into scratch-blocks
# Removes files and directories that scratch-blocks doesn't want.
# Rachel Fenichel (fenichel@google.com)

# On separate lines so that a failure to find one doesn't block removal of the other directories.
git rm -rf accessible
git rm -rf demos
git rm -rf generators
git rm -rf tests/generators
git rm -rf appengine

git rm -f python_compressed.js php_compressed.js tests/playground.html core/block_render_svg.js dart_compressed.js javascript_compressed.js lua_compressed.js

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
