import { SsoProviderName } from '@logto/schemas';
import { HTTPError } from 'ky';

import {
  providerNames,
  partialConfigAndProviderNames,
} from '#src/__mocks__/sso-connectors-mock.js';
import {
  getSsoConnectorFactories,
  createSsoConnector,
  getSsoConnectors,
  getSsoConnectorById,
  deleteSsoConnectorById,
  patchSsoConnectorById,
} from '#src/api/sso-connector.js';
import { expectRejects } from '#src/helpers/index.js';

describe('sso-connector library', () => {
  it('should return sso-connector-providers', async () => {
    const response = await getSsoConnectorFactories();

    expect(response.length).toBeGreaterThan(0);

    for (const provider of Object.values(SsoProviderName)) {
      expect(response.find((data) => data.providerName === provider)).toBeDefined();
    }
  });
});

describe('post sso-connectors', () => {
  it('should throw error when providerName is not provided', async () => {
    await expect(
      createSsoConnector({
        connectorName: 'test',
      })
    ).rejects.toThrow(HTTPError);
  });

  it('should throw error when connectorName is not provided', async () => {
    await expect(
      createSsoConnector({
        providerName: 'OIDC',
      })
    ).rejects.toThrow(HTTPError);
  });

  it('should throw error when providerName is not supported', async () => {
    await expect(
      createSsoConnector({
        providerName: 'dummy provider',
        connectorName: 'test',
      })
    ).rejects.toThrow(HTTPError);
  });

  it('should throw error when connectorName is not unique', async () => {
    const { id } = await createSsoConnector({
      providerName: 'OIDC',
      connectorName: 'test connector name',
    });

    await expectRejects(
      createSsoConnector({
        providerName: 'OIDC',
        connectorName: 'test connector name',
      }),
      { code: 'single_sign_on.duplicate_connector_name', status: 409 }
    );

    await deleteSsoConnectorById(id);
  });

  it.each(providerNames)('should create a new sso connector', async (providerName) => {
    const response = await createSsoConnector({
      providerName,
      connectorName: 'test',
    });

    expect(response).toHaveProperty('id');
    expect(response).toHaveProperty('providerName', providerName);
    expect(response).toHaveProperty('connectorName', 'test');
    expect(response).toHaveProperty('config', {});
    expect(response).toHaveProperty('domains', []);
    expect(response).toHaveProperty('syncProfile', false);

    await deleteSsoConnectorById(response.id);
  });

  it('OIDC connector should throw error if insufficient config is provided', async () => {
    await expect(
      createSsoConnector({
        providerName: SsoProviderName.OIDC,
        connectorName: 'test',
        config: {
          clientId: 'logto.io',
        },
      })
    ).rejects.toThrow(HTTPError);
  });

  it('SAML connector should throw error if invalid config is provided', async () => {
    await expect(
      createSsoConnector({
        providerName: SsoProviderName.SAML,
        connectorName: 'test',
        config: {
          entityId: 123,
        },
      })
    ).rejects.toThrow(HTTPError);
  });
});

describe('get sso-connectors', () => {
  it.each(providerNames)('should return sso connectors', async (providerName) => {
    const { id } = await createSsoConnector({
      providerName,
      connectorName: 'test',
    });

    const connectors = await getSsoConnectors();
    expect(connectors.length).toBeGreaterThan(0);

    const connector = connectors.find((connector) => connector.id === id);

    expect(connector).toBeDefined();
    expect(connector?.providerLogo).toBeDefined();
    expect(connector?.providerLogoDark).toBeDefined();

    // Empty config object is a valid SAML config.
    if (providerName === 'OIDC') {
      // Invalid config
      expect(connector?.providerConfig).toBeUndefined();
    }

    await deleteSsoConnectorById(id);
  });
});

describe('get sso-connector by id', () => {
  it('should return 404 if connector is not found', async () => {
    await expect(getSsoConnectorById('invalid-id')).rejects.toThrow(HTTPError);
  });

  it.each(providerNames)('should return sso connector', async (providerName) => {
    const { id } = await createSsoConnector({
      providerName,
      connectorName: 'integration_test connector',
    });

    const connector = await getSsoConnectorById(id);

    expect(connector).toHaveProperty('id', id);
    expect(connector).toHaveProperty('providerName', providerName);
    expect(connector).toHaveProperty('connectorName', 'integration_test connector');
    expect(connector).toHaveProperty('config', {});
    expect(connector).toHaveProperty('domains', []);
    expect(connector).toHaveProperty('syncProfile', false);

    await deleteSsoConnectorById(id);
  });
});

