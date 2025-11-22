# Analytics & Monitoring Review

**Review Date:** November 22, 2025  
**Reviewer:** GitHub Copilot Analytics Agent  
**Application:** Commander Scout v0.0.0

## Executive Summary

This review assesses Commander Scout's analytics and monitoring capabilities for tracking errors, performance, and user behavior. The application currently has basic error tracking via Sentry but lacks comprehensive analytics and performance monitoring.

**Overall Status:** ⚠️ Basic - Error tracking configured, analytics missing

## Review Scope

- ✅ Error tracking and reporting
- ✅ Performance monitoring capabilities
- ⚠️ User behavior analytics
- ⚠️ Business metrics tracking
- ✅ Crash reporting
- ⚠️ Real User Monitoring (RUM)
- ❌ A/B testing capabilities
- ❌ Feature usage tracking

## Current Implementation

### Error Tracking ✅

**Tool:** Sentry  
**Status:** Configured and Active

**Configuration:**

```typescript
// src/utils/sentry.ts
- DSN configured via environment variable
- Production-only tracking
- Privacy filtering enabled (CSV data excluded)
- Source maps generated
- 10% performance sample rate
```

**Strengths:**

- ✅ Automatically captures JavaScript errors
- ✅ Filters sensitive data (CSV contents)
- ✅ Source maps for readable stack traces
- ✅ Environment-aware (prod only)
- ✅ Privacy-respectful configuration

**Limitations:**

- ⚠️ No custom error context
- ⚠️ No user feedback mechanism
- ⚠️ No error grouping tags
- ⚠️ Limited performance monitoring

**Issue:** #108 - Enhance Sentry Error Context

### Performance Monitoring ⚠️

**Tool:** Sentry Performance (partially configured)  
**Status:** Basic configuration, underutilized

**Current Metrics:**

- Sample rate: 10%
- Automatic transaction tracking
- No custom spans
- No custom measurements

**Missing Metrics:**

- CSV parsing time
- Scryfall fetch duration
- EDHREC fetch duration
- Card table render time
- Filter operation time
- Theme toggle response time

**Issue:** #109 - Implement Custom Performance Tracking

### User Analytics ❌

**Tool:** None  
**Status:** Not Implemented

**Missing:**

- Page views
- User sessions
- Feature usage
- User flows
- Conversion funnels
- Retention metrics

**Privacy Consideration:**

- Should be privacy-respectful
- No personal data collection
- Cookie consent if implemented

**Issue:** #110 - Implement Privacy-Focused Analytics

### Logging ⚠️

**Current Approach:**

- `console.log` for development
- Sentry for production errors
- No structured logging
- No log levels

**Issue:** #111 - Implement Structured Logging

## Analytics Strategy

### What to Track

#### Error Metrics (Current - Sentry)

**Errors to Monitor:**

- ✅ JavaScript runtime errors
- ✅ API request failures
- ✅ Network errors
- ⚠️ CSV parsing errors (needs tagging)
- ⚠️ Scryfall API errors (needs tagging)
- ⚠️ EDHREC API errors (needs tagging)

**Enhancement Needed:**

```typescript
// Add error context
Sentry.setContext("user_action", {
  action: "csv_upload",
  cardCount: cards.length,
  hasQuantity: true,
});

// Tag errors by category
Sentry.setTag("error_category", "api_error");
Sentry.setTag("api_service", "scryfall");
```

**Issue:** #108 (same) - Enhance Sentry Error Context

#### Performance Metrics (Partially Implemented)

**Core Web Vitals (Should Track):**

- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)
- INP (Interaction to Next Paint)

**Custom Metrics (Not Tracked):**

- Time to first commander search
- CSV parse duration
- API response times
- Filter operation duration
- Card table render time
- Image load time

**Implementation:**

```typescript
// Example custom measurements
const mark = performance.mark("csv-parse-start");
// ... parsing logic ...
performance.measure("csv-parse", "csv-parse-start");
```

**Issue:** #109 (same) - Implement Custom Performance Tracking

#### User Behavior Metrics (Not Implemented)

**Key Metrics to Track:**

- Daily/Weekly/Monthly Active Users
- Session duration
- Commander searches per session
- CSV upload rate
- Filter usage frequency
- Theme preference distribution
- Background toggle usage

**Privacy-Focused Approach:**

- No user identification
- No cross-session tracking
- Aggregate data only
- Respect Do Not Track
- Cookie consent

**Tools to Consider:**

- Plausible Analytics (privacy-focused, EU-hosted)
- Fathom Analytics (privacy-focused)
- Self-hosted Matomo (open source)
- Umami (open source, simple)

**Issue:** #110 (same) - Implement Privacy-Focused Analytics

#### Feature Usage Metrics (Not Implemented)

**Features to Track:**

- Commander searches (frequency)
- CSV uploads (conversion rate)
- Filter usage (owned/unowned/show all)
- Bracket filter usage
- Cardlist navigation usage
- Theme toggle frequency
- Download features usage

