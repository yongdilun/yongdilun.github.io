# UI/UX Implementation Plan

This plan upgrades the existing portfolio using `DESIGN-vercel.md` as the visual base while preserving all current portfolio content and wording. The implementation should improve polish, structure, accessibility, responsiveness, and project readability without changing the meaning, copy, project order, links, images, or contact information.

Known repository state at plan creation: `style.css` has uncommitted changes. Before implementing, inspect and preserve the current diff. Do not reset, discard, or overwrite unrelated work.

## Non-Negotiable Constraints

- Do not edit visible wording in `index.html`.
- Do not change project descriptions, headings, button labels, contact details, URLs, image filenames, video filename, or project order.
- Do not change `DESIGN-vercel.md`; use it as the design reference.
- Keep IDs used by navigation and carousel logic stable: `hero`, `about`, `projects`, `contact`, `carousel-*`, and `dots-carousel-*`.
- If `moveCarousel`, `goToSlide`, or `initCarousel` are refactored, keep `moveCarousel` globally callable because inline `onclick` handlers currently use it.
- Prefer CSS-only improvements first. Touch `index.html` only for structural/accessibility attributes or wrappers that do not alter copy.
- Avoid decorative visual noise. The Vercel direction should come from white space, sharp typography, precise rhythm, shadow-as-border, restrained interaction, and excellent screenshots.
- Preserve readability over copying extreme visual treatments literally. Do not introduce new compressed letter spacing on body or UI text.
- Every implementation phase must end with Playwright verification and a tracker update in this file.

## Design Direction

Use the Vercel-inspired system from `DESIGN-vercel.md`, adapted for a personal software portfolio:

- White canvas, near-black text, quiet gray hierarchy.
- Geist as the primary type system.
- Shadow-as-border for cards, media frames, buttons, and disclosure panels.
- Tight but readable section rhythm with generous white space.
- Functional blue accent for links, focus, active nav, and availability/status affordances.
- Project screenshots as the primary visual proof, not decorative illustrations.
- Advanced layout behavior through responsive grids, sticky media where appropriate, strong focus states, and measured microinteractions.

## Files And Ownership

Primary implementation files:

- `style.css`: Main design system, layout, responsive styling, states, motion, media treatment.
- `script.js`: Navigation active state, mobile nav behavior, carousel accessibility, reduced-motion-safe interactions.
- `index.html`: Only add non-copy structural attributes/classes where needed.

Do not modify:

- Image and video assets.
- Project text, headings, summaries, button labels, links, or contact values.
- `DESIGN-vercel.md`.

Optional QA-only files if a persistent Playwright suite is desired:

- `tests/portfolio-ui.spec.js`
- `playwright.config.js`
- `.gitignore` entry for `test-results/` and `playwright-report/`

If avoiding new project files, run the same checks through Playwright MCP/browser tooling during each phase.

## Playwright Baseline Protocol

Run this before Phase 1 and repeat after every phase.

1. Start the static site:

```powershell
python -m http.server 4173
```

2. Open the site:

```text
http://127.0.0.1:4173/
```

3. Test these viewports every time:

```text
390x844    mobile
768x1024   tablet
1280x800   laptop
1440x1000  desktop
```

4. Capture screenshots for each phase:

```text
qa/phase-XX/mobile-home.png
qa/phase-XX/mobile-projects.png
qa/phase-XX/tablet-home.png
qa/phase-XX/laptop-projects.png
qa/phase-XX/desktop-fullpage.png
```

5. Run this page-health check in Playwright after each phase:

```js
await page.evaluate(() => {
  const overflow = document.documentElement.scrollWidth - window.innerWidth;
  const images = [...document.images].map((img) => ({
    src: img.getAttribute("src"),
    complete: img.complete,
    naturalWidth: img.naturalWidth,
    naturalHeight: img.naturalHeight
  }));
  const emptyLinks = [...document.querySelectorAll("a")].filter((a) => !a.textContent.trim() && !a.getAttribute("aria-label"));
  const buttonsMissingLabels = [...document.querySelectorAll("button")].filter((button) => !button.textContent.trim() && !button.getAttribute("aria-label"));
  const projectCount = document.querySelectorAll(".project-card").length;
  const focusableCount = document.querySelectorAll("a, button, summary, video, [tabindex]:not([tabindex='-1'])").length;

  return {
    overflow,
    projectCount,
    focusableCount,
    brokenImages: images.filter((img) => !img.complete || img.naturalWidth === 0),
    emptyLinks: emptyLinks.length,
    buttonsMissingLabels: buttonsMissingLabels.length
  };
});
```

