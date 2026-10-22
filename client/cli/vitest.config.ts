import { esmExternalRequirePlugin } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    globals: true,
    deps: {
      optimizer: {
        ssr: {
          enabled: true,
          include: ["ink-table"],
          exclude: ["ink"],
          rolldownOptions: {
            // ink-table is CommonJS; share the same ESM Ink instance as the tests.
            plugins: [esmExternalRequirePlugin({ external: ["ink"] })],
          },
        },
      },
    },
  },
});
