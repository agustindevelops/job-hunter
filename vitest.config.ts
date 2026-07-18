import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    // Default threads pool intermittently fails suite collection on Windows
    // ("Cannot read properties of undefined (reading 'config')").
    pool: "vmThreads",
    include: ["src/**/*.{test,spec}.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
