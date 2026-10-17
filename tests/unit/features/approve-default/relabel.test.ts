// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { keepRelabelled } from '../../../../src/features/approve-default/relabel'
import type { ApproveAction } from '../../../../src/settings/schema'
import { loadEditorFixture } from '../../helpers/fixture'
import { queryRequired } from '../../helpers/query'

const GROUP_SELECTOR = 'div.ApproveAndEmailButton'
const PRIMARY_SELECTOR = '#ApproveAndEmailButton-approve-and-email'
const TOOLTIP_SELECTOR = '#xui-tooltip-approve'
const DOT_SELECTOR = '.bt-approve-dot'
const HIDDEN_TOOLTIP_CLASS = 'bt-approve-tooltip-hidden'
const ROOT_SELECTOR = '#shell-app-root'
const XERO_LABEL = 'Approve & email'
const TITLE_ATTRIBUTE = 'title'
const TOOLTIP_ATTRIBUTE = 'aria-describedby'
const APPROVE: ApproveAction = 'approve'
const VIEW_NEXT: ApproveAction = 'approve-and-view-next'
const XERO_ACTION: ApproveAction = 'approve-and-email'
let stop = (): void => {}

function element(selector: string): Element {
  return queryRequired(document, selector)
}

function nextTask(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0)
  })
}

beforeEach(async () => {
  await loadEditorFixture()
})

afterEach(() => {
  stop()
})

describe('keepRelabelled', () => {
  it('shows the chosen action, its shortcut and the mark', () => {
    stop = keepRelabelled(document.body, APPROVE)

    expect(element(PRIMARY_SELECTOR).textContent).toBe('Approve')
    expect(element(TOOLTIP_SELECTOR).textContent).toBe('Ctrl-Alt-A')
    expect(element(DOT_SELECTOR).getAttribute(TITLE_ATTRIBUTE)).toBe('Set by Bookkeeper Tweaks')
  })

  it('writes into Xero\'s own text node', () => {
    const xeroText = element(PRIMARY_SELECTOR).firstChild

    stop = keepRelabelled(document.body, APPROVE)

    expect(element(PRIMARY_SELECTOR).firstChild).toBe(xeroText)
  })

  it('hides the tooltip of an action without a shortcut', () => {
    stop = keepRelabelled(document.body, VIEW_NEXT)

    expect(element(PRIMARY_SELECTOR).textContent).toBe('Approve & view next')
    expect(element(TOOLTIP_SELECTOR).classList.contains(HIDDEN_TOOLTIP_CLASS)).toBe(true)
  })

  it('leaves the button alone when it already does the chosen action', () => {
    stop = keepRelabelled(document.body, XERO_ACTION)

    expect(element(PRIMARY_SELECTOR).textContent).toBe(XERO_LABEL)
    expect(document.querySelector(DOT_SELECTOR)).toBeNull()
  })

  it('relabels every Approve group on the page', () => {
    element(ROOT_SELECTOR).append(element(GROUP_SELECTOR).cloneNode(true))

    stop = keepRelabelled(document.body, APPROVE)

    expect([...document.querySelectorAll(PRIMARY_SELECTOR)].map((button) => button.textContent)).toEqual(['Approve', 'Approve'])
  })

  it('puts the label back after Xero rewrites it', async () => {
    stop = keepRelabelled(document.body, APPROVE)

    const xeroText = element(PRIMARY_SELECTOR).firstChild

    if (xeroText) {
      xeroText.nodeValue = XERO_LABEL
    }

    await nextTask()

    expect(element(PRIMARY_SELECTOR).textContent).toBe('Approve')
  })

  it('relabels a group that appears later', async () => {
    const group = element(GROUP_SELECTOR)

    group.remove()
    stop = keepRelabelled(document.body, APPROVE)
    element(ROOT_SELECTOR).append(group)
    await nextTask()

    expect(element(PRIMARY_SELECTOR).textContent).toBe('Approve')
  })

  it('restores Xero\'s button when stopped', () => {
    keepRelabelled(document.body, APPROVE)()

    expect(element(PRIMARY_SELECTOR).textContent).toBe(XERO_LABEL)
    expect(element(TOOLTIP_SELECTOR).textContent).toBe('Ctrl-Alt-E')
    expect(document.querySelector(DOT_SELECTOR)).toBeNull()
  })

  it('relabels a button whose tooltip is missing', () => {
    element(PRIMARY_SELECTOR).removeAttribute(TOOLTIP_ATTRIBUTE)

    stop = keepRelabelled(document.body, APPROVE)

    expect(element(PRIMARY_SELECTOR).textContent).toBe('Approve')
    expect(element(TOOLTIP_SELECTOR).textContent).toBe('Ctrl-Alt-E')
  })

  it('skips a group without its primary button, on relabel and on stop', () => {
    const emptyGroup = element(GROUP_SELECTOR).cloneNode(true)

    if (emptyGroup instanceof Element) {
      queryRequired(emptyGroup, PRIMARY_SELECTOR).remove()
      element(ROOT_SELECTOR).append(emptyGroup)
    }

    keepRelabelled(document.body, APPROVE)()

    expect(document.querySelectorAll(DOT_SELECTOR)).toHaveLength(0)
    expect(element(PRIMARY_SELECTOR).textContent).toBe(XERO_LABEL)
  })
})
