// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { activateDirectPrint } from '../../../../src/features/direct-print'
import { SESSION_KEY } from '../../../../src/features/direct-print/token'
import { loadFixture } from '../../helpers/fixture'
import { queryRequired } from '../../helpers/query'

// The loading and the frame are replaced: these tests are about what the feature does with the page
const fakes = vi.hoisted(() => ({ fetchPdf: vi.fn(), printInFrame: vi.fn(), removeFrame: vi.fn() }))

vi.mock('../../../../src/features/direct-print/pdf', () => ({ fetchPdf: fakes.fetchPdf }))
vi.mock('../../../../src/features/direct-print/frame', () => ({ printInFrame: fakes.printInFrame }))

const VIEW_FIXTURE = 'tests/fixtures/app/!demo0/invoicing/view/00000000-0000-0000-0000-000000000000.html'
const VIEW_PATH = '/app/!demo0/invoicing/view/00000000-0000-0000-0000-000000000000'
const EDITOR_PATH = '/app/!demo0/invoicing/edit/00000000-0000-0000-0000-000000000000'
const CONTROL_SELECTOR = '.bt-print'
const BUTTON_SELECTOR = '.bt-print__button'
const GROUP_SELECTOR = 'div.PrintDropdown-group'
const HEADER_SELECTOR = '.PageHeaderActions'
const NOTE_SELECTOR = '.bt-print__note'
const NOTICE_SELECTOR = '.bt-notice'
const SESSION = JSON.stringify({ access_token: 'header.payload.signature' })
const PDF = new Blob(['%PDF-1.4'], { type: 'application/pdf' })
const PDF_URL = 'blob:https://go.xero.com/11111111-1111-4111-8111-111111111111'
const KEEP_MS = 60000
const ABORT_EVENT = 'abort'
const QUIET = (): void => {}
let stop = (): void => {}

// Lets the click's work run to its end: the PDF comes from a promise
function settle(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0)
  })
}

// Draws the header anew the way React does: new nodes for Xero's own children, the extension's control gone
function redrawHeader(): void {
  const header = queryRequired(document, HEADER_SELECTOR)
  const fresh = [...header.children].filter((child) => !child.matches(CONTROL_SELECTOR)).map((child) => child.cloneNode(true))

  header.replaceChildren(...fresh)
}

// A load that ends, with no PDF, only when it is stopped
function endOnAbort(_request: unknown, signal: AbortSignal): Promise<null> {
  return new Promise((resolve) => {
    signal.addEventListener(ABORT_EVENT, () => {
      resolve(null)
    })
  })
}

async function clickPrint(): Promise<void> {
  queryRequired<HTMLButtonElement>(document, BUTTON_SELECTOR).click()
  await settle()
}

beforeEach(async () => {
  await loadFixture(VIEW_FIXTURE)
  sessionStorage.setItem(SESSION_KEY, SESSION)
  fakes.fetchPdf.mockResolvedValue(PDF)
  fakes.printInFrame.mockReturnValue(fakes.removeFrame)
  vi.spyOn(URL, 'createObjectURL').mockReturnValue(PDF_URL)
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(QUIET)
})

afterEach(() => {
  stop()
  vi.useRealTimers()
  sessionStorage.clear()
  vi.clearAllMocks()
  vi.restoreAllMocks()
})

describe('activateDirectPrint', () => {
  it('puts the Print button right before Xero\'s print group', () => {
    stop = activateDirectPrint(document.body, VIEW_PATH, true)

    expect(queryRequired(document, CONTROL_SELECTOR).nextElementSibling).toBe(queryRequired(document, GROUP_SELECTOR))
  })

  it('stays away while switched off and on other pages', () => {
    activateDirectPrint(document.body, VIEW_PATH, false)
    activateDirectPrint(document.body, EDITOR_PATH, true)

    expect(document.querySelector(CONTROL_SELECTOR)).toBeNull()
  })

  it('puts the button back when React draws the header again', async () => {
    stop = activateDirectPrint(document.body, VIEW_PATH, true)

    redrawHeader()
    await settle()

    expect(queryRequired(document, CONTROL_SELECTOR).nextElementSibling).toBe(queryRequired(document, GROUP_SELECTOR))
  })

  it('takes the button out while the header has no print group', async () => {
    stop = activateDirectPrint(document.body, VIEW_PATH, true)

    queryRequired(document, GROUP_SELECTOR).remove()
    await settle()

    expect(document.querySelector(CONTROL_SELECTOR)).toBeNull()
  })
})

