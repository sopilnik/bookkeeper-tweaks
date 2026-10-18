// Stands in for Ext JS on the Find and recode fixture: a combo's trigger opens and closes its list in <body> (id: the
// combo's id plus "-boundlist"), an item sets the combo, Prev and Next step the page. Like Ext 4.2, the trigger and the
// item focus the combo's field, and the browser scrolls it into view. Every action Xero would perform
// is appended to data-bt-performed on <html>, and the total is written again after each one, as Ext redraws the
// results. Self-contained, because Playwright serializes it into the page; unit tests call it directly and remove it
// with the returned function
export function installExtStub(): () => void {
  const TRIGGER_SELECTOR = '.x-form-trigger'
  const COMBO_SELECTOR = 'table.x-field'
  const ITEM_SELECTOR = 'li.x-boundlist-item'
  const LIST_SELECTOR = '.x-boundlist'
  const LIST_SUFFIX = '-boundlist'
  const LIST_TAG = 'div'
  const LIST_CLASS = 'x-boundlist x-boundlist-floating x-layer'
  const PAGE_INPUT_SELECTOR = 'table.page-number input'
  const INPUT_SELECTOR = 'input'
  const SIZE_COMBO_CLASS = 'list-size'
  const NEXT_SELECTOR = '.next-button a.x-btn-button'
  const PREVIOUS_SELECTOR = '.back-button a.x-btn-button'
  const TOTAL_SELECTOR = '.x-toolbar-text'
  const SIZES = [10, 25, 50, 100, 200]
  const PAGE_OF = /Page\s+(\d+)\s+of\s+(\d+)/
  const FIRST_NUMBER = /\d+/
  const SIZE_TEXT = (size: number): string => `${size} items per page`
  const PAGE_TEXT = (page: number, pages: number): string => `Page  ${page}  of  ${pages}`
  const ITEMS_HTML = (texts: string[]): string => `<ul>${texts.map((text) => `<li class="x-boundlist-item">${text}</li>`).join('')}</ul>`
  const SIZE_ACTION = (size: number): string => `size ${size}`
  const PAGE_ACTION = (page: number): string => `page ${page}`
  const NEXT_ACTION = 'next'
  const PREVIOUS_ACTION = 'previous'
  const HIDDEN = 'none'
  const SHOWN = 'block'
  const SEPARATOR = ' '
  const CLICK_EVENT = 'click'
  const perform = (action: string): void => {
    const performed = document.documentElement.dataset.btPerformed

    document.documentElement.dataset.btPerformed = performed ? [performed, action].join(SEPARATOR) : action
  }
  const pageInput = (): HTMLInputElement | null => document.querySelector(PAGE_INPUT_SELECTOR)
  const position = (): number[] => {
    const match = PAGE_OF.exec(pageInput()?.value ?? '')

    return match ? [Number(match[1]), Number(match[2])] : []
  }
  const redraw = (): void => {
    const total = document.querySelector(TOTAL_SELECTOR)

    total?.replaceChildren(total.textContent ?? '')
  }
  const showPage = (page: number): void => {
    const input = pageInput()

    if (input) {
      input.value = PAGE_TEXT(page, position()[1])
    }
  }
  const itemTexts = (combo: Element): string[] => {
    const pages = Array.from({ length: position()[1] }, (_, index) => PAGE_TEXT(index + 1, position()[1]))

    return combo.classList.contains(SIZE_COMBO_CLASS) ? SIZES.map(SIZE_TEXT) : pages
  }
  const toggleList = (trigger: Element): void => {
    const combo = trigger.closest(COMBO_SELECTOR)
    const existing = combo ? document.getElementById(combo.id + LIST_SUFFIX) : null

    if (!combo) {
      return
    }

    combo.querySelector<HTMLInputElement>(INPUT_SELECTOR)?.focus()

    if (existing && existing.style.display !== HIDDEN) {
      existing.style.display = HIDDEN

      return
    }

    const list = existing ?? document.body.appendChild(document.createElement(LIST_TAG))

    list.id = combo.id + LIST_SUFFIX
    list.className = LIST_CLASS
    list.innerHTML = ITEMS_HTML(itemTexts(combo))
    list.style.display = SHOWN
  }
  const choose = (item: Element): void => {
    const list = item.closest<HTMLElement>(LIST_SELECTOR)
    const combo = list ? document.getElementById(list.id.slice(0, -LIST_SUFFIX.length)) : null
    const input = combo?.querySelector<HTMLInputElement>(INPUT_SELECTOR)
    const number = Number(FIRST_NUMBER.exec(item.textContent ?? '')?.[0])

    if (!list || !combo || !input) {
      return
    }

    input.value = item.textContent ?? ''
    input.focus()
    list.style.display = HIDDEN
    perform(combo.classList.contains(SIZE_COMBO_CLASS) ? SIZE_ACTION(number) : PAGE_ACTION(number))
    redraw()
  }
  const step = (delta: number, action: string): void => {
    showPage(position()[0] + delta)
    perform(action)
    redraw()
  }

  const handlers: [string, (element: Element) => void][] = [
    [TRIGGER_SELECTOR, toggleList],
    [ITEM_SELECTOR, choose],
    [NEXT_SELECTOR, () => {
      step(1, NEXT_ACTION)
    }],
    [PREVIOUS_SELECTOR, () => {
      step(-1, PREVIOUS_ACTION)
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
