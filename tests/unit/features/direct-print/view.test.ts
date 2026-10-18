import { describe, expect, it } from 'vitest'
import { invoiceViewOf } from '../../../../src/features/direct-print/view'

const VIEW_PATH = '/app/!demo0/invoicing/view/aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee'
const OTHER_CASING = '/APP/!demo0/Invoicing/View/AAAAAAAA-BBBB-4CCC-8DDD-EEEEEEEEEEEE'
const TRAILING_SLASH = '/app/!demo0/invoicing/view/aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee/'
const EDITOR_PATH = '/app/!demo0/invoicing/edit/aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee'
const SHORT_ID = '/app/!demo0/invoicing/view/12345'

describe('invoiceViewOf', () => {
  it('reads the organisation and the invoice from the view path', () => {
    expect(invoiceViewOf(VIEW_PATH)).toEqual({ tenant: '!demo0', invoiceId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee' })
  })

  it('takes any casing and a trailing slash', () => {
    expect(invoiceViewOf(OTHER_CASING)?.invoiceId).toBe('AAAAAAAA-BBBB-4CCC-8DDD-EEEEEEEEEEEE')
    expect(invoiceViewOf(TRAILING_SLASH)?.tenant).toBe('!demo0')
  })

  it('gives null on any other page', () => {
    expect(invoiceViewOf(EDITOR_PATH)).toBeNull()
    expect(invoiceViewOf(SHORT_ID)).toBeNull()
  })
})
