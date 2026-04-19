# Motion System

## Principles

- Every animation must guide attention, confirm an action, or provide feedback.
- If removed, the UI should feel broken — not lighter.

## Timing

- Micro-interactions: 150ms (`micro`)
- Transitions: 250ms (`spring`)
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)`

## Rules

- All animations use `motion.*` components from Framer Motion.
- No CSS animations, no Tailwind animation utilities.
- All timing values imported from `/lib/motion.ts`. No inline durations.
- No duplicate animation logic across files. Use `AnimatedCard` and `AnimatedPage` wrappers.
- No animation exceeds 300ms.
- Do not animate more than one property at a time unless necessary.
- Avoid delays unless part of a staggered sequence.

## Component Behaviors

| Component   | Behavior                                                              |
|-------------|-----------------------------------------------------------------------|
| Card        | fade-up entry, hover y:-2, tap scale:0.97, spring timing             |
| Button      | tap scale:0.97, micro timing                                         |
| QuizBlock   | correct: green flash, wrong: shake x:[-6,6,-4,4,0], micro timing    |
| ProgressBar | animate width smoothly, spring timing                                 |
| Page        | fade-up entry, fade-down exit, spring timing                          |
| Terminal    | blinking cursor (opacity loop), output lines staggered fade-up        |
