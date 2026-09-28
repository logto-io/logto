import { type Nullable } from '@silverhand/essentials';

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

type IsSamlAppLimitReachedOptions = {
  readonly isCloud: boolean;
  /** The SAML application cap, `null` when unlimited. */
  readonly samlAppLimit: Nullable<number>;
  readonly samlAppTotalCount?: number;
};

/**
 * Whether a self-hosted deployment has reached its SAML application cap: the OSS default, or the
 * limit its installed license grants. Cloud has its own quota notices.
 */
export const isSamlAppLimitReached = ({
  isCloud,
  samlAppLimit,
  samlAppTotalCount,
}: IsSamlAppLimitReachedOptions) =>
  !isCloud &&
  samlAppLimit !== null &&
  typeof samlAppTotalCount === 'number' &&
  samlAppTotalCount >= samlAppLimit;

type ShouldShowSamlAppLimitNoticeOptions = IsSamlAppLimitReachedOptions & {
  readonly isThirdPartyTab: boolean;
};

export const shouldShowSamlAppLimitNotice = ({
  isThirdPartyTab,
  ...options
}: ShouldShowSamlAppLimitNoticeOptions) => !isThirdPartyTab && isSamlAppLimitReached(options);
