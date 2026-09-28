import { ossDefaultQuota } from '@logto/schemas';

import { shouldListDynamicApp, shouldShowSamlAppLimitNotice } from './utils';

const ossSamlApplicationsLimit = ossDefaultQuota.samlApplicationsLimit;
const belowSamlLimit = ossSamlApplicationsLimit - 1;

describe('shouldShowSamlAppLimitNotice', () => {
  it('returns true for OSS my apps when the SAML app limit is reached', () => {
    expect(
      shouldShowSamlAppLimitNotice({
        isCloud: false,
        isThirdPartyTab: false,
        samlAppLimit: ossSamlApplicationsLimit,
        samlAppTotalCount: ossSamlApplicationsLimit,
      })
    ).toBe(true);
  });

  it('returns false when the SAML app count is below the limit', () => {
    expect(
      shouldShowSamlAppLimitNotice({
        isCloud: false,
        isThirdPartyTab: false,
        samlAppLimit: ossSamlApplicationsLimit,
        samlAppTotalCount: belowSamlLimit,
      })
    ).toBe(false);
  });

  it('follows a limit granted by a license', () => {
    expect(
      shouldShowSamlAppLimitNotice({
        isCloud: false,
        isThirdPartyTab: false,
        samlAppLimit: 10,
        samlAppTotalCount: ossSamlApplicationsLimit,
      })
    ).toBe(false);
  });

  it('returns false when a license lifts the limit', () => {
    expect(
      shouldShowSamlAppLimitNotice({
        isCloud: false,
        isThirdPartyTab: false,
        samlAppLimit: null,
        samlAppTotalCount: 100,
      })
    ).toBe(false);
  });

  it('returns false on Cloud', () => {
    expect(
      shouldShowSamlAppLimitNotice({
        isCloud: true,
        isThirdPartyTab: false,
        samlAppLimit: ossSamlApplicationsLimit,
        samlAppTotalCount: ossSamlApplicationsLimit,
      })
    ).toBe(false);
  });

  it('returns false on the third-party apps tab', () => {
    expect(
      shouldShowSamlAppLimitNotice({
        isCloud: false,
        isThirdPartyTab: true,
        samlAppLimit: ossSamlApplicationsLimit,
        samlAppTotalCount: ossSamlApplicationsLimit,
      })
    ).toBe(false);
  });
});

describe('shouldListDynamicApp', () => {
  it('returns true on the first page of the third-party apps tab when enabled', () => {
    expect(
      shouldListDynamicApp({ isThirdPartyTab: true, isDynamicAppEnabled: true, page: 1 })
    ).toBe(true);
  });

  it('returns false when the dynamic app is disabled', () => {
    expect(
      shouldListDynamicApp({ isThirdPartyTab: true, isDynamicAppEnabled: false, page: 1 })
    ).toBe(false);
  });

  it('returns false on the my apps tab', () => {
    expect(
      shouldListDynamicApp({ isThirdPartyTab: false, isDynamicAppEnabled: true, page: 1 })
    ).toBe(false);
  });

  it('returns false beyond the first page', () => {
    expect(
      shouldListDynamicApp({ isThirdPartyTab: true, isDynamicAppEnabled: true, page: 2 })
    ).toBe(false);
  });
});
