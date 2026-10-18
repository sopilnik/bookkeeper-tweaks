// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { keepPlaced } from '../../../src/shared/keeper'

const ELEMENT_TAG = 'span'
const CHANGE_TAG = 'p'
let stop = (): void => {}

// Lets the observer see the change
function settle(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0)
  })
}

afterEach(() => {
  stop()
  document.body.replaceChildren()
})

describe('keepPlaced', () => {
  it('places the element at once and again after every change under root', async () => {
    const place = vi.fn()

    stop = keepPlaced(document.body, document.createElement(ELEMENT_TAG), place)
    document.body.append(document.createElement(CHANGE_TAG))
    await settle()

    expect(place).toHaveBeenCalledTimes(2)
  })

  it('stops watching and removes the element when stopped', async () => {
    const place = vi.fn()
    const element = document.createElement(ELEMENT_TAG)

    document.body.append(element)
    keepPlaced(document.body, element, place)()
    document.body.append(document.createElement(CHANGE_TAG))
    await settle()

    expect(place).toHaveBeenCalledTimes(1)
    expect(element.isConnected).toBe(false)
  })
})
