import { defineConfig } from "cypress";
import { loadEnv } from "vite";

export default defineConfig({
  projectId: "d2y71v",
  e2e: {
    specPattern: "cypress/e2e/**/*.{spec,cy}.{js,jsx,ts,tsx}",
    setupNodeEvents(on, config) {
      const env = loadEnv("development", process.cwd(), "VITE_");
      config.env = { ...config.env, API_KEY: env.VITE_API_KEY };
      return config;
    },
  },
});
