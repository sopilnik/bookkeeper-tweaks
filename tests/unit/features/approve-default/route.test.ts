import { describe, expect, it } from 'vitest'
import { isInvoiceEditorRoute } from '../../../../src/features/approve-default/route'

const EDITOR_PATHS = [
  '/app/!demo0/invoicing/',
  '/app/!demo0/invoicing',
  '/app/!demo0/invoicing/edit/00000000-0000-0000-0000-000000000000',
  '/APP/!demo0/Invoicing/Edit/00000000-0000-0000-0000-000000000000',
]
const OTHER_PATHS = [
  '/app/!demo0/invoicing/view/00000000-0000-0000-0000-000000000000',
  '/app/!demo0/sales/overview',
  '/app/!demo0/bills/list/all',
  '/AccountsReceivable/Search.aspx',
]

describe('isInvoiceEditorRoute', () => {
  it.each(EDITOR_PATHS)('takes %s', (pathname) => {
    expect(isInvoiceEditorRoute(pathname)).toBe(true)
  })

  it.each(OTHER_PATHS)('leaves %s', (pathname) => {
    expect(isInvoiceEditorRoute(pathname)).toBe(false)
  })
})
