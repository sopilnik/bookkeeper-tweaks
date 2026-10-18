// The extension's Print button before Xero's print group (sheet variant A1, see print.css): Xero's button look with
// the extension's dot; while busy it keeps its width and shows a spinner in its label's place; after printing, a note
// under it offers to open the PDF
export interface PrintControl {
  element: HTMLElement
  button: HTMLButtonElement
}

const CONTROL_TAG = 'span'
const CONTROL_CLASS = 'bt-print'
const BUSY_CLASS = 'bt-print--busy'
const BUTTON_TAG = 'button'
const BUTTON_CLASS = 'xui-button xui-button-standard bt-print__button'
const BUTTON_TYPE = 'button'
const BUTTON_TEXT = 'Print'
const BUTTON_TITLE = 'Print the invoice without downloading its PDF'
const BUSY_ATTRIBUTE = 'aria-busy'
const DOT_TAG = 'span'
const DOT_CLASS = 'bt-print__dot'
const NOTE_TAG = 'span'
const NOTE_CLASS = 'bt-print__note'
const NOTE_TEXT = 'No print dialog? '
const LINK_TAG = 'a'
const LINK_CLASS = 'bt-print__open'
const LINK_TEXT = 'Open PDF'
const NEW_TAB = '_blank'
const NO_OPENER = 'noopener'
const CLICK_EVENT = 'click'

export function createPrintControl(onPrint: () => void): PrintControl {
  const element = document.createElement(CONTROL_TAG)
  const button = document.createElement(BUTTON_TAG)
  const dot = document.createElement(DOT_TAG)

  element.className = CONTROL_CLASS
  button.className = BUTTON_CLASS
  button.type = BUTTON_TYPE
  button.textContent = BUTTON_TEXT
  button.title = BUTTON_TITLE
  dot.className = DOT_CLASS
  button.addEventListener(CLICK_EVENT, onPrint)
  element.append(button, dot)

  return { element, button }
}

export function setBusy(control: PrintControl, busy: boolean): void {
  control.element.classList.toggle(BUSY_CLASS, busy)
  control.button.disabled = busy
  control.button.setAttribute(BUSY_ATTRIBUTE, String(busy))
}

// Shows the note that opens the PDF in a new tab, for when Chrome showed no print dialog; the returned function
// removes it
export function showOpenNote(control: PrintControl, url: string): () => void {
  const note = document.createElement(NOTE_TAG)
  const link = document.createElement(LINK_TAG)

  link.className = LINK_CLASS
  link.href = url
  link.target = NEW_TAB
  link.rel = NO_OPENER
  link.textContent = LINK_TEXT
  note.className = NOTE_CLASS
  note.append(NOTE_TEXT, link)
  control.element.append(note)

  return () => {
    note.remove()
  }
}
