# Architecture Documentation

## Overview

Commander Scout is a Vue 3 + TypeScript single-page application that helps Magic: The Gathering Commander players compare their card collections against EDHREC deck recommendations.

## Technology Stack

### Core Framework

- **Vue 3** (v3.5.24) - Using Composition API
- **TypeScript** (~5.9.3) - For type safety
- **Vite** (rolldown-vite@7.2.2) - Build tool and dev server

### Build Tooling Decision: Rolldown vs Standard Vite

#### What is Rolldown?

Rolldown is an experimental JavaScript/TypeScript bundler written in Rust, developed by the Vite team (VoidZero) as a faster alternative to Rollup. The `rolldown-vite` package is a preview version of Vite that uses Rolldown instead of Rollup as the underlying bundler.

- **Repository**: https://github.com/rolldown/rolldown
- **Website**: https://rolldown.rs/
- **Status**: Beta (v1.0.0-beta.47 as of this writing)
- **Maintainers**: Core Vite team (Evan You, Patak, Anthony Fu, and others)

#### Why Rolldown Was Chosen

This project uses `rolldown-vite@7.2.2` instead of standard Vite. Based on investigation, Rolldown was included from the initial project setup, likely for the following reasons:

1. **Performance**: Rolldown is written in Rust and provides significantly faster build times
2. **Future-proofing**: Rolldown is being developed by the Vite core team as the eventual replacement for Rollup
3. **Compatibility**: Rolldown aims for API compatibility with Rollup, making migration seamless
4. **Early adoption**: Testing cutting-edge tooling in a personal/small project setting

#### Performance Comparison

A comprehensive performance comparison was conducted (November 2025) between rolldown-vite@7.2.2 and standard vite@7.2.4:

| Metric                 | Rolldown-Vite | Standard Vite | Winner                    |
| ---------------------- | ------------- | ------------- | ------------------------- |
| Build Time             | 1.19s         | 2.48s         | **Rolldown** (52% faster) |
| JS Bundle Size         | 176 KB        | 178 KB        | **Rolldown** (1% smaller) |
| CSS Bundle Size        | 37 KB         | 39 KB         | **Rolldown** (5% smaller) |
| Gzipped JS             | 61.46 KB      | 62.68 KB      | **Rolldown** (2% smaller) |
| Gzipped CSS            | 6.96 KB       | 7.06 KB       | **Rolldown** (1% smaller) |
| Unit Tests (211 tests) | ✅ Pass       | ✅ Pass       | **Both work**             |
| E2E Tests              | ✅ Pass       | ✅ Pass       | **Both work**             |

**Key Finding**: Rolldown provides **~2x faster build times** with slightly smaller bundle sizes, while maintaining full compatibility with the existing codebase.

#### Stability Assessment

**Current Status** (as of November 2025):

- ✅ All 211 unit tests pass
- ✅ All E2E tests pass
- ✅ Production builds work correctly
- ✅ Development server runs stably
- ✅ No known vulnerabilities (npm audit clean)
- ✅ Active maintenance by Vite core team
- ⚠️ Still in beta phase (v1.0.0-beta.47)

**Risks**:

1. **Beta Software**: Rolldown is still in beta, meaning breaking changes are possible
2. **Smaller Community**: Fewer users means potentially undiscovered edge cases
3. **Documentation**: Less comprehensive than standard Vite/Rollup
4. **Plugin Ecosystem**: Not all Rollup/Vite plugins may be compatible

**Mitigations**:

1. The package override ensures consistent behavior across dependencies
2. Comprehensive test suite catches compatibility issues early
3. Standard Vite can be swapped in quickly if needed (verified to work)
4. Project is maintained by the same team as Vite, ensuring alignment

#### Decision: Keep Rolldown

**Recommendation**: **Continue using rolldown-vite** ✅

**Rationale**:

1. **Significant Performance Gains**: 2x faster builds improve developer experience
2. **Production Proven**: All tests pass, no stability issues observed
3. **Future Alignment**: Rolldown is the future direction of Vite
4. **Easy Fallback**: Standard Vite can be swapped in if needed (tested and verified)
5. **Low Risk**: For a personal/small project, the benefits outweigh the beta status risks
6. **Active Development**: Regular updates from Vite core team

