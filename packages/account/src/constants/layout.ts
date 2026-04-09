/**
 * Stable (non-hashed) class names for key account center elements,
 * so that custom CSS injected via `customCss` can target them easily.
 *
 * Mirrors the pattern used by the sign-in experience package
 * (`packages/experience/src/utils/consts.ts` → `layoutClassNames`).
 */
export const layoutClassNames = Object.freeze({
  /** Root `<div>` wrapping the entire account center app. */
  app: 'logto_ac-app',
  /** Full-page layout wrapper (used on the Security / Home page). */
  pageContainer: 'logto_ac-page-container',
  /** `<main>` that holds the primary content area. */
  mainContent: 'logto_ac-main-content',
  /** Card-style container used on sub-pages (email, phone, password…). */
  cardContainer: 'logto_ac-card-container',
  /** Card-style `<main>` inside the card container. */
  cardMain: 'logto_ac-card-main',
  /** Logto signature / branding footer. */
  signature: 'logto_ac-signature',
  /** Top-level page header (logo + app name bar). */
  pageHeader: 'logto_ac-page-header',
  /** Page title text (on Security / Home page). */
  pageTitle: 'logto_ac-page-title',
  /** Page description text (on Security / Home page). */
  pageDescription: 'logto_ac-page-description',
  /** Scrollable content area on the Security / Home page. */
  pageContent: 'logto_ac-page-content',
  /** Each logical section (username, email/phone, password, MFA, social, delete). */
  section: 'logto_ac-section',
  /** Section heading text. */
  sectionTitle: 'logto_ac-section-title',
  /** Card that groups rows inside a section. */
  card: 'logto_ac-card',
  /** A single row inside a card. */
  row: 'logto_ac-row',
  /** Wrapper for the secondary (sub-page) layout. */
  secondaryPageWrapper: 'logto_ac-secondary-page-wrapper',
  /** Secondary page title. */
  secondaryPageTitle: 'logto_ac-secondary-page-title',
  /** Secondary page description. */
  secondaryPageDescription: 'logto_ac-secondary-page-description',
});
