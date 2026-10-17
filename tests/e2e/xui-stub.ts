// Stands in for Xero's split Approve button on fixture pages: the trigger opens and closes the Approve menu in a
// portal with the given actions, and every action Xero would perform — an option picked, or the primary button's own
// Approve & email — is appended to data-bt-performed on <html>. Self-contained, because Playwright serializes it into
// the page; unit tests call it directly and remove it with the returned function
export function installXuiStub(actions: readonly string[]): () => void {
  const TRIGGER_SELECTOR = '[data-automationid="ApproveAndEmailButton-dropdown-trigger"]'
  const PRIMARY_SELECTOR = '#ApproveAndEmailButton-approve-and-email'
  const OPTION_SELECTOR = '[role="option"]'
  const LIST_SELECTOR = '.ApproveAndEmailDropdown'
  const LIST_CLASS = 'xui-dropdown-layout ApproveAndEmailDropdown'
  const LIST_TAG = 'div'
  const LIST_ID = 'xui-stub-list'
  const CONTROLS_ATTRIBUTE = 'aria-controls'
  const XERO_ACTION = 'approve-and-email'
  const SEPARATOR = ' '
  const CLICK_EVENT = 'click'
  const optionHtml = (action: string): string => `<li role="option" data-action="${action}" id="ApproveAndEmailButton-${action}"><button type="button">${action}</button></li>`
  const listHtml = (items: readonly string[]): string => `<ul role="listbox">${items.map(optionHtml).join('')}</ul>`
  const perform = (action: string): void => {
    const performed = document.documentElement.dataset.btPerformed

    document.documentElement.dataset.btPerformed = performed ? [performed, action].join(SEPARATOR) : action
  }
  const closeList = (trigger: Element | null): void => {
    document.querySelector(LIST_SELECTOR)?.remove()
    trigger?.removeAttribute(CONTROLS_ATTRIBUTE)
  }
  const toggleList = (trigger: Element): void => {
    const list = document.createElement(LIST_TAG)

    if (document.querySelector(LIST_SELECTOR)) {
      closeList(trigger)

      return
    }

    list.className = LIST_CLASS
    list.id = LIST_ID
    list.innerHTML = listHtml(actions)
    trigger.setAttribute(CONTROLS_ATTRIBUTE, LIST_ID)
    document.body.append(list)
  }

  const onClick = (event: Event): void => {
    const target = event.target instanceof Element ? event.target : null
    const trigger = target?.closest(TRIGGER_SELECTOR)
    const option = target?.closest<HTMLElement>(OPTION_SELECTOR)

    if (trigger) {
      toggleList(trigger)
    }

    if (option?.dataset.action) {
      perform(option.dataset.action)
      closeList(document.querySelector(TRIGGER_SELECTOR))
    }

    if (target?.closest(PRIMARY_SELECTOR)) {
      perform(XERO_ACTION)
    }
  }

  document.addEventListener(CLICK_EVENT, onClick)

  return () => {
    document.removeEventListener(CLICK_EVENT, onClick)
  }
}
