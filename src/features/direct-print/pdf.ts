import type { PdfRequest } from './request'

const PDF_TYPE = 'application/pdf'
const TYPE_HEADER = 'content-type'
const PARAMETERS_START = ';'
// The bytes are always typed as a PDF, so the frame and the new tab never show them as anything else
const AS_PDF: BlobPropertyBag = { type: PDF_TYPE }

// The answer's media type in lower case, without parameters; two types joined by a comma are not a PDF's
function mediaTypeOf(response: Response): string {
  return (response.headers.get(TYPE_HEADER) ?? '').split(PARAMETERS_START)[0].trim().toLowerCase()
}

function isPdf(response: Response): boolean {
  return response.ok && mediaTypeOf(response) === PDF_TYPE
}

// Asks Xero for the invoice's PDF and gives its bytes, typed as a PDF; null for an error status, an answer that is not
// exactly a PDF, a failed request and an aborted one
export async function fetchPdf(request: PdfRequest, signal: AbortSignal): Promise<Blob | null> {
  try {
    const response = await fetch(request.url, { ...request.init, signal })

    return isPdf(response) ? new Blob([await response.blob()], AS_PDF) : null
  } catch {
    return null
  }
}
