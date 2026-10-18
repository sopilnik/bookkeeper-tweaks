// The two halves of feature 4 run in two worlds of the Find and recode page and talk through events on the document;
// an event carries at most a direction, a plain string, which crosses between the worlds as it is
export type SortDirection = 'asc' | 'desc'
