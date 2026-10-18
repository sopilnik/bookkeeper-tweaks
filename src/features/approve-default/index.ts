import type { ApproveAction } from '../../settings/schema'
import { showNotice } from '../../shared/notice'
import { takeOverApproveClicks } from './click'
import { missingOptionMessage } from './decide'
import { keepRelabelled } from './relabel'
import { PRIMARY_SELECTOR } from './selectors'

function buttonTextOf(group: Element): string {
  return group.querySelector(PRIMARY_SELECTOR)?.textContent ?? ''
}

// Feature 1 on an invoice page: the Approve buttons show and do the chosen action. When Xero's menu lacks it, the
// buttons go back to Xero and a notice says so. The returned function deactivates the feature and removes everything
// it added
export function activateApproveDefault(root: ParentNode & Node, chosen: ApproveAction): () => void {
  let removeNotice = (): void => {}
  const stopRelabel = keepRelabelled(root, chosen)
  const onMissing = (group: Element): void => {
    stopRelabel()
    removeNotice = showNotice(group, missingOptionMessage(chosen, buttonTextOf(group)))
  }
  const stopClicks = takeOverApproveClicks({ chosen, onMissing })

  return () => {
    stopClicks()
    stopRelabel()
    removeNotice()
  }
}
