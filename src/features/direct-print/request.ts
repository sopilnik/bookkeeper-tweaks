import type { InvoiceView } from './view'

export interface PdfRequest {
  url: string
  init: RequestInit
}

// The headers Xero's own PDF request carries besides the browser's, as read on the demo company: the session's token,
// the organisation, the client and app names, and an id per request
const ACCEPT_ANY = '*/*'
const CLIENT_NAME = 'xero-secure-fetch'
const APP_NAME = 'Invoicing'
const WITH_COOKIES: RequestCredentials = 'include'
// The address is whole, never relative to the page, so no base URL in the page can send the token elsewhere; Xero
// answers it without a redirect, and a redirect fails the request
const PDF_URL = (invoiceId: string): string => `https://go.xero.com/api/invoicing/invoice/${invoiceId}/pdf`
const NO_REDIRECT: RequestRedirect = 'error'
const BEARER = (token: string): string => `Bearer ${token}`

// Xero's own request for the invoice's PDF, made with the session's token and a fresh correlation id
export function pdfRequestOf(view: InvoiceView, token: string, correlationId: string): PdfRequest {
  return {
    url: PDF_URL(view.invoiceId),
    init: {
      credentials: WITH_COOKIES,
      redirect: NO_REDIRECT,
      headers: {
        Accept: ACCEPT_ANY,
        Authorization: BEARER(token),
        'X-Client': CLIENT_NAME,
        'Xero-Correlation-Id': correlationId,
        'Xero-Shell-App-Name': APP_NAME,
        'Xero-Tenant-Shortcode': view.tenant,
      },
    },
  }
}
