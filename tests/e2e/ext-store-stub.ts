// Stands in for the part of Ext JS 4.2 that the page-world script uses on the Find and recode fixture:
// Ext.ComponentQuery finds the results panel, whose store draws its rows into the grid view and sorts them in the
// browser only while remoteSort is off — with remoteSort on, a sort asks the server, which keeps Xero's order. A load
// runs beforeload with an operation built from the store's sorters, records the sorters it sends on
// <html data-bt-sent-sorters>, draws the rows in Xero's order and runs load. Self-contained, because Playwright
// serializes it into the page; its types are erased, so they live outside it
interface Sorter {
  property?: string
  sorterFn?: (a: unknown, b: unknown) => number
}

type Listener = (store: unknown, operation: { sorters: Sorter[] }) => void

export function installExtStore(): void {
  const DESCRIPTIONS = ['Team coffees', 'Bank fee', '', 'Misc stationery']
  const XERO_SORTER = { property: 'InvoiceDate' }
  const GRID_BODY_SELECTOR = '.x-grid-view tbody'
  const RESULTS_XTYPE = 'resultspanel'
  const ROW_TAG = 'tr'
  const CELL_TAG = 'td'
  const SEPARATOR = ' '
  const OWN_SORTER = 'own'
  const DRAW_EVENT = 'DOMContentLoaded'
  const BEFORE_LOAD_EVENT = 'beforeload'
  const LOAD_EVENT = 'load'
  const records = DESCRIPTIONS.map((description) => ({ get: () => description }))
  const listeners = new Map<string, Listener[]>()
  let current: Sorter[] = [XERO_SORTER]
  let rows = [...records]
  const draw = (): void => {
    const body = document.querySelector(GRID_BODY_SELECTOR)
    const drawn = rows.map((record) => {
      const row = document.createElement(ROW_TAG)
      const cell = document.createElement(CELL_TAG)

      cell.textContent = String(record.get())
      row.append(cell)

      return row
    })

    body?.replaceChildren(...drawn)
  }
  const store = {
    remoteSort: true,
    sorters: {
      clear: (): void => {
        current = []
      },
      addAll: (sorters: Sorter[]): void => {
        current.push(...sorters)
      },
    },
    getSorters: (): Sorter[] => current,
    on: (event: string, listener: Listener): void => {
      listeners.set(event, [...(listeners.get(event) ?? []), listener])
    },
    load: (): void => {
      const operation = { sorters: current }

      listeners.get(BEFORE_LOAD_EVENT)?.forEach((listener) => {
        listener(store, operation)
      })

      const sent = operation.sorters.map((sorter) => sorter.property ?? OWN_SORTER)

      document.documentElement.dataset.btSentSorters = sent.join(SEPARATOR)
      rows = [...records]
      draw()

      listeners.get(LOAD_EVENT)?.forEach((listener) => {
        listener(store, operation)
      })
    },
    sort: (sorter: Sorter): void => {
      current = [sorter]

      if (store.remoteSort || !sorter.sorterFn) {
        store.load()

        return
      }

      rows = [...rows].sort(sorter.sorterFn)
      draw()
    },
  }

  const panel = { getStore: () => store }
  const query = (xtype: string): unknown[] => (xtype === RESULTS_XTYPE ? [panel] : [])

  Object.assign(window, { Ext: { ComponentQuery: { query } } })
  document.addEventListener(DRAW_EVENT, draw)
}