describe('delete sso-connector by id', () => {
  it('should return 404 if connector is not found', async () => {
    await expect(getSsoConnectorById('invalid-id')).rejects.toThrow(HTTPError);
  });

  it.each(providerNames)('should delete sso connector', async (providerName) => {
    const { id } = await createSsoConnector({
      providerName,
      connectorName: 'integration_test connector',
    });

    await expect(getSsoConnectorById(id)).resolves.toBeDefined();

    await deleteSsoConnectorById(id);

    await expect(getSsoConnectorById(id)).rejects.toThrow(HTTPError);
  });
});

describe('patch sso-connector by id', () => {
  it('should return 404 if connector is not found', async () => {
    await expect(patchSsoConnectorById('invalid-id', { connectorName: 'foo' })).rejects.toThrow(
      HTTPError
    );
  });

  it('should throw error if connector name is not unique', async () => {
    const { id } = await createSsoConnector({
      providerName: 'OIDC',
      connectorName: 'test connector name',
    });

    const { id: id2 } = await createSsoConnector({
      providerName: 'OIDC',
      connectorName: 'test connector name 2',
    });

    await expectRejects(
      patchSsoConnectorById(id2, {
        connectorName: 'test connector name',
      }),
      { code: 'single_sign_on.duplicate_connector_name', status: 409 }
    );

    await deleteSsoConnectorById(id);
    await deleteSsoConnectorById(id2);
  });

  it('should not block the update of current connector', async () => {
    const { id } = await createSsoConnector({
      providerName: 'OIDC',
      connectorName: 'test connector name',
    });

    const updatedSsoConnector = await patchSsoConnectorById(id, {
      connectorName: 'test connector name',
    });
    expect(updatedSsoConnector).toHaveProperty('connectorName', 'test connector name');

    await deleteSsoConnectorById(id);
  });

  it.each(providerNames)('should patch sso connector without config', async (providerName) => {
    const { id } = await createSsoConnector({
      providerName,
      connectorName: 'integration_test connector',
    });

    const connector = await patchSsoConnectorById(id, {
      connectorName: 'integration_test connector updated',
      domains: ['test.com'],
    });

    expect(connector).toHaveProperty('id', id);
    expect(connector).toHaveProperty('providerName', providerName);
    expect(connector).toHaveProperty('connectorName', 'integration_test connector updated');
    expect(connector).toHaveProperty('config', {});
    expect(connector).toHaveProperty('domains', ['test.com']);
    expect(connector).toHaveProperty('syncProfile', false);

    await deleteSsoConnectorById(id);
  });

  it.each(providerNames)('should directly return if no changes are made', async (providerName) => {
    const { id } = await createSsoConnector({
      providerName,
      connectorName: 'integration_test connector',
    });

    const connector = await patchSsoConnectorById(id, {
      config: undefined,
    });

    expect(connector).toHaveProperty('id', id);
    expect(connector).toHaveProperty('providerName', providerName);
    expect(connector).toHaveProperty('connectorName', 'integration_test connector');
    expect(connector).toHaveProperty('config', {});
    expect(connector).toHaveProperty('domains', []);
    expect(connector).toHaveProperty('syncProfile', false);

    await deleteSsoConnectorById(id);
  });

  it.each(providerNames)('should throw if invalid config is provided', async (providerName) => {
    const { id } = await createSsoConnector({
      providerName,
      connectorName: 'integration_test connector',
    });

    await expect(
      patchSsoConnectorById(id, {
        config: {
          issuer: 23,
          signInEndpoint: 123,
        },
      })
    ).rejects.toThrow(HTTPError);

    await deleteSsoConnectorById(id);
  });

  it.each(partialConfigAndProviderNames)(
    'should patch sso connector with config',
    async ({ providerName, config }) => {
      const { id } = await createSsoConnector({
        providerName,
        connectorName: 'integration_test connector',
      });

      const connector = await patchSsoConnectorById(id, {
        connectorName: 'integration_test connector updated',
        config,
        syncProfile: true,
      });

      expect(connector).toHaveProperty('id', id);
      expect(connector).toHaveProperty('providerName', providerName);
      expect(connector).toHaveProperty('connectorName', 'integration_test connector updated');
      expect(connector).toHaveProperty('config', config);
      expect(connector).toHaveProperty('syncProfile', true);

      // Since we've provided a valid metadata content, check if the `providerConfig` is returned.
      if (providerName === SsoProviderName.SAML) {
        expect(connector.providerConfig).toBeDefined();
      }

      await deleteSsoConnectorById(id);
    }
  );
});
