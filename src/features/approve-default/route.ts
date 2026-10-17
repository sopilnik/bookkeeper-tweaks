// A new invoice (/app/!<org>/invoicing/) and the invoice editor (/app/!<org>/invoicing/edit/<id>), compared in lower
// case because Xero's links mix casings
const INVOICE_EDITOR_PATH = /^\/app\/![^/]+\/invoicing\/?(edit\/[^/]+\/?)?$/

export function isInvoiceEditorRoute(pathname: string): boolean {
  return INVOICE_EDITOR_PATH.test(pathname.toLowerCase())
}
