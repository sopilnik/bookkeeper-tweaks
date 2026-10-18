// Stands in for Xero's pager on the Bills fixture: the items-per-page select and the page select open and close their
// lists in the portal, under the ids the fixture's triggers name; an option and Prev or Next change the page, and
// after each change the row above the table is drawn anew, as React does. Every action Xero would perform is appended
// to data-bt-performed on <html>. Self-contained, because Playwright serializes it into the page; unit tests call it
// directly and remove it with the returned function
export function installBillsStub(): () => void {
  const SIZE_TRIGGER_SELECTOR = '[role="combobox"].xui-single-select__trigger'
  const PAGE_BUTTON_SELECTOR = '.xui-select--button'
  const PAGE_CONTENT_SELECTOR = '.xui-select--content'
  const PREVIOUS_SELECTOR = 'button[aria-label="Previous Page"]'
  const NEXT_SELECTOR = 'button[aria-label="Next Page"]'
  const SIZE_OPTION_SELECTOR = '#xui-sizes [role="option"]'
  const PAGE_OPTION_SELECTOR = '#xui-pages [role="option"]'
  const SIZE_LIST_SELECTOR = '#xui-sizes'
  const PAGE_LIST_SELECTOR = '#xui-pages'
  const PORTAL_SELECTOR = '.xui-portal .xui-container'
  const ROW_SELECTOR = '.bills-list-content-container > .xui-padding-xsmall:not(.xui-panel--section)'
  const ROW_HTML = '<div class="xui-u-flex-justify-end xui-u-flex-align-center">37 items | 8,386.76 USD</div>'
  const SIZE_LIST_HTML = '<div id="xui-sizes" class="xui-single-select__flyout" role="listbox">' +
    [10, 25, 50, 100, 200].map((size) => `<div role="option" id="${size}" class="xui-single-select__option">${size}</div>`).join('') + '</div>'
  const PAGE_LIST_HTML = (pages: number): string => '<div id="xui-pages" class="xui-dropdown-layout"><ul class="xui-picklist" role="listbox">' +
    Array.from({ length: pages }, (_, index) => `<li role="option" class="xui-pickitem">${index + 1}</li>`).join('') + '</ul></div>'
  const PAGE_TEXT = (page: number, pages: number): string => `Page ${page} of ${pages}`
  const SIZE_ACTION = (size: string): string => `size ${size}`
  const PAGE_ACTION = (page: number): string => `page ${page}`
  const NEXT_ACTION = 'next'
  const PREVIOUS_ACTION = 'previous'
  const PAGE_OF = /Page (\d+) of (\d+)/
  const EXPANDED_ATTRIBUTE = 'aria-expanded'
  const EXPANDED = 'true'
  const COLLAPSED = 'false'
  const DISABLED = 'disabled'
  const ROW_TAG = 'div'
  const ROW_CLASS = 'xui-padding-xsmall'
  const SEPARATOR = ' '
  const AT_END: InsertPosition = 'beforeend'
  const CLICK_EVENT = 'click'
  const perform = (action: string): void => {
    const performed = document.documentElement.dataset.btPerformed

    document.documentElement.dataset.btPerformed = performed ? [performed, action].join(SEPARATOR) : action
  }
  const position = (): number[] => {
    const match = PAGE_OF.exec(document.querySelector(PAGE_CONTENT_SELECTOR)?.textContent ?? '')

    return match ? [Number(match[1]), Number(match[2])] : []
  }
  const redrawRow = (): void => {
    const row = document.createElement(ROW_TAG)

    row.className = ROW_CLASS
    row.innerHTML = ROW_HTML
    document.querySelector(ROW_SELECTOR)?.replaceWith(row)
  }
  const showPage = (page: number, action: string): void => {
    const content = document.querySelector(PAGE_CONTENT_SELECTOR)

    content?.replaceChildren(PAGE_TEXT(page, position()[1]))
    document.querySelector(PREVIOUS_SELECTOR)?.toggleAttribute(DISABLED, page <= 1)
    document.querySelector(NEXT_SELECTOR)?.toggleAttribute(DISABLED, page >= position()[1])
    perform(action)
    redrawRow()
  }
  const toggle = (listSelector: string, html: string): boolean => {
    const open = document.querySelector(listSelector)

    open?.remove()

    if (!open) {
      document.querySelector(PORTAL_SELECTOR)?.insertAdjacentHTML(AT_END, html)
    }

    return !open
  }
  const handlers: [string, (element: Element) => void][] = [
    [SIZE_TRIGGER_SELECTOR, (trigger) => {
      trigger.setAttribute(EXPANDED_ATTRIBUTE, toggle(SIZE_LIST_SELECTOR, SIZE_LIST_HTML) ? EXPANDED : COLLAPSED)
    }],
    [PAGE_BUTTON_SELECTOR, () => {
      toggle(PAGE_LIST_SELECTOR, PAGE_LIST_HTML(position()[1]))
    }],
    [SIZE_OPTION_SELECTOR, (option) => {
      document.querySelector(SIZE_LIST_SELECTOR)?.remove()
      document.querySelector(SIZE_TRIGGER_SELECTOR)?.setAttribute(EXPANDED_ATTRIBUTE, COLLAPSED)
      showPage(1, SIZE_ACTION(option.id))
    }],
    [PAGE_OPTION_SELECTOR, (option) => {
      document.querySelector(PAGE_LIST_SELECTOR)?.remove()
      showPage(Number(option.textContent), PAGE_ACTION(Number(option.textContent)))
    }],
    [NEXT_SELECTOR, () => {
      showPage(position()[0] + 1, NEXT_ACTION)
    }],
    [PREVIOUS_SELECTOR, () => {
      showPage(position()[0] - 1, PREVIOUS_ACTION)
    }],
  ]

  const onClick = (event: Event): void => {
    const target = event.target instanceof Element ? event.target : null

    handlers.forEach(([selector, handle]) => {
      const match = target?.closest(selector)

      if (match) {
        handle(match)
      }
    })
  }

  document.addEventListener(CLICK_EVENT, onClick)

  return () => {
    document.removeEventListener(CLICK_EVENT, onClick)
  }
}
