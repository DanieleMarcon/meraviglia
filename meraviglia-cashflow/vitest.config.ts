import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    include: [
      "src/engine/__tests__/**/*.test.ts",
      "src/application/__tests__/**/*.test.ts",
      "src/state/**/__tests__/**/*.test.ts",
      "src/infra/**/__tests__/**/*.test.ts",
    ],
    globals: false,
  },
})
