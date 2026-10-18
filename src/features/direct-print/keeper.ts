const WATCHED: MutationObserverInit = { childList: true, subtree: true }

// Puts the control right before the group, or takes it out when there is no group
function placeBefore(control: HTMLElement, group: Element | null): void {
  if (!group) {
    control.remove()

    return
  }

  if (control.nextElementSibling !== group) {
    group.before(control)
  }
}

// Keeps the control right before the group the selector names under root: put back whenever React draws the header
// again, taken out while the header has no such group. The returned function stops and removes the control
export function keepBeforeGroup(root: ParentNode & Node, control: HTMLElement, groupSelector: string): () => void {
  const place = (): void => {
    placeBefore(control, root.querySelector(groupSelector))
  }
  const observer = new MutationObserver(place)

  place()
  observer.observe(root, WATCHED)

  return () => {
    observer.disconnect()
    control.remove()
  }
}
