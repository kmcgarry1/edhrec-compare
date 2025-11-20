# 🎨 Add ESLint and Prettier for code quality

**Labels:** `tooling`, `high-priority`

## Problem
The project has no linting or formatting configuration, which can lead to:
- Inconsistent code style
- Potential bugs from common mistakes
- Difficult code reviews

## Impact
- Code style inconsistencies
- Missed common errors
- Reduced code quality

## Proposed Solution
1. Add ESLint with Vue 3 + TypeScript rules
   - `@typescript-eslint/eslint-plugin`
   - `eslint-plugin-vue`
   
2. Add Prettier for consistent formatting
   - `prettier`
   - `eslint-config-prettier`

3. Add pre-commit hooks with husky + lint-staged

4. Add npm scripts:
   - `npm run lint` - Check for issues
   - `npm run lint:fix` - Auto-fix issues
   - `npm run format` - Format with Prettier

5. Configure in:
   - `.eslintrc.js` or `eslint.config.js`
   - `.prettierrc`
   - `.prettierignore`

## Example Configuration
```json
// .eslintrc.js
{
  "extends": [
    "eslint:recommended",
    "plugin:vue/vue3-recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ]
}
```
