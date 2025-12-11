# Contributing to Commander Scout

Thank you for your interest in contributing to Commander Scout! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. We expect everyone to:

- Be respectful and considerate in all interactions
- Welcome newcomers and help them get started
- Provide constructive feedback and be open to receiving it
- Focus on what is best for the project and community
- Show empathy towards other community members
- Respect differing viewpoints and experiences

Any behavior that violates these principles, including harassment or discrimination, will not be tolerated.

## How to Contribute

### 1. Fork the Repository

Click the "Fork" button at the top right of the repository page to create your own copy.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/edhrec-compare.git
cd edhrec-compare
```

### 3. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Use descriptive branch names:

- `feature/add-card-filtering`
- `fix/csv-upload-bug`
- `docs/update-readme`

### 4. Make Your Changes

- Follow the code style guidelines (see below)
- Write clear, self-documenting code
- Add or update tests as needed
- Update documentation if your changes affect user-facing features

### 5. Test Your Changes

Run all tests before submitting:

```bash
# Run unit tests
npm run test:unit

# Run unit tests with coverage
npm run test:unit:coverage

# Run end-to-end tests
npm run test:e2e

# Run linter
npm run lint

# Run formatter
npm run format
```

### 6. Commit Your Changes

Follow the commit message conventions (see below).

### 7. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 8. Submit a Pull Request

- Go to the original repository
- Click "New Pull Request"
- Select your fork and branch
- Fill out the PR template with a clear description of your changes

## Development Setup

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Git**

### Installation Steps

```bash
# Clone the repository
git clone https://github.com/kmcgarry1/edhrec-compare.git
cd edhrec-compare

# Install dependencies
npm install
```

### Running Locally

```bash
# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`.

### Running Tests

```bash
# Run unit tests in watch mode
npm run test:unit:watch

# Run unit tests with coverage
npm run test:unit:coverage

# Run end-to-end tests
npm run test:e2e

# Run end-to-end tests in UI mode
npx playwright test --ui
```

### Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

## Code Style

### General Guidelines

- Follow the existing code patterns and conventions in the project
- Write clear, readable code with meaningful variable and function names
- Keep functions small and focused on a single responsibility
- Avoid deeply nested code structures

### ESLint

This project uses ESLint to enforce code quality. All code must pass linting:

```bash
# Check for linting errors
npm run lint

# Automatically fix linting issues
npm run lint:fix
```

**Key ESLint Rules:**

- See `eslint.config.js` for the complete configuration
- Vue 3 recommended rules and TypeScript recommended rules are enabled
- Unused variables prefixed with `_` are allowed
- Multi-word component names are not required

### Prettier

This project uses Prettier for consistent code formatting:

```bash
# Format all files
npm run format
```

**Prettier Configuration:**

- Print width: 100 characters
- Tab width: 2 spaces
- Use double quotes for strings
- Always use semicolons
- Trailing commas: ES5 compatible
- Arrow function parentheses: always
- Line endings: LF (Unix style)

### TypeScript

- **TypeScript is required** for all new code
- Use explicit types where possible, avoid `any`
- Leverage TypeScript's type inference when appropriate
- Create interfaces for complex object structures

### Vue Component Patterns

- Use Vue 3 Composition API with `<script setup>`
- Use TypeScript with `.ts` or `.vue` files
- Keep components focused and single-purpose
- Use composables for reusable logic
- Follow the existing project structure:
  - `components/` - Vue components
  - `composables/` - Reusable composition functions
  - `api/` - API client code
  - `utils/` - Utility functions
  - `assets/` - Static assets

### File Organization

```
src/
├── api/                 # API clients and wrappers
├── components/          # Vue components
│   ├── core/           # Reusable core components
│   └── helpers/        # Helper functions and utilities
├── composables/        # Vue composables
├── utils/              # Utility functions
└── assets/             # Static assets
```

## Commit Messages

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification for clear and structured commit history.

### Format

```
<type>: <description>

[optional body]

[optional footer]
```

### Types

- **feat:** A new feature for the user
- **fix:** A bug fix
- **docs:** Documentation only changes
- **style:** Changes that don't affect code meaning (formatting, whitespace)
- **refactor:** Code change that neither fixes a bug nor adds a feature
- **perf:** Performance improvements
- **test:** Adding or updating tests
- **chore:** Maintenance tasks, dependency updates, build process changes
- **ci:** Changes to CI configuration files and scripts

### Examples

```bash
feat: add card filtering by color identity

fix: resolve CSV upload issue with special characters

docs: update installation instructions in README

test: add unit tests for slugifyCommander utility

refactor: simplify Scryfall API error handling

chore: update dependencies to latest versions
```

### Tips

- Keep the subject line under 72 characters
- Use the imperative mood ("add" not "added" or "adds")
- Don't capitalize the first letter after the type
- Don't end the subject line with a period
- Use the body to explain what and why, not how

## Pull Request Process

### Before Submitting

1. **Ensure all tests pass**: Run `npm run test:unit` and `npm run test:e2e`
2. **Run linter**: Execute `npm run lint` and fix any issues
3. **Update documentation**: If your changes affect user-facing features or APIs
4. **Test locally**: Manually test your changes in the development environment
5. **Rebase on main**: Make sure your branch is up to date with the main branch

### PR Description

Provide a clear description of your changes:

- **What** changes you made
- **Why** you made these changes
- **How** the changes work (if complex)
- **Related issues**: Reference any related issues using #issue_number
- **Screenshots**: Include screenshots for UI changes
- **Breaking changes**: Clearly indicate any breaking changes

### Review Process

