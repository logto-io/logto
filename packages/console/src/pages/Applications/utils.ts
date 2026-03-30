import { ossSamlApplicationsLimit } from '@/consts/application-limits';

type ShouldShowSamlAppLimitNoticeOptions = {
  readonly isCloud: boolean;
  readonly isDevFeaturesEnabled: boolean;
  readonly isThirdPartyTab: boolean;
  readonly samlAppTotalCount?: number;
};

export const shouldShowSamlAppLimitNotice = ({
  isCloud,
  isDevFeaturesEnabled,
  isThirdPartyTab,
  samlAppTotalCount,
}: ShouldShowSamlAppLimitNoticeOptions) =>
  !isCloud &&
  isDevFeaturesEnabled &&
  !isThirdPartyTab &&
  typeof samlAppTotalCount === 'number' &&
  samlAppTotalCount >= ossSamlApplicationsLimit;
