// Xero's elements for feature 1, as read on the demo company: every Approve button group, its primary button (whose
// id names its action) and the attribute that points to the primary's shortcut tooltip
export const GROUP_SELECTOR = 'div.ApproveAndEmailButton'
export const PRIMARY_SELECTOR = 'button[id^="ApproveAndEmailButton-"]'
export const TOOLTIP_ATTRIBUTE = 'aria-describedby'
// Its menu: the split trigger, the open list in the portal (the trigger carries no aria-expanded) and the options,
// whose ids are the prefix plus the action
export const TRIGGER_SELECTOR = 'button[data-automationid="ApproveAndEmailButton-dropdown-trigger"]'
export const OPEN_MENU_SELECTOR = '.ApproveAndEmailDropdown'
export const OPTION_SELECTOR_PREFIX = '#ApproveAndEmailButton-'
