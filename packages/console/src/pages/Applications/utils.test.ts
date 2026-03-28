import { shouldShowSamlAppLimitNotice, getSamlAppLimitNoticeTranslation } from './utils';

describe('getSamlAppLimitNoticeTranslation', () => {
  it('returns the dedicated banner i18n key and limit interpolation', () => {
    expect(getSamlAppLimitNoticeTranslation()).toEqual({
      key: 'upsell.paywall.saml_applications_oss_limit_notice',
      interpolation: {
        limit: 3,
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
        samlAppTotalCount: 3,
      })
    ).toBe(true);
  });

  it('returns false when dev features are disabled', () => {
    expect(
      shouldShowSamlAppLimitNotice({
        isCloud: false,
        isDevFeaturesEnabled: false,
        isThirdPartyTab: false,
        samlAppTotalCount: 3,
      })
    ).toBe(false);
  });

  it('returns false when the SAML app count is below the OSS limit', () => {
    expect(
      shouldShowSamlAppLimitNotice({
        isCloud: false,
        isDevFeaturesEnabled: true,
        isThirdPartyTab: false,
        samlAppTotalCount: 2,
      })
    ).toBe(false);
  });

  it('returns false on the third-party apps tab', () => {
    expect(
      shouldShowSamlAppLimitNotice({
        isCloud: false,
        isDevFeaturesEnabled: true,
        isThirdPartyTab: true,
        samlAppTotalCount: 3,
      })
    ).toBe(false);
  });
});
