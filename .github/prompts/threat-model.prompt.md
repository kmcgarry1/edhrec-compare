---
description: "Create a lightweight threat model for a feature, workflow, integration, or architecture change before implementation or security review."
name: "Threat Model"
argument-hint: "Describe the feature, workflow, user action, external API, or change to analyze."
agent: "Vulnerability Checker"
---

Build a concise threat model for the supplied feature or change.

Use the repository context when relevant, especially [ARCHITECTURE.md](../../ARCHITECTURE.md), [docs/SECURITY_REVIEW.md](../../docs/SECURITY_REVIEW.md), and [docs/ACCESSIBILITY.md](../../docs/ACCESSIBILITY.md) if the workflow involves user interaction constraints.

Return the result in this order:

1. Scope summary
2. Assets to protect
3. Trust boundaries and entry points
4. Threats and abuse cases
5. Existing mitigations visible in code or config
6. Recommended controls
7. Open questions

For each threat include:

- Threat
- Attack path
- Impact
- Likelihood: High | Medium | Low
- Recommended mitigation

Prefer concrete application threats over generic checklists. If assumptions are missing, state them explicitly instead of inventing architecture details.
