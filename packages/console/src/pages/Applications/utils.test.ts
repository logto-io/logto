import { ossSamlApplicationsLimit } from '@/consts/application-limits';

import { shouldListDynamicApp, shouldShowSamlAppLimitNotice } from './utils';

const belowSamlLimit = ossSamlApplicationsLimit - 1;

describe('shouldShowSamlAppLimitNotice', () => {
  it('returns true for OSS my apps when the SAML app limit is reached', () => {
    expect(
      shouldShowSamlAppLimitNotice({
        isCloud: false,
        isThirdPartyTab: false,
        samlAppTotalCount: ossSamlApplicationsLimit,
      })
    ).toBe(true);
  });

  it('returns false when the SAML app count is below the OSS limit', () => {
    expect(
      shouldShowSamlAppLimitNotice({
        isCloud: false,
        isThirdPartyTab: false,
        samlAppTotalCount: belowSamlLimit,
      })
    ).toBe(false);
  });

  it('returns false on the third-party apps tab', () => {
    expect(
      shouldShowSamlAppLimitNotice({
        isCloud: false,
        isThirdPartyTab: true,
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
