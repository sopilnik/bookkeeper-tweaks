import { normalizeSettings } from '../settings/normalize'
import type { Settings } from '../settings/schema'

// Each feature's switch is named after its key in Settings; the Approve action is one radio group
const FEATURES: readonly (keyof Settings)[] = ['approveDefault', 'topPager', 'directPrint', 'recodeSort']
const ACTION_FIELD = 'approveAction'
const SAVED_SCOPE_SELECTOR = '[data-bt-saved-scope]'
const SAVED_MARK_SELECTOR = '.bt-saved'

function isInput(node: Node): node is HTMLInputElement {
  return node instanceof HTMLInputElement
}

function findSwitch(fields: HTMLFormControlsCollection, feature: string): HTMLInputElement | null {
  const field = fields.namedItem(feature)

  return field instanceof HTMLInputElement ? field : null
}

function findActionRadios(fields: HTMLFormControlsCollection): HTMLInputElement[] {
  const field = fields.namedItem(ACTION_FIELD)

  return field instanceof RadioNodeList ? Array.from(field).filter(isInput) : []
}

function isSwitchedOn(fields: HTMLFormControlsCollection, feature: string): boolean {
  return findSwitch(fields, feature)?.checked === true
}

function chosenAction(fields: HTMLFormControlsCollection): string {
  const field = fields.namedItem(ACTION_FIELD)

  return field instanceof RadioNodeList ? field.value : ''
}

function setSwitch(field: HTMLInputElement | null, on: boolean): void {
  if (!field) {
    return
  }

  field.checked = on
}

function checkAction(radios: HTMLInputElement[], action: string): void {
  radios.forEach((radio) => {
    radio.checked = radio.value === action
  })
}

function findSavedMark(control: Element): Element | null {
  return control.closest(SAVED_SCOPE_SELECTOR)?.querySelector(SAVED_MARK_SELECTOR) ?? null
}

function findSavedMarks(form: HTMLFormElement): NodeListOf<HTMLElement> {
  return form.querySelectorAll<HTMLElement>(SAVED_MARK_SELECTOR)
}

function showOnlyMark(marks: NodeListOf<HTMLElement>, mark: Element | null): void {
  marks.forEach((each) => {
    each.hidden = each !== mark
  })
}

// What the form shows, as settings; anything the form cannot say falls back to the defaults
export function readForm(form: HTMLFormElement): Settings {
  const switches = Object.fromEntries(FEATURES.map((feature) => [feature, { enabled: isSwitchedOn(form.elements, feature) }]))
  const approveDefault = { ...switches.approveDefault, action: chosenAction(form.elements) }

  return normalizeSettings({ ...switches, approveDefault })
}

export function fillForm(form: HTMLFormElement, settings: Settings): void {
  FEATURES.forEach((feature) => {
    setSwitch(findSwitch(form.elements, feature), settings[feature].enabled)
  })

  checkAction(findActionRadios(form.elements), settings.approveDefault.action)
}

// Shows "Saved" next to the control that changed and hides it everywhere else
export function showSaved(form: HTMLFormElement, control: Element): void {
  showOnlyMark(findSavedMarks(form), findSavedMark(control))
}
