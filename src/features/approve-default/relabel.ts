import type { ApproveAction } from '../../settings/schema'
import { actionOfButton, relabelFor } from './decide'
import { GROUP_SELECTOR, PRIMARY_SELECTOR, TOOLTIP_ATTRIBUTE } from './selectors'

// The extension's own names (see approve.css); the originals are kept on Xero's elements to restore them
const MARKED_GROUP_CLASS = 'bt-approve-group'
const DOT_CLASS = 'bt-approve-dot'
const DOT_SELECTOR = `.${DOT_CLASS}`
const DOT_TAG = 'span'
const DOT_TITLE = 'Set by Bookkeeper Tweaks'
const HIDDEN_TOOLTIP_CLASS = 'bt-approve-tooltip-hidden'
const ORIGINAL_KEY = 'btOriginal'
const WATCHED: MutationObserverInit = {
  childList: true,
  subtree: true,
  characterData: true,
  attributes: true,
  attributeFilter: [TOOLTIP_ATTRIBUTE],
}

function textNodeOf(element: Element): Text | null {
  return [...element.childNodes].find((node): node is Text => node instanceof Text) ?? null
}

function tooltipOf(primary: Element): HTMLElement | null {
  return document.getElementById(primary.getAttribute(TOOLTIP_ATTRIBUTE) ?? '')
}

// Writes into the element's own text node, so the node Xero's page renders stays in place, and keeps the original
function setText(element: HTMLElement, text: string): void {
  const node = textNodeOf(element)

  if (!node || node.nodeValue === text) {
    return
  }

  element.dataset[ORIGINAL_KEY] ??= node.nodeValue ?? ''
  node.nodeValue = text
}

function restoreText(element: HTMLElement | null): void {
  const original = element?.dataset[ORIGINAL_KEY]
  const node = element ? textNodeOf(element) : null

  if (!element || original === undefined || !node) {
    return
  }

  node.nodeValue = original
  delete element.dataset[ORIGINAL_KEY]
}

function showShortcut(tooltip: HTMLElement | null, shortcut: string): void {
  if (!tooltip) {
    return
  }

  if (shortcut === '') {
    tooltip.classList.add(HIDDEN_TOOLTIP_CLASS)

    return
  }

  setText(tooltip, shortcut)
}

function addDot(group: Element): void {
  if (group.querySelector(DOT_SELECTOR)) {
    return
  }

  const dot = document.createElement(DOT_TAG)

  dot.className = DOT_CLASS
  dot.title = DOT_TITLE
  group.classList.add(MARKED_GROUP_CLASS)
  group.append(dot)
}

function relabelGroup(group: Element, chosen: ApproveAction): void {
  const primary = group.querySelector<HTMLElement>(PRIMARY_SELECTOR)
  const look = primary ? relabelFor(actionOfButton(primary.id), chosen) : null

  if (!primary || !look) {
    return
  }

  setText(primary, look.label)
  showShortcut(tooltipOf(primary), look.shortcut)
  addDot(group)
}

function restoreGroup(group: Element): void {
  const primary = group.querySelector<HTMLElement>(PRIMARY_SELECTOR)
  const tooltip = primary ? tooltipOf(primary) : null

  restoreText(primary)
  restoreText(tooltip)
  tooltip?.classList.remove(HIDDEN_TOOLTIP_CLASS)
  group.querySelector(DOT_SELECTOR)?.remove()
  group.classList.remove(MARKED_GROUP_CLASS)
}

function relabelAll(root: ParentNode, chosen: ApproveAction): void {
  root.querySelectorAll(GROUP_SELECTOR).forEach((group) => {
    relabelGroup(group, chosen)
  })
}

// Relabels every Approve group under root to the chosen action now and whenever the page changes (Xero re-renders its
// buttons); the observer is off while it writes, so its own writes never wake it. The returned function stops and
// restores Xero's buttons
export function keepRelabelled(root: ParentNode & Node, chosen: ApproveAction): () => void {
  const observer = new MutationObserver(() => {
    observer.disconnect()
    relabelAll(root, chosen)
    observer.observe(root, WATCHED)
  })

  relabelAll(root, chosen)
  observer.observe(root, WATCHED)

  return () => {
    observer.disconnect()
    root.querySelectorAll(GROUP_SELECTOR).forEach(restoreGroup)
  }
}
