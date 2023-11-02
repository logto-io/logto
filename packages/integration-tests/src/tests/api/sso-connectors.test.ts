import { type JsonObject } from '@logto/schemas';
import { HTTPError } from 'got';

import {
  getSsoConnectorFactories,
  createSsoConnector,
  getSsoConnectors,
  getSsoConnectorById,
  deleteSsoConnectorById,
  patchSsoConnectorById,
  patchSsoConnectorConfigById,
} from '#src/api/sso-connector.js';

const providerNames = ['OIDC', 'SAML'];
const partialConfigAndProviderNames: Array<{
  providerName: string;
  config: JsonObject;
}> = [
  {
    providerName: 'OIDC',
    config: {
      clientId: 'foo',
      clientSecret: 'foo',
      issuer: 'https://test.com',
      scope: 'openid',
    },
  },
  {
    providerName: 'SAML',
    config: {
      metadataType: 'URL',
      metadataUrl: 'http://test.com',
      attributeMapping: {},
      entityId: 'foo',
    },
  },
];

describe('sso-connector library', () => {
  it('should return sso-connector-factories', async () => {
    const response = await getSsoConnectorFactories();

    expect(response).toHaveProperty('standardConnectors');
    expect(response).toHaveProperty('providerConnectors');

    expect(response.standardConnectors.length).toBe(2);
    expect(
      response.standardConnectors.find(({ providerName }) => providerName === 'OIDC')
    ).toBeDefined();
    expect(
      response.standardConnectors.find(({ providerName }) => providerName === 'SAML')
    ).toBeDefined();
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
    expect(response).toHaveProperty('ssoOnly', false);
    expect(response).toHaveProperty('syncProfile', false);

    await deleteSsoConnectorById(response.id);
  });

  it.each(providerNames)('should throw if invalid config is provided', async (providerName) => {
    await expect(
      createSsoConnector({
        providerName,
        connectorName: 'test',
        config: {
          issuer: 23,
          entityId: 123,
        },
      })
    ).rejects.toThrow(HTTPError);
  });

  it.each(partialConfigAndProviderNames)(
    'should create a new sso connector with partial configs',
    async ({ providerName, config }) => {
      const data = {
        providerName,
        connectorName: 'test',
        config,
        domains: ['test.com'],
        ssoOnly: true,
      };

      const response = await createSsoConnector(data);

      expect(response).toHaveProperty('id');
      expect(response).toHaveProperty('providerName', providerName);
      expect(response).toHaveProperty('connectorName', 'test');
      expect(response).toHaveProperty('config', data.config);
      expect(response).toHaveProperty('domains', data.domains);
      expect(response).toHaveProperty('ssoOnly', data.ssoOnly);
      expect(response).toHaveProperty('syncProfile', false);

      await deleteSsoConnectorById(response.id);
    }
  );
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

    // Invalid config
    expect(connector?.providerConfig).toBeUndefined();

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
    expect(connector).toHaveProperty('ssoOnly', false);
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

  it.each(providerNames)('should patch sso connector without config', async (providerName) => {
    const { id } = await createSsoConnector({
      providerName,
      connectorName: 'integration_test connector',
    });

    const connector = await patchSsoConnectorById(id, {
      connectorName: 'integration_test connector updated',
      domains: ['test.com'],
      ssoOnly: true,
    });

    expect(connector).toHaveProperty('id', id);
    expect(connector).toHaveProperty('providerName', providerName);
    expect(connector).toHaveProperty('connectorName', 'integration_test connector updated');
    expect(connector).toHaveProperty('config', {});
    expect(connector).toHaveProperty('domains', ['test.com']);
    expect(connector).toHaveProperty('ssoOnly', true);
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
    expect(connector).toHaveProperty('ssoOnly', false);
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
          entityId: 123,
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

      await deleteSsoConnectorById(id);
    }
  );
});

describe('patch sso-connector config by id', () => {
  it('should return 404 if connector is not found', async () => {
    await expect(patchSsoConnectorConfigById('invalid-id', {})).rejects.toThrow(HTTPError);
  });

  it.each(providerNames)('should throw if invalid config is provided', async (providerName) => {
    const { id } = await createSsoConnector({
      providerName,
      connectorName: 'integration_test connector',
      config: {
        clientSecret: 'bar',
        metadataType: 'URL',
      },
    });

    await expect(
      patchSsoConnectorConfigById(id, {
        issuer: 23,
        entityId: 123,
      })
    ).rejects.toThrow(HTTPError);

    await deleteSsoConnectorById(id);
  });

  it.each(partialConfigAndProviderNames)(
    'should patch sso connector config',
    async ({ providerName, config }) => {
      const { id } = await createSsoConnector({
        providerName,
        connectorName: 'integration_test connector',
      });

      const connector = await patchSsoConnectorConfigById(id, config);

      expect(connector).toHaveProperty('id', id);
      expect(connector).toHaveProperty('providerName', providerName);
      expect(connector).toHaveProperty('connectorName', 'integration_test connector');
      expect(connector).toHaveProperty('config', config);

      await deleteSsoConnectorById(id);
    }
  );
});
