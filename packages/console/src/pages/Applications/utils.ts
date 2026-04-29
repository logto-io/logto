import { ossSamlApplicationsLimit } from '@/consts/application-limits';

type ShouldShowSamlAppLimitNoticeOptions = {
  readonly isCloud: boolean;
  readonly isThirdPartyTab: boolean;
  readonly samlAppTotalCount?: number;
};

export const shouldShowSamlAppLimitNotice = ({
  isCloud,
  isThirdPartyTab,
  samlAppTotalCount,
}: ShouldShowSamlAppLimitNoticeOptions) =>
  !isCloud &&
  !isThirdPartyTab &&
  typeof samlAppTotalCount === 'number' &&
  samlAppTotalCount >= ossSamlApplicationsLimit;
