import { ConnectorType, ServiceConnector } from '@logto/connector-kit';

import { getConnectorSelectionState, getEmailConnectorUpsellCopyKeys } from './utils';

describe('getConnectorSelectionState', () => {
  test('shows the OSS email upsell banner even when the built-in email connector is absent', () => {
    const smtpGroup = {
      id: 'smtp',
      type: ConnectorType.Email,
      target: 'smtp',
      name: { en: 'SMTP' },
      description: { en: 'SMTP connector.' },
      logo: 'smtp.svg',
      logoDark: 'smtp-dark.svg',
      isStandard: true,
      isDemo: false,
      isTokenStorageSupported: false,
      connectors: [{ id: 'smtp' }],
    };

    expect(
      getConnectorSelectionState([smtpGroup], {
        type: ConnectorType.Email,
        isCloud: false,
        isDevFeaturesEnabled: true,
      })
    ).toEqual({
      shouldShowEmailConnectorUpsellBanner: true,
      groups: [smtpGroup],
    });
  });

  test('removes the built-in email connector from the selectable groups when present', () => {
    const logtoEmailGroup = {
      id: ServiceConnector.Email,
      type: ConnectorType.Email,
      target: 'logto-email',
      name: { en: 'Logto email service' },
      description: { en: 'Built-in email delivery.' },
      logo: 'logto-email.svg',
      logoDark: 'logto-email-dark.svg',
      isStandard: false,
      isDemo: false,
      isTokenStorageSupported: false,
      connectors: [{ id: ServiceConnector.Email }],
    };

    const smtpGroup = {
      id: 'smtp',
      type: ConnectorType.Email,
      target: 'smtp',
      name: { en: 'SMTP' },
      description: { en: 'SMTP connector.' },
      logo: 'smtp.svg',
      logoDark: 'smtp-dark.svg',
      isStandard: true,
      isDemo: false,
      isTokenStorageSupported: false,
      connectors: [{ id: 'smtp' }],
    };

    expect(
      getConnectorSelectionState([logtoEmailGroup, smtpGroup], {
        type: ConnectorType.Email,
        isCloud: false,
        isDevFeaturesEnabled: true,
      })
    ).toEqual({
      shouldShowEmailConnectorUpsellBanner: true,
      groups: [smtpGroup],
    });
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
