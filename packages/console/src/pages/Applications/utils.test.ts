import { ossSamlApplicationsLimit } from '@/consts/application-limits';

import { shouldShowSamlAppLimitNotice, getSamlAppLimitNoticeTranslation } from './utils';

const belowSamlLimit = ossSamlApplicationsLimit - 1;

describe('getSamlAppLimitNoticeTranslation', () => {
  it('returns the dedicated banner i18n key and limit interpolation', () => {
    expect(getSamlAppLimitNoticeTranslation()).toEqual({
      key: 'upsell.paywall.saml_applications_oss_limit_notice',
      interpolation: {
        limit: ossSamlApplicationsLimit,
      },
    });
  });
});

describe('shouldShowSamlAppLimitNotice', () => {
  it('returns true for OSS my apps when the SAML app limit is reached and dev features are enabled', () => {
    expect(
      shouldShowSamlAppLimitNotice({
        isCloud: false,
        isDevFeaturesEnabled: true,
        isThirdPartyTab: false,
        samlAppTotalCount: ossSamlApplicationsLimit,
      })
    ).toBe(true);
  });

  it('returns false when dev features are disabled', () => {
    expect(
      shouldShowSamlAppLimitNotice({
        isCloud: false,
        isDevFeaturesEnabled: false,
        isThirdPartyTab: false,
        samlAppTotalCount: ossSamlApplicationsLimit,
      })
    ).toBe(false);
  });

  it('returns false when the SAML app count is below the OSS limit', () => {
    expect(
      shouldShowSamlAppLimitNotice({
        isCloud: false,
        isDevFeaturesEnabled: true,
        isThirdPartyTab: false,
        samlAppTotalCount: belowSamlLimit,
      })
    ).toBe(false);
  });

  it('returns false on the third-party apps tab', () => {
    expect(
      shouldShowSamlAppLimitNotice({
        isCloud: false,
        isDevFeaturesEnabled: true,
        isThirdPartyTab: true,
        samlAppTotalCount: ossSamlApplicationsLimit,
      })
    ).toBe(false);
  });
});
