#!/usr/bin/env node
/**
 * Copyright 2026 Scratch Foundation
 * SPDX-License-Identifier: Apache-2.0
 *
 * Checks msg/json/en.json, the English source pushed to Transifex, before it is pushed.
 */
import console from 'node:console'
import fs from 'node:fs'
import process from 'node:process'
import { URL, fileURLToPath } from 'node:url'

const file = process.argv[2] ?? fileURLToPath(new URL('../msg/json/en.json', import.meta.url))

const messages = JSON.parse(fs.readFileSync(file, 'utf8'))
const errors = []
for (const [key, value] of Object.entries(messages)) {
  if (!/^[A-Z][A-Z0-9_]*$/.test(key)) errors.push(`${key}: key must be UPPER_SNAKE_CASE`)
  if (typeof value !== 'string' || !value.trim()) errors.push(`${key}: value must be a non-empty string`)
  else if (value.includes('\n')) errors.push(`${key}: value must not contain a newline`)
}

if (errors.length > 0) {
  console.error(`${file}:\n  ${errors.join('\n  ')}`)
  process.exit(1)
}
console.log(`${file}: ${Object.keys(messages).length} messages OK`)