Required pass conditions:

- `overflow <= 1`
- `projectCount === 6`
- `brokenImages.length === 0`
- `emptyLinks === 0`
- `buttonsMissingLabels === 0`
- No console errors.
- No visible text overlap in screenshots.
- Hero shows a hint of the next section on both desktop and mobile.
- Navigation, project carousels, disclosures, links, and video controls remain usable by keyboard.

6. Preserve wording using a text snapshot:

```js
const normalize = (value) => value.replace(/\s+/g, " ").trim();
const bodyText = normalize(await page.locator("body").innerText());
```

Save the baseline before Phase 1. After every phase, compare the normalized body text against the baseline. If it changes, inspect the difference and revert any accidental copy change unless the only difference is an approved accessibility-only hidden control.

## Phase Tracker

| Phase | Scope | Status | Playwright Evidence | Notes |
| --- | --- | --- | --- | --- |
| 0 | Baseline audit and QA setup | [x] Complete | [x] Baseline screenshots and body text captured | Baseline had broken external Geist font URLs and missing favicon console noise. |
| 1 | Design tokens and CSS architecture | [x] Complete | [x] Final matrix passed | Added centralized tokens, stable container sizing, shadow-as-border aliases, focus states, and cache-busted assets. |
| 2 | Navigation and global information architecture | [x] Complete | [x] Mobile and desktop nav verified | Added icon-only mobile toggle, active section state, keyboard close, solid fixed nav, and no wording changes. |
| 3 | Hero redesign | [x] Complete | [x] Mobile and desktop hero screenshots saved | First viewport now has stronger hierarchy and visible next-section content on tested mobile/tablet/laptop/desktop sizes. |
| 4 | About and skills refinement | [x] Complete | [x] Responsive matrix passed | Improved reading width, metadata chips, skill card rhythm, and mobile stacking. |
| 5 | Project system redesign | [x] Complete | [x] All six project cards and carousels exercised | Reworked project cards, screenshots, disclosures, tech stacks, carousel dots, and keyboard arrow support. |
| 6 | Contact and footer refinement | [x] Complete | [x] Responsive matrix passed | Contact cards and footer now use stable responsive layouts and visible focus states. |
| 7 | Motion, accessibility, and performance pass | [x] Complete | [x] Nav motion, reveal, reduced-motion, console, and health checks passed | Added smooth hash scrolling and JS-gated scroll reveal; reduced-motion keeps content instant and fully visible. |
| 8 | Final cross-device QA and documentation | [x] Complete | [x] Screenshots saved in `qa/phase-final/` | Final checks: 0 console errors, 0 broken images after carousel exercise, 0 missing labels, 6 project cards, no horizontal overflow. |

## Phase 0: Baseline Audit And QA Setup

Goal: establish a safe starting point so future implementation can prove that layout improved without changing content.

Implementation tasks:

- Run `git status --short` and inspect the current `style.css` diff before editing.
- Start the local server with `python -m http.server 4173`.
- Open the site in Playwright at `http://127.0.0.1:4173/`.
- Capture screenshots for all target viewports.
- Save normalized `body.innerText` as the copy baseline.
- Record current console messages.
- Record current page-health metrics using the Playwright snippet above.
- Check the current behavior of:
  - Fixed nav.
  - Hidden mobile nav links.
  - Hero visual.
  - About grid.
  - All six project cards.
  - Each carousel next/previous button.
  - Each details disclosure.
  - Contact links.

Design findings to verify during audit:

- Mobile nav currently hides links without an alternate visible menu.
- `#hero` uses `100vh`; implementation should move to `100dvh` or a safer responsive equivalent.
- Project descriptions and tech stacks are visually clamped; this can hide important portfolio evidence.
- Carousel buttons depend on hover visibility, which is weak on touch devices.
- Current card system is directionally Vercel-like but can be made more deliberate with stricter spacing, aspect ratios, and shadow roles.

Playwright evaluation:

