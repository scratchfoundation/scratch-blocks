/**
 * Copyright 2026 Scratch Foundation
 * SPDX-License-Identifier: Apache-2.0
 */
declare module 'scratch-l10n' {
  /** The locales Scratch supports, keyed by locale code. */
  const locales: Record<string, { name: string }>
  export default locales
}

declare module 'scratch-l10n/locales/blocks-msgs.js' {
  /** Reviewed block translations from Transifex, keyed by locale, then by message key. */
  const blocksMsgs: Record<string, Record<string, string>>
  export default blocksMsgs
}
