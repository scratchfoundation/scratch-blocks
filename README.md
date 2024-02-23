# scratch-blocks

Scratch Blocks is a library for building creative computing interfaces.

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/LLK/scratch-blocks/tree/develop.svg?style=shield)](https://dl.circleci.com/status-badge/redirect/gh/LLK/scratch-blocks/tree/develop)

![An image of Scratch Blocks running on a tablet](https://cloud.githubusercontent.com/assets/747641/15227351/c37c09da-1854-11e6-8dc7-9a298f2b1f01.jpg)

## Introduction

Scratch Blocks is a fork of Google's [Blockly](https://github.com/google/blockly) project that provides a design
specification and codebase for building creative computing interfaces. Together with the [Scratch Virtual Machine
(VM)](https://github.com/scratchfoundation/scratch-vm) this codebase allows for the rapid design and development of visual
programming interfaces. Unlike [Blockly](https://github.com/google/blockly), Scratch Blocks does not use [code
generators](https://developers.google.com/blockly/guides/configure/web/code-generators), but rather leverages the
[Scratch Virtual Machine](https://github.com/scratchfoundation/scratch-vm) to create highly dynamic, interactive programming
environments.

*This project is in active development and should be considered a "developer preview" at this time.*

## Two Types of Blocks

![A divided image showing horizontal blocks on the left and vertical blocks on the right](https://cloud.githubusercontent.com/assets/747641/15255731/dad4d028-190b-11e6-9c16-8df7445adc96.png)

Scratch Blocks brings together two different programming "grammars" that the Scratch Team has designed and continued
to refine over the past decade. The standard [Scratch](https://scratch.mit.edu) grammar uses blocks that snap together
vertically, much like LEGO bricks. For our [ScratchJr](https://scratchjr.org) software, intended for younger children,
we developed blocks that are labelled with icons rather than words, and snap together horizontally rather than
vertically. We have found that the horizontal grammar is not only friendlier for beginning programmers but also better
suited for devices with small screens.

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
