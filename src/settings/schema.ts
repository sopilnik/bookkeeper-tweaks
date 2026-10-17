export const APPROVE_ACTIONS = [
  'approve',
  'approve-and-email',
  'approve-and-add-another',
  'approve-and-view-next',
  'approve-and-get-link',
  'approve-and-print-pdf',
] as const

export type ApproveAction = (typeof APPROVE_ACTIONS)[number]

export interface Settings {
  approveDefault: { enabled: boolean, action: ApproveAction }
  topPager: { enabled: boolean }
  directPrint: { enabled: boolean }
  recodeSort: { enabled: boolean }
}

export const DEFAULT_SETTINGS: Settings = {
  approveDefault: { enabled: true, action: 'approve' },
  topPager: { enabled: true },
  directPrint: { enabled: true },
  recodeSort: { enabled: true },
}
