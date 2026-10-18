import type { PagerState } from './state'
import { hasNext, hasPrevious, pageNumbers } from './state'

// The three looks of Xero's lists the bar matches (see top-pager.css)
export type PagerLook = 'classic' | 'ext' | 'xui'

// What the bar's controls ask of Xero's own pager
export interface PagerActions {
  goToPage: (page: number) => void
  setPageSize: (size: number) => void
  previous: () => void
  next: () => void
}

interface StepButton {
  text: string
  label: string
  enabled: boolean
  run: () => void
}

const BAR_TAG = 'nav'
const BAR_CLASSES = (look: PagerLook): string => `bt-pager bt-pager--${look}`
const BAR_LABEL = 'Pagination (top)'
const TEXT_TAG = 'span'
const PICKER_TAG = 'select'
const OPTION_TAG = 'option'
const BUTTON_TAG = 'button'
const TEXT_CLASS = 'bt-pager__text'
const SELECT_CLASS = 'bt-pager__select'
const STEP_CLASS = 'bt-pager__step'
export const LABEL_ATTRIBUTE = 'aria-label'
const BUTTON_TYPE = 'button'
const CHANGE_EVENT = 'change'
const CLICK_EVENT = 'click'
const PAGE_LABEL = 'Page'
const SIZE_LABEL = 'Items per page'
const PER_PAGE_TEXT = 'per page'
const PAGE_OF_TEXT = (page: number, pages: number): string => `Page ${page} of ${pages}`
const OF_PAGES_TEXT = (pages: number): string => `of ${pages}`
const PREVIOUS: Pick<StepButton, 'text' | 'label'> = { text: '‹ Prev', label: 'Previous page' }
const NEXT: Pick<StepButton, 'text' | 'label'> = { text: 'Next ›', label: 'Next page' }

function textPart(content: string): HTMLElement {
  const part = document.createElement(TEXT_TAG)

  part.className = TEXT_CLASS
  part.textContent = content

  return part
}

function optionOf(value: number, current: number): HTMLOptionElement {
  const option = document.createElement(OPTION_TAG)

  option.value = String(value)
  option.textContent = option.value
  option.selected = value === current

  return option
}

function pickerOf(values: readonly number[], current: number, label: string): HTMLSelectElement {
  const picker = document.createElement(PICKER_TAG)
  const options = values.map((value) => optionOf(value, current))

  picker.className = SELECT_CLASS
  picker.setAttribute(LABEL_ATTRIBUTE, label)
  picker.append(...options)

  return picker
}

function onPick(picker: HTMLSelectElement, choose: (value: number) => void): HTMLSelectElement {
  picker.addEventListener(CHANGE_EVENT, () => {
    choose(Number(picker.value))
  })

  return picker
}

function stepButtonOf(step: StepButton): HTMLButtonElement {
  const button = document.createElement(BUTTON_TAG)

  button.type = BUTTON_TYPE
  button.className = STEP_CLASS
  button.textContent = step.text
  button.setAttribute(LABEL_ATTRIBUTE, step.label)
  button.disabled = !step.enabled
  button.addEventListener(CLICK_EVENT, step.run)

  return button
}

// "Page [n] of m" with a picker when Xero's pager has one, the plain "Page n of m" when it has none
function pageParts(state: PagerState, actions: PagerActions): HTMLElement[] {
  if (!state.canPickPage) {
    return [textPart(PAGE_OF_TEXT(state.page, state.pages))]
  }

  const picker = onPick(pickerOf(pageNumbers(state.pages), state.page, PAGE_LABEL), actions.goToPage)

  return [textPart(PAGE_LABEL), picker, textPart(OF_PAGES_TEXT(state.pages))]
}

function sizeParts(state: PagerState, actions: PagerActions): HTMLElement[] {
  const picker = onPick(pickerOf(state.pageSizes, state.pageSize, SIZE_LABEL), actions.setPageSize)

  return [picker, textPart(PER_PAGE_TEXT)]
}

function stepParts(state: PagerState, actions: PagerActions): HTMLElement[] {
  const previous = stepButtonOf({ ...PREVIOUS, enabled: hasPrevious(state), run: actions.previous })
  const next = stepButtonOf({ ...NEXT, enabled: hasNext(state), run: actions.next })

  return [previous, next]
}

// The top bar for Xero's pager as it is now: the page and its picker, the page size and its picker, Prev and Next.
// It is built from the state, never copied from Xero's elements, and every control asks Xero's pager to act
export function createBar(state: PagerState, actions: PagerActions, look: PagerLook): HTMLElement {
  const bar = document.createElement(BAR_TAG)

  bar.className = BAR_CLASSES(look)
  bar.setAttribute(LABEL_ATTRIBUTE, BAR_LABEL)
  bar.append(...pageParts(state, actions), ...sizeParts(state, actions), ...stepParts(state, actions))

  return bar
}
