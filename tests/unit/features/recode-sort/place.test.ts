// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest'
import { findToolbarPlace, placeInToolbar, rightOffset } from '../../../../src/features/recode-sort/place'
import { queryRequired } from '../../helpers/query'

const TOOLBAR_HTML = '<div class="x-panel results-panel"><div class="x-toolbar results-toolbar"><div class="x-box-inner"></div><nav class="bt-pager"></nav></div></div>'
const TOOLBAR_SELECTOR = '.x-toolbar.results-toolbar'
const PAGER_SELECTOR = 'nav.bt-pager'
const CONTROL_TAG = 'button'
const PAGER_WIDTH = 333

afterEach(() => {
  document.body.replaceChildren()
})

// The results toolbar with the top pager in it, which happy-dom gives the width it has on the demo company
function showToolbar(): void {
  document.body.innerHTML = TOOLBAR_HTML
  Object.defineProperty(queryRequired(document, PAGER_SELECTOR), 'offsetWidth', { value: PAGER_WIDTH })
}

describe('findToolbarPlace', () => {
  it('finds the results toolbar, the top pager in it and its width', () => {
    showToolbar()

    expect(findToolbarPlace(document)).toEqual({
      toolbar: queryRequired(document, TOOLBAR_SELECTOR),
      pager: queryRequired(document, PAGER_SELECTOR),
      pagerWidth: PAGER_WIDTH,
    })
  })

  it('gives null before a search, without a toolbar', () => {
    expect(findToolbarPlace(document)).toBeNull()
  })
})

describe('rightOffset', () => {
  it('keeps the button left of a shown pager, else at the toolbar\'s edge', () => {
    expect(rightOffset(PAGER_WIDTH)).toBe(361)
    expect(rightOffset(0)).toBe(12)
  })
})

describe('placeInToolbar', () => {
  it('puts the button right before the pager, which stays last, at its offset', () => {
    showToolbar()

    const control = document.createElement(CONTROL_TAG)

    placeInToolbar(control, findToolbarPlace(document))

    expect(control.nextElementSibling).toBe(queryRequired(document, PAGER_SELECTOR))
    expect(control.style.right).toBe('361px')
  })

  it('takes the button out when there is no toolbar', () => {
    const control = document.createElement(CONTROL_TAG)

    document.body.append(control)
    placeInToolbar(control, null)

    expect(control.isConnected).toBe(false)
  })
})
