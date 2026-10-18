import { describe, expect, it } from 'vitest'
import { pdfRequestOf } from '../../../../src/features/direct-print/request'

const VIEW = { tenant: '!demo0', invoiceId: '00000000-0000-0000-0000-000000000000' }
const TOKEN = 'header.payload.signature'
const CORRELATION_ID = '11111111-1111-4111-8111-111111111111'

describe('pdfRequestOf', () => {
  it('asks for the invoice\'s PDF at Xero\'s own address, with the page\'s cookies and no redirect', () => {
    const request = pdfRequestOf(VIEW, TOKEN, CORRELATION_ID)

    expect(request.url).toBe('https://go.xero.com/api/invoicing/invoice/00000000-0000-0000-0000-000000000000/pdf')
    expect(request.init.credentials).toBe('include')
    expect(request.init.redirect).toBe('error')
  })

  it('sends the headers Xero\'s own request sends', () => {
    expect(pdfRequestOf(VIEW, TOKEN, CORRELATION_ID).init.headers).toEqual({
      Accept: '*/*',
      Authorization: 'Bearer header.payload.signature',
      'X-Client': 'xero-secure-fetch',
      'Xero-Correlation-Id': '11111111-1111-4111-8111-111111111111',
      'Xero-Shell-App-Name': 'Invoicing',
      'Xero-Tenant-Shortcode': '!demo0',
    })
  })
})
