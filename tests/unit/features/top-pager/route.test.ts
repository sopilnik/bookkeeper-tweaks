import { describe, expect, it } from 'vitest'
import type { PagerKind } from '../../../../src/features/top-pager/route'
import { pagerKindOf } from '../../../../src/features/top-pager/route'

// Paths as Xero's links write them, and in other casings
const LISTS: [string, PagerKind][] = [
  ['/AccountsReceivable/Search.aspx', 'classic'],
  ['/accountsreceivable/search.aspx', 'classic'],
  ['/Accounts/Recoding/Recode', 'recode'],
  ['/app/!tmGS8/bills/list/all', 'bills'],
  ['/app/!tmGS8/bills/list', 'bills'],
  ['/app/!tmGS8/Bills/List/awaiting-payment', 'bills'],
]
const OTHER_PAGES = [
  '/Accounts/Recoding',
  '/AccountsReceivable/SearchRepeating.aspx',
  '/app/!tmGS8/bills/listing',
  '/app/!tmGS8/contacts/customers',
]

describe('pagerKindOf', () => {
  it('knows the three lists in any casing', () => {
    expect(LISTS.map(([path]) => pagerKindOf(path))).toEqual(LISTS.map(([, kind]) => kind))
  })

  it('gives null for every other page', () => {
    expect(OTHER_PAGES.map(pagerKindOf)).toEqual([null, null, null, null])
  })
})
