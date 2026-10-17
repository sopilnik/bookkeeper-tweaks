// The extension's callout under an Approve group (see approve.css)
const NOTICE_CLASS = 'bt-approve-notice'
const HOST_CLASS = 'bt-approve-notice-host'
const NOTICE_TAG = 'div'
const ROLE_ATTRIBUTE = 'role'
const NOTICE_ROLE = 'status'
const NOTICE_MS = 8000

// Shows the message in a callout under the group for eight seconds; the returned function removes it sooner
export function showNotice(group: Element, message: string): () => void {
  const notice = document.createElement(NOTICE_TAG)
  const remove = (): void => {
    clearTimeout(timer)
    notice.remove()
    group.classList.remove(HOST_CLASS)
  }
  const timer = setTimeout(remove, NOTICE_MS)

  notice.className = NOTICE_CLASS
  notice.setAttribute(ROLE_ATTRIBUTE, NOTICE_ROLE)
  notice.textContent = message
  group.classList.add(HOST_CLASS)
  group.append(notice)

  return remove
}
