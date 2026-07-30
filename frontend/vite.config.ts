import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  server: {
    proxy: { "/api": "http://localhost:8000" },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["tests/setup.ts"],
    // Component tests are co-located in src/components/<Name>/;
    // everything else's unit tests mirror src/ under tests/unit/.
    include: ["src/**/*.test.{ts,tsx}", "tests/unit/**/*.test.{ts,tsx}"],
    // Tests are self-contained (CLAUDE.md): auto-undo vi.fn/spyOn/stubGlobal/
    // stubEnv between tests so a leaked mock can't break the next one.
    restoreMocks: true,
    unstubGlobals: true,
    unstubEnvs: true,
  },
});
