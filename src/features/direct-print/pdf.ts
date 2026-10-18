import type { PdfRequest } from './request'

const PDF_TYPE = 'application/pdf'
const TYPE_HEADER = 'content-type'

function isPdf(response: Response): boolean {
  return response.ok && (response.headers.get(TYPE_HEADER) ?? '').startsWith(PDF_TYPE)
}

// Asks Xero for the invoice's PDF and gives its bytes; null for an error status, an answer that is not a PDF, a failed
// request and an aborted one
export async function fetchPdf(request: PdfRequest, signal: AbortSignal): Promise<Blob | null> {
  try {
    const response = await fetch(request.url, { ...request.init, signal })

    return isPdf(response) ? await response.blob() : null
  } catch {
    return null
  }
}
