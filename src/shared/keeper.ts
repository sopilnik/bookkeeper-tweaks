const WATCHED: MutationObserverInit = { childList: true, subtree: true }

// Keeps an element of the extension in its place under root: place puts it there now and again after every change
// under root, as React and Ext draw their parts anew. The returned function stops and removes the element
export function keepPlaced(root: Node, element: HTMLElement, place: () => void): () => void {
  const observer = new MutationObserver(place)

  place()
  observer.observe(root, WATCHED)

  return () => {
    observer.disconnect()
    element.remove()
  }
}
