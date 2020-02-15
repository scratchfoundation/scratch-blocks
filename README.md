# scratch-blocks
#### Scratch Blocks is a library for building creative computing interfaces.
[![Build Status](https://travis-ci.org/LLK/scratch-blocks.svg?branch=develop)](https://travis-ci.org/LLK/scratch-blocks)
[![Dependency Status](https://david-dm.org/LLK/scratch-blocks.svg)](https://david-dm.org/LLK/scratch-blocks)
[![devDependency Status](https://david-dm.org/LLK/scratch-blocks/dev-status.svg)](https://david-dm.org/LLK/scratch-blocks#info=devDependencies)

![](https://cloud.githubusercontent.com/assets/747641/15227351/c37c09da-1854-11e6-8dc7-9a298f2b1f01.jpg)

## Introduction
Scratch Blocks is a fork of Google's [Blockly](https://github.com/google/blockly) project that provides a design specification and codebase for building creative computing interfaces. Together with the [Scratch Virtual Machine (VM)](https://github.com/LLK/scratch-vm) this codebase allows for the rapid design and development of visual programming interfaces.

*This project is in active development and should be considered a "developer preview" at this time.*

## Two Types of Blocks

![](https://cloud.githubusercontent.com/assets/747641/15255731/dad4d028-190b-11e6-9c16-8df7445adc96.png)

Scratch Blocks brings together two different programming "grammars" that the Scratch Team has designed and continued to refine over the past decade. The standard [Scratch](https://scratch.mit.edu) grammar uses blocks that snap together vertically, much like LEGO bricks. For our [ScratchJr](https://scratchjr.org) software, intended for younger children, we developed blocks that are labelled with icons rather than words, and snap together horizontally rather than vertically. We have found that the horizontal grammar is not only friendlier for beginning programmers but also better suited for devices with small screens.

## Documentation
The "getting started" guide including [FAQ](https://scratch.mit.edu/developers#faq) and [design documentation](https://github.com/LLK/scratch-blocks/wiki/Design) can be found in the [wiki](https://github.com/LLK/scratch-blocks/wiki).

## Internationalization and translations
The scratch-blocks project aims to implement internationalization (i18n) for a wide variety of languages.

We use the [Transifex](https://www.transifex.com/llk/public/) service to facilitate translation of Scratch Blocks by an international network of volunteers.

### Source file
* `msg/messages.js` is the source file for English strings. *Add new strings to this file directly.*

### Generated files
* `msg/json/en.json` is generated from `messages.js`. `en.json` is used to upload to Transifex (which requires JSON, not raw js). *Developers should not edit this file directly.*
* `msg/js/en.js` is also generated from `messages.js`. `en.js` is used only by Blockly, and not used in Scratch. *Developers should not edit this file directly.*

### Production file
* `msg/scratch_msgs.js` is generated from Transifex data, and used by Scratch Blocks code when running. It is structured as a single object with a key-value pair for each supported locale; the value contains the translations for each string. *See note in "Development workflow" below about when to edit this file.*

### Translation scripts
* `npm run translate:sync:translations` downloads the latest translations from Transifex, and updates `msg/scratch_msgs.js` with them. It validates messages, so it can fail if there are errors in translations, such as invalid syntax. However, note that only approved users have privileges to run this script.

### Development workflow
Currently the source file `messages.js` and the translation file `scratch_msgs.js` must be kept in sync, or the test:messages task will fail.

We do this daily using a scheduled cron job, but if you wish to develop locally with new strings defined, you will have to manually add your new strings to `scratch_msgs.js`. You can simply use the same English string; it will eventually be replaced with a proper translation.

*If you submit a pull request which adds new strings to `messages.js`, your pull request should also include adding the strings to each locale in `scratch_msgs.js`.*

## Donate
We provide [Scratch](https://scratch.mit.edu) free of charge, and want to keep it that way! Please consider making a [donation](https://secure.donationpay.org/scratchfoundation/) to support our continued engineering, design, community, and resource development efforts. Donations of any size are appreciated. Thank you!
