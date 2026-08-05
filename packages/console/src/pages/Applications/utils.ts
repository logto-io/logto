import { ossSamlApplicationsLimit } from '@/consts/application-limits';

type ShouldListDynamicAppOptions = {
  readonly isThirdPartyTab: boolean;
  readonly isDynamicAppEnabled: boolean;
  readonly page: number;
};

/**
 * The dynamic app is a tenant-level feature switch listed among third-party applications. It has
 * no application record to paginate, so it is pinned to the first page of that tab only.
 */
export const shouldListDynamicApp = ({
  isThirdPartyTab,
  isDynamicAppEnabled,
  page,
}: ShouldListDynamicAppOptions) => isThirdPartyTab && isDynamicAppEnabled && page === 1;

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
