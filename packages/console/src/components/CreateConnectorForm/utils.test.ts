import { ConnectorType } from '@logto/connector-kit';

import { getEmailConnectorUpsellCopyKeys, shouldShowEmailConnectorUpsellBanner } from './utils';

describe('shouldShowEmailConnectorUpsellBanner', () => {
  test('returns true only for OSS email connectors with dev features enabled', () => {
    expect(
      shouldShowEmailConnectorUpsellBanner({
        type: ConnectorType.Email,
        isCloud: false,
        isDevFeaturesEnabled: true,
      })
    ).toBe(true);
  });

  test('returns false for cloud, non-email, or disabled dev-features cases', () => {
    expect(
      shouldShowEmailConnectorUpsellBanner({
        type: ConnectorType.Email,
        isCloud: true,
        isDevFeaturesEnabled: true,
      })
    ).toBe(false);
    expect(
      shouldShowEmailConnectorUpsellBanner({
        type: ConnectorType.Email,
        isCloud: false,
        isDevFeaturesEnabled: false,
      })
    ).toBe(false);
    expect(
      shouldShowEmailConnectorUpsellBanner({
        type: ConnectorType.Sms,
        isCloud: false,
        isDevFeaturesEnabled: true,
      })
    ).toBe(false);
  });
});

describe('getEmailConnectorUpsellCopyKeys', () => {
  test('uses dedicated i18n keys for the OSS email upsell banner copy', () => {
    expect(getEmailConnectorUpsellCopyKeys()).toEqual({
      title: 'connectors.create_form.email_connector_upsell.title',
      description: 'connectors.create_form.email_connector_upsell.description',
    });
  });
});
