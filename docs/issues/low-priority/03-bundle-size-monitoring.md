# 📊 Add bundle size monitoring and optimization

**Labels:** `performance`, `low-priority`

## Problem
No visibility into bundle size or optimization effectiveness.

## Impact
- Unknown bundle size
- Can't track size regression
- May have unnecessary dependencies
- No tree-shaking verification

## Proposed Solution

### 1. Add Bundle Analyzer
```bash
npm install -D rollup-plugin-visualizer
```

```typescript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    vue(),
    visualizer({
      open: true,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    })
  ]
});
```

### 2. Add Size Limits
```json
// package.json
{
  "size-limit": [
    {
      "path": "dist/assets/*.js",
      "limit": "200 KB"
    }
  ]
}
```

### 3. Analyze Current Bundle
- Identify largest dependencies
- Check for duplicate dependencies
- Verify tree-shaking working

### 4. Optimization Opportunities
- Lazy load components
- Code split by route (if routing added)
- Remove unused dependencies
- Use lighter alternatives

## Success Criteria
- Bundle size visible in CI
- Size limit checks in place
- All dependencies justified
- Bundle < 200KB gzipped
