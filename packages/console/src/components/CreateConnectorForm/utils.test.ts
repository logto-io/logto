import { ConnectorType } from '@logto/connector-kit';
import type { TFuncKey } from 'i18next';

import { getEmailConnectorUpsellCopyKeys, shouldShowEmailConnectorUpsellBanner } from './utils';

describe('shouldShowEmailConnectorUpsellBanner', () => {
  test('returns true for OSS email connectors', () => {
    expect(
      shouldShowEmailConnectorUpsellBanner({
        type: ConnectorType.Email,
        isCloud: false,
      })
    ).toBe(true);
  });

  test('returns false for cloud or non-email cases', () => {
    expect(
      shouldShowEmailConnectorUpsellBanner({
        type: ConnectorType.Email,
        isCloud: true,
      })
    ).toBe(false);
    expect(
      shouldShowEmailConnectorUpsellBanner({
        type: ConnectorType.Sms,
        isCloud: false,
      })
    ).toBe(false);
  });
});

describe('getEmailConnectorUpsellCopyKeys', () => {
  test('uses dedicated i18n keys for the OSS email upsell banner copy', () => {
    const copyKeys = getEmailConnectorUpsellCopyKeys();
    const titleKey: TFuncKey<'translation', 'admin_console'> = copyKeys.title;
    const descriptionKey: TFuncKey<'translation', 'admin_console'> = copyKeys.description;
    const actionKey: TFuncKey<'translation', 'admin_console'> = copyKeys.action;

    expect({ title: titleKey, description: descriptionKey, action: actionKey }).toEqual({
      title: 'connectors.create_form.email_connector_upsell.title',
      description: 'connectors.create_form.email_connector_upsell.description',
      action: 'upsell.try_with_product_name',
    });
  });
});
