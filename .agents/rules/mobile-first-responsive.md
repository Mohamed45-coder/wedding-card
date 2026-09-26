# Workspace Rules: Mobile-First Responsive Design & Full-Screen Scene Architecture

These rules are persistent workspace rules for this project. They MUST be consulted and strictly applied before and during any code changes.

---

## 1. Mobile Responsiveness — CRITICAL

The website must be fully responsive across all modern mobile devices and not tailored or hardcoded for any single device (e.g., a specific iPhone model).

* **Target Viewport Range:** The design must render cleanly across approximately 320px–480px CSS viewport widths and various mobile viewport heights (short and tall screens).
* **Primary Testing Widths:**
  * 320px
  * 360px
  * 375px
  * 390px
  * 393px
  * 402px
  * 414px
  * 420px
  * 430px
  * 440px
  * 480px
* **Fluid Techniques:**
  * Use relative and fluid units: `%`, `vw`, `vh`, `dvh`, `rem`, `clamp()`, `min()`, `max()`.
  * Use flexible layouts: modern Flexbox and CSS Grid.
  * Avoid unnecessary fixed pixel dimensions (e.g., fixed heights, rigid pixel widths) and device-specific hacks.
  * Do not use hardcoded positioning that only works at one screen size.

---

## 2. Full-Screen Section Behavior — HIGHEST PRIORITY

Every major page section is intended to behave as a complete, dedicated "scene" or full screen on mobile.

* Sizing relative to the viewport:
  ```css
  .section {
      min-height: 100dvh;
      width: 100%;
      box-sizing: border-box;
  }
  ```
* **Dynamic Viewport Unit:** Use `100dvh` instead of `100vh` for mobile full-screen sections to properly handle dynamic mobile browser chrome (address bars, navigation bars).
* **No Cutoffs or Overlaps:**
  * Section 1 must not end halfway down the viewport.
  * When scrolling from Section 1 to Section 2, Section 2 must cleanly occupy the viewport.
  * No important content from the current section should be pushed outside the viewport unintentionally.
* **Layout Adaptation:** If a section contains substantial content that genuinely cannot fit within a single viewport on smaller screens (e.g., 320px width or short heights), adapt and restructure the internal layout responsively rather than forcing clipping or hiding content.

---

## 3. No Section Sneak Peek

Prevent accidental visibility of adjacent sections when viewing a screen.

* **Forbidden:**
  ```text
  ┌──────────────────────┐
  │                      │
  │     SECTION 1        │
  │                      │
  ├──────────────────────┤
  │  TOP OF SECTION 2    │ ← NOT ALLOWED
  └──────────────────────┘
  ```
* **Required:**
  ```text
  ┌──────────────────────┐
  │                      │
  │     SECTION 1        │
  │                      │
  │                      │
  └──────────────────────┘
  ```
* **No Fake Fixes:** Do NOT introduce aggressive `overflow: hidden`, clipping, or arbitrary fixed heights simply to disguise sizing problems. The section must genuinely fit the viewport via responsive layout and proportional internal spacing.

---

## 4. Mobile Safe Areas

The design must seamlessly account for modern device notches, Dynamic Islands, status bars, and home indicators.

* **Safe Area Environment Variables:**
  ```css
  padding-top: max(16px, env(safe-area-inset-top));
  padding-bottom: max(16px, env(safe-area-inset-bottom));
  padding-left: max(16px, env(safe-area-inset-left));
  padding-right: max(16px, env(safe-area-inset-right));
  ```
* Ensure interactive controls (buttons, links, form inputs) and text never collide with or get obscured by device physical hardware boundaries or system UI gestures.

---

## 5. No Horizontal Scrolling

The website must never create unintended horizontal scrollbars or side-to-side viewport wiggle.

* Avoid `width: 100vw` which often includes the scrollbar width and causes horizontal overflow; prefer `width: 100%`.
* Ensure containers, animations, decorations, floating particles, and images are constrained to the viewport boundary (`box-sizing: border-box`, `max-width: 100%`).

