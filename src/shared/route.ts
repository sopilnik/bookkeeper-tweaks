const OBSERVE_TREE: MutationObserverInit = { childList: true, subtree: true }

// The new app routes on the client: a route change shows up as a change under target, not as a page load. Calls
// onChange with the new path after every such change that left the page on another path; the returned function stops
export function watchRoute(target: Node, onChange: (pathname: string) => void): () => void {
  let current = location.pathname
  const observer = new MutationObserver(() => {
    if (location.pathname === current) {
      return
    }

    current = location.pathname
    onChange(current)
  })

  observer.observe(target, OBSERVE_TREE)

  return () => {
    observer.disconnect()
  }
}
