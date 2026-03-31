import { conditional, type Nullable, type Optional } from '@silverhand/essentials';

type ShouldShowOssCloudSidebarCardOptions = {
  readonly isCloud: boolean;
  readonly isDevFeaturesEnabled: boolean;
  readonly dismissedUntil?: number;
  readonly now: number;
};

export const ossCloudSidebarCardDismissDuration = 24 * 60 * 60 * 1000;

export const parseOssCloudSidebarCardDismissedUntil = (
  value: Nullable<string>
): Optional<number> => {
  const parsed = Number(value);

  return conditional(Number.isFinite(parsed) && parsed);
};

export const shouldShowOssCloudSidebarCard = ({
  isCloud,
  isDevFeaturesEnabled,
  dismissedUntil,
  now,
}: ShouldShowOssCloudSidebarCardOptions): boolean =>
  !isCloud && isDevFeaturesEnabled && (dismissedUntil === undefined || dismissedUntil <= now);
