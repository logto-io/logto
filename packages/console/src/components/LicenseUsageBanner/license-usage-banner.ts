import { conditional, type Nullable, type Optional } from '@silverhand/essentials';

type ShouldShowLicenseUsageBannerOptions = {
  readonly isCloud: boolean;
  /** Whether the current page shows the same warning in more detail. */
  readonly isLicensePage: boolean;
  readonly hasUsageWarnings: boolean;
  readonly dismissedUntil?: number;
  readonly now: number;
};

/** How long dismissing the usage banner hides it. */
export const licenseUsageBannerDismissDuration = 7 * 24 * 60 * 60 * 1000;

/** Read the local expiry of a dismissal; anything unparsable is treated as not dismissed. */
export const parseLicenseUsageBannerDismissedUntil = (
  value?: Nullable<string>
): Optional<number> => {
  const parsed = Number(value);

  return conditional(Number.isFinite(parsed) && parsed);
};

/**
 * Whether the usage banner belongs at the top of Console. The License page shows the same warning
 * and its details, so the banner stays out of the way there.
 */
export const shouldShowLicenseUsageBanner = ({
  isCloud,
  isLicensePage,
  hasUsageWarnings,
  dismissedUntil,
  now,
}: ShouldShowLicenseUsageBannerOptions): boolean =>
  !isCloud &&
  !isLicensePage &&
  hasUsageWarnings &&
  (dismissedUntil === undefined || dismissedUntil <= now);
