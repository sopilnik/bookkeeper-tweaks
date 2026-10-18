// The frame stays rendered, out of sight: Chrome never starts its PDF viewer in a frame with display: none
const FRAME_STYLE = 'position: fixed; left: 0; bottom: 0; width: 1px; height: 1px; border: 0; opacity: 0'
const FRAME_TAG = 'iframe'
const LOAD_EVENT = 'load'
const ONCE = { once: true }

// Loads the PDF at the url into a hidden frame and opens Chrome's print dialog for it once it has loaded; the returned
// function removes the frame
export function printInFrame(url: string): () => void {
  const frame = document.createElement(FRAME_TAG)

  frame.style.cssText = FRAME_STYLE

  frame.addEventListener(LOAD_EVENT, () => {
    frame.contentWindow?.print()
  }, ONCE)

  frame.src = url
  document.body.append(frame)

  return () => {
    frame.remove()
  }
}