**Implementation Approach:**

```typescript
// Simple event tracking
function trackEvent(category: string, action: string, label?: string) {
  if (analytics) {
    analytics.track(category, { action, label });
  }
}

// Usage
trackEvent("commander", "search", commanderName);
trackEvent("csv", "upload", "success");
trackEvent("filter", "toggle", "owned-only");
```

**Issue:** #112 - Implement Feature Usage Tracking

### What NOT to Track

**Privacy-Respectful Exclusions:**

- ❌ Personal data (none collected anyway)
- ❌ CSV contents
- ❌ Card collection details
- ❌ IP addresses (anonymize if collected)
- ❌ Precise geolocation
- ❌ User identifiers across sessions

## Monitoring Infrastructure

### Current Setup

**Services:**

- Sentry (error tracking + basic performance)
- GitHub Actions CI (build monitoring)

**Missing:**

- Uptime monitoring
- API availability monitoring
- Performance regression detection
- Alert system

### Recommended Additions

#### 1. Uptime Monitoring ⚠️

**Tool Options:**

- UptimeRobot (free tier available)
- Pingdom
- StatusCake
- Self-hosted: Uptime Kuma

**Metrics:**

- Site availability (200 OK checks)
- Response time
- SSL certificate expiry

**Issue:** #113 - Set Up Uptime Monitoring

#### 2. Third-Party API Monitoring ⚠️

**APIs to Monitor:**

- Scryfall API health
- EDHREC API health

**Approach:**

- Track error rates in Sentry
- Alert on high failure rate
- Detect API changes

**Implementation:**

```typescript
// Track API health
function trackApiCall(service: string, success: boolean, duration: number) {
  Sentry.addBreadcrumb({
    category: "api",
    message: `${service} API call`,
    level: success ? "info" : "error",
    data: { duration, success },
  });
}
```

**Issue:** #114 - Implement API Health Monitoring

#### 3. Performance Regression Detection ⚠️

**Current:**

- Bundle size tracked in CI ✅
- No runtime performance tracking

**Recommended:**

- Lighthouse CI for automated audits
- Bundle size alerts
- Performance budgets

**Issue:** #115 - Set Up Lighthouse CI

### Alerting Strategy

#### Alert Categories

**Critical (Immediate Action):**

- Site down (> 5 min)
- Error rate spike (> 10 errors/min)
- API completely failing

**Warning (Review Soon):**

- Elevated error rate (> 1 error/min)
- Slow response times (> 5s TTI)
- Bundle size increase (> 10%)

**Info (FYI):**

- Dependency updates available
- Performance improvements detected
- Feature usage milestones

#### Alert Channels

**Current:**

- Email (Sentry)
- GitHub notifications (Dependabot)

**Recommended:**

- Slack/Discord webhook
- GitHub Issues auto-creation
- Email digest

**Issue:** #116 - Configure Alert System

## Dashboard Requirements

### Development Dashboard

**Metrics:**

- Build success rate
- Test coverage trend
- Bundle size trend
- Dependency vulnerabilities

**Tool:** GitHub Actions dashboard (current)

### Operations Dashboard

**Metrics:**

- Error rate (24h, 7d, 30d)
- Response time percentiles
- API health status
- Uptime percentage

**Tool:** Sentry dashboard + custom (if needed)

**Issue:** #117 - Create Operations Dashboard

### Business Metrics Dashboard

**Metrics:**

- Daily/Weekly/Monthly Active Users
- Commander searches (total, unique)
- CSV upload conversion rate
- Feature adoption rates
- Session duration average

**Tool:** To be determined (based on analytics choice)

**Issue:** #118 - Create Business Metrics Dashboard

## Privacy & Compliance

### GDPR Compliance ✅

**Current Sentry Setup:**

- ✅ No PII collected
- ✅ CSV data filtered
- ✅ IP anonymization available
- ✅ EU data residency option

**For Future Analytics:**

- Must not collect PII
- Must respect Do Not Track
- Must allow opt-out
- Must document in privacy policy

### Cookie Consent ⚠️

**Current:**

- localStorage used (functional, no consent needed)
- No tracking cookies

**Future:**

- Analytics cookies would need consent
- Use cookie-less tracking if possible
- Implement consent banner if needed

**Issue:** #99 (from Compliance Review) - Privacy Policy

## Metrics Collection Plan

### Phase 1: Enhanced Error Tracking (1-2 days)

**Implement:**

- Error context and tagging
- User feedback on errors
- Error grouping by category
- API error tracking

**Expected Value:**

- Better error diagnosis
- Faster bug fixes
- Improved error recovery

**Issue:** #108 - Enhanced Sentry Configuration

### Phase 2: Performance Monitoring (2-3 days)

**Implement:**

- Custom performance marks
- API timing tracking
- Core Web Vitals monitoring
- Performance budgets

**Expected Value:**

- Identify performance regressions
- Validate optimizations
- Track user experience

**Issue:** #109 - Custom Performance Tracking

