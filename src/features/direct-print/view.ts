// An approved invoice in the new app (/app/!<org>/invoicing/view/<id>): the organisation's short code, which Xero's
// own requests send as a header, and the invoice's id. Any casing matches, because Xero's links mix casings; both
// parts keep the casing of the path
const INVOICE_VIEW_PATH = /^\/app\/(![^/]+)\/invoicing\/view\/([0-9a-f-]{36})\/?$/i

export interface InvoiceView {
  tenant: string
  invoiceId: string
}

// The invoice the path shows; null on any other page
export function invoiceViewOf(pathname: string): InvoiceView | null {
  const match = INVOICE_VIEW_PATH.exec(pathname)

  return match ? { tenant: match[1], invoiceId: match[2] } : null
}