1. A maintainer will review your PR
2. Address any feedback or requested changes
3. Once approved, your PR will be merged
4. Your contributions will be acknowledged in the project

### Requirements for Merging

- All tests must pass
- Code must pass linting checks
- Code review approval from at least one maintainer
- No merge conflicts with the main branch
- Documentation is updated (if applicable)

### Automated Checks

This project uses Husky for Git hooks:

- **Pre-commit**: Runs `lint-staged` to lint and format changed files
- **Pre-push**: Runs unit tests to ensure code quality

These checks will run automatically, but you can run them manually:

```bash
# Run lint-staged manually
npx lint-staged

# Run pre-push tests
npm run test:unit
```

## Testing Requirements

### Unit Tests

- **Required** for all new business logic and utility functions
- **Required** for all new composables
- **Recommended** for new Vue components
- Use Vitest as the test runner
- Place tests in `tests/unit/` directory, mirroring the `src/` structure
- Aim for high code coverage (currently ~80%)

Example unit test structure:

```typescript
import { describe, it, expect } from "vitest";
import { yourFunction } from "@/utils/yourFunction";

describe("yourFunction", () => {
  it("should handle basic case", () => {
    expect(yourFunction("input")).toBe("expected");
  });

  it("should handle edge case", () => {
    expect(yourFunction("")).toBe("");
  });
});
```

### E2E Tests

- **Required** for new user-facing features and workflows
- Use Playwright for end-to-end testing
- Place tests in `tests/e2e/` directory
- Test critical user paths and interactions

Example E2E test structure:

```typescript
import { test, expect } from "@playwright/test";

test("user can search for commander", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await page.fill('input[placeholder*="Search"]', "Atraxa");
  await expect(page.locator(".commander-result")).toBeVisible();
});
```

### Testing Guidelines

- Write tests that are clear and maintainable
- Test behavior, not implementation details
- Use descriptive test names that explain what is being tested
- Mock external dependencies (API calls, localStorage, etc.)
- Avoid testing third-party library code

### Breaking Changes

- **Discuss first**: Open an issue to discuss breaking changes before implementing
- **Document thoroughly**: Clearly document migration path in PR and changelog
- **Provide warnings**: Add deprecation warnings before removing features
- **Version appropriately**: Breaking changes should be part of major version releases

## Documentation

### Code Documentation Standards

All public APIs, functions, and composables should have comprehensive JSDoc documentation:

````typescript
/**
 * Brief description of the function
 *
 * More detailed description explaining what the function does,
 * how it works, and any important considerations.
 *
 * @param paramName - Description of the parameter
 * @param optionalParam - Description (default: value)
 * @returns Description of return value
 * @throws {ErrorType} When this error occurs
 *
 * @example
 * ```typescript
 * const result = myFunction('example', 42);
 * console.log(result); // Expected output
 * ```
 */
export function myFunction(paramName: string, optionalParam = 10): number {
  // Implementation
}
````

### Documentation Location

- **API Documentation**: `src/api/README.md` - Overview of Scryfall API integration, caching, and error handling
- **Composables**: `src/composables/README.md` - Guide to all Vue composables and state management patterns
- **Utilities**: `src/utils/README.md` - Pure utility functions and helpers
- **Components**: Individual component files have inline JSDoc documentation

### Viewing Documentation

#### Inline Documentation

All TypeScript files have inline JSDoc comments that appear in IDE tooltips:

- Hover over functions in VS Code to see documentation
- Use "Go to Definition" (F12) to read full documentation

#### README Files

Each major directory has a README.md with:

- Overview of the module's purpose
- Examples of common usage patterns
- Architecture and design decisions
- Best practices and conventions

**Key README files:**

```bash
src/api/README.md          # API layer architecture
src/composables/README.md  # State management patterns
src/utils/README.md        # Utility functions
```

### Documentation Requirements

When contributing code, ensure:

1. **All public functions** have JSDoc comments with:
   - Brief description
   - Parameter descriptions with types
   - Return value description
   - At least one usage example
   - `@throws` tags for possible errors

2. **All composables** document:
   - What state they manage
   - What methods they expose
   - Usage examples
   - Related composables

3. **All Vue components** document:
   - Component purpose
   - Props with types and defaults
   - Emitted events
   - Slots (if any)
   - Usage examples

4. **Complex algorithms** have:
   - Explanation of the approach
   - Time/space complexity notes
   - Edge cases handled

### Documentation Best Practices

1. **Be concise but complete**: One sentence summary, then details
2. **Include examples**: Show how to use the code, not just what it does
3. **Document edge cases**: Explain unusual behavior or limitations
4. **Keep in sync**: Update documentation when changing code
5. **Link related items**: Reference related functions, composables, or components

### Example: Well-Documented Composable

````typescript
/**
 * Global loading state management composable
 *
 * Tracks loading states across multiple concurrent operations using scoped
 * identifiers. Supports progress tracking and custom status messages.
 *
 * @example
 * ```typescript
 * const { startLoading, stopLoading, withLoading } = useGlobalLoading();
 *
 * // Manual control
 * startLoading('Fetching data...', 'data-fetch');
 * // ... async operation
 * stopLoading('data-fetch');
 *
 * // Async wrapper
 * await withLoading(
 *   async () => await fetchData(),
 *   'Loading...',
 *   'api-scope'
 * );
 * ```
 */
export const useGlobalLoading = () => {
  // Implementation
};
````

## Getting Help

If you need help or have questions:

- Open an issue for bugs or feature requests
- Check existing issues and pull requests for similar topics
- Review the [README](README.md) for project overview
- Check the documentation in the `docs/` directory

## License

By contributing to Commander Scout, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to Commander Scout! Your efforts help make this project better for everyone.
