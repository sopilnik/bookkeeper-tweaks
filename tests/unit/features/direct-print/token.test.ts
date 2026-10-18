import { describe, expect, it } from 'vitest'
import { accessTokenOf, SESSION_KEY } from '../../../../src/features/direct-print/token'

const NOW_MS = 1_800_000_000_000
const LATER_S = 1_800_000_600
const EARLIER_S = 1_799_999_400
const TOKEN = 'header.payload.signature'
const NOT_JSON = '{oops'
const NULL_JSON = 'null'

function sessionText(fields: object): string {
  return JSON.stringify(fields)
}

describe('accessTokenOf', () => {
  it('gives the stored token while it lasts', () => {
    expect(accessTokenOf(sessionText({ access_token: TOKEN, expires_at: LATER_S }), NOW_MS)).toBe(TOKEN)
  })

  it('gives the token when the session names no expiry', () => {
    expect(accessTokenOf(sessionText({ access_token: TOKEN }), NOW_MS)).toBe(TOKEN)
  })

  it('gives null for an expired session, one without a token, no session and unreadable text', () => {
    expect(accessTokenOf(sessionText({ access_token: TOKEN, expires_at: EARLIER_S }), NOW_MS)).toBeNull()
    expect(accessTokenOf(sessionText({ expires_at: LATER_S }), NOW_MS)).toBeNull()
    expect(accessTokenOf(null, NOW_MS)).toBeNull()
    expect(accessTokenOf(NOT_JSON, NOW_MS)).toBeNull()
    expect(accessTokenOf(NULL_JSON, NOW_MS)).toBeNull()
  })

  it('reads the session Xero\'s new app keeps', () => {
    expect(SESSION_KEY).toBe('oidc.user:https://identity.xero.com:xero_business_go')
  })
})
