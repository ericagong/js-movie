import { defineConfig } from "cypress";

export default defineConfig({
  projectId: "d2y71v",
  e2e: {
    specPattern: "cypress/e2e/**/*.{spec,cy}.{js,jsx,ts,tsx}",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
