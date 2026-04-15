import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";

export default defineConfig({
  extends: [core],
  overrides: [
    {
      files: ["**/routeTree.gen.ts"],
      rules: {
        "unicorn/filename-case": "off",
        "unicorn/no-abusive-eslint-disable": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "import/first": "off",
        "no-unused-vars": "off",
      },
    },
  ],
  rules: {
    "sort-keys": "off",
    "eslint/no-use-before-define": "off",
    "eslint/func-style": "off",
    "import/no-relative-parent-imports": "off",
    "eslint/no-warning-comments": "warn",
  },
});