### Phase 3: Basic Analytics (3-4 days)

**Implement:**

- Privacy-focused analytics tool
- Page view tracking
- Feature usage events
- Session duration

**Expected Value:**

- Understand user behavior
- Validate feature value
- Guide roadmap

**Issue:** #110 - Privacy-Focused Analytics

### Phase 4: Advanced Monitoring (2-3 days)

**Implement:**

- Uptime monitoring
- API health checks
- Alert system
- Dashboards

**Expected Value:**

- Proactive issue detection
- Faster incident response
- Better visibility

**Issues:** #113-#118 - Monitoring Infrastructure

## Success Metrics

### Error Tracking

**Current:**

- Error capture rate: Unknown
- Error resolution time: Unknown

**Target:**

- Error capture rate: > 95%
- Mean time to resolution: < 24h
- Error rate: < 0.1% of sessions

### Performance

**Current:**

- No baseline measurements

**Target:**

- LCP: < 2.5s (75th percentile)
- FID: < 100ms (75th percentile)
- CLS: < 0.1 (75th percentile)
- TTI: < 3s on 3G

### Usage Metrics

**Target (if implemented):**

- Daily Active Users: Track growth
- Session duration: > 5 minutes
- Commander search conversion: > 80%
- CSV upload rate: > 40% of users
- Return visitor rate: > 30%

## Tool Recommendations

### Error Tracking ✅

**Current: Sentry** - Good choice

- Excellent error grouping
- Source map support
- Performance monitoring included
- Free tier sufficient

**Alternative:** Rollbar, Bugsnag

### Analytics (To Implement) ⚠️

**Recommended: Plausible Analytics**

- Privacy-focused
- No cookies needed
- Simple, lightweight
- EU-hosted option

**Alternatives:**

- Fathom Analytics (privacy-focused)
- Umami (open source, self-hosted)
- Simple Analytics (privacy-focused)

**NOT Recommended:**

- Google Analytics (privacy concerns)
- Mixpanel (too complex for needs)

### Uptime Monitoring (To Implement) ⚠️

**Recommended: UptimeRobot**

- Free tier: 50 monitors
- 5-minute checks
- Alert integrations

**Alternatives:**

- Pingdom
- StatusCake
- Self-hosted: Uptime Kuma

### Performance Monitoring ⚠️

**Current: Sentry Performance** - Good start

- Included with Sentry
- 10% sample rate acceptable

**Additions:**

- Lighthouse CI (CI/CD integration)
- Web Vitals library (client-side)

## Implementation Priority

### High Priority (Weeks 1-2)

1. **Enhanced Sentry Configuration** (#108)
   - Add error context and tags
   - Improve error categorization
   - Implement user feedback

2. **Custom Performance Tracking** (#109)
   - Add performance marks
   - Track API timings
   - Monitor Core Web Vitals

### Medium Priority (Weeks 3-4)

3. **Privacy-Focused Analytics** (#110)
   - Choose and integrate tool
   - Track basic usage
   - Respect user privacy

4. **Uptime Monitoring** (#113)
   - Set up status checks
   - Configure alerts
   - Create status page

### Low Priority (Month 2+)

5. **API Health Monitoring** (#114)
6. **Lighthouse CI** (#115)
7. **Advanced Dashboards** (#117-#118)
8. **Feature Usage Tracking** (#112)

## Related Issues

Analytics and monitoring issues created from this review:

- **#108** - Enhance Sentry Error Context (High Priority)
- **#109** - Implement Custom Performance Tracking (High Priority)
- **#110** - Implement Privacy-Focused Analytics (Medium Priority)
- **#111** - Implement Structured Logging (Low Priority)
- **#112** - Implement Feature Usage Tracking (Medium Priority)
- **#113** - Set Up Uptime Monitoring (Medium Priority)
- **#114** - Implement API Health Monitoring (Medium Priority)
- **#115** - Set Up Lighthouse CI (Medium Priority)
- **#116** - Configure Alert System (Medium Priority)
- **#117** - Create Operations Dashboard (Low Priority)
- **#118** - Create Business Metrics Dashboard (Low Priority)

## Conclusion

Commander Scout has a solid foundation with Sentry error tracking configured. The main gaps are:

1. **Analytics** - No user behavior tracking
2. **Performance Monitoring** - Basic but needs custom metrics
3. **Uptime Monitoring** - No proactive status checks
4. **Alerting** - No comprehensive alert system

Implementing the high-priority improvements (enhanced Sentry and custom performance tracking) will provide immediate value in understanding and improving the application. The analytics implementation should be carefully considered to maintain the privacy-focused approach.

**Overall Monitoring Maturity:** Basic (2/5)  
**Target Maturity:** Intermediate (4/5)

---

**Review Completed:** November 22, 2025  
**Current Tools:** Sentry (errors + basic performance)  
**Recommended Additions:** Plausible Analytics, UptimeRobot, Lighthouse CI  
**Next Steps:** Enhance Sentry configuration and add custom performance tracking
