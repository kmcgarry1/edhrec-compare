# Error Tracking with Sentry

Commander Scout uses [Sentry](https://sentry.io/) for production error tracking and monitoring. This document explains how error tracking is configured and how to enable it in your deployment.

## Overview

Sentry integration provides:

- **Automatic error capture** - Runtime errors are automatically sent to Sentry
- **Readable stack traces** - Source maps enable debugging with original TypeScript/Vue code
- **Error trends** - Track error frequency and identify patterns over time
- **Performance monitoring** - 10% sample rate for transaction tracking
- **Session replays** - 10% of error sessions include replays for debugging
- **Privacy protection** - Sensitive data (CSV contents) is automatically filtered

## Configuration

### 1. Create a Sentry Account

1. Sign up at [sentry.io](https://sentry.io/)
2. Create a new project (select "Vue" as the platform)
3. Copy the DSN (Data Source Name) from your project settings

### 2. Set Environment Variable

Create a `.env` file in the project root (or configure in your deployment platform):

```bash
# Copy from .env.example
VITE_SENTRY_DSN=https://your-public-key@sentry.io/your-project-id
```

**Important**: The DSN is a public value and can be safely included in your frontend bundle.

### 3. Build and Deploy

```bash
# Build with source maps
npm run build

# Source maps are automatically generated and included in the build
```

The Sentry integration will automatically:

- Initialize only in production builds
- Upload source maps to make stack traces readable
- Filter out sensitive data before sending to Sentry

## How It Works

### Automatic Error Capture

Sentry integrates with the existing error handling system in `src/utils/errorHandler.ts`:

- **Vue component errors** - Captured via Vue's `errorHandler`
- **Unhandled promise rejections** - Captured via `window.unhandledrejection`
- **Global JavaScript errors** - Captured via `window.error`

All errors are automatically sent to Sentry in production builds.

### Privacy Protection

The `beforeSend` hook in `src/utils/sentry.ts` filters out sensitive data:

```typescript
beforeSend(event) {
  // Remove CSV-related breadcrumbs
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.filter(
      breadcrumb => !breadcrumb.message?.includes('CSV') &&
                    !breadcrumb.data?.csv
    );
  }
  return event;
}
```

This ensures that user-uploaded CSV data is never sent to Sentry.

### Source Maps

Source maps are generated during production builds (see `vite.config.ts`):

```typescript
build: {
  sourcemap: true;
}
```

This enables Sentry to show readable stack traces with original TypeScript/Vue code instead of minified JavaScript.

## Manual Error Reporting

You can manually report errors using the utility functions in `src/utils/sentry.ts`:

```typescript
import { captureError } from "@/utils/sentry";

try {
  // risky operation
} catch (error) {
  captureError(error, {
    context: {
      action: "manual-operation",
      userId: "user123",
    },
  });
}
```

**Note**: Manual error reporting should be rare, as most errors are captured automatically.

## Sample Rates

To minimize data collection and respect user privacy:

- **Performance monitoring**: 10% of transactions (`tracesSampleRate: 0.1`)
- **Session replays**: Only 10% of error sessions (`replaysOnErrorSampleRate: 0.1`)
- **Normal session replays**: Disabled (`replaysSessionSampleRate: 0`)

These rates can be adjusted in `src/utils/sentry.ts` if needed.

## Testing Locally

Sentry is disabled in development mode to avoid noise. To test the integration:

1. Build the production version: `npm run build`
2. Preview locally: `npm run preview`
3. Trigger an error and check your Sentry dashboard

## Disabling Sentry

To disable Sentry, simply don't set the `VITE_SENTRY_DSN` environment variable. The app will function normally without error tracking.

## Best Practices

### Do

- ✅ Monitor Sentry dashboard regularly for production errors
- ✅ Set up alerts for critical errors
- ✅ Use error trends to identify recurring issues
- ✅ Review stack traces to understand error context

### Don't

- ❌ Log personally identifiable information (PII)
- ❌ Send sensitive user data to Sentry
- ❌ Set sample rates too high (respect user privacy)
- ❌ Ignore security alerts from Sentry

## Troubleshooting

### Sentry Not Capturing Errors

1. **Check environment**: Sentry only runs in production (`import.meta.env.PROD`)
2. **Verify DSN**: Ensure `VITE_SENTRY_DSN` is set correctly
3. **Check console**: Look for initialization messages in production builds
4. **Test manually**: Use `captureError()` to verify integration

### Source Maps Not Working

1. **Verify build**: Ensure `sourcemap: true` in `vite.config.ts`
2. **Check upload**: Source maps should be in the `dist/assets/` folder
3. **Configure Sentry**: If using a CI/CD pipeline, you may need to upload source maps to Sentry using `@sentry/vite-plugin`

### Too Many Errors

1. **Increase filtering**: Add more filters in the `beforeSend` hook
2. **Adjust sample rates**: Reduce `tracesSampleRate` and `replaysOnErrorSampleRate`
3. **Use issue grouping**: Configure Sentry's fingerprinting to group similar errors

## Resources

- [Sentry Vue Documentation](https://docs.sentry.io/platforms/javascript/guides/vue/)
- [Sentry Error Filtering](https://docs.sentry.io/platforms/javascript/configuration/filtering/)
- [Sentry Source Maps](https://docs.sentry.io/platforms/javascript/sourcemaps/)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)

## Support

For issues related to Sentry integration, please:

1. Check the [Sentry documentation](https://docs.sentry.io/)
2. Open an issue in this repository with the `monitoring` label
3. Contact the maintainers if you need help with configuration
