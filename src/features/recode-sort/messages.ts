// The two halves of feature 4 run in two worlds of the Find and recode page and talk through events on the document;
// an event carries at most a direction, a plain string, which crosses between the worlds as it is
export type SortDirection = 'asc' | 'desc'

// The isolated control asks the page world to sort; detail: the direction
export const SORT_EVENT = 'bookkeeper-tweaks:recode-sort'
// The page world has sorted; detail: the direction
export const SORTED_EVENT = 'bookkeeper-tweaks:recode-sorted'
// Ext has loaded rows: they are in Xero's order again
export const RESET_EVENT = 'bookkeeper-tweaks:recode-reset'
