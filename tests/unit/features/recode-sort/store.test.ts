import { describe, expect, it, vi } from 'vitest'
import type { SortDirection } from '../../../../src/features/recode-sort/messages'
import type { RecodeStore, StoreListener, StoreSorter } from '../../../../src/features/recode-sort/store'
import { sortPage, watchLoads } from '../../../../src/features/recode-sort/store'

interface FakeRecord {
  get: (field: string) => unknown
}

const ASCENDING: SortDirection = 'asc'
const DESCENDING: SortDirection = 'desc'
const XERO_SORTER: StoreSorter = { property: 'InvoiceDate' }
const HEADER_SORTER: StoreSorter = { property: 'ContactName' }
const DESCRIPTIONS = ['Team coffees', '', 'Bank fee', 'Misc stationery']
const BEFORE_LOAD = 'beforeload'
const LOAD = 'load'

function recordOf(description: string): FakeRecord {
  return { get: () => description }
}

// Stands in for Ext JS 4.2's store as Find and recode uses it: sort() replaces the sorters, and orders the records
// only while remoteSort is off; a load runs beforeload with an operation built from the sorters, then load
class FakeStore implements RecodeStore {
  remoteSort = true
  records = DESCRIPTIONS.map(recordOf)
  current: StoreSorter[] = [XERO_SORTER]
  remoteDuringSort: boolean[] = []
  listeners = new Map<string, StoreListener[]>()
  sorters = {
    clear: (): void => {
      this.current = []
    },
    addAll: (sorters: StoreSorter[]): void => {
      this.current.push(...sorters)
    },
  }

  getSorters(): StoreSorter[] {
    return this.current
  }

  sort(sorter: StoreSorter): void {
    const compare = sorter.sorterFn as (a: FakeRecord, b: FakeRecord) => number

    this.remoteDuringSort.push(this.remoteSort)
    this.current = [sorter]

    if (!this.remoteSort) {
      this.records.sort(compare)
    }
  }

  on(event: string, listener: StoreListener): void {
    this.listeners.set(event, [...(this.listeners.get(event) ?? []), listener])
  }

  // A load as Ext runs it; gives the sorters the request went out with
  load(): StoreSorter[] {
    const operation = { sorters: this.current }

    this.listeners.get(BEFORE_LOAD)?.forEach((listener) => {
      listener(this, operation)
    })

    this.listeners.get(LOAD)?.forEach((listener) => {
      listener(this, operation)
    })

    return operation.sorters
  }

  descriptions(): unknown[] {
    return this.records.map((record) => record.get(''))
  }
}

describe('sortPage', () => {
  it('sorts the loaded page from A to Z, empty descriptions first', () => {
    const store = new FakeStore()

    sortPage(store, ASCENDING)

    expect(store.descriptions()).toEqual(['', 'Bank fee', 'Misc stationery', 'Team coffees'])
  })

  it('sorts it from Z to A', () => {
    const store = new FakeStore()

    sortPage(store, DESCENDING)

    expect(store.descriptions()).toEqual(['Team coffees', 'Misc stationery', 'Bank fee', ''])
  })

  it('turns remote sorting off for its own call only', () => {
    const store = new FakeStore()

    sortPage(store, ASCENDING)

    expect(store.remoteDuringSort).toEqual([false])
    expect(store.remoteSort).toBe(true)
  })
})

describe('watchLoads', () => {
  it('sends Xero\'s own sorters with the next load and puts them back into the store', () => {
    const store = new FakeStore()

    watchLoads(store, vi.fn())
    sortPage(store, ASCENDING)
    sortPage(store, DESCENDING)

    expect(store.load()).toEqual([XERO_SORTER])
    expect(store.getSorters()).toEqual([XERO_SORTER])
  })

  it('leaves the user\'s own header sort alone', () => {
    const store = new FakeStore()

    watchLoads(store, vi.fn())
    sortPage(store, ASCENDING)
    store.sort(HEADER_SORTER)

    expect(store.load()).toEqual([HEADER_SORTER])
  })

  it('announces every load, and listens to a store once', () => {
    const store = new FakeStore()
    const onLoad = vi.fn()

    watchLoads(store, onLoad)
    watchLoads(store, onLoad)
    store.load()
    store.load()

    expect(onLoad).toHaveBeenCalledTimes(2)
  })
})
