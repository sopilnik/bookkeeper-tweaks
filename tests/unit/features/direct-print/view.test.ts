import { describe, expect, it } from 'vitest'
import { invoiceViewOf } from '../../../../src/features/direct-print/view'

const VIEW_PATH = '/app/!tmGS8/invoicing/view/a909dda4-555b-414b-a395-ba7a4077de72'
const OTHER_CASING = '/APP/!tmGS8/Invoicing/View/A909DDA4-555B-414B-A395-BA7A4077DE72'
const TRAILING_SLASH = '/app/!tmGS8/invoicing/view/a909dda4-555b-414b-a395-ba7a4077de72/'
const EDITOR_PATH = '/app/!tmGS8/invoicing/edit/a909dda4-555b-414b-a395-ba7a4077de72'
const SHORT_ID = '/app/!tmGS8/invoicing/view/12345'

describe('invoiceViewOf', () => {
  it('reads the organisation and the invoice from the view path', () => {
    expect(invoiceViewOf(VIEW_PATH)).toEqual({ tenant: '!tmGS8', invoiceId: 'a909dda4-555b-414b-a395-ba7a4077de72' })
  })

  it('takes any casing and a trailing slash', () => {
    expect(invoiceViewOf(OTHER_CASING)?.invoiceId).toBe('A909DDA4-555B-414B-A395-BA7A4077DE72')
    expect(invoiceViewOf(TRAILING_SLASH)?.tenant).toBe('!tmGS8')
  })

  it('gives null on any other page', () => {
    expect(invoiceViewOf(EDITOR_PATH)).toBeNull()
    expect(invoiceViewOf(SHORT_ID)).toBeNull()
  })
})
