# Plan: Fix account center security page mobile adaptation

## Problem Brief
- **Problem:** The unreleased account center security page still uses desktop-oriented row layouts on phones, so mobile rendering looks cramped and below release quality.
- **Impact:** Phone users can still reach the page, but the security sections look broken or overcrowded, which makes the feature feel unfinished and not ready to ship.
- **Root cause / Gap:** The page shell already supports a mobile mode, but the security page section SCSS modules only define desktop-first horizontal rows and do not add `body.mobile` overrides.
- **Constraints:** Keep this to mobile adaptation only; change styles only; do not change feature behavior, information content, section visibility logic, or interaction model; do not include page header/footer polish.
- **Affected systems:** `packages/account/src/pages/Security/**`, `packages/account/src/pages/Home/index.module.scss`, and the existing account page shell in `packages/account/src/App.tsx` / `packages/account/src/App.module.scss`.
- **Scope decision:** Standard.
- **Experience Library flags:**
  - `Dev feature flag: gate new features behind isDevFeaturesEnabled` applies. The security page is already gated in `packages/account/src/App.tsx`; preserve that gate and do not couple this work to any release-visibility change.
- **Open questions:** None blocking. During execution, manually verify on common phone widths (at minimum ~320 px and ~390 px) because this repo treats “mobile” as a platform mode rather than a pure CSS breakpoint.

## What Already Exists
- `packages/account/src/App.tsx`
  - **Existing behavior:** The security route only renders when `isDevFeaturesEnabled && hasVisibleSecuritySection(...)`.
  - **Plan stance:** Reuse as-is. This plan does not touch route gating or feature visibility.
- `packages/account/src/Providers/PageContextProvider/index.tsx` and `packages/account/src/Providers/AppBoundary/AppMeta.tsx`
  - **Existing behavior:** The app derives `platform` from `react-device-detect` and writes `body.mobile` / `body.desktop` to the DOM.
  - **Plan stance:** Reuse as-is. In this codebase, “mobile” means the `body.mobile` platform class, not a new viewport-detection strategy.
- `packages/account/src/App.module.scss`
  - **Existing behavior:** The page shell already has mobile-specific spacing/layout rules for the full-page account view.
  - **Plan stance:** Reuse and leave unchanged unless a section fix proves impossible without shell support.
- `packages/account/src/pages/Security/index.tsx`
  - **Existing behavior:** The page composition already matches the intended information architecture: username, email/phone, password, social, MFA, and gated delete-account section.
  - **Plan stance:** Reuse as-is. No TSX restructuring is planned.
- `packages/account/src/pages/Home/index.module.scss`
  - **Existing behavior:** This file owns the security page header/content spacing.
  - **Plan stance:** Extend with mobile spacing tweaks only if section-level fixes still leave the page too airy or cramped.
- Section SCSS modules:
  - `packages/account/src/pages/Security/UsernameSection/index.module.scss`
  - `packages/account/src/pages/Security/EmailPhoneSection/index.module.scss`
  - `packages/account/src/pages/Security/PasswordSection/index.module.scss`
  - `packages/account/src/pages/Security/SocialSection/index.module.scss`
  - `packages/account/src/pages/Security/MfaSection/index.module.scss`
  - `packages/account/src/pages/Security/DeleteAccountSection/index.module.scss`
  - **Existing behavior:** All six files use desktop-style horizontal `.row` layouts with fixed heights, wide gaps, and nowrap action buttons.
  - **Plan stance:** Extend, not replace. Add `:global(body.mobile)` overrides in-place so the existing DOM can reflow on phones.
- `packages/account/src/layouts/SecondaryPageLayout/index.module.scss`
  - **Existing behavior:** Nearby account pages already use `:global(body.mobile)` as the project’s responsive styling convention.
  - **Plan stance:** Follow this convention instead of introducing a new responsive pattern for the security page.

### Resolved domain terms
- **“Account center security page”** in this repo is `packages/account/src/pages/Security/index.tsx`, routed at `securityRoute` from `packages/account/src/App.tsx`.
- **“Mobile”** in this repo is the `body.mobile` class written by `AppMeta`, driven by `react-device-detect` in `PageContextProvider`, not a separate viewport-only abstraction.

### Complexity smell check
This plan stays below the smell threshold: it should touch 6-7 existing SCSS modules, plus at most one page-level SCSS file, and should not introduce any new modules or classes.