**When to Reconsider**:

- If breaking changes cause development friction
- If critical plugins are incompatible
- If production issues arise
- If the project scales to require enterprise-level stability guarantees

#### How to Switch to Standard Vite (if needed)

If you ever need to switch back to standard Vite, follow these steps:

1. Edit `package.json`:

```json
// Change this:
"vite": "npm:rolldown-vite@7.2.2"

// To this:
"vite": "^7.2.4"
```

2. Remove the overrides section:

```json
// Delete this:
"overrides": {
  "vite": "npm:rolldown-vite@7.2.2"
}
```

3. Reinstall dependencies:

```bash
npm install --legacy-peer-deps
```

4. Rebuild and test:

```bash
npm run build
npm run test:unit
npm run test:e2e
```

All tests have been verified to pass with standard Vite, so the switch can be made at any time without code changes.

### UI & Styling

- **Tailwind CSS** (v3.4.13) - Utility-first CSS framework
- **PostCSS** (v8.4.49) - CSS transformations
- **Autoprefixer** (v10.4.22) - Browser compatibility

### Testing

- **Vitest** (v4.0.12) - Unit testing framework
- **@vue/test-utils** (v2.4.6) - Vue component testing
- **Playwright** (v1.56.1) - E2E testing
- **@vitest/coverage-v8** (v4.0.12) - Code coverage

### Code Quality

- **ESLint** (v9.39.1) - Linting
- **Prettier** (v3.6.2) - Code formatting
- **TypeScript ESLint** - TypeScript-specific linting
- **Husky** (v9.1.6) - Git hooks
- **lint-staged** (v15.2.10) - Pre-commit linting

### Build Analysis

- **rollup-plugin-visualizer** (v6.0.5) - Bundle size analysis
- **size-limit** (v11.2.0) - Bundle size monitoring

### Analytics & Monitoring

- **@vercel/analytics** (v1.5.0) - Usage analytics
- **@vercel/speed-insights** (v1.2.0) - Performance monitoring

## Project Structure

```
edhrec-compare/
├── src/
│   ├── api/              # API integration (EDHREC, Scryfall)
│   │   ├── errorHandler.ts
│   │   └── scryfallApi.ts
│   ├── components/       # Vue components
│   │   ├── core/         # Reusable UI components
│   │   ├── CommanderSearch.vue
│   │   ├── EdhrecReader.vue
│   │   ├── Dashboard.vue
│   │   └── ...
│   ├── composables/      # Vue Composition API composables
│   │   ├── useTheme.ts
│   │   ├── useCsvUpload.ts
│   │   ├── useCommanderColors.ts
│   │   └── ...
│   ├── utils/            # Utility functions
│   │   ├── slugifyCommander.ts
│   │   ├── downloadTextFile.ts
│   │   └── errorHandler.ts
│   ├── assets/           # Static assets
│   └── App.vue           # Root component
├── tests/
│   ├── unit/             # Vitest unit tests
│   └── e2e/              # Playwright E2E tests
├── docs/                 # Documentation
├── public/               # Public static files
└── api/                  # Vercel serverless functions
```

## Key Architecture Patterns

### State Management

- **No Pinia/Vuex**: Uses Vue 3 Composition API with composables for state
- **Module-level refs**: Composables use module-level reactive refs for global state
- **localStorage**: Persists theme and background preferences

### Component Architecture

- **Composition API**: All components use `<script setup>` syntax
- **TypeScript**: Full type safety with interfaces for API responses
- **Prop validation**: TypeScript interfaces for component props

### API Integration

- **EDHREC**: Direct JSON API calls to `json.edhrec.com`
- **Scryfall**: Bulk API with batch requests (75 cards/batch, 300ms delay)
- **Rate Limiting**: Manual delays to respect API rate limits
- **Error Handling**: Centralized error handling with user feedback

### Styling Approach

- **Tailwind CSS**: Utility-first approach for all styling
- **Dark Mode**: Theme toggle stored in localStorage
- **Responsive**: Mobile-first design
- **Custom Colors**: Dynamic nebula background based on commander colors

## Build Configuration

### Vite Config (`vite.config.ts`)