- Screenshot baseline at all viewports.
- Confirm project count is 6.
- Confirm all images load.
- Confirm there is no horizontal overflow.
- Confirm current body text baseline is saved.

Tracker update:

- Mark Phase 0 complete only after screenshots and text baseline exist.

## Phase 1: Design Tokens And CSS Architecture

Goal: make the CSS easier to implement safely by centralizing design decisions before changing major sections.

Implementation tasks in `style.css`:

- Expand `:root` tokens without removing existing variables until all references are checked.
- Add container tokens:
  - `--container-max: 1200px`
  - `--container-wide: 1320px`
  - `--page-pad: clamp(16px, 4vw, 48px)`
- Add z-index scale:
  - `--z-base: 0`
  - `--z-sticky: 20`
  - `--z-nav: 40`
  - `--z-popover: 60`
- Add motion tokens:
  - `--duration-fast: 150ms`
  - `--duration-medium: 200ms`
  - `--ease-standard: ease-out`
- Add surface tokens:
  - `--surface: #ffffff`
  - `--surface-subtle: #fafafa`
  - `--line: rgba(0,0,0,0.08)`
- Add text tokens:
  - `--text-primary: #171717`
  - `--text-secondary: #4d4d4d`
  - `--text-tertiary: #666666`
- Add reusable shadow aliases while preserving the Vercel shadow-as-border approach.
- Add `text-wrap: balance` to headings where supported.
- Add `text-wrap: pretty` to paragraphs and long card copy where supported.
- Ensure body/UI text uses readable tracking. Do not add new negative tracking. If existing negative tracking hurts readability in screenshots, reduce it rather than increasing it.
- Update `img` base rule to include `height: auto`.
- Add consistent `scroll-margin-top` for anchored sections.
- Replace `100vh` usage with `100dvh` or responsive `min-height` formulas.
- Avoid new gradients, glow effects, or decorative background objects.

Implementation safety:

- Keep existing variable names during the first pass to avoid breaking selectors.
- Do not rewrite section CSS wholesale. Add tokens first, then migrate section by section in later phases.
- Do not edit HTML copy.

Playwright evaluation:

- Compare screenshots against Phase 0; there should be minimal visual change.
- Run page-health check.
- Confirm no console errors.
- Confirm body text is unchanged.
- Confirm no horizontal overflow at every viewport.

Tracker update:

- Mark Phase 1 complete after token migration is stable and screenshots show no regressions.

## Phase 2: Navigation And Global Information Architecture

Goal: make the nav feel precise and product-grade while preserving the existing link labels.

Implementation tasks in `index.html`:

- Add `id="primary-navigation"` to the existing `.nav-links` list.
- Add a mobile icon button inside `.nav-inner` after `.nav-links`:
  - Class: `.nav-toggle`
  - `type="button"`
  - `aria-label="Open navigation"`
  - `aria-controls="primary-navigation"`
  - `aria-expanded="false"`
  - Use icon spans or CSS pseudo-elements, not visible new words.
- Do not change the text of existing nav links.

Implementation tasks in `style.css`:

- Use `--z-nav` for `#navbar`.
- Add safe-area-aware padding for fixed nav:
  - `padding-top: env(safe-area-inset-top)`
- Make nav container use `--container-max` and `--page-pad`.
- Refine nav hover, active, and focus states using shadow-as-border.
- Add `.nav-links a.is-active` style.
- Add mobile menu styling:
  - At mobile widths, show `.nav-toggle`.
  - Hide/collapse `.nav-links` behind the toggle.
  - Use a simple vertical white panel with shadow-as-border.
  - Keep touch targets at least 44px tall.
- Keep interaction transitions at or below 200ms.

Implementation tasks in `script.js`:

- Add IntersectionObserver nav active-state logic for `hero`, `about`, `projects`, and `contact`.
- Add mobile nav open/close behavior.
- Close mobile nav when a nav link is clicked.
- Close mobile nav on `Escape`.
- Keep focus visible.
- Respect reduced motion; do not add scrolling animations beyond native anchor behavior.

Playwright evaluation:

- Desktop: nav links visible, hover/focus states visible, active link updates while scrolling.
- Mobile: toggle appears, opens nav, closes nav, and updates `aria-expanded`.
- Keyboard: `Tab` reaches logo, nav links/toggle, project controls, and contact links in logical order.
- Run page-health check.
- Confirm body text is unchanged.
- Confirm screenshots have no nav overlap or horizontal overflow.

