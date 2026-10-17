import { defineConfig } from 'vitest/config'

const config = defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
  },
})

export default config
