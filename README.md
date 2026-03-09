# scratch-blocks

Scratch Blocks is a library for building creative computing interfaces.

![An image of Scratch Blocks running on a tablet](https://cloud.githubusercontent.com/assets/747641/15227351/c37c09da-1854-11e6-8dc7-9a298f2b1f01.jpg)

## Version 2.0

The Scratch and Blockly teams are excited to announce the release of Scratch Blocks 2.0! This release is no longer a
fork of Blockly, but rather depends on Blockly as a library. We've also updated from version (mumble mumble) of
Blockly to version 12, which includes many, many bug fixes and improvements.

There will likely be a few bumps in the road as we work toward a user-facing release of this work, but we're excited
to share the code and look forward to your feedback! If you see any problems, please check the
[issues](https://github.com/scratchfoundation/scratch-blocks/issues) and if you don't see it there, please consider
filing an issue with as much detail as possible. Thank you!

## Introduction

Scratch Blocks builds on the [Blockly](https://github.com/RaspberryPiFoundation/blockly) library from Google and the
[Raspberry Pi Foundation](https://www.raspberrypi.org/), to provide a design specification and codebase for building
creative computing interfaces. Together with the
[Scratch Virtual Machine (VM)](https://github.com/scratchfoundation/scratch-vm) this codebase allows for the rapid
design and development of visual programming interfaces. Like
[Blockly](https://github.com/RaspberryPiFoundation/blockly), Scratch Blocks is written in TypeScript and bundled with
webpack. Unlike [Blockly](https://github.com/RaspberryPiFoundation/blockly), Scratch Blocks does not use
[code generators](https://developers.google.com/blockly/guides/configure/web/code-generators), but rather leverages
the [Scratch Virtual Machine](https://github.com/scratchfoundation/scratch-vm) to create highly dynamic, interactive
programming environments.

## Documentation

The "getting started" guide including [FAQ](https://scratch.mit.edu/developers#faq) and [design
documentation](https://github.com/scratchfoundation/scratch-blocks/wiki/Design) can be found in the
[wiki](https://github.com/scratchfoundation/scratch-blocks/wiki).

## Donate

We provide [Scratch](https://scratch.mit.edu) free of charge, and want to keep it that way! Please consider making a
[donation](https://secure.donationpay.org/scratchfoundation/) to support our continued engineering, design, community,
and resource development efforts. Donations of any size are appreciated. Thank you!

## Committing

This project uses [semantic release](https://github.com/semantic-release/semantic-release) to ensure version bumps
follow semver so that projects depending on it don't break unexpectedly.

In order to automatically determine version updates, semantic release expects commit messages to follow the
[conventional-changelog](https://github.com/bcoe/conventional-changelog-standard/blob/master/convention.md)
specification.

You can use the [commitizen CLI](https://github.com/commitizen/cz-cli) to make commits formatted in this way:

```bash
npm install -g commitizen@latest cz-conventional-changelog@latest
```

Now you're ready to make commits using `git cz`.
