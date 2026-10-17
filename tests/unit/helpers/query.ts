// The element the selector names under root; throws with the selector when there is none, so a test fails at the
// lookup and says which element was missing
export function queryRequired<T extends Element>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector)

  if (!element) {
    throw new Error(selector)
  }

  return element
}
