import { APPROVE_ACTIONS, DEFAULT_SETTINGS } from './schema'
import type { ApproveAction, Settings } from './schema'

type StoredObject = Record<string, unknown>

// Object() turns undefined, null and other primitives into an object without any of the settings' fields
function asStoredObject(value: unknown): StoredObject {
  return Object(value)
}

function isApproveAction(value: unknown): value is ApproveAction {
  return APPROVE_ACTIONS.some((action) => action === value)
}

function readEnabled(feature: unknown, fallback: boolean): boolean {
  const value = asStoredObject(feature).enabled

  return value === true || value === false ? value : fallback
}

function readApproveAction(feature: unknown): ApproveAction {
  const value = asStoredObject(feature).action

  return isApproveAction(value) ? value : DEFAULT_SETTINGS.approveDefault.action
}

export function normalizeSettings(raw: unknown): Settings {
  const stored = asStoredObject(raw)

  return {
    approveDefault: {
      enabled: readEnabled(stored.approveDefault, DEFAULT_SETTINGS.approveDefault.enabled),
      action: readApproveAction(stored.approveDefault),
    },
    topPager: { enabled: readEnabled(stored.topPager, DEFAULT_SETTINGS.topPager.enabled) },
    directPrint: { enabled: readEnabled(stored.directPrint, DEFAULT_SETTINGS.directPrint.enabled) },
    recodeSort: { enabled: readEnabled(stored.recodeSort, DEFAULT_SETTINGS.recodeSort.enabled) },
  }
}
