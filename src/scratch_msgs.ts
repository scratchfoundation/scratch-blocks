/**
 * Copyright 2026 Scratch Foundation
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core'
import blocksMsgs from 'scratch-l10n/locales/blocks-msgs.js'
import en from '../msg/json/en.json'

type Messages = Record<string, string>

/** A message key defined in this repository's English source. */
export type ScratchMessageKey = keyof typeof en

/**
 * Blockly core message keys that read the same text as a Scratch message, mapped to that Scratch key. Transifex
 * holds the translation under the Scratch key.
 */
const BLOCKLY_ALIASES: Record<string, ScratchMessageKey> = {
  // The block context menu's Duplicate item.
  DUPLICATE_BLOCK: 'DUPLICATE',
}

/**
 * Localized strings for Scratch blocks and workspace UI.
 *
 * English comes from this repository's `msg/json/en.json`, so new strings are usable before they are translated.
 * Every other locale comes from scratch-l10n, which pulls reviewed translations from Transifex.
 */
export class ScratchMsgs {
  static currentLocale_ = 'en'
  static locales: Record<string, Messages> = { ...blocksMsgs, en }

  /**
   * Apply a locale's messages to `Blockly.Msg`.
   * @param locale A key of `ScratchMsgs.locales`, such as `'de'` or `'pt-br'`.
   */
  static setLocale(locale: string): void {
    const messages = this.getLocaleMessages(locale)
    if (!messages) {
      console.warn('Ignoring unrecognized locale: ' + locale)
      return
    }
    this.currentLocale_ = locale
    // Apply English first so any key this locale lacks falls back to English instead of keeping the previous
    // locale's text.
    Object.assign(Blockly.Msg, this.locales.en, messages)
    for (const [blocklyKey, scratchKey] of Object.entries(BLOCKLY_ALIASES)) {
      Blockly.Msg[blocklyKey] = Blockly.Msg[scratchKey]
    }
  }

  /**
   * Look up a message without changing the current locale.
   * @param msgId The message key.
   * @param defaultMsg Returned when the locale has no translation for `msgId`.
   * @param useLocale The locale to use instead of the current one.
   * @returns The translation, else `defaultMsg`, else the English message.
   */
  static translate(msgId: ScratchMessageKey, defaultMsg?: string, useLocale?: string): string
  static translate(msgId: string, defaultMsg: string, useLocale?: string): string
  static translate(msgId: string, defaultMsg?: string, useLocale?: string): string | undefined
  static translate(msgId: string, defaultMsg?: string, useLocale?: string): string | undefined {
    return this.getLocaleMessages(useLocale ?? this.currentLocale_)?.[msgId] ?? defaultMsg ?? this.locales.en[msgId]
  }

  private static getLocaleMessages(locale: string): Messages | undefined {
    return Object.prototype.hasOwnProperty.call(this.locales, locale) ? this.locales[locale] : undefined
  }
}
