# Form Input Accessibility Improvements

**Priority:** Medium  
**Type:** Accessibility Enhancement  
**Component:** CommanderSearch, CSVUpload  
**Effort:** Low (< 1 day)

## Problem

Form inputs rely on placeholder text and `aria-label` attributes without visible labels. While this works for screen readers, it's not optimal for all users, especially those with cognitive disabilities or low vision who benefit from persistent visible labels.

### Current Issues

- Primary commander search uses placeholder text that disappears on focus
- No persistent label visible to sighted users
- Search icon positioned inside input may reduce text space
- No clear/reset button visible when input has text
- Missing validation feedback or character limits

### Accessibility Impact

- **WCAG 2.1 Level AA:** Partially fails 3.3.2 (Labels or Instructions)
- Screen reader users: ✅ Works (aria-label present)
- Low vision users: ⚠️ Suboptimal (no persistent label)
- Cognitive disabilities: ⚠️ Context lost when placeholder disappears

## Screenshots

- [Commander search input](https://github.com/user-attachments/assets/45f1f1e9-f478-4aa9-a40f-083ef4c8b453)

## Current Implementation

```vue
<input
  type="text"
  placeholder="Atraxa, Grand Unifier..."
  aria-label="Search primary commander"
  class="..."
/>
```

## Proposed Solution

### Floating Label Pattern

Implement Material Design-style floating labels that:

1. Start as placeholder text when empty
2. Float above input on focus or when filled
3. Remain visible at all times after first interaction
4. Provide visual hierarchy and context

```vue
<template>
  <div class="input-wrapper">
    <input
      id="commander-search"
      v-model="searchText"
      type="text"
      placeholder=" "
      class="peer"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    <label for="commander-search" class="floating-label"> Primary Commander </label>
    <button v-if="searchText" @click="clearSearch" class="clear-button" aria-label="Clear search">
      ✕
    </button>
  </div>
</template>

<style scoped>
.input-wrapper {
  position: relative;
}

.floating-label {
  position: absolute;
  left: 2.5rem; /* After icon */
  top: 50%;
  transform: translateY(-50%);
  transition: all 0.2s;
  pointer-events: none;
  color: theme("colors.slate.500");
}

/* Float when focused or has value */
.peer:focus ~ .floating-label,
.peer:not(:placeholder-shown) ~ .floating-label {
  top: -0.5rem;
  left: 0.75rem;
  font-size: 0.75rem;
  color: theme("colors.emerald.600");
  background: white;
  padding: 0 0.25rem;
}
</style>
```

### Alternative: Visible Label Above Input

Simpler approach if floating labels seem too complex:

```vue
<div class="field-group">
  <label 
    for="commander-search"
    class="block text-sm font-medium text-slate-700 mb-1"
  >
    Primary Commander
  </label>
  <input
    id="commander-search"
    v-model="searchText"
    type="text"
    placeholder="Search for a commander..."
    class="..."
  />
  <p class="text-xs text-slate-500 mt-1">
    Select the main deck commander.
  </p>
</div>
```

### Additional Enhancements

#### 1. Clear Button

```vue
<button
  v-if="searchText"
  @click="clearSearch"
  type="button"
  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
  aria-label="Clear search text"
>
  <svg class="w-4 h-4"><!-- X icon --></svg>
</button>
```

#### 2. Search Suggestions Dropdown

```vue
<div
  v-if="showSuggestions && suggestions.length"
  role="listbox"
  class="absolute top-full mt-1 w-full bg-white shadow-lg rounded-lg"
>
  <button
    v-for="(suggestion, i) in suggestions"
    :key="i"
    role="option"
    @click="selectSuggestion(suggestion)"
    class="..."
  >
    {{ suggestion.name }}
  </button>
</div>
```

#### 3. Validation Feedback

```vue
<div v-if="error" class="text-red-600 text-xs mt-1" role="alert">
  {{ error }}
</div>

<div v-if="success" class="text-emerald-600 text-xs mt-1" role="status">
  {{ success }}
</div>
```

## Implementation Plan

### Phase 1: Visible Labels

1. Add visible labels above all inputs
2. Keep aria-labels for redundancy
3. Style labels consistently

### Phase 2: Clear Buttons

1. Add clear button to search inputs
2. Show only when input has value
3. Ensure keyboard accessible

### Phase 3: Floating Labels (Optional)

1. Implement CSS-only floating label
2. Add smooth transitions
3. Test across browsers

### Phase 4: Enhanced Feedback

1. Add validation messages
2. Implement inline help text
3. Show character counts where relevant

## Technical Details

### Files to Modify

- `src/components/CommanderSearch.vue` - Primary search input
- `src/components/CSVUpload.vue` - File input label
- Create shared `FormField.vue` component for consistency

### Reusable Component

```vue
<!-- src/components/core/FormField.vue -->
<script setup lang="ts">
interface Props {
  modelValue: string;
  label: string;
  placeholder?: string;
  error?: string;
  helpText?: string;
  clearable?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  "update:modelValue": [value: string];
  clear: [];
}>();
</script>

<template>
  <div class="form-field">
    <label :for="id" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
      {{ label }}
    </label>

    <div class="relative">
      <slot name="icon" />

      <input
        :id="id"
        :value="modelValue"
        :placeholder="placeholder"
        @input="emit('update:modelValue', $event.target.value)"
        class="..."
      />

      <button
        v-if="clearable && modelValue"
        @click="emit('clear')"
        type="button"
        class="absolute right-3 top-1/2 -translate-y-1/2"
        aria-label="Clear input"
      >
        ✕
      </button>
    </div>

    <p v-if="helpText" class="text-xs text-slate-500 mt-1">
      {{ helpText }}
    </p>

    <p v-if="error" class="text-xs text-red-600 mt-1" role="alert">
      {{ error }}
    </p>
  </div>
</template>
```

### Usage Example

```vue
<FormField
  v-model="commanderName"
  label="Primary Commander"
  placeholder="Atraxa, Grand Unifier..."
  help-text="Select the main deck commander."
  clearable
  @clear="commanderName = ''"
>
  <template #icon>
    <MagnifyIcon class="absolute left-3 top-1/2 -translate-y-1/2" />
  </template>
</FormField>
```

## Acceptance Criteria

- [ ] All form inputs have visible labels
- [ ] Labels persist when input is focused or filled
- [ ] Clear buttons appear on all text inputs when filled
- [ ] Labels maintain contrast ratio of 4.5:1 minimum
- [ ] Labels properly associated with inputs (for/id)
- [ ] Screen reader announces label, value, and validation
- [ ] Keyboard navigation works for all interactions
- [ ] Help text provides additional context where needed
- [ ] Error messages are accessible (role="alert")
- [ ] Passes axe-core accessibility audit

## Testing Checklist

- [ ] Test with NVDA screen reader (Windows)
- [ ] Test with VoiceOver (macOS/iOS)
- [ ] Verify keyboard-only navigation
- [ ] Check color contrast with tools
- [ ] Test with 200% zoom
- [ ] Verify in high contrast mode
- [ ] Test with forms auto-fill

## WCAG Success Criteria

This enhancement addresses:

- **3.3.2 Labels or Instructions (Level A)** - Visible labels provided
- **2.4.6 Headings and Labels (Level AA)** - Descriptive labels
- **1.3.1 Info and Relationships (Level A)** - Proper form structure
- **4.1.2 Name, Role, Value (Level A)** - Semantic HTML

## Related Issues

- docs/issues/medium-priority/09-accessibility-improvements.md
- #TBD-button-states (consistent interaction patterns)

## References

- [WCAG 3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions.html)
- [Material Design Text Fields](https://material.io/components/text-fields)
- [Floating Labels Are Problematic](https://medium.com/simple-human/floating-labels-are-a-bad-idea-82edb64220f6)
- [Placeholders in Form Fields Are Harmful](https://www.nngroup.com/articles/form-design-placeholders/)
