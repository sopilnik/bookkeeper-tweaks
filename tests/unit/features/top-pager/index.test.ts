// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { activateTopPager } from '../../../../src/features/top-pager'
import { loadFixture } from '../../helpers/fixture'

const BILLS_FIXTURE = 'tests/fixtures/app/!demo0/bills/list/all.html'
const BILLS_PATH = '/app/!demo0/bills/list/all'
const OTHER_PATH = '/app/!demo0/contacts/customers'
const BAR = 'nav.bt-pager'
let stop = (): void => {}

beforeEach(async () => {
  await loadFixture(BILLS_FIXTURE)
})

afterEach(() => {
  stop()
})

describe('activateTopPager', () => {
  it('draws the bar on one of its lists while the feature is on', () => {
    stop = activateTopPager(document.body, BILLS_PATH, true)

    expect(document.querySelectorAll(BAR)).toHaveLength(1)
  })

  it('does nothing while the feature is off', () => {
    stop = activateTopPager(document.body, BILLS_PATH, false)

    expect(document.querySelector(BAR)).toBeNull()
  })

  it('does nothing on another page', () => {
    stop = activateTopPager(document.body, OTHER_PATH, true)

    expect(document.querySelector(BAR)).toBeNull()
  })

  it('removes the bar when deactivated', () => {
    stop = activateTopPager(document.body, BILLS_PATH, true)

    stop()

    expect(document.querySelector(BAR)).toBeNull()
  })
})
