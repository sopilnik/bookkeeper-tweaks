import { defineConfig } from '@playwright/test'

const config = defineConfig({
  testDir: 'tests/e2e',
  reporter: [['list'], ['html', { open: 'never' }]],
  forbidOnly: Boolean(process.env.CI),
  use: { trace: 'retain-on-failure' },
})

export default config
