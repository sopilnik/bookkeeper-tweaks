import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

const SAMPLE_FILE = 'src/sample.ts'
const PADDING_RULE = '@stylistic/padding-line-between-statements'
const RETURN_WITHOUT_BLANK_LINE = `export function total(price: number): number {
  const tax = price / 10
  return price + tax
}
`
const BLOCK_OPENING_WITH_BLANK_LINE = `export function total(price: number): number {

  return price
}
`
const IF_WITHOUT_BRACES = `export function sign(value: number): number {
  if (value < 0) return -1

  return 1
}
`
const FOUR_PARAMETERS = `export function sum(a: number, b: number, c: number, d: number): number {
  return a + b + c + d
}
`
const ADJACENT_FUNCTIONS = `export function one(): number {
  return 1
}
export function two(): number {
  return 2
}
`
const ADJACENT_TESTS = `it('adds', () => {
  expect(1 + 1).toBe(2)
})
it('subtracts', () => {
  expect(2 - 1).toBe(1)
})
`
const TODO_IN_PROSE = `// Rounding is a todo for the next release.
export const RATE = 10
`
const CODE_RULES_EXAMPLE = `// Illustrative selector and class names.
const APPROVE_BUTTON_SELECTOR = 'button[data-automationid="approve"]'
const WARNING_CLASS = 'approve-warning'
const MIN_UNRECONCILED_FOR_WARNING = 1

function findApproveButton(root: ParentNode): HTMLButtonElement | null {
  return root.querySelector<HTMLButtonElement>(APPROVE_BUTTON_SELECTOR)
}

function needsWarning(unreconciled: number): boolean {
  return unreconciled >= MIN_UNRECONCILED_FOR_WARNING
}

function markButton(button: HTMLButtonElement, warn: boolean): void {
  button.classList.toggle(WARNING_CLASS, warn)
}

export function applyApproveWarning(root: ParentNode, unreconciled: number): boolean {
  const button = findApproveButton(root)
  const warn = needsWarning(unreconciled)

  if (!button) {
    return false
  }

  markButton(button, warn)

  return warn
}
`
const RULE_CASES = [
  { name: 'a return without a blank line before it', code: RETURN_WITHOUT_BLANK_LINE, ruleId: PADDING_RULE },
  { name: 'a block that opens with a blank line', code: BLOCK_OPENING_WITH_BLANK_LINE, ruleId: '@stylistic/padded-blocks' },
  { name: 'an if without braces', code: IF_WITHOUT_BRACES, ruleId: 'curly' },
  { name: 'a function with four parameters', code: FOUR_PARAMETERS, ruleId: '@typescript-eslint/max-params' },
  { name: 'two functions without a blank line between them', code: ADJACENT_FUNCTIONS, ruleId: PADDING_RULE },
  { name: 'two tests without a blank line between them', code: ADJACENT_TESTS, ruleId: PADDING_RULE },
  { name: 'a todo in a comment', code: TODO_IN_PROSE, ruleId: 'no-warning-comments' },
]
const eslint = new ESLint()

async function ruleIdsOf(code: string): Promise<(string | null)[]> {
  const [result] = await eslint.lintText(code, { filePath: SAMPLE_FILE })

  return result.messages.map((message) => message.ruleId)
}

describe('the lint config', () => {
  it.each(RULE_CASES)('flags $name', async ({ code, ruleId }) => {
    expect(await ruleIdsOf(code)).toContain(ruleId)
  })

  it('accepts the example of the code rules', async () => {
    expect(await ruleIdsOf(CODE_RULES_EXAMPLE)).toEqual([])
  })
})
