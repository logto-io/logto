import { ConnectorType, ServiceConnector } from '@logto/connector-kit';

import { getConnectorSelectionState, getEmailConnectorUpsellCopyKeys } from './utils';

describe('getConnectorSelectionState', () => {
  test('keeps the built-in email connector in cloud', () => {
    const logtoEmailGroup = {
      id: ServiceConnector.Email,
      type: ConnectorType.Email,
      target: ServiceConnector.Email,
      name: { en: 'Logto email service' },
      description: { en: 'Built-in email delivery.' },
      logo: 'logto-email.svg',
      logoDark: 'logto-email-dark.svg',
      isStandard: false,
      isDemo: false,
      isTokenStorageSupported: false,
      connectors: [{ id: ServiceConnector.Email }],
    };

    expect(
      getConnectorSelectionState([logtoEmailGroup], {
        type: ConnectorType.Email,
        isCloud: true,
        isDevFeaturesEnabled: true,
      })
    ).toEqual({
      shouldShowEmailConnectorUpsellBanner: false,
      groups: [logtoEmailGroup],
    });
  });

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

  test('removes the built-in email connector from the selectable groups in OSS', () => {
    const logtoEmailGroup = {
      id: ServiceConnector.Email,
      type: ConnectorType.Email,
      target: ServiceConnector.Email,
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

  test('still removes the built-in email connector in OSS when dev features are disabled', () => {
    const logtoEmailGroup = {
      id: ServiceConnector.Email,
      type: ConnectorType.Email,
      target: ServiceConnector.Email,
      name: { en: 'Logto email service' },
      description: { en: 'Built-in email delivery.' },
      logo: 'logto-email.svg',
      logoDark: 'logto-email-dark.svg',
      isStandard: false,
      isDemo: false,
      isTokenStorageSupported: false,
      connectors: [{ id: ServiceConnector.Email }],
    };

    expect(
      getConnectorSelectionState([logtoEmailGroup], {
        type: ConnectorType.Email,
        isCloud: false,
        isDevFeaturesEnabled: false,
      })
    ).toEqual({
      shouldShowEmailConnectorUpsellBanner: false,
      groups: [],
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
