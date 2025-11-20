# 📖 Create ARCHITECTURE.md documentation

**Labels:** `documentation`, `low-priority`

## Problem
No architecture documentation exists. Design decisions and patterns are undocumented.

## Impact
- Knowledge locked in developers' heads
- New contributors face steep learning curve
- Design rationale unclear
- Difficult to maintain consistency

## Proposed Solution
Create `ARCHITECTURE.md` covering:

### 1. Overview
- Application purpose
- High-level architecture diagram
- Key technologies and why chosen

### 2. Directory Structure
```
src/
  api/          - External API integrations
  components/   - Vue components
  composables/  - Composition API logic
  utils/        - Utility functions
  assets/       - Static assets
```

### 3. State Management
- Composable-based global state
- Why no Vuex/Pinia
- State flow diagram

### 4. Data Flow
- User uploads CSV → processed → stored in memory
- User searches commander → fetch EDHREC → fetch Scryfall → render
- Export flow

### 5. Design Decisions
- Why Vue 3 Composition API
- Why no routing (or why routing added)
- Why Rolldown instead of standard Vite
- State management approach
- Testing strategy

### 6. External Dependencies
- EDHREC JSON API
- Scryfall API
- Rate limiting strategy
- Error handling

### 7. Performance Considerations
- Virtual scrolling strategy
- API caching
- Bundle optimization

### 8. Security
- CSP configuration
- Input validation
- API key management (if any)

## Example Structure
See [C4 Model](https://c4model.com/) for inspiration

## Success Criteria
- Clear architecture documentation
- New contributors can understand design
- Design decisions documented
- Diagrams where helpful
