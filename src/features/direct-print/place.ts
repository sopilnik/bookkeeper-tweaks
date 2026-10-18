// Puts the control right before Xero's print group, or takes it out when the header has no print group
export function placeBefore(control: HTMLElement, group: Element | null): void {
  if (!group) {
    control.remove()

    return
  }

  if (control.nextElementSibling !== group) {
    group.before(control)
  }
}
