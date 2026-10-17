// @vitest-environment happy-dom
import { readFile } from 'node:fs/promises'
import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS } from '../../../src/settings/schema'
import type { Settings } from '../../../src/settings/schema'
import { fillForm, readForm, showSaved } from '../../../src/settings-page/form'
import { queryRequired } from '../helpers/query'

// Read from the repository root, where Vitest runs
const PAGE_FILE = 'src/settings-page/settings.html'
const TEXT_ENCODING = 'utf8'
const HTML_TYPE = 'text/html'
const FORM_SELECTOR = '#bt-settings-form'
const SWITCH_SELECTOR = '#bt-directPrint'
const OTHER_SWITCH_SELECTOR = '#bt-topPager'
const ACTION_SELECTOR = 'input[value="approve-and-print-pdf"]'
const ACTION_INPUTS_SELECTOR = 'input[name="approveAction"]'
const VISIBLE_MARK_SELECTOR = '.bt-saved:not([hidden])'
const FORM_TAG = 'form'
const CHANGED: Settings = {
  approveDefault: { enabled: false, action: 'approve-and-print-pdf' },
  topPager: { enabled: true },
  directPrint: { enabled: false },
  recodeSort: { enabled: true },
}

function settingsForm(): HTMLFormElement {
  return queryRequired<HTMLFormElement>(document, FORM_SELECTOR)
}

function control(selector: string): Element {
  return queryRequired(settingsForm(), selector)
}

function visibleMarks(): string[] {
  return [...document.querySelectorAll(VISIBLE_MARK_SELECTOR)].map((mark) => mark.parentElement?.textContent ?? '')
}

beforeEach(async () => {
  const page = new DOMParser().parseFromString(await readFile(PAGE_FILE, TEXT_ENCODING), HTML_TYPE)

  document.body.replaceWith(document.importNode(page.body, true))
})

describe('the settings form', () => {
  it('reads back what it was filled with', () => {
    fillForm(settingsForm(), CHANGED)

    expect(readForm(settingsForm())).toEqual(CHANGED)
  })

  it('shows the defaults when filled with them', () => {
    fillForm(settingsForm(), DEFAULT_SETTINGS)

    expect(readForm(settingsForm())).toEqual(DEFAULT_SETTINGS)
  })

  it('offers all six Approve actions', () => {
    expect(settingsForm().querySelectorAll(ACTION_INPUTS_SELECTOR)).toHaveLength(6)
  })
})

describe('the saved mark', () => {
  it('shows next to the control that changed, and only there', () => {
    showSaved(settingsForm(), control(SWITCH_SELECTOR))

    expect(visibleMarks()).toEqual([expect.stringContaining('Direct print')])
  })

  it('moves to the next control that changes', () => {
    showSaved(settingsForm(), control(SWITCH_SELECTOR))
    showSaved(settingsForm(), control(OTHER_SWITCH_SELECTOR))

    expect(visibleMarks()).toEqual([expect.stringContaining('Top pager')])
  })

  it('shows next to the Approve choice when an action is picked', () => {
    showSaved(settingsForm(), control(ACTION_SELECTOR))

    expect(visibleMarks()).toEqual([expect.stringContaining('What the Approve button does')])
  })
})

describe('a form without its controls', () => {
  it('reads as the defaults', () => {
    expect(readForm(document.createElement(FORM_TAG))).toEqual(DEFAULT_SETTINGS)
  })

  it('takes settings without complaint', () => {
    expect(() => {
      fillForm(document.createElement(FORM_TAG), CHANGED)
    }).not.toThrow()
  })
})
