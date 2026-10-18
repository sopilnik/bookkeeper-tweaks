const LOCALE = 'en'
const LETTERS_ONLY: Intl.CollatorOptions = { sensitivity: 'base' }

// Orders descriptions as a person reads them, ignoring case and accents; a missing description counts as empty, so
// it comes first from A to Z
export function compareDescriptions(a: unknown, b: unknown): number {
  return String(a ?? '').localeCompare(String(b ?? ''), LOCALE, LETTERS_ONLY)
}
