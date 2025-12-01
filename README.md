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

## Building Scratch Blocks on Windows (Known Issues & Workarounds)

Scratch Blocks uses an older build pipeline based on the Google Closure Compiler, Python 2, and Node.js v10.
Because of this, building on Windows is known to fail due to OS command-length limits and deprecated tooling.

## Common Windows Errors

You may encounter:

```bash
The command line is too long
```

or: 

```bash
Module not found: Error: Can't resolve '../blockly_compressed_horizontal'
```

These issues are caused by:
- Windows’ 8191-character command length limit
- Deprecated Closure Compiler dependencies
- Python 2 syntax in build.py
- Incompatibility with modern Node.js versions
- Differences in Windows path handling

Related issue:  
**[#2080: Some build steps fail with "The command line is too long"](https://github.com/LLK/scratch-blocks/issues/2080)**


## Recommended: Build Using WSL 2 (Windows Subsystem for Linux)

For Windows users, the Scratch development team and community highly recommend using WSL 2.
This avoids Windows path limitations and provides a Linux-compatible build environment.

### Steps to Build Using WSL 2

1. Install WSL:
```powershell
wsl --install
```
2. Launch Ubuntu (WSL)
3. Install Node.js v10 inside WSL:
```bash
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt install -y nodejs
```
4. Install Python 2 (required for build.py).
Ubuntu 24.04 removed Python 2, so install it using pyenv:
```bash
curl https://pyenv.run | bash
pyenv install 2.7.18
pyenv local 2.7.18
```
5. Install dependencies:
```bash
npm install
```
6. Build:
```bash
python2 build.py
npm run prepublish
```
This method avoids all Windows-specific build errors.

## Node.js Version Requirements

Scratch Blocks requires Node.js 8–10.
Newer versions (12, 14, 16, 18+) will fail due to incompatible build tooling.

Check your Node version:
```bash
node -v
```

## Python Requirement (Python 2 Only)

The build.py script relies on Python 2 syntax and older regex patterns.
Running it under Python 3 may show warnings such as:

```bash
SyntaxWarning: invalid escape sequence
```

Install Python 2 using pyenv:
```bash
Install Python 2 using pyenv:
```

## Troubleshooting (For Windows)

❗ “The command line is too long”

Occurs only on Windows.
Solution: Build using WSL 2.

❗ Missing blockly_compressed_horizontal.js or vertical.js

Caused by outdated Closure Compiler behavior on Windows.
Solution: Use WSL 2.

❗ Deprecation warnings during npm install

Expected — scratch-blocks uses legacy dependencies.
These warnings do not affect functionality inside WSL.