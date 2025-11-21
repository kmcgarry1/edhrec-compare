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
<Transition name="success-checkmark">
  <div v-if="uploadSuccess" class="success-indicator">
    <svg class="checkmark" viewBox="0 0 52 52">
      <circle class="checkmark-circle" cx="26" cy="26" r="25" />
      <path class="checkmark-check" d="M14 27l7.5 7.5L38 18" />
    </svg>
  </div>
</Transition>

<style>
.checkmark-circle {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.checkmark-check {
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.5s forwards;
}

@keyframes stroke {
  100% {
    stroke-dashoffset: 0;
  }
}
</style>
```

### 2. Card Enter/Exit Transitions

**Current:** Cards appear instantly  
**Proposed:** Staggered fade-up animation

```vue
<TransitionGroup name="card-list" tag="div" @before-enter="onBeforeEnter" @enter="onEnter">
  <CardRow
    v-for="(card, index) in cards"
    :key="card.id"
    :data-index="index"
  />
</TransitionGroup>

<script>
const onBeforeEnter = (el: Element) => {
  (el as HTMLElement).style.opacity = '0';
  (el as HTMLElement).style.transform = 'translateY(20px)';
};

const onEnter = (el: Element, done: () => void) => {
  const delay = (el as HTMLElement).dataset.index * 50;
  setTimeout(() => {
    (el as HTMLElement).style.transition = 'all 0.4s ease';
    (el as HTMLElement).style.opacity = '1';
    (el as HTMLElement).style.transform = 'translateY(0)';
    done();
  }, delay);
};
</script>
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
<button @click="handleClick" class="relative overflow-hidden">
  <span class="button-content">Click me</span>
  <span 
    v-for="ripple in ripples"
    :key="ripple.id"
    class="ripple"
    :style="{
      left: ripple.x + 'px',
      top: ripple.y + 'px'
    }"
  />
</button>

<script>
const ripples = ref([]);

const handleClick = (event) => {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const ripple = { id: Date.now(), x, y };
  ripples.value.push(ripple);

  setTimeout(() => {
    ripples.value = ripples.value.filter((r) => r.id !== ripple.id);
  }, 600);
};
</script>

<style>
.ripple {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transform: translate(-50%, -50%) scale(0);
  animation: ripple-animation 0.6s ease-out;
}

@keyframes ripple-animation {
  to {
    transform: translate(-50%, -50%) scale(4);
    opacity: 0;
  }
}
</style>
```

### 5. Icon Transitions

**Proposed:** Smooth morphing between states

```vue
<!-- Theme toggle icon transition -->
<Transition name="icon-flip" mode="out-in">
  <SunIcon v-if="theme === 'light'" key="sun" />
  <MoonIcon v-else key="moon" />
</Transition>

<style>
.icon-flip-enter-active,
.icon-flip-leave-active {
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.icon-flip-enter-from {
  transform: rotateY(90deg) scale(0.5);
  opacity: 0;
}

.icon-flip-leave-to {
  transform: rotateY(-90deg) scale(0.5);
  opacity: 0;
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
<Transition name="toast" @enter="onToastEnter" @leave="onToastLeave">
  <div v-if="visible" class="toast">
    {{ message }}
  </div>
</Transition>

<style>
.toast-enter-active {
  animation: slide-in-bounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.toast-leave-active {
  animation: slide-out 0.3s ease-in;
}

@keyframes slide-in-bounce {
  0% {
    transform: translateX(100%);
  }
  60% {
    transform: translateX(-10px);
  }
  100% {
    transform: translateX(0);
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

- #TBD-button-states
- #TBD-loading-states
- docs/issues/medium-priority/09-accessibility-improvements.md (reduced motion)

## References

- [Material Design Motion](https://material.io/design/motion/)
- [Framer Motion Principles](https://www.framer.com/motion/)
- [CSS Easing Functions](https://easings.net/)
- [Reduced Motion Query](https://web.dev/prefers-reduced-motion/)