Tracker update:

- Mark Phase 2 complete after mobile and desktop nav pass.

## Phase 3: Hero Redesign

Goal: create a sharper first impression that feels advanced, personal, and Vercel-inspired without reducing readability.

Implementation tasks in `style.css`:

- Rework `#hero` into a responsive first-screen composition:
  - Desktop: text column plus visual proof area.
  - Tablet/mobile: single column with avatar/proof chips placed after the hero text.
  - Use `min-height: calc(100dvh - var(--nav-height))` with enough bottom spacing to reveal a hint of `#about`.
- Use `--container-max` and `--page-pad`.
- Keep the hero content order unchanged.
- Refine `.hero-name`, `.hero-tagline`, and `.hero-sub` for hierarchy:
  - Strong H1 scale on desktop.
  - No text overlap on mobile.
  - Readable line lengths.
  - Avoid viewport-width font scaling.
- Convert `.hero-visual` from a heavy card into a more intentional proof stage:
  - Keep the profile image.
  - Keep the existing proof chip text.
  - Use shadow-as-border and subtle geometry, not decorative blobs.
  - Avoid nested-card clutter.
- Improve `.avatar-ring`:
  - Stable size with `clamp`.
  - Crisp ring shadow.
  - No layout shift.
- Improve `.floating-card`:
  - Treat them as proof chips.
  - Use consistent size, spacing, and focus/hover behavior.
  - Keep text unchanged.
- Update `.hero-cta` spacing and wrapping so both buttons remain polished at 320px to 1440px.
- Make `.scroll-indicator` nonintrusive and ensure it never overlaps the hero CTA or next section.

Implementation tasks in `script.js`:

- Preserve the typed text value exactly as it currently appears.
- Do not add a typing animation unless explicitly requested later. Static text is clearer and avoids unnecessary motion.

Playwright evaluation:

- Desktop screenshot: hero has clear hierarchy, avatar/proof area is visible, and next section is hinted below the fold.
- Mobile screenshot: no clipped H1, no CTA wrapping defects, and avatar/proof chips do not crowd the intro.
- Run page-health check.
- Confirm body text is unchanged.
- Confirm `#projects` CTA and `#contact` CTA anchors still work.

Tracker update:

- Mark Phase 3 complete after desktop and mobile hero screenshots pass.

## Phase 4: About And Skills Refinement

Goal: make the About section feel like a readable professional profile with a fast-scanning technical matrix.

Implementation tasks in `style.css`:

- Rework `#about` spacing so it no longer depends on full viewport height.
- Keep `.about-grid` as the primary structure, but improve proportions:
  - Desktop: readable profile copy on the left, skills matrix on the right.
  - Tablet/mobile: profile first, skills second.
- Improve `.about-text`:
  - Set a comfortable max line length.
  - Use consistent paragraph spacing.
  - Apply `text-wrap: pretty`.
- Improve `.about-details`:
  - Convert the list into a compact contact rail or grouped metadata block.
  - Keep visible text unchanged.
  - Preserve link behavior for email and GitHub.
- Improve `.skills-grid`:
  - Use stable grid tracks.
  - Avoid cards resizing unpredictably due to long skill strings.
  - Keep skill card titles and skill text unchanged.
  - Keep skill cards visually related but not overly decorative.
- Make `.skill-card` states subtle:
  - Shadow-as-border by default.
  - Slight lift on hover/focus within 150ms to 200ms.
  - No layout shift.

Playwright evaluation:

- Desktop: paragraphs are readable and skills align cleanly.
- Tablet/mobile: About copy appears before skills, no card overflow, no clipped skill strings.
- Keyboard: email and GitHub links receive visible focus.
- Run page-health check.
- Confirm body text is unchanged.

Tracker update:

- Mark Phase 4 complete after about/skills screenshots pass.

## Phase 5: Project System Redesign

Goal: make the project section the strongest part of the portfolio by improving screenshot presentation, scanning, disclosure behavior, and carousel usability.

Implementation tasks in `style.css`:

- Treat `.projects-list` as a portfolio case-study stack:
  - Increase rhythm between project cards.
  - Use consistent section alignment with `--container-max` or `--container-wide`.
