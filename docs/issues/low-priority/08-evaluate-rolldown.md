# 📐 Evaluate Rolldown vs standard Vite stability

**Labels:** `investigation`, `low-priority`

## Problem
Project uses `rolldown-vite@7.2.2` instead of standard Vite. This is an experimental bundler.

## Current State
```json
"vite": "npm:rolldown-vite@7.2.2"
```

## Questions
1. Why was Rolldown chosen?
2. What benefits does it provide?
3. Are there stability concerns?
4. Should we stick with it or migrate to standard Vite?

## Investigation Needed
- Document rationale in ARCHITECTURE.md
- Evaluate stability in production
- Check for known issues
- Compare performance vs standard Vite
- Assess long-term maintenance

## Potential Actions
1. **Keep Rolldown** - If proven stable and beneficial
2. **Switch to standard Vite** - If concerns arise
3. **Document decision** - Either way, document why

## Success Criteria
- Decision documented
- Rationale clear
- No unexpected production issues
- Team aligned on choice
