import { describe, expect, it } from 'vitest'
import { isRecodeResultsPath } from '../../../../src/features/recode-sort/route'

const RECODE_PATH = '/Accounts/Recoding/Recode'
const OTHER_CASING = '/accounts/recoding/recode'
const HISTORY_PATH = '/Accounts/Recoding'

describe('isRecodeResultsPath', () => {
  it('knows Find and recode in any casing, and nothing else', () => {
    expect(isRecodeResultsPath(RECODE_PATH)).toBe(true)
    expect(isRecodeResultsPath(OTHER_CASING)).toBe(true)
    expect(isRecodeResultsPath(HISTORY_PATH)).toBe(false)
  })
})