## Approach
Implement CSS-only mobile overrides inside the existing security page SCSS modules so each section can stack vertically, wrap long values, and keep action buttons reachable on phone screens. Keep all page logic, section order, route gating, and dialog flows unchanged. If any section cannot be fixed cleanly with CSS alone, stop and revisit scope instead of silently adding TSX or interaction changes.

## NOT in Scope
- Updating `PageHeader` or `PageFooter` mobile styles, because the user explicitly limited this pass to the security sections.
- Changing the security page’s section order or information architecture.
- Replacing text links with different mobile-specific controls (drawer, accordion, sticky footer actions, etc.).
- Changing how the app detects mobile vs. desktop.
- Removing the dev-feature gate or adding a changeset for release.

## Alternatives Considered
1. **Fix only the page shell (`App.module.scss` / `Home/index.module.scss`)**
   - Rejected because the visible breakage comes from each section’s local row layout, not the outer page container.
2. **Refactor section markup into dedicated mobile cards**
   - Rejected because the user explicitly limited this pass to style changes and the current DOM is sufficient for CSS reflow.
3. **Include page chrome (header/footer) in the same pass**
   - Rejected because the user explicitly narrowed scope to the sections.
4. **Switch from platform-class styling to new viewport media-query logic**
   - Rejected because that is broader than the reported bug and would change an existing project convention.

## Detailed Changes

### Change Group 1: Page-level section spacing
- File: `packages/account/src/pages/Home/index.module.scss`
  - **What:** Add a small `:global(body.mobile)` block only if needed to tune `.header` / `.content` spacing for the security page after section-level fixes are in place.
  - **Why:** The page wrapper owns the overall rhythm between the title/description and the section stack.
  - **Edge cases:** Do not accidentally affect non-security uses of the same class names; keep desktop spacing unchanged.

### Change Group 2: Username / password / delete-account single-row sections
- Files:
  - `packages/account/src/pages/Security/UsernameSection/index.module.scss`
  - `packages/account/src/pages/Security/PasswordSection/index.module.scss`
  - `packages/account/src/pages/Security/DeleteAccountSection/index.module.scss`
  - **What:** Under `:global(body.mobile)`, remove fixed row heights, reduce horizontal padding, allow `.row` to stack or wrap, let `.info` use full width, and place the action button on its own line when necessary.
  - **Why:** These sections currently assume a one-line desktop row, which is fragile once localized labels, values, and actions compete for width.
  - **Edge cases:** Empty username (`-`), long localized button labels, password status chip width, delete-account CTA remaining clearly separated from the content text.

### Change Group 3: Email / phone section with two actions
- File: `packages/account/src/pages/Security/EmailPhoneSection/index.module.scss`
  - **What:** Add mobile overrides so `.row` becomes vertical or wrapped, `.actions` can occupy a second line, and long email/phone values can wrap instead of fighting two right-aligned buttons inside a fixed-height row.
  - **Why:** This section is the highest-probability overflow point because it combines long identifiers with both `change` and `remove` actions.
  - **Edge cases:** Both email and phone present, only one identifier visible, long international phone numbers, long localized action labels, missing value showing `not_set`.

### Change Group 4: MFA section with toggle and dense rows
- File: `packages/account/src/pages/Security/MfaSection/index.module.scss`
  - **What:** Add mobile overrides for `.toggleRow`, `.row`, `.info`, `.name`, `.value`, and `.actions` so the toggle block and MFA factor rows can stack safely, status chips stay visible, and plain values like email/phone do not clip.
  - **Why:** MFA is the densest section: it can include a warning banner, a toggle, multiple factor rows, counts, and action links.
  - **Edge cases:** Toggle shown with zero configured factors, long email value in factor rows, passkey / backup-code count text, notification + card spacing, action buttons staying tappable.

### Change Group 5: Social section with connector + profile columns
- File: `packages/account/src/pages/Security/SocialSection/index.module.scss`
  - **What:** Add mobile overrides that remove the rigid `220px` connector column, let connector info and identity info stack or wrap, and move the action button to a stable mobile position without horizontal clipping.
  - **Why:** The current desktop layout depends on three horizontal regions and fixed-width connector metadata, which is the least resilient layout on a narrow phone.
  - **Edge cases:** Long social display names, long email addresses, avatar + text combination, unlinked state, multiple connectors rendered one after another.

