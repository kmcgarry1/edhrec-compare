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
<input type="text" placeholder="Search for a commander..." aria-label="Commander search" />
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
  <div class="form-field">
    <input v-model="searchTerm" type="text" id="commander-search" class="peer" placeholder=" " />
    <label for="commander-search" class="floating-label"> Primary Commander </label>
    <button v-if="searchTerm" @click="clear" class="clear-btn">✕</button>
  </div>
</template>

<style>
.floating-label {
  position: absolute;
  transition: all 0.2s;
  pointer-events: none;
}

.peer:focus ~ .floating-label,
.peer:not(:placeholder-shown) ~ .floating-label {
  transform: translateY(-1.5rem) scale(0.85);
  color: theme("colors.emerald.600");
}
</style>
```

### Alternative: Visible Label Above Input

Simpler approach if floating labels seem too complex:

```vue
<template>
  <div class="form-field">
    <label for="commander-search" class="block text-sm font-medium mb-2"> Primary Commander </label>
    <input
      v-model="searchTerm"
      type="text"
      id="commander-search"
      placeholder="Search for a commander..."
    />
  </div>
  <p class="help-text">Select the main deck commander.</p>
</template>
```

### Additional Enhancements

#### 1. Clear Button

```vue
<button
  v-if="searchTerm"
  @click="clear"
  class="absolute right-2 top-1/2 -translate-y-1/2"
  aria-label="Clear search"
>
  ✕
</button>
```

#### 2. Search Suggestions Dropdown

```vue
<ul v-if="suggestions.length" role="listbox">
  <li
    v-for="suggestion in suggestions"
    :key="suggestion.id"
    role="option"
    @click="selectCommander(suggestion)"
  >
    {{ suggestion.name }}
  </li>
</ul>
```

#### 3. Validation Feedback

```vue
<p v-if="error" role="alert" class="error-message">
  {{ error }}
</p>

<p v-if="success" role="status" class="success-message">
  {{ success }}
</p>
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
<script setup lang="ts">
import { computed } from "vue";

interface Props {
  label: string;
  modelValue: string;
  placeholder?: string;
  helpText?: string;
  error?: string;
  type?: "text" | "email" | "password";
}

const props = withDefaults(defineProps<Props>(), {
  type: "text",
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
  clear: [];
}>();

const hasValue = computed(() => props.modelValue.length > 0);
</script>

<template>
  <div class="form-field">
    <label :for="label" class="block text-sm font-medium mb-2">
      {{ label }}
    </label>

    <div class="relative">
      <input
        :value="modelValue"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        :type="type"
        :id="label"
        :placeholder="placeholder"
        class="w-full px-4 py-2 pr-10"
      />

      <button
        v-if="hasValue"
        @click="emit('clear')"
        class="absolute right-2 top-1/2 -translate-y-1/2"
        aria-label="Clear input"
      >
        ✕
      </button>
    </div>

    <p v-if="helpText" class="text-xs text-slate-600 mt-1">
      {{ helpText }}
    </p>

    <p v-if="error" role="alert" class="text-xs text-red-600 mt-1">
      {{ error }}
    </p>
  </div>
</template>
```

### Usage Example

```vue
<template>
  <FormField
    v-model="commanderName"
    label="Primary Commander"
    placeholder="Search for a commander..."
    help-text="Enter the name of your deck commander"
    :error="validationError"
    @clear="commanderName = ''"
  />
</template>
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

- #69 - Mobile toolbar (touch targets)

## References

- [WCAG 3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions.html)
- [Material Design Text Fields](https://material.io/components/text-fields)
- [Floating Labels Are Problematic](https://medium.com/simple-human/floating-labels-are-a-bad-idea-82edb64220f6)
- [Placeholders in Form Fields Are Harmful](https://www.nngroup.com/articles/form-design-placeholders/)
