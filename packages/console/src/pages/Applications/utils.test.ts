import { ossSamlApplicationsLimit } from '@/consts/application-limits';

import { shouldShowSamlAppLimitNotice } from './utils';

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