- Rework `.project-card`:
  - Desktop: two-column layout with media and content balanced.
  - Large screens: allow stronger screenshot presence.
  - Mobile/tablet: single column with media first, content second.
  - Use shadow-as-border and restrained depth.
  - Avoid card-in-card visual clutter.
- Feature the first project without changing content:
  - Use `#proj-emas` or `.project-card:first-child` for slightly stronger media scale.
  - Do not add new text.
- Improve `.project-images` and `.image-carousel`:
  - Use a stable `aspect-ratio` instead of fixed image height where possible.
  - Keep screenshots fully inspectable with `object-fit: contain`.
  - Use a quiet surface behind screenshots.
  - Ensure mobile screenshot trio remains readable.
- Improve carousel controls:
  - Make buttons visible on touch devices.
  - Increase hit area to at least 40px.
  - Keep existing previous/next labels through `aria-label`.
  - Keep dot controls accessible and visible.
- Improve `.project-number`:
  - Keep it decorative and nonblocking.
  - Ensure it never covers important screenshot details or controls.
- Improve `.project-info` hierarchy:
  - Clear meta row.
  - Strong title.
  - Subtitle readable.
  - Description readable without accidental truncation.
- Remove or revise hidden content patterns:
  - Avoid `-webkit-line-clamp` on `.project-desc` unless there is a visible, accessible expansion control.
  - Avoid `max-height` hiding tech stack chips unless there is a clear interaction to reveal them.
  - Preferred: show all project descriptions and tech chips, then use layout/spacing to maintain rhythm.
- Improve `.project-highlights` and `.project-demo`:
  - Keep disclosure summaries unchanged.
  - Use focus-visible styling.
  - Make open state clear.
  - Ensure expanded content does not overlap carousel or links.
- Improve `.tech-stack`:
  - Use consistent pill sizing.
  - Keep all tags readable.
  - Ensure long tags wrap gracefully.
- Improve `.project-links`:
  - Keep labels unchanged.
  - Align buttons cleanly across projects.
  - Maintain focus and hover states.

Implementation tasks in `script.js`:

- Keep carousel initialization stable.
- Add keyboard support:
  - Left arrow on focused carousel goes to previous slide.
  - Right arrow on focused carousel goes to next slide.
  - Home goes to first slide.
  - End goes to last slide.
- Add `aria-current="true"` or equivalent state to the active dot.
- Keep dots synced after every slide movement.
- Ensure carousels work after details panels open/close.

Playwright evaluation:

- For each of 6 project cards:
  - Scroll card into view.
  - Screenshot desktop and mobile.
  - Click next and previous carousel controls where present.
  - Click every dot once on at least one carousel.
  - Open and close `Key Highlights`.
  - For eMAS, open and close `Watch Quick Demo`.
- Keyboard:
  - Focus carousel controls and move slides with keyboard.
  - Focus summary elements and toggle with Enter/Space.
- Run page-health check.
- Confirm all images still load.
- Confirm body text is unchanged.
- Confirm no project card causes horizontal overflow.

Tracker update:

- Mark Phase 5 complete only after all six project cards pass.

## Phase 6: Contact And Footer Refinement

Goal: make the final section feel clear, calm, and action-oriented without changing contact copy.

Implementation tasks in `style.css`:

- Refine `#contact` spacing:
  - Avoid unnecessary full-height emptiness on small screens.
  - Keep it centered and calm on desktop.
- Improve `.contact-grid`:
  - Desktop: four stable columns.
  - Tablet: two columns.
  - Mobile: one column.
  - Ensure each card has consistent height and readable value wrapping.
- Improve `.contact-card`:
  - Preserve visible labels and values.
  - Use shadow-as-border.
  - Add clear focus-visible state.
  - Avoid excessive hover lift.
- Improve footer:
  - Keep text unchanged.
  - Ensure footer links have visible focus.
  - Keep spacing compact and aligned.

Playwright evaluation:

- Click email, phone, and GitHub contact cards enough to confirm correct `href` values without leaving the page permanently.
- Check mobile wrapping for email and GitHub values.
- Run page-health check.
- Confirm body text is unchanged.
- Confirm footer is visible and not cramped at mobile width.

Tracker update:

- Mark Phase 6 complete after contact/footer pass.

## Phase 7: Motion, Accessibility, And Performance Pass