- Vue plugin for SFC compilation
- Bundle analyzer (optional, via `ANALYZE=true`)
- Path aliases for cleaner imports
- Vue Router stub (no actual routing implemented)

### TypeScript Config

- Strict mode enabled
- Path aliases configured
- Separate configs for app and node code

### Bundle Size Limits (`package.json`)

- JavaScript: 200 KB (gzipped)
- CSS: 50 KB (gzipped)
- Monitored via size-limit

## Testing Strategy

### Unit Tests (Vitest)

- 211 tests across 29 test files
- ~80% code coverage
- Tests for composables, components, utilities, and API functions
- Happy DOM for DOM simulation

### E2E Tests (Playwright)

- Critical user flows tested
- Network mocking for external APIs
- Mobile viewport testing

### Code Quality Gates

- Pre-commit: lint-staged runs ESLint on changed files
- Pre-push: Unit tests run before push
- Build: TypeScript compilation errors fail the build

## Deployment

### Vercel Configuration

- Automatic deployments from main branch
- Serverless functions in `/api` directory
- Analytics and Speed Insights enabled
- Environment: Production builds use `npm run build`

## Performance Considerations

### Bundle Optimization

- Tree-shaking via Rolldown
- CSS purging via Tailwind
- Dynamic imports (not currently implemented)
- Gzip compression

### Runtime Performance

- Lazy loading of Scryfall data
- Batch API requests
- Computed properties for expensive operations
- Virtual scrolling (not implemented, noted as improvement)

## Known Limitations & Future Improvements

### Current Limitations

1. **No Routing**: Single-page view, no URL-based navigation
2. **No Offline Support**: Requires internet for API calls
3. **Large Components**: Some components exceed 400 lines
4. **No Virtual Scrolling**: Performance degrades with 100+ cards

### Planned Improvements (from Architecture Review)

- See `docs/issues/` for tracked improvements
- HIGH priority: Unit test coverage expansion
- MEDIUM priority: Component refactoring, CSP headers, virtual scrolling
- LOW priority: PWA support, routing implementation

## Development Workflow

### Setup

```bash
npm install
npm run dev
```

### Testing

```bash
npm run test:unit              # Run unit tests
npm run test:unit:watch        # Watch mode
npm run test:unit:coverage     # With coverage
npm run test:e2e               # E2E tests
```

### Building

```bash
npm run build                  # Production build
npm run build:analyze          # With bundle analysis
npm run preview                # Preview production build
```

### Code Quality

```bash
npm run lint                   # Check for issues
npm run lint:fix               # Auto-fix issues
npm run format                 # Format with Prettier
npm run size                   # Check bundle size
```

## External Dependencies

### APIs Used

1. **EDHREC** (`json.edhrec.com`)
   - Commander recommendations and decklists
   - No authentication required
   - Rate limits: Unknown (using conservative delays)

2. **Scryfall** (`api.scryfall.com`)
   - Card data, images, and pricing
   - No authentication required
   - Rate limits: ~10 requests/second (using 300ms delays)

### Third-party Libraries

- **@mdi/js**: Material Design Icons
- **@vueuse/core**: Vue composition utilities
- **jsdom**: DOM implementation for testing

## Security Considerations

### Current Security Measures

- No user authentication (static site)
- No sensitive data storage
- CSP headers (to be implemented)
- Dependency vulnerability scanning via npm audit

### Data Privacy

- CSV files processed entirely client-side
- No data sent to backend servers
- Analytics via Vercel (anonymous)
- localStorage only for preferences

## Maintenance

### Dependency Updates

- Manual updates currently
- Automated updates (Dependabot) recommended
- npm audit run regularly

### Version Strategy

- Semantic versioning for releases
- Rolling updates for dependencies
- Beta tooling (Rolldown) accepted for dev dependencies

## Contributing

### Code Style

- ESLint + Prettier enforce consistent style
- TypeScript strict mode required
- Component organization: props → emits → composables → computed → methods
- Comments: JSDoc for public APIs (currently minimal)

### Pull Request Process

1. Branch from main
2. Run linters and tests locally
3. Ensure no bundle size regressions
4. Update documentation if needed
5. Request review

---

**Last Updated**: November 2025  
**Maintained By**: Commander Scout Team  
**Questions**: Open a GitHub issue
