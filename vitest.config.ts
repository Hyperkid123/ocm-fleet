import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@ocm-fleet/common": path.resolve(__dirname, "sdk/common/src"),
    },
  },
  test: {
    include: [
      "./sdk/*/src/**/__tests__/**/*.test.ts",
      "./client/*/src/**/__tests__/**/*.test.ts",
      "./extensions/**/src/**/__tests__/**/*.test.ts",
    ],
    exclude: ["./client/cli/**"],
    globals: true,
  },
});
