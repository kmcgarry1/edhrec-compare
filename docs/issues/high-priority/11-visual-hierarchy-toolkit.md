# Visual Hierarchy in Toolkit Header

**Priority:** High  
**Type:** UI Enhancement  
**Component:** ToolkitHeader  
**Effort:** Low (< 1 day)

## Problem

All buttons in the toolkit header have similar visual weight, making it difficult for users to distinguish between primary and secondary actions. While "Upload CSV" uses emerald accent color, other important controls blend together, requiring users to read every button to find what they need.

### Current Issues

- No clear primary action (everything looks equal)
- "Upload CSV" and ownership filters don't stand out enough
- Theme/background toggles given same prominence as core features
- Export buttons have same visual weight despite being contextual
- Cognitive load increases when scanning for specific controls

### User Impact

- **Medium-High:** Users take longer to find key features
- New users unsure what actions are most important
- Reduced efficiency in repeated workflows
- Features like CSV upload may be overlooked

## Screenshots

- [Current toolbar layout](https://github.com/user-attachments/assets/45f1f1e9-f478-4aa9-a40f-083ef4c8b453)
- [Dark mode toolbar](https://github.com/user-attachments/assets/8b32ef9f-2f8c-4958-9829-501ce3b25d61)

## Proposed Solution

### Button Hierarchy System

#### **Primary Actions** (Most important, high visual weight)

- **Upload CSV** - Core feature enabling main functionality
  - Large button (px-6 py-3)
  - High contrast emerald background
  - Icon + bold text
  - Elevated shadow

#### **Secondary Actions** (Important, medium visual weight)

- **Ownership Filters** (Owned, Unowned, Show All)
  - Medium size (px-4 py-2)
  - Outline style when inactive
  - Filled style when active
  - Clear visual feedback

#### **Tertiary Actions** (Utilities, low visual weight)

- **Theme Toggle, Background Toggle, Hide Toolbar**
  - Small size (px-3 py-1.5)
  - Ghost or minimal styling
  - Icons preferred over text
  - Grouped together visually

#### **Contextual Actions** (Only shown when relevant)

- **Export Buttons**
  - Disabled state when no data
  - Clear tooltip explaining why disabled
  - Secondary style when enabled

### Visual Design Changes

```vue
<!-- Before: All similar weight -->
<button>Upload CSV</button>
<button>Dark</button>
<button>Hide BG</button>

<!-- After: Clear hierarchy -->
<button class="btn-primary px-6 py-3 text-base font-bold">
  📁 Upload Collection
</button>

<div class="btn-group-secondary">
  <button class="btn-filter">
    Owned
  </button>
  <button class="btn-filter">
    Unowned
  </button>
</div>
```

### Layout Improvements

1. **Group Related Controls**

   ```
   [Title & Branding]                [Utilities]   [Primary Action]
   Commander Scout                   ☾ 🎨 ✕       [Upload CSV]

   [Description text explaining the tool]

   [Ownership Filters]               [Export]
   ○ Owned  ○ Unowned  ● Show All    Copy | Download
   ```

2. **Use Visual Separators**
   - Divider between utility buttons and primary action
   - Subtle borders around filter group
   - Card sections for logical grouping

3. **Size Differentiation**
   - Primary: Large (text-base, py-3)
   - Secondary: Medium (text-sm, py-2)
   - Tertiary: Small (text-xs, py-1.5)

4. **Color Strategy**
   - Primary: High saturation emerald (500-600)
   - Secondary: Medium contrast slate borders
   - Tertiary: Low contrast, ghosted appearance
   - Active states: Bold emerald

## Implementation Plan

### Phase 1: Button Sizing (Quick Win)

1. Increase "Upload CSV" button size
2. Reduce utility button sizes
3. Adjust padding and font sizes

### Phase 2: Color & Contrast

1. Make primary action more vibrant
2. Reduce contrast on utility buttons
3. Ensure active states are obvious

### Phase 3: Layout & Grouping

1. Add visual separators
2. Group related controls in `<div>` containers
3. Adjust spacing between groups (gap-4 vs gap-2)

### Phase 4: Responsive Behavior

1. Adjust hierarchy on mobile (hamburger menu)
2. Ensure primary action always visible
3. Progressive disclosure for secondary features

## Technical Details

### Files to Modify

- `src/components/ToolkitHeader.vue` - Main button layout
- Possibly extract button variants to shared components

### Tailwind Classes

```typescript
// Button variants
const buttonVariants = {
  primary:
    "px-6 py-3 text-base font-bold bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 transition",
  secondary:
    "px-4 py-2 text-sm font-semibold border-2 border-slate-300 hover:border-emerald-500 transition",
  tertiary: "px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700 transition",
  ghost:
    "px-3 py-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition",
};
```

### Design Tokens

Consider adding design token constants:

```typescript
// src/utils/designTokens.ts
export const BUTTON_SIZES = {
  lg: "px-6 py-3 text-base",
  md: "px-4 py-2 text-sm",
  sm: "px-3 py-1.5 text-xs",
  xs: "px-2 py-1 text-xs",
};

export const BUTTON_VARIANTS = {
  primary: "bg-emerald-600 text-white font-bold shadow-lg",
  secondary: "border-2 border-slate-300 font-semibold",
  tertiary: "text-slate-500",
  ghost: "text-slate-400 hover:bg-slate-50",
};
```

## Acceptance Criteria

- [ ] "Upload CSV" button is visually dominant (1.5-2x larger)
- [ ] Utility buttons (theme, hide) are smaller and less prominent
- [ ] Related controls are grouped with visual separation
- [ ] Active filter states are immediately obvious
- [ ] Disabled states are clearly distinguishable
- [ ] Hierarchy maintained in both light and dark modes
- [ ] Design system tokens documented
- [ ] A/B test shows improved task completion time (optional)

## Design Principles

1. **Visual Weight = Importance**
   - Size, color, contrast, shadow communicate priority

2. **Grouping = Relationship**
   - Proximity shows which controls are related

3. **Consistency = Learnability**
   - Same patterns used throughout interface

4. **Progressive Disclosure**
   - Show primary actions first, reveal details on interaction

## Alternatives Considered

1. **Tab-based toolbar** - Dismissed: Adds navigation complexity
2. **Dropdown menus for everything** - Dismissed: Hides important features
3. **Two-row toolbar** - Dismissed: Takes too much vertical space
4. **Context-sensitive toolbar** - Future enhancement, not initial solution

## Related Issues

- #69 - Mobile toolbar (responsive design)
- #71 - Information density (overall layout)

## References

- [Material Design Button Hierarchy](https://material.io/components/buttons)
- [Nielsen Norman Group - Visual Hierarchy](https://www.nngroup.com/articles/visual-hierarchy-ux-definition/)
- [Apple HIG - Visual Design](https://developer.apple.com/design/human-interface-guidelines/foundations/layout)
