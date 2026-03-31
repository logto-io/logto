type ShouldShowOssCloudSidebarCardOptions = {
  readonly isCloud: boolean;
  readonly isDevFeaturesEnabled: boolean;
  readonly isUserPreferencesLoaded: boolean;
  readonly isDismissed: boolean;
};

export const shouldShowOssCloudSidebarCard = ({
  isCloud,
  isDevFeaturesEnabled,
  isUserPreferencesLoaded,
  isDismissed,
}: ShouldShowOssCloudSidebarCardOptions): boolean =>
  !isCloud && isDevFeaturesEnabled && isUserPreferencesLoaded && !isDismissed;