### Change Group 6: Cross-section visual consistency
- Files: the six section SCSS files above
  - **What:** Normalize mobile row padding, section-title inset, internal gaps, and card divider behavior so the page feels intentionally designed rather than partially patched.
  - **Why:** The current desktop section styles are duplicated across multiple files, so mobile fixes must stay visually consistent across all sections.
  - **Edge cases:** Divider alignment after padding changes, maintaining the same card background/radius language across sections.

## Data Flow
```text
PageContextProvider
  └─ computes platform = mobile | web
       ↓
AppMeta
  └─ writes body.mobile or body.desktop
       ↓
App.tsx
  └─ renders Security route only when feature gate + visible-section checks pass
       ↓
Security/index.tsx
  └─ renders section components in fixed order
       ↓
Section SCSS modules
  └─ desktop base styles remain default
       ↓
body.mobile overrides
  └─ change row direction, padding, wrapping, and action placement for phones
```

## Failure Modes
- **Desktop regression from overly broad selectors**
  - What could go wrong: a mobile override leaks outside `body.mobile` and changes desktop rows.
  - What the user sees: desktop security page spacing or row alignment breaks.
  - Error handling: none needed; this is a visible styling regression.
  - Test coverage: manual desktop regression check.
- **Action buttons remain clipped or pushed below the viewport**
  - What could go wrong: long values still prevent `change` / `remove` / `manage` actions from laying out correctly.
  - What the user sees: they can read the row but cannot comfortably tap the action.
  - Error handling: none; visible UI issue.
  - Test coverage: manual mobile verification per section.
- **Social connector rows still overflow due to long identity text**
  - What could go wrong: the connector name, avatar block, or profile text keeps desktop truncation assumptions and creates horizontal scroll.
  - What the user sees: cropped text or clipped action buttons in linked social rows.
  - Error handling: none; visible UI issue.
  - Test coverage: manual mobile verification with long linked-identity content.
- **MFA toggle row compresses the switch or description text**
  - What could go wrong: the toggle block stays horizontally constrained and becomes unreadable on narrow screens.
  - What the user sees: overlapping toggle description or a misaligned switch.
  - Error handling: none; visible UI issue.
  - Test coverage: manual mobile verification with the toggle shown.
- **Section-specific mobile fixes feel inconsistent**
  - What could go wrong: each section becomes “fixed” differently, leaving mismatched paddings and rhythm.
  - What the user sees: no outright bug, but the page still feels unfinished.
  - Error handling: none; visible UI inconsistency.
  - Test coverage: manual full-page visual pass.

## Test Plan
> No new automated test is planned unless execution unexpectedly requires TSX changes. This bug is in responsive SCSS, and the repo does not currently have visual regression coverage for the account center pages.

- [ ] Manual verification on a narrow mobile viewport (~320 px) with the security page enabled: no horizontal scroll, no clipped rows, and every visible section stays within the card width.
- [ ] Manual verification on a standard phone viewport (~390 px): username, password, and delete-account rows remain readable and their action buttons remain reachable without overlap.
- [ ] Manual verification with both primary email and primary phone present: `EmailPhoneSection` shows long values plus `change` / `remove` actions without clipping or accidental wrapping into unreadable layouts.
- [ ] Manual verification with MFA enabled and multiple factors configured: the warning banner, toggle block, factor rows, counts, and action links remain readable and tappable on mobile.
- [ ] Manual verification with at least one linked social identity containing long display text and one unlinked connector: `SocialSection` has no horizontal overflow and keeps actions visible.
- [ ] Manual verification on desktop after the mobile fix: the security page still uses the current single-row desktop layout and spacing.

## Migration / Rollback
- **Backward compatible:** Yes. This is a CSS-only change for an unreleased, already gated page.
- **Migration plan:** None.
- **Rollback:** Revert the touched SCSS modules; no data migration or API rollback is required.

## PR Breakdown
- **PR 1:** Add mobile `body.mobile` overrides to the account center security page section styles, then manually verify the full page on phone-sized viewports and desktop.

## Checklist Before Execution
- [x] Step 0 scope challenge completed
- [x] Existing code and terms resolved against the repository
- [x] Complexity checked; no new modules required
- [x] All planned changes scoped to specific files
- [x] Dev-feature-gate experience note accounted for
- [x] Failure modes analyzed
- [x] Manual verification scenarios listed
- [x] No blocking open questions remain
