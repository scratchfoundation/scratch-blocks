/**
 * Copyright 2026 Scratch Foundation
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'
import supportedLocales from 'scratch-l10n'
import { afterEach, describe, expect, it } from 'vitest'
import en from '../../msg/json/en.json'
import { ScratchMsgs } from '../../src/scratch_msgs'

// A locale with a single translated key, for testing fallback to English.
const PARTIAL_LOCALE = 'x-partial'

afterEach(() => {
  delete ScratchMsgs.locales[PARTIAL_LOCALE]
  ScratchMsgs.setLocale('en')
})

describe('ScratchMsgs.locales', () => {
  it('includes every locale Scratch supports', () => {
    const supported = Object.keys(supportedLocales)
    expect(supported).toContain('pt-br')
    expect(supported.filter((locale) => !(locale in ScratchMsgs.locales))).toEqual([])
  })

  it("uses this repository's English source", () => {
    expect(ScratchMsgs.locales.en).toEqual(en)
  })
})

describe('ScratchMsgs.setLocale', () => {
  it('applies the locale to Blockly.Msg', () => {
    ScratchMsgs.setLocale('ja')
    expect(Blockly.Msg.CONTROL_FOREVER).toBe(ScratchMsgs.locales.ja.CONTROL_FOREVER)
    expect(Blockly.Msg.CONTROL_FOREVER).not.toBe(en.CONTROL_FOREVER)
  })

  it("replaces the previous locale's text with English for keys the new locale lacks", () => {
    ScratchMsgs.locales[PARTIAL_LOCALE] = { CONTROL_FOREVER: 'partial forever' }
    ScratchMsgs.setLocale('de')
    ScratchMsgs.setLocale(PARTIAL_LOCALE)
    expect(Blockly.Msg.CONTROL_FOREVER).toBe('partial forever')
    expect(Blockly.Msg.CONTROL_REPEAT).toBe(en.CONTROL_REPEAT)
  })

  it('ignores an unrecognized locale', () => {
    ScratchMsgs.setLocale('de')
    ScratchMsgs.setLocale('not-a-locale')
    expect(ScratchMsgs.currentLocale_).toBe('de')
    expect(Blockly.Msg.CONTROL_FOREVER).toBe(ScratchMsgs.locales.de.CONTROL_FOREVER)
  })

  it("gives Blockly's Duplicate menu item the translation of DUPLICATE", () => {
    ScratchMsgs.setLocale('de')
    expect(Blockly.Msg.DUPLICATE_BLOCK).toBe(ScratchMsgs.locales.de.DUPLICATE)
  })

  it.each(['en', 'de'])('defines the Blockly core messages Scratch shows (%s)', (locale) => {
    ScratchMsgs.setLocale(locale)
    for (const key of [
      'DUPLICATE_COMMENT',
      'WORKSPACE_ARIA_LABEL',
      'COLLAPSE_BLOCK',
      'EXPAND_BLOCK',
      'COLLAPSE_ALL',
      'EXPAND_ALL',
      'COLLAPSED_WARNINGS_WARNING',
    ]) {
      expect(Blockly.Msg[key], key).toBeTypeOf('string')
    }
  })
})

describe('ScratchMsgs.translate', () => {
  it('returns the translation for the requested locale', () => {
    expect(ScratchMsgs.translate('CONTROL_FOREVER', 'forever', 'de')).toBe(ScratchMsgs.locales.de.CONTROL_FOREVER)
  })

  it('falls back to the default message, then to English', () => {
    ScratchMsgs.locales[PARTIAL_LOCALE] = {}
    expect(ScratchMsgs.translate('CONTROL_REPEAT', 'default text', PARTIAL_LOCALE)).toBe('default text')
    expect(ScratchMsgs.translate('CONTROL_REPEAT', undefined, PARTIAL_LOCALE)).toBe(en.CONTROL_REPEAT)
  })
})
