import { compareDescriptions } from './compare'
import type { SortDirection } from './messages'

// The part of Ext JS 4.2's store that the sort uses, as read on Find and recode
export interface StoreSorter {
  property?: string
  sorterFn?: unknown
}

interface LoadOperation {
  sorters?: StoreSorter[]
}

// Ext calls a store's beforeload and load listeners with the store and the load's operation, among others
export type StoreListener = (store: RecodeStore, operation: LoadOperation) => void

export interface RecodeStore {
  remoteSort: boolean
  sorters: { clear: () => void, addAll: (sorters: StoreSorter[]) => void }
  getSorters: () => StoreSorter[]
  sort: (sorter: StoreSorter) => void
  on: (event: string, listener: StoreListener) => void
}

interface RecodeRecord {
  get: (field: string) => unknown
}

const DESCRIPTION_FIELD = 'Description'
const DIRECTION_SIGN: Record<SortDirection, number> = { asc: 1, desc: -1 }
const BEFORE_LOAD_EVENT = 'beforeload'
const LOAD_EVENT = 'load'
// Xero's sorters, kept per store while a local sort is in place
const xeroSorters = new WeakMap<RecodeStore, StoreSorter[]>()
// The compare functions of the extension's own sorters, which tell them apart from Xero's and the user's
const ownCompares = new WeakSet<object>()
const watched = new WeakSet<RecodeStore>()

function descriptionSorter(direction: SortDirection): StoreSorter {
  const sign = DIRECTION_SIGN[direction]
  const sorterFn = (a: RecodeRecord, b: RecodeRecord): number => {
    return sign * compareDescriptions(a.get(DESCRIPTION_FIELD), b.get(DESCRIPTION_FIELD))
  }

  ownCompares.add(sorterFn)

  return { sorterFn }
}

function isOwn(sorter: StoreSorter): boolean {
  return typeof sorter.sorterFn === 'function' && ownCompares.has(sorter.sorterFn)
}

// Sorts the rows on the loaded page by description. Ext sorts in the browser only while remoteSort is off, so it is
// off for this call alone; Xero's sorters are kept, once, for the next load
export function sortPage(store: RecodeStore, direction: SortDirection): void {
  if (!xeroSorters.has(store)) {
    xeroSorters.set(store, store.getSorters().slice())
  }

  store.remoteSort = false
  store.sort(descriptionSorter(direction))
  store.remoteSort = true
}

// Before Ext loads rows: a load that still carries the extension's sorter (paging, a page-size change) goes out with
// Xero's own sorters, which also go back into the store; a load after a header click carries the user's own sort
function restoreSorters(store: RecodeStore, operation: LoadOperation): void {
  const kept = xeroSorters.get(store)

  xeroSorters.delete(store)

  if (!kept || !operation.sorters?.some(isOwn)) {
    return
  }

  store.sorters.clear()
  store.sorters.addAll(kept)
  operation.sorters = kept
}

// Watches the store's loads, once per store: each load gets Xero's sorters back where the extension's are, then
// onLoad says that the rows are in Xero's order again
export function watchLoads(store: RecodeStore, onLoad: () => void): void {
  if (watched.has(store)) {
    return
  }

  watched.add(store)
  store.on(BEFORE_LOAD_EVENT, restoreSorters)
  store.on(LOAD_EVENT, onLoad)
}
