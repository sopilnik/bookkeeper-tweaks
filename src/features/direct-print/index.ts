import { showNotice } from '../../shared/notice'
import type { PrintControl } from './control'
import { createPrintControl, setBusy, showOpenNote } from './control'
import { printInFrame } from './frame'
import { keepBeforeGroup } from './keeper'
import { fetchPdf } from './pdf'
import { pdfRequestOf } from './request'
import { accessTokenOf, SESSION_KEY } from './token'
import type { InvoiceView } from './view'
import { invoiceViewOf } from './view'

interface PrintJob {
  view: InvoiceView
  control: PrintControl
  signal: AbortSignal
}

// Xero's print group in the invoice view header, as read on the demo company
const GROUP_SELECTOR = 'div.PrintDropdown-group'
const FAILURE_MESSAGE = 'Could not load the PDF — use Print PDF.'
// The printed PDF stays in its frame and in the note for a minute; then both go and its url is freed
const KEEP_MS = 60000
const NOTHING_TO_UNDO = (): void => {}

// The invoice's PDF, asked for with the session's token as the page holds it now; null without a token or when Xero
// gives none
function loadPdf(view: InvoiceView, signal: AbortSignal): Promise<Blob | null> {
  const token = accessTokenOf(sessionStorage.getItem(SESSION_KEY), Date.now())

  if (token === null) {
    return Promise.resolve(null)
  }

  const request = pdfRequestOf(view, token, crypto.randomUUID())

  return fetchPdf(request, signal)
}

// Prints the PDF in a hidden frame and offers it in the note; the returned function removes both and frees the url,
// which also happens by itself after a minute
function presentPdf(control: PrintControl, pdf: Blob): () => void {
  const url = URL.createObjectURL(pdf)
  const removeFrame = printInFrame(url)
  const removeNote = showOpenNote(control, url)
  const remove = (): void => {
    clearTimeout(timer)
    removeFrame()
    removeNote()
    URL.revokeObjectURL(url)
  }
  const timer = setTimeout(remove, KEEP_MS)

  return remove
}

// One click: the button is busy while the PDF loads; then the PDF prints, or a notice says it could not load — not when
// the load was stopped with the feature. Gives the function that removes what the click left on the page
async function printOnce(job: PrintJob): Promise<() => void> {
  setBusy(job.control, true)

  const pdf = await loadPdf(job.view, job.signal)

  setBusy(job.control, false)

  if (pdf) {
    return presentPdf(job.control, pdf)
  }

  if (job.signal.aborted) {
    return NOTHING_TO_UNDO
  }

  return showNotice(job.control.element, FAILURE_MESSAGE)
}

// Feature 2 on an approved invoice: a Print button before Xero's print group prints the invoice's PDF without
// downloading it. The returned function stops it, cancels a load still running and removes everything it added
export function activateDirectPrint(root: ParentNode & Node, pathname: string, enabled: boolean): () => void {
  const view = invoiceViewOf(pathname)

  if (!enabled || !view) {
    return NOTHING_TO_UNDO
  }

  const controller = new AbortController()
  let removeLast = NOTHING_TO_UNDO
  const control = createPrintControl(() => {
    void printOnce({ view, control, signal: controller.signal }).then((remove) => {
      removeLast()
      removeLast = remove
    })
  })
  const stopKeeping = keepBeforeGroup(root, control.element, GROUP_SELECTOR)

  return () => {
    controller.abort()
    removeLast()
    stopKeeping()
  }
}
