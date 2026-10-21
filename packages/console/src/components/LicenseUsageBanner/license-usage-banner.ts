import { type AdminConsoleKey } from '@logto/phrases';
import { LicenseUsageMetric } from '@logto/schemas';
import { conditional, type Nullable, type Optional } from '@silverhand/essentials';

type ShouldShowLicenseUsageBannerOptions = {
  readonly isCloud: boolean;
  readonly hasUsageWarnings: boolean;
  readonly dismissedUntil?: number;
  readonly now: number;
};

/** How long dismissing the usage banner hides it. */
export const licenseUsageBannerDismissDuration = 7 * 24 * 60 * 60 * 1000;

/** The metric names a usage warning can carry; an unknown metric shows its raw key. */
export const usageMetricPhraseKeys: Partial<Record<string, AdminConsoleKey>> = Object.freeze({
  [LicenseUsageMetric.Mau]: 'tenants.license.usage_metric_mau',
  [LicenseUsageMetric.MonthlyAccessTokens]: 'tenants.license.usage_metric_access_tokens',
  [LicenseUsageMetric.ProductionDeployments]: 'tenants.license.usage_metric_production_deployments',
} as const);

/** Read the local expiry of a dismissal; anything unparsable is treated as not dismissed. */
export const parseLicenseUsageBannerDismissedUntil = (
  value?: Nullable<string>
): Optional<number> => {
  const parsed = Number(value);

  return conditional(Number.isFinite(parsed) && parsed);
};

/** Whether the usage banner belongs at the top of Console: only when a metric is over its limit. */
export const shouldShowLicenseUsageBanner = ({
  isCloud,
  hasUsageWarnings,
  dismissedUntil,
  now,
}: ShouldShowLicenseUsageBannerOptions): boolean =>
  !isCloud && hasUsageWarnings && (dismissedUntil === undefined || dismissedUntil <= now);
