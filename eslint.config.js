import js from "@eslint/js";
import cypress from "eslint-plugin-cypress";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default [
  {
    ignores: ["dist/**", "node_modules/**", "cypress/fixtures/**"],
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
  },
  {
    ...cypress.configs.recommended,
    files: ["cypress/**/*.{js,jsx,ts,tsx}", "cypress.config.js"],
  },
  prettier,
];
