import { loadSettings, saveSettings } from '../settings/storage'
import { fillForm, readForm, showSaved } from './form'

const FORM_SELECTOR = '#bt-settings-form'
const VERSION_SELECTOR = '#bt-version'
const CHANGE_EVENT = 'change'

function showVersion(slot: HTMLElement, version: string): void {
  slot.textContent = version
}

// Saves the whole form on every change, then marks the control that changed
async function saveChange(form: HTMLFormElement, event: Event): Promise<void> {
  await saveSettings(chrome.storage.local, readForm(form))

  if (!(event.target instanceof Element)) {
    return
  }

  showSaved(form, event.target)
}

async function start(): Promise<void> {
  const form = document.querySelector<HTMLFormElement>(FORM_SELECTOR)
  const slot = document.querySelector<HTMLElement>(VERSION_SELECTOR)
  const { version } = chrome.runtime.getManifest()

  if (!form || !slot) {
    return
  }

  showVersion(slot, version)
  fillForm(form, await loadSettings(chrome.storage.local))

  form.addEventListener(CHANGE_EVENT, (event) => {
    void saveChange(form, event)
  })

  // Inert in the markup, so a change made before the listener exists cannot be lost to fillForm
  form.inert = false
}

void start()