---

## 6. Responsive Content & Typography

Content must scale and reposition gracefully across viewport changes.

* Use fluid typography where appropriate:
  ```css
  font-size: clamp(1rem, 2.5vw + 0.5rem, 1.75rem);
  ```
* Prevent text overlap, truncated labels, or button overflow.
* Balance whitespace to prevent crowded layouts on 320px screens and excessive empty gaps on 480px+ screens.

---

## 7. Desktop & Tablet Responsiveness

While mobile is the highest priority, the site must remain visually pleasing and functional on tablets, laptops, and desktop monitors.

* Avoid raw stretched mobile layouts on large screens.
* Apply appropriate `max-width` containers, centered columns, and expanded multi-column grid/flex layouts on larger viewports via media queries.

---

## 8. Design Preservation

* **Preserve Visual Identity:** Maintain the existing visual theme, aesthetic choices, colors, fonts, shadows, transitions, and animations unless a redesign is explicitly requested.
* **Preserve Interactions:** Do not break existing interactive mechanisms (e.g., door opening, envelope animations, countdown timers, RSVP flows, music toggles).
* **Targeted Scope:** Do not touch or modify unrelated sections when resolving an issue in a specific component.

---

## 9. Minimal Changes & Safety

1. **Inspect & Understand:** Always inspect existing HTML/CSS/JS and understand component logic before editing.
2. **Smallest Viable Diff:** Make precise, targeted edits rather than rewriting large sections of files.
3. **No Unnecessary Dependencies:** Rely on standard vanilla HTML/CSS/JS. Do not add external frameworks, libraries, or npm packages unless specifically requested.
4. **JS Safety:** Do not modify JavaScript event listeners or animation logic unless strictly needed for the requested task.

---

## 10. CSS Maintainability & Quality

* Keep CSS structured, semantic, and easy to maintain.
* Avoid redundant or conflicting media queries.
* Avoid magic numbers, excessive `!important`, or fragile absolute positioning for layout flow.
* Use clean CSS custom properties (variables) for consistent colors, spacing, and sizing tokens.

---

## 11. Images & Media

* Images must scale responsively without distortion:
  ```css
  max-width: 100%;
  height: auto;
  object-fit: contain; /* or cover, depending on design intent */
  ```
* Ensure decorative background illustrations or SVGs do not cause layout shifts or horizontal overflow.

---

## 12. Scroll Experience

* Treat each major section as an intentional "scene".
* Scrolling should move smoothly between complete scenes (`Section 1` → `Section 2` → `Section 3`).
* If CSS scroll snapping (`scroll-snap-type`, `scroll-snap-align`) is used, ensure section dimensions and content layouts are correctly calculated first.

---

## 13. Pre-Completion Verification Checklist

Before finalizing any change, verify against the following criteria:

- [ ] **Mobile Viewport Widths:** 320px, 360px, 375px, 390px, 393px, 402px, 414px, 420px, 430px, 440px, 480px.
- [ ] **Height Variants:** Both short (landscape/small screens) and tall aspect ratios.
- [ ] **No Horizontal Scroll:** Page does not scroll horizontally on any screen width.
- [ ] **No Sneak Peek:** No accidental visibility of the next section while reading the current section.
- [ ] **Viewport Fit:** Each major section cleanly occupies `min-height: 100dvh` without unnecessary blank spaces or abrupt cutoffs.
- [ ] **Safe Areas:** Safe area insets respected for notches and home bars.
- [ ] **Content Integrity:** Text is legible and not overlapping; buttons/forms are fully clickable and within view.
- [ ] **Preserved Logic:** Existing animations, audio, doors, and interactive scripts remain fully functional.

---

## 14. Priority Order for Decisions

1. User's explicit request
2. Functional correctness
3. Mobile responsiveness (320px–480px)
4. Full-screen section behavior (`100dvh` scene structure)
5. Existing design preservation
6. Accessibility and usability
7. Code simplicity and maintainability
8. Desktop / large-screen optimization
