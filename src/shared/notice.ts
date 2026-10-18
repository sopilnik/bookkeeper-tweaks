// The extension's callout under one of its places on Xero's page (see notice.css)
const NOTICE_CLASS = 'bt-notice'
const HOST_CLASS = 'bt-notice-host'
const NOTICE_TAG = 'div'
const ROLE_ATTRIBUTE = 'role'
const NOTICE_ROLE = 'status'
const NOTICE_MS = 8000

// Shows the message in a callout under the host for eight seconds; the returned function removes it sooner
export function showNotice(host: Element, message: string): () => void {
  const notice = document.createElement(NOTICE_TAG)
  const remove = (): void => {
    clearTimeout(timer)
    notice.remove()
    host.classList.remove(HOST_CLASS)
  }
  const timer = setTimeout(remove, NOTICE_MS)

  notice.className = NOTICE_CLASS
  notice.setAttribute(ROLE_ATTRIBUTE, NOTICE_ROLE)
  notice.textContent = message
  host.classList.add(HOST_CLASS)
  host.append(notice)

  return remove
}