describe('a click on Print', () => {
  it('asks Xero for the PDF with the session\'s token and prints it in a frame', async () => {
    stop = activateDirectPrint(document.body, VIEW_PATH, true)

    await clickPrint()

    const [request] = fakes.fetchPdf.mock.calls[0]

    expect(request.url).toBe('/api/invoicing/invoice/00000000-0000-0000-0000-000000000000/pdf')
    expect(request.init.headers.Authorization).toBe('Bearer header.payload.signature')
    expect(request.init.headers['Xero-Tenant-Shortcode']).toBe('!demo0')
    expect(fakes.printInFrame).toHaveBeenCalledWith(PDF_URL)
    expect(queryRequired(document, NOTE_SELECTOR).textContent).toBe('No print dialog? Open PDF')
  })

  it('says it could not load the PDF when Xero gives none', async () => {
    fakes.fetchPdf.mockResolvedValue(null)
    stop = activateDirectPrint(document.body, VIEW_PATH, true)

    await clickPrint()

    expect(queryRequired(document, NOTICE_SELECTOR).textContent).toBe('Could not load the PDF — use Print PDF.')
    expect(fakes.printInFrame).not.toHaveBeenCalled()
  })

  it('says so without asking Xero when the page holds no session', async () => {
    sessionStorage.clear()
    stop = activateDirectPrint(document.body, VIEW_PATH, true)

    await clickPrint()

    expect(fakes.fetchPdf).not.toHaveBeenCalled()
    expect(document.querySelector(NOTICE_SELECTOR)).not.toBeNull()
  })

  it('removes the frame, the note and the PDF\'s url when the feature stops', async () => {
    const stopNow = activateDirectPrint(document.body, VIEW_PATH, true)

    await clickPrint()
    stopNow()

    expect(fakes.removeFrame).toHaveBeenCalledTimes(1)
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(PDF_URL)
    expect(document.querySelector(NOTE_SELECTOR)).toBeNull()
    expect(document.querySelector(CONTROL_SELECTOR)).toBeNull()
  })

  it('removes the previous frame, note and url when the next print comes', async () => {
    stop = activateDirectPrint(document.body, VIEW_PATH, true)

    await clickPrint()
    await clickPrint()

    expect(fakes.removeFrame).toHaveBeenCalledTimes(1)
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(PDF_URL)
    expect(document.querySelectorAll(NOTE_SELECTOR)).toHaveLength(1)
  })

  it('removes the frame, the note and the url after a minute', async () => {
    vi.useFakeTimers()
    stop = activateDirectPrint(document.body, VIEW_PATH, true)

    queryRequired<HTMLButtonElement>(document, BUTTON_SELECTOR).click()
    await vi.advanceTimersByTimeAsync(KEEP_MS)

    expect(fakes.removeFrame).toHaveBeenCalledTimes(1)
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(PDF_URL)
    expect(document.querySelector(NOTE_SELECTOR)).toBeNull()
  })

  it('stops a load without a notice when the feature stops', async () => {
    fakes.fetchPdf.mockImplementation(endOnAbort)
    stop = activateDirectPrint(document.body, VIEW_PATH, true)

    const control = queryRequired(document, CONTROL_SELECTOR)

    queryRequired<HTMLButtonElement>(document, BUTTON_SELECTOR).click()
    stop()
    await settle()

    const [, signal] = fakes.fetchPdf.mock.calls[0]

    expect(signal.aborted).toBe(true)
    expect(control.querySelector(NOTICE_SELECTOR)).toBeNull()
    expect(fakes.printInFrame).not.toHaveBeenCalled()
  })
})
