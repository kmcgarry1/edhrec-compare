# Creating GitHub Issues from Reviews

This document provides instructions for creating GitHub issues from the comprehensive app reviews conducted in November 2025.

## Overview

**Total Issues Identified:** 51 issues across 7 review categories

| Category               | Issue Range | Count | Script                  |
| ---------------------- | ----------- | ----- | ----------------------- |
| Performance            | #76-#80     | 5     | create-review-issues.sh |
| Security               | #81-#86     | 6     | create-review-issues.sh |
| Functionality          | #87-#90     | 4     | Manual or extend script |
| Compatibility          | #91-#98     | 8     | Manual or extend script |
| Compliance             | #99-#107    | 9     | Manual or extend script |
| Monitoring & Analytics | #108-#118   | 11    | Manual or extend script |
| Marketing & Content    | #119-#129   | 11    | Manual or extend script |

## Automated Issue Creation

### Prerequisites

1. **Install GitHub CLI:**

   ```bash
   # macOS
   brew install gh

   # Windows
   winget install GitHub.cli

   # Linux
   See https://github.com/cli/cli#installation
   ```

2. **Authenticate:**
   ```bash
   gh auth login
   ```

### Method 1: Create Performance & Security Issues (11 issues)

The provided script creates the first 11 issues (#76-#86):

```bash
# Make script executable (if not already)
chmod +x create-review-issues.sh

# Run the script
./create-review-issues.sh
```

This will create:

- **Performance issues** (#76-#80): Caching, virtual scrolling, code splitting, deduplication, PWA
- **Security issues** (#81-#86): CSP, input sanitization, storage strategy, error messages, npm audit, privacy policy

### Method 2: Create Architecture/UI Issues (16 issues)

Use the existing script for previously documented issues:

```bash
./create-issues.sh
```

This creates issues from `docs/issues/{priority}/` markdown files.

### Method 3: Create Remaining Issues Manually (40 issues)

For issues #87-#129, you have two options:

#### Option A: Extend the Script

Add additional issues to `create-review-issues.sh` following the existing pattern:

```bash
# Add more create_issue calls
create_issue \
    "Issue Title" \
    "Issue body..." \
    "labels" \
    "priority"
```

#### Option B: Manual Creation via GitHub UI

1. Go to https://github.com/kmcgarry1/edhrec-compare/issues/new
2. Use templates below for each issue
3. Add appropriate labels

## Issue Templates

### Functionality Issues (#87-#90)

**#87 - Add CSV Upload Success Feedback**

- **Title:** Add CSV Upload Success Feedback
- **Labels:** functionality, low-priority, enhancement, ux
- **Body:** See Functionality Review (docs/FUNCTIONALITY_REVIEW.md) - Section "CSV Upload and Processing"

**#88 - Add Inventory Status Indicator**

- **Title:** Add Inventory Status Indicator in Toolbar
- **Labels:** functionality, low-priority, enhancement, ux
- **Body:** See Functionality Review - Section "CSV Upload and Processing"

**#89 - Add Currency Toggle (USD/EUR)**

- **Title:** Add Currency Toggle for Pricing (USD/EUR)
- **Labels:** functionality, low-priority, enhancement, feature
- **Body:** See Functionality Review - Section "Scryfall Integration"

**#90 - Add Fallback Image for Missing Cards**

- **Title:** Add Fallback Placeholder Image for Cards Without Images
- **Labels:** functionality, low-priority, enhancement, ux
- **Body:** See Functionality Review - Section "Scryfall Integration"

### Compatibility Issues (#91-#98)

**#91 - Test Safari Compatibility and Fix IndexedDB**

- **Title:** Test Safari Compatibility and Handle IndexedDB Private Mode
- **Labels:** compatibility, high-priority, testing, bug
- **Body:** See Compatibility Review (docs/COMPATIBILITY_REVIEW.md) - Section "Safari 17+"

**#92 - Comprehensive iOS Testing**

- **Title:** Conduct Comprehensive iOS Safari Testing
- **Labels:** compatibility, high-priority, testing, mobile
- **Body:** See Compatibility Review - Section "iOS Safari"

**#93 - Comprehensive Android Testing**

- **Title:** Conduct Comprehensive Android Chrome Testing
- **Labels:** compatibility, high-priority, testing, mobile
- **Body:** See Compatibility Review - Section "Chrome Mobile (Android)"

**#94 - Tablet Optimization**

- **Title:** Optimize User Experience for Tablet Devices
- **Labels:** compatibility, medium-priority, enhancement, tablet
- **Body:** See Compatibility Review - Section "Tablet Sizes"

**#95 - macOS Safari Testing**

- **Title:** Test and Verify macOS Safari Compatibility
- **Labels:** compatibility, medium-priority, testing
- **Body:** See Compatibility Review - Section "macOS"

**#96 - Comprehensive Responsive Testing**

- **Title:** Conduct Comprehensive Responsive Design Testing
- **Labels:** compatibility, medium-priority, testing, responsive
- **Body:** See Compatibility Review - Section "Screen Size & Responsive Design"

**#97 - Add No-JavaScript Fallback Message**

- **Title:** Add Fallback Message for JavaScript Disabled
- **Labels:** compatibility, low-priority, enhancement, a11y
- **Body:** See Compatibility Review - Section "Feature Detection"

**#98 - High Contrast Mode Support**

- **Title:** Add Windows High Contrast Mode Support
- **Labels:** compatibility, low-priority, enhancement, a11y
- **Body:** See Compatibility Review - Section "Accessibility Compatibility"

### Compliance Issues (#99-#107)

**#99 - Create Privacy Policy and Cookie Notice**

- **Title:** Create Privacy Policy and Cookie Consent Notice
- **Labels:** compliance, high-priority, legal, documentation
- **Body:** See Compliance Review (docs/COMPLIANCE_REVIEW.md) - Section "Privacy Policy"

**#100 - WCAG 2.1 Color Contrast Audit**

- **Title:** Conduct WCAG 2.1 Level AA Color Contrast Audit
- **Labels:** compliance, high-priority, a11y, testing
- **Body:** See Compliance Review - Section "WCAG 2.1 Level AA"

**#101 - Add Skip Navigation Links**

- **Title:** Add Skip Navigation Links for Accessibility
- **Labels:** compliance, medium-priority, a11y, enhancement
- **Body:** See Compliance Review - Section "WCAG 2.1 - Principle 2"

**#102 - HTML Validation and Cleanup**

- **Title:** Run W3C HTML Validator and Fix Issues
- **Labels:** compliance, medium-priority, maintenance
- **Body:** See Compliance Review - Section "HTML5 Compliance"

**#103 - Add Third-Party API Attribution**

- **Title:** Add Attribution for Scryfall and EDHREC APIs
- **Labels:** compliance, high-priority, legal, documentation
- **Body:** See Compliance Review - Section "Third-Party Service Compliance"

**#104 - Add Wizards of the Coast Disclaimer**

- **Title:** Add WotC Fan Content Policy Disclaimer
- **Labels:** compliance, high-priority, legal, documentation
- **Body:** See Compliance Review - Section "Magic: The Gathering IP"

**#105 - Add LICENSE File**

- **Title:** Add LICENSE File to Repository
- **Labels:** compliance, medium-priority, legal, documentation
- **Body:** See Compliance Review - Section "Commander Scout Branding"

**#106 - Create Terms of Service**

- **Title:** Create Terms of Service Document
- **Labels:** compliance, medium-priority, legal, documentation
- **Body:** See Compliance Review - Section "Terms of Service"

**#107 - Add Legal Disclaimer Page**

- **Title:** Add Legal Disclaimer/Legal Notice Page
- **Labels:** compliance, medium-priority, legal, documentation
- **Body:** See Compliance Review - Section "Disclaimer / Legal Notice"

### Monitoring & Analytics Issues (#108-#118)

**#108 - Enhance Sentry Error Context**

- **Title:** Enhance Sentry with Error Context and Tagging
- **Labels:** monitoring, high-priority, enhancement
- **Body:** See Monitoring & Analytics Review (docs/MONITORING_ANALYTICS_REVIEW.md) - Section "Error Tracking"

**#109 - Implement Custom Performance Tracking**

- **Title:** Implement Custom Performance Measurements
- **Labels:** monitoring, high-priority, performance
- **Body:** See Monitoring & Analytics Review - Section "Performance Metrics"

**#110 - Implement Privacy-Focused Analytics**

- **Title:** Implement Privacy-Focused User Analytics
- **Labels:** monitoring, medium-priority, analytics, privacy
- **Body:** See Monitoring & Analytics Review - Section "User Analytics"

**#111 - Implement Structured Logging**

- **Title:** Implement Structured Logging System
- **Labels:** monitoring, low-priority, maintenance
- **Body:** See Monitoring & Analytics Review - Section "Logging"

**#112 - Implement Feature Usage Tracking**

- **Title:** Implement Feature Usage Event Tracking
- **Labels:** monitoring, medium-priority, analytics
- **Body:** See Monitoring & Analytics Review - Section "Feature Usage Metrics"

**#113 - Set Up Uptime Monitoring**

- **Title:** Set Up Uptime and Availability Monitoring
- **Labels:** monitoring, medium-priority, infrastructure
- **Body:** See Monitoring & Analytics Review - Section "Uptime Monitoring"

**#114 - Implement API Health Monitoring**

- **Title:** Implement Third-Party API Health Monitoring
- **Labels:** monitoring, medium-priority, reliability
- **Body:** See Monitoring & Analytics Review - Section "Third-Party API Monitoring"

**#115 - Set Up Lighthouse CI**

- **Title:** Set Up Lighthouse CI for Performance Regression Detection
- **Labels:** monitoring, medium-priority, performance, ci
- **Body:** See Monitoring & Analytics Review - Section "Performance Regression Detection"

**#116 - Configure Alert System**

- **Title:** Configure Comprehensive Alert System
- **Labels:** monitoring, medium-priority, infrastructure
- **Body:** See Monitoring & Analytics Review - Section "Alerting Strategy"

**#117 - Create Operations Dashboard**

- **Title:** Create Operations Monitoring Dashboard
- **Labels:** monitoring, low-priority, infrastructure
- **Body:** See Monitoring & Analytics Review - Section "Operations Dashboard"

**#118 - Create Business Metrics Dashboard**

- **Title:** Create Business Metrics Dashboard
- **Labels:** monitoring, low-priority, analytics
- **Body:** See Monitoring & Analytics Review - Section "Business Metrics Dashboard"

### Marketing & Content Issues (#119-#129)

**#119 - Enhance README with Visual Content**

- **Title:** Enhance README with Screenshots and Visual Content
- **Labels:** marketing, high-priority, documentation
- **Body:** See Marketing & Content Review (docs/CONTENT_MARKETING_REVIEW.md) - Section "README.md"

**#120 - Improve Error Message Copy**

- **Title:** Improve Error Message Copy and Helpfulness
- **Labels:** content, medium-priority, ux
- **Body:** See Marketing & Content Review - Section "Error Messages"

**#121 - Add Contextual Help and Tooltips**

- **Title:** Add Contextual Help Text and Tooltips
- **Labels:** content, high-priority, ux
- **Body:** See Marketing & Content Review - Section "Tooltips and Help Text"

**#122 - Add Code of Conduct**

- **Title:** Add Code of Conduct for Contributors
- **Labels:** community, low-priority, documentation
- **Body:** See Marketing & Content Review - Section "Contributing"

**#123 - Create User Documentation**

- **Title:** Create User-Focused Documentation and FAQ
- **Labels:** documentation, high-priority
- **Body:** See Marketing & Content Review - Section "User Help Documentation"

**#124 - Design Logo and Favicon**

- **Title:** Design Logo and Favicon for Branding
- **Labels:** design, medium-priority, branding
- **Body:** See Marketing & Content Review - Section "Logo/Icon"

**#125 - Create Demo Video/GIF**

- **Title:** Create Demo Video or Animated GIF
- **Labels:** marketing, medium-priority, documentation
- **Body:** See Marketing & Content Review - Section "Demo/Tutorial"

**#126 - Refine Value Proposition**

- **Title:** Refine Value Proposition and Messaging
- **Labels:** marketing, medium-priority, content
- **Body:** See Marketing & Content Review - Section "Value Proposition"

**#127 - Optimize Call-to-Action Copy**

- **Title:** Optimize Call-to-Action Button Copy
- **Labels:** content, medium-priority, ux
- **Body:** See Marketing & Content Review - Section "Calls to Action"

**#128 - Optimize SEO Meta Tags**

- **Title:** Optimize SEO Meta Tags and Page Titles
- **Labels:** marketing, medium-priority, seo
- **Body:** See Marketing & Content Review - Section "SEO & Discoverability"

**#129 - Add Structured Data Markup**

- **Title:** Add Schema.org Structured Data Markup
- **Labels:** marketing, low-priority, seo
- **Body:** See Marketing & Content Review - Section "Structured Data"

## Verification

After creating issues, verify:

```bash
# List all issues
gh issue list --limit 100

# Count issues by label
gh issue list --label high-priority
gh issue list --label medium-priority
gh issue list --label low-priority

# Check specific issue
gh issue view 76
```

## Bulk Operations

### Add Milestone to All Issues

```bash
# Create milestone
gh api repos/:owner/:repo/milestones -f title="Review Implementation" -f description="Issues from comprehensive app reviews"

# Get milestone number
gh api repos/:owner/:repo/milestones | jq '.[] | select(.title=="Review Implementation") | .number'

# Add issues to milestone (replace MILESTONE_NUM)
for i in {76..129}; do
  gh issue edit $i --milestone MILESTONE_NUM
done
```

### Add Project Board

```bash
# List projects
gh project list

# Add issues to project (replace PROJECT_NUM)
for i in {76..129}; do
  gh project item-add PROJECT_NUM --owner @me --url "https://github.com/kmcgarry1/edhrec-compare/issues/$i"
done
```

## Priority-Based Execution

### Phase 1: High Priority (15 issues)

Focus on critical security, performance, and compliance issues first.

```bash
gh issue list --label high-priority --json number,title
```

**Timeline:** Weeks 1-2 (15 days effort)

### Phase 2: Medium Priority (25 issues)

Address compatibility, monitoring, and quality improvements.

```bash
gh issue list --label medium-priority --json number,title
```

**Timeline:** Weeks 3-6 (25 days effort)

### Phase 3: Low Priority (11 issues)

Polish, enhancement, and nice-to-have features.

```bash
gh issue list --label low-priority --json number,title
```

**Timeline:** Weeks 7-10 (11 days effort)

## Resources

- **Comprehensive Review Summary:** docs/COMPREHENSIVE_REVIEW_SUMMARY.md
- **Individual Reviews:** docs/\*\_REVIEW.md
- **GitHub CLI Docs:** https://cli.github.com/manual/
- **Issue Templates:** This document

## Support

If you encounter issues:

1. Check GitHub CLI authentication: `gh auth status`
2. Verify repository access: `gh repo view`
3. Check issue creation permissions
4. Review error messages in script output

## Notes

- Issue numbers (#76-#129) are approximate - actual numbers may vary based on repository state
- Labels should be created first if they don't exist
- Some issues may already exist from previous reviews - check before creating duplicates
- Adjust priority labels based on project needs

---

**Last Updated:** November 22, 2025  
**Total Issues:** 51 across 7 review categories  
**Estimated Effort:** 60-75 developer days over 3 months
