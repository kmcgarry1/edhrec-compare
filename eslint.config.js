import js from "@eslint/js";
import globals from "globals";
import vuePlugin from "eslint-plugin-vue";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import vueParser from "vue-eslint-parser";
import eslintConfigPrettier from "eslint-config-prettier";

const commonRules = {
  "@typescript-eslint/no-unused-vars": [
    "warn",
    { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
  ],
  "no-undef": "off",
  "no-redeclare": "off",
};

const sharedLanguageOptions = {
  ecmaVersion: "latest",
  sourceType: "module",
  globals: {
    ...globals.browser,
    ...globals.node,
  },
};

export default [
  {
    ignores: [
      "dist/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "node_modules/**",
    ],
  },
  {
    files: ["**/*.vue"],
    languageOptions: {
      ...sharedLanguageOptions,
      parser: vueParser,
      parserOptions: {
        parser: {
          ts: tsParser,
        },
        ecmaVersion: "latest",
        sourceType: "module",
        extraFileExtensions: [".vue"],
      },
    },
    plugins: {
      vue: vuePlugin,
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...(vuePlugin.configs["flat/recommended"]?.rules ??
        vuePlugin.configs.recommended?.rules ??
        {}),
      ...(tsPlugin.configs["flat/recommended"]?.rules ??
        tsPlugin.configs.recommended?.rules ??
        {}),
      "vue/multi-word-component-names": "off",
      ...commonRules,
    },
  },
  {
    files: ["**/*.{ts,tsx,js,jsx,cjs,mjs}"],
    languageOptions: {
      ...sharedLanguageOptions,
      parser: tsParser,
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...(tsPlugin.configs["flat/recommended"]?.rules ??
        tsPlugin.configs.recommended?.rules ??
        {}),
      ...commonRules,
    },
  },
  eslintConfigPrettier,
];
