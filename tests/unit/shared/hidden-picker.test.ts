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
const OPTION_BODY_SELECTOR = 'button'
const LIST_CLASS = 'xui-dropdown-layout'
const LIST_SELECTOR = `.${LIST_CLASS}`
const LIST_TAG = 'div'
const TRIGGER_TAG = 'button'
const CLICK_EVENT = 'click'
const PICKING_CLASS = 'bt-picking'
const OPTION_TIMEOUT_MS = 1000

function isOpen(): boolean {
  return document.querySelector(LIST_SELECTOR) !== null
}

function openList(withOption: boolean): HTMLElement {
  const list = document.createElement(LIST_TAG)

  list.className = LIST_CLASS
  list.innerHTML = withOption ? OPTION_HTML : ''
  document.body.append(list)

  return list
}

// A trigger that opens and closes a list the way Xero's does; the option records whether the list was hidden when the
// option was clicked
function fakePicker(withOption: boolean): FakePicker {
  const trigger = document.createElement(TRIGGER_TAG)
  let picked = false
  let hiddenWhilePicked = false
  const recordPick = (): void => {
    picked = true
    hiddenWhilePicked = document.documentElement.classList.contains(PICKING_CLASS)
  }

  trigger.addEventListener(CLICK_EVENT, () => {
    const open = document.querySelector(LIST_SELECTOR)

    if (open) {
      open.remove()

      return
    }

    openList(withOption).querySelector(OPTION_BODY_SELECTOR)?.addEventListener(CLICK_EVENT, recordPick)
  })

  document.body.append(trigger)

  return { trigger, picked: () => picked, hiddenWhilePicked: () => hiddenWhilePicked }
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
    const picker = fakePicker(true)

    expect(await pickWith(picker.trigger)).toBe(true)
    expect(picker.picked()).toBe(true)
    expect(picker.hiddenWhilePicked()).toBe(true)
    expect(document.documentElement.classList.contains(PICKING_CLASS)).toBe(false)
  })

  it('closes the list it opened when the option never comes', async () => {
    const picker = fakePicker(false)
    const picking = pickWith(picker.trigger)

    await vi.advanceTimersByTimeAsync(OPTION_TIMEOUT_MS)

    expect(await picking).toBe(false)
    expect(isOpen()).toBe(false)
    expect(document.documentElement.classList.contains(PICKING_CLASS)).toBe(false)
  })

  it('does not toggle a list that was already open', async () => {
    const picker = fakePicker(false)

    picker.trigger.click()

    const picking = pickWith(picker.trigger)

    await vi.advanceTimersByTimeAsync(OPTION_TIMEOUT_MS)

    expect(await picking).toBe(false)
    expect(isOpen()).toBe(true)
  })

  it('gives up at once when aborted', async () => {
    const picker = fakePicker(false)
    const controller = new AbortController()
    const picking = pickWith(picker.trigger, controller.signal)

    controller.abort()

    expect(await picking).toBe(false)
    expect(isOpen()).toBe(false)
  })
})
