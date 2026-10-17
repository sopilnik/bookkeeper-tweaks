import js from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import tseslint from 'typescript-eslint'

// Rule 4: statements that always stand apart, from each other too
const SET_APART = [
  'function',
  { selector: 'ExportNamedDeclaration[declaration.type="FunctionDeclaration"]' },
  { selector: 'ExportDefaultDeclaration[declaration.type="FunctionDeclaration"]' },
  { selector: 'ExpressionStatement:has(:function[body.type="BlockStatement"])' },
]

const config = [
  { ignores: ['dist/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // The house style: single quotes, no semicolons
    files: ['**/*.{ts,mts,js,mjs}'],
    plugins: { '@stylistic': stylistic },
    rules: {
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
      '@stylistic/semi': ['error', 'never'],
    },
  },
  {
    // The code rules
    files: ['**/*.{ts,mts,js,mjs}'],
    plugins: { '@stylistic': stylistic },
    rules: {
      // Rule 1
      'max-lines-per-function': ['error', { max: 150, skipBlankLines: true, skipComments: true, IIFEs: true }],
      // Rule 6; `max-params` is replaced for TS files below
      'max-depth': ['error', { max: 3 }],
      complexity: ['error', { max: 10, variant: 'classic' }],
      'max-params': ['error', { max: 3 }],
      // Rules 2–4. The last matching entry wins: every `any` entry relaxes the `always` entries above it, and the
      // entries below it override it again
      '@stylistic/padding-line-between-statements': ['error',
        // Rule 4, block statements
        { blankLine: 'always', prev: 'block-like', next: '*' },
        { blankLine: 'always', prev: '*', next: 'block-like' },
        { blankLine: 'any', prev: 'block-like', next: 'block-like' },
        { blankLine: 'any', prev: ['case', 'default'], next: ['case', 'default'] },
        // Rule 3
        { blankLine: 'always', prev: ['const', 'let', 'export'], next: '*' },
        { blankLine: 'always', prev: '*', next: ['const', 'let', 'export'] },
        { blankLine: 'any', prev: ['const', 'let', 'export'], next: ['const', 'let', 'export'] },
        // Rule 4, functions and statements with a callback
        { blankLine: 'always', prev: SET_APART, next: '*' },
        { blankLine: 'always', prev: '*', next: SET_APART },
        // Rule 2, last, so that no `any` entry relaxes it (a `return () => { … }` after a block is block-like too)
        { blankLine: 'always', prev: '*', next: ['return', 'throw'] },
      ],
      '@stylistic/padded-blocks': ['error', 'never'],
      '@stylistic/no-multiple-empty-lines': ['error', { max: 1, maxBOF: 0, maxEOF: 0 }],
      // Rule 5, lintable part
      curly: ['error', 'all'],
      'no-else-return': ['error', { allowElseIf: false }],
      'no-lonely-if': 'error',
      'no-nested-ternary': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-warning-comments': ['error', { terms: ['todo', 'fixme', 'xxx'], location: 'anywhere' }],
      'no-param-reassign': ['error', { props: false }],
    },
  },
  {
    files: ['**/*.{ts,mts}'],
    plugins: { '@typescript-eslint': tseslint.plugin },
    rules: {
      'max-params': 'off',
      '@typescript-eslint/max-params': ['error', { max: 3 }],
      '@typescript-eslint/explicit-module-boundary-types': 'error',
    },
  },
]

export default config
