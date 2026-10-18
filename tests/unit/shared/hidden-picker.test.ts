// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { pickHidden } from '../../../src/shared/hidden-picker'

interface FakePicker {
  trigger: HTMLButtonElement
  picked: () => boolean
  hiddenWhilePicked: () => boolean
}

const OPTION_ID = 'bt-option'
const OPTION_SELECTOR = `#${OPTION_ID}`
const OPTION_HTML = `<div role="option" id="${OPTION_ID}"><button type="button">Pick me</button></div>`
const BODILESS_OPTION_HTML = `<svg role="option" id="${OPTION_ID}"></svg>`
const NO_OPTION = ''
const OPTION_BODY_SELECTOR = 'button'
const LIST_CLASS = 'xui-dropdown-layout'
const LIST_SELECTOR = `.${LIST_CLASS}`
const LIST_TAG = 'div'
const TRIGGER_TAG = 'button'
const CLICK_EVENT = 'click'
const PICKING_CLASS = 'bt-picking'
const OPTION_TIMEOUT_MS = 1000
const FIELD_TAG = 'input'
const OWN_CONTROL_TAG = 'select'
// Where the picker's field sits, below the window's first screen
const FIELD_TOP = 600

function isOpen(): boolean {
  return document.querySelector(LIST_SELECTOR) !== null
}

function openList(optionHtml: string): HTMLElement {
  const list = document.createElement(LIST_TAG)

  list.className = LIST_CLASS
  list.innerHTML = optionHtml
  document.body.append(list)

  return list
}

// Focuses the picker's own field and scrolls the window to it, as Ext's combos do whenever their trigger is clicked
function focusField(field: HTMLElement): void {
  field.focus()
  window.scrollTo(0, FIELD_TOP)
}

// A trigger that opens and closes a list the way Xero's does, focusing the picker's field on every click; the option
// records whether the list was hidden when the option was clicked
function fakePicker(optionHtml: string): FakePicker {
  const trigger = document.createElement(TRIGGER_TAG)
  const field = document.createElement(FIELD_TAG)
  let picked = false
  let hiddenWhilePicked = false
  const recordPick = (): void => {
    picked = true
    hiddenWhilePicked = document.documentElement.classList.contains(PICKING_CLASS)
  }

  trigger.addEventListener(CLICK_EVENT, () => {
    const open = document.querySelector(LIST_SELECTOR)

    focusField(field)

    if (open) {
      open.remove()

      return
    }

    openList(optionHtml).querySelector(OPTION_BODY_SELECTOR)?.addEventListener(CLICK_EVENT, recordPick)
  })

  document.body.append(trigger, field)

  return { trigger, picked: () => picked, hiddenWhilePicked: () => hiddenWhilePicked }
}

// The bar's own control, focused with the window at its top, as when the user picks in it
function focusOwnControl(): HTMLElement {
  const own = document.createElement(OWN_CONTROL_TAG)

  document.body.append(own)
  own.focus()
  window.scrollTo(0, 0)

  return own
}

function expectViewAt(own: HTMLElement): void {
  expect(document.activeElement).toBe(own)
  expect(window.scrollY).toBe(0)
}

function pickWith(trigger: HTMLButtonElement, signal = new AbortController().signal): Promise<boolean> {
  return pickHidden({ trigger, optionSelector: OPTION_SELECTOR, isOpen, signal })
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  document.body.replaceChildren()
  document.documentElement.className = ''
})

describe('pickHidden', () => {
  it('clicks the option with the list hidden', async () => {
    const picker = fakePicker(OPTION_HTML)

    expect(await pickWith(picker.trigger)).toBe(true)
    expect(picker.picked()).toBe(true)
    expect(picker.hiddenWhilePicked()).toBe(true)
    expect(document.documentElement.classList.contains(PICKING_CLASS)).toBe(false)
  })

  it('closes the list it opened when the option never comes', async () => {
    const picker = fakePicker(NO_OPTION)
    const picking = pickWith(picker.trigger)

    await vi.advanceTimersByTimeAsync(OPTION_TIMEOUT_MS)

    expect(await picking).toBe(false)
    expect(isOpen()).toBe(false)
    expect(document.documentElement.classList.contains(PICKING_CLASS)).toBe(false)
  })

  it('does not toggle a list that was already open', async () => {
    const picker = fakePicker(NO_OPTION)

    picker.trigger.click()

    const picking = pickWith(picker.trigger)

    await vi.advanceTimersByTimeAsync(OPTION_TIMEOUT_MS)

    expect(await picking).toBe(false)
    expect(isOpen()).toBe(true)
  })

  it('gives up at once when aborted', async () => {
    const picker = fakePicker(NO_OPTION)
    const controller = new AbortController()
    const picking = pickWith(picker.trigger, controller.signal)

    controller.abort()

    expect(await picking).toBe(false)
    expect(isOpen()).toBe(false)
  })

  it('leaves the focus and the window where the pick found them', async () => {
    const picker = fakePicker(OPTION_HTML)
    const own = focusOwnControl()

    expect(await pickWith(picker.trigger)).toBe(true)
    expectViewAt(own)
  })

  it('leaves them there when the option never comes', async () => {
    const picker = fakePicker(NO_OPTION)
    const own = focusOwnControl()
    const picking = pickWith(picker.trigger)

    await vi.advanceTimersByTimeAsync(OPTION_TIMEOUT_MS)

    expect(await picking).toBe(false)
    expectViewAt(own)
  })

  it('treats an option with nothing to click as missing', async () => {
    const picker = fakePicker(BODILESS_OPTION_HTML)

    expect(await pickWith(picker.trigger)).toBe(false)
    expect(isOpen()).toBe(false)
    expect(document.documentElement.classList.contains(PICKING_CLASS)).toBe(false)
  })
})
