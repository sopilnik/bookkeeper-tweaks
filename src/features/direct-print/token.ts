// Where Xero's new app keeps its sign-in session, as read on the demo company: a JSON object in the page's
// sessionStorage with the access token and its expiry in seconds
export const SESSION_KEY = 'oidc.user:https://identity.xero.com:xero_business_go'

const MS_PER_SECOND = 1000

interface StoredSession {
  access_token?: unknown
  expires_at?: unknown
}

function parseSession(raw: string): StoredSession | null {
  try {
    const parsed: unknown = JSON.parse(raw)

    return typeof parsed === 'object' && parsed !== null ? parsed : null
  } catch {
    return null
  }
}

function isExpired(expiresAt: unknown, nowMs: number): boolean {
  return typeof expiresAt === 'number' && expiresAt * MS_PER_SECOND <= nowMs
}

// The access token of Xero's session as the page stored it; null without a session, without a token, for text that
// is not a session, and once the token has expired
export function accessTokenOf(raw: string | null, nowMs: number): string | null {
  const session = raw === null ? null : parseSession(raw)
  const token = session?.access_token

  if (typeof token !== 'string' || isExpired(session?.expires_at, nowMs)) {
    return null
  }

  return token
}