Goal: refine the whole experience so it feels advanced without becoming distracting or fragile.

Implementation tasks in `style.css`:

- Keep all hover/focus transitions at or below 200ms.
- Use only compositor-safe motion:
  - `transform`
  - `opacity`
- Do not animate layout properties like width, height, margin, padding, top, or left.
- Keep `@media (prefers-reduced-motion: reduce)` and verify it neutralizes nonessential motion.
- Review `.fade-in`:
  - If retained, shorten duration and ensure no content stays hidden if JavaScript fails.
  - If removed, ensure static layout still feels complete.
- Avoid large animated blur or backdrop-filter surfaces.
- Ensure all interactive elements have visible `:focus-visible`.
- Ensure touch targets are at least 40px, ideally 44px, on mobile.
- Use `content-visibility: auto` only if it does not break anchor scrolling or Playwright screenshots.
- Add `contain-intrinsic-size` only after visual testing.

Implementation tasks in `index.html`:

- Add `decoding="async"` to noncritical images if desired.
- Consider `fetchpriority="high"` only for the profile image if it materially improves hero loading.
- Add width/height attributes only if measured from actual assets and verified visually.
- Do not edit alt text unless an accessibility defect is approved.

Implementation tasks in `script.js`:

- Guard all DOM queries so missing elements do not create console errors.
- Avoid scroll handlers that mutate style on every frame unless throttled or replaced with CSS.
- Keep nav active observer and carousel observers lightweight.

Playwright evaluation:

- Emulate reduced motion and confirm no essential content disappears.
- Keyboard tab through the page from top to bottom.
- Confirm focus is visible on:
  - Nav logo.
  - Nav links.
  - Mobile nav toggle.
  - Hero CTAs.
  - Carousel buttons and dots.
  - Details summaries.
  - Project links.
  - Contact cards.
  - Footer link.
- Run page-health check.
- Confirm body text is unchanged.
- Confirm no console errors.

Tracker update:

- Mark Phase 7 complete after accessibility and motion checks pass.

## Phase 8: Final Cross-Device QA And Documentation

Goal: finish with evidence that the redesign is stable, readable, and implementation-safe.

Final Playwright checklist:

- Desktop full-page screenshot at 1440x1000.
- Laptop full-page screenshot at 1280x800.
- Tablet full-page screenshot at 768x1024.
- Mobile full-page screenshot at 390x844.
- Hero section screenshot at each viewport.
- Projects section screenshot at each viewport.
- At least one screenshot with:
  - A project carousel moved away from slide 1.
  - A `Key Highlights` disclosure open.
  - eMAS demo disclosure open.
  - Mobile nav open.
- Console has no errors.
- Horizontal overflow is absent.
- Body text matches baseline.
- All images load.
- Six project cards remain present.
- Anchor navigation works.
- Keyboard navigation works.

Final manual review:

- No content wording changed.
- No project order changed.
- No URLs changed.
- No image filenames changed.
- No decorative gradients, blobs, or glow-heavy effects were introduced.
- Vercel-inspired traits are visible:
  - White canvas.
  - Geist typography.
  - Shadow-as-border.
  - Tight neutral palette.
  - Functional blue accent.
  - Strong screenshot presentation.
  - Calm, precise motion.
- Readability remains strong:
  - Body copy has comfortable line length.
  - Project descriptions and tech stacks are not accidentally hidden.
  - Mobile text does not overflow or collide.

Final implementation note:

- Update this tracker with the final status of each phase.
- Include the Playwright screenshot folder path and any remaining known issues.
- If any content baseline difference remains, document the exact reason and get approval before shipping.

## Implementation Order Summary

1. Baseline and Playwright evidence.
2. CSS tokens and global primitives.
3. Navigation and mobile menu.
4. Hero layout.
5. About and skills.
6. Projects and carousel behavior.
7. Contact and footer.
8. Motion, accessibility, performance.
9. Final QA and tracker completion.

## Definition Of Done

The redesign is complete only when:

- The visual system is more advanced and cohesive than the current implementation.
- The portfolio content and wording are unchanged.
- All phases have Playwright evidence.
- The tracker is updated.
- No horizontal overflow exists at required viewports.
- All six project cards and all assets still render.
- Keyboard and touch interactions are usable.
- The site remains readable, calm, and portfolio-focused.
