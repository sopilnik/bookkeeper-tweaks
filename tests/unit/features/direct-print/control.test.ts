// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createPrintControl, setBusy, showOpenNote } from '../../../../src/features/direct-print/control'
import { queryRequired } from '../../helpers/query'

const PDF_URL = 'blob:https://go.xero.com/00000000-0000-0000-0000-000000000000'
const DOT_SELECTOR = '.bt-print__dot'
const NOTE_SELECTOR = '.bt-print__note'
const LINK_SELECTOR = 'a.bt-print__open'
const BUSY_CLASS = 'bt-print--busy'
const BUSY_ATTRIBUTE = 'aria-busy'
const QUIET = (): void => {}

afterEach(() => {
  document.body.replaceChildren()
})

describe('createPrintControl', () => {
  it('builds a Print button in the classes and size of Xero\'s Print PDF, marked with the extension\'s dot', () => {
    const { element, button } = createPrintControl(QUIET)

    expect(button.textContent).toBe('Print')
    expect(button.type).toBe('button')
    expect(button.title).toBe('Print the invoice without downloading its PDF')
    expect([...button.classList]).toEqual(
      expect.arrayContaining(['xui-button', 'xui-button-standard', 'xui-button-small']),
    )
    expect(element.querySelector(DOT_SELECTOR)).not.toBeNull()
  })

  it('calls back when the button is clicked', () => {
    const onPrint = vi.fn()

    createPrintControl(onPrint).button.click()

    expect(onPrint).toHaveBeenCalledTimes(1)
  })
})

describe('setBusy', () => {
  it('disables the button while busy and gives it back after', () => {
    const control = createPrintControl(QUIET)

    setBusy(control, true)

    expect(control.element.classList.contains(BUSY_CLASS)).toBe(true)
    expect(control.button.disabled).toBe(true)
    expect(control.button.getAttribute(BUSY_ATTRIBUTE)).toBe('true')

    setBusy(control, false)

    expect(control.element.classList.contains(BUSY_CLASS)).toBe(false)
    expect(control.button.disabled).toBe(false)
    expect(control.button.getAttribute(BUSY_ATTRIBUTE)).toBe('false')
  })
})

describe('showOpenNote', () => {
  it('offers the PDF in a new tab from a note under the button', () => {
    const control = createPrintControl(QUIET)

    showOpenNote(control, PDF_URL)

    const link = queryRequired<HTMLAnchorElement>(control.element, LINK_SELECTOR)

    expect(queryRequired(control.element, NOTE_SELECTOR).textContent).toBe('No print dialog? Open PDF')
    expect(link.href).toBe(PDF_URL)
    expect(link.target).toBe('_blank')
    expect(link.rel).toBe('noopener')
  })

  it('takes the note away when asked', () => {
    const control = createPrintControl(QUIET)

    showOpenNote(control, PDF_URL)()

    expect(control.element.querySelector(NOTE_SELECTOR)).toBeNull()
  })
})
