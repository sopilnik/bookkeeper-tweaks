// Find and recode with its results, compared in lower case, because Xero's links mix casings
const RECODE_PATH = '/accounts/recoding/recode'

export function isRecodeResultsPath(pathname: string): boolean {
  return pathname.toLowerCase() === RECODE_PATH
}
