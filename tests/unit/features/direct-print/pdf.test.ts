import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchPdf } from '../../../../src/features/direct-print/pdf'
import type { PdfRequest } from '../../../../src/features/direct-print/request'

const REQUEST: PdfRequest = { url: '/api/invoicing/invoice/00000000-0000-0000-0000-000000000000/pdf', init: { credentials: 'include' } }
const PDF_BYTES = '%PDF-1.4'
const PDF_TYPE = { 'content-type': 'application/pdf' }
const HTML_TYPE = { 'content-type': 'text/html' }
const PDF_TYPE_WITH_PARAMETERS = { 'content-type': 'Application/PDF; charset=binary' }
const PDF_LIKE_TYPE = { 'content-type': 'application/pdfx' }
const TWO_TYPES: HeadersInit = [['content-type', 'application/pdf'], ['content-type', 'text/html']]
const UNAUTHORISED = 401
const OFFLINE = new Error('offline')

// Makes the page's fetch answer with the response, or fail with the error
function answerWith(answer: Response | Error): ReturnType<typeof vi.fn> {
  const fake = vi.fn(() => (answer instanceof Error ? Promise.reject(answer) : Promise.resolve(answer)))

  vi.stubGlobal('fetch', fake)

  return fake
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('fetchPdf', () => {
  it('gives the bytes of a PDF answer and passes the request and the signal on', async () => {
    const fake = answerWith(new Response(PDF_BYTES, { headers: PDF_TYPE }))
    const signal = new AbortController().signal
    const pdf = await fetchPdf(REQUEST, signal)

    expect(await pdf?.text()).toBe(PDF_BYTES)
    expect(fake).toHaveBeenCalledWith(REQUEST.url, { ...REQUEST.init, signal })
  })

  it('types the bytes as a PDF, whatever case and parameters the answer\'s type has', async () => {
    answerWith(new Response(PDF_BYTES, { headers: PDF_TYPE_WITH_PARAMETERS }))

    const pdf = await fetchPdf(REQUEST, new AbortController().signal)

    expect(pdf?.type).toBe('application/pdf')
    expect(await pdf?.text()).toBe(PDF_BYTES)
  })

  it('gives null for a type that only begins like a PDF\'s and for an answer with two types', async () => {
    answerWith(new Response(PDF_BYTES, { headers: PDF_LIKE_TYPE }))

    const pdfLike = await fetchPdf(REQUEST, new AbortController().signal)

    answerWith(new Response(PDF_BYTES, { headers: TWO_TYPES }))

    expect(pdfLike).toBeNull()
    expect(await fetchPdf(REQUEST, new AbortController().signal)).toBeNull()
  })

  it('gives null for an error status', async () => {
    answerWith(new Response(PDF_BYTES, { status: UNAUTHORISED, headers: PDF_TYPE }))

    expect(await fetchPdf(REQUEST, new AbortController().signal)).toBeNull()
  })

  it('gives null for an answer that is not a PDF', async () => {
    answerWith(new Response(PDF_BYTES, { headers: HTML_TYPE }))

    expect(await fetchPdf(REQUEST, new AbortController().signal)).toBeNull()
  })

  it('gives null when the request fails', async () => {
    answerWith(OFFLINE)

    expect(await fetchPdf(REQUEST, new AbortController().signal)).toBeNull()
  })
})
