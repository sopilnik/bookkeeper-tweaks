// The three lists the top pager works on
export type PagerKind = 'classic' | 'recode' | 'bills'

// Compared in lower case, because Xero's links mix casings
const CLASSIC_LIST_PATH = '/accountsreceivable/search.aspx'
const RECODE_PATH = '/accounts/recoding/recode'
const BILLS_LIST_PATH = /^\/app\/![^/]+\/bills\/list(\/|$)/

// The kind of list at the path: the classic invoice list, the Find and recode results or a Bills list; null for any
// other page
export function pagerKindOf(pathname: string): PagerKind | null {
  const path = pathname.toLowerCase()

  if (path === CLASSIC_LIST_PATH) {
    return 'classic'
  }

  if (path === RECODE_PATH) {
    return 'recode'
  }

  return BILLS_LIST_PATH.test(path) ? 'bills' : null
}
