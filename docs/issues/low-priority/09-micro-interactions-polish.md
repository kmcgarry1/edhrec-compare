# Micro-interactions & Visual Polish

**Priority:** Low  
**Type:** Enhancement  
**Component:** Global  
**Effort:** Low-Medium (1-3 days)

## Description

Add subtle animations and micro-interactions throughout the interface to enhance the premium feel, provide feedback, and delight users. These small touches improve perceived performance and make the application feel more responsive.

## Proposed Enhancements

### 1. Success Animation for CSV Upload

**Current:** File uploads, modal closes  
**Proposed:** Checkmark animation with scale bounce

```vue
<template>
  <Transition name="success">
    <div v-if="uploadSuccess" class="success-indicator">
      <svg class="checkmark">
        <path d="M5 13l4 4L19 7" />
      </svg>
    </div>
  </Transition>
</template>

<style>
.success-enter-active {
  animation: bounce-in 0.5s;
}

@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
</style>
```

### 2. Card Enter/Exit Transitions

**Current:** Cards appear instantly  
**Proposed:** Staggered fade-up animation

```vue
<template>
  <TransitionGroup name="card-list" tag="div">
    <Card
      v-for="(card, index) in cards"
      :key="card.id"
      :style="{ transitionDelay: `${index * 50}ms` }"
    />
  </TransitionGroup>
</template>

<style>
.card-list-enter-active {
  transition: all 0.3s ease-out;
}

.card-list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
</style>
```

### 3. Card Hover Lift Effect

**Current:** Static cards  
**Proposed:** Subtle elevation on hover

```css
.card-hover {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15);
}
```

### 4. Button Click Ripple Effect

**Proposed:** Material Design-style ripple

```vue
<template>
  <button @click="createRipple">
    Click me
    <span v-for="ripple in ripples" :key="ripple.id" class="ripple" :style="ripple.style" />
  </button>
</template>

<script setup lang="ts">
import { ref } from "vue";

const ripples = ref<Array<{ id: number; style: object }>>([]);

const createRipple = (event: MouseEvent) => {
  const button = event.currentTarget as HTMLButtonElement;
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  const ripple = {
    id: Date.now(),
    style: {
      width: `${size}px`,
      height: `${size}px`,
      left: `${x}px`,
      top: `${y}px`,
    },
  };

  ripples.value.push(ripple);
  setTimeout(() => {
    ripples.value.shift();
  }, 600);
};
</script>

<style>
.ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transform: scale(0);
  animation: ripple-animation 0.6s ease-out;
}

@keyframes ripple-animation {
  to {
    transform: scale(4);
    opacity: 0;
  }
}
</style>
```

### 5. Icon Transitions

**Proposed:** Smooth morphing between states

```vue
<template>
  <Transition name="icon-morph" mode="out-in">
    <svg v-if="isDark" key="moon">
      <path d="M..." />
    </svg>
    <svg v-else key="sun">
      <path d="M..." />
    </svg>
  </Transition>
</template>

<style>
.icon-morph-enter-active,
.icon-morph-leave-active {
  transition: all 0.2s ease;
}

.icon-morph-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.8);
}

.icon-morph-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.8);
}
</style>
```

### 6. Loading Pulse Animation

**Proposed:** Breathing effect on loading elements

```css
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.loading-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### 7. Smooth Scroll Behavior

```css
html {
  scroll-behavior: smooth;
}

/* Or with JavaScript for more control */
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};
```

### 8. Toast Notification Animation

**Proposed:** Slide in from right with bounce

```vue
<template>
  <TransitionGroup name="toast" tag="div">
    <div v-for="toast in toasts" :key="toast.id" class="toast">
      {{ message }}
    </div>
  </TransitionGroup>
</template>

<style>
.toast-enter-active {
  animation: slide-in 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.toast-leave-active {
  animation: slide-out 0.2s ease-in;
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-out {
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
</style>
```

## Implementation Guidelines

### Performance Considerations

1. **Use CSS Transforms** (hardware accelerated)
   - `transform: translate()` over `left`/`top`
   - `opacity` for fades
   - Avoid animating `width`, `height`, `margin`, `padding`

2. **Will-change Hint**

   ```css
   .will-animate {
     will-change: transform, opacity;
   }
   ```

3. **Reduce Motion Preference**
   ```css
   @media (prefers-reduced-motion: reduce) {
     *,
     *::before,
     *::after {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
     }
   }
   ```

### Animation Timing

- **Instant:** < 100ms (feels immediate)
- **Quick:** 100-200ms (button feedback)
- **Standard:** 200-400ms (most transitions)
- **Emphasis:** 400-600ms (important changes)
- **Slow:** > 600ms (special effects only)

### Easing Functions

```css
/* Material Design easing */
--ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
--ease-decelerate: cubic-bezier(0, 0, 0.2, 1); /* Enter */
--ease-accelerate: cubic-bezier(0.4, 0, 1, 1); /* Exit */

/* Spring-like bounce */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

## Acceptance Criteria

- [ ] CSV upload shows success animation
- [ ] Cards fade in with stagger effect
- [ ] Card hover shows lift effect
- [ ] Buttons have ripple or scale feedback
- [ ] Icon transitions are smooth
- [ ] Toast notifications slide in nicely
- [ ] All animations respect `prefers-reduced-motion`
- [ ] No jank or dropped frames (60fps)
- [ ] Animations feel purposeful, not gratuitous
- [ ] Total animation CSS < 5KB

## Files to Create/Modify

- `src/utils/animations.ts` - Reusable animation utilities
- `src/components/*.vue` - Add transitions to components
- `src/assets/animations.css` - Shared animation keyframes
- Update Tailwind config with custom animations

## Related Issues

- #74 - Loading states (skeleton screens need animation)
- #73 - Form accessibility (reduced motion support)

## References

- [Material Design Motion](https://material.io/design/motion/)
- [Framer Motion Principles](https://www.framer.com/motion/)
- [CSS Easing Functions](https://easings.net/)
- [Reduced Motion Query](https://web.dev/prefers-reduced-motion/)
