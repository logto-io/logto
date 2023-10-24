import { HTTPError } from 'got';

import {
  getSsoConnectorFactories,
  createSsoConnector,
  getSsoConnectors,
} from '#src/api/sso-connector.js';

describe('sso-connector library', () => {
  it('should return sso-connector-factories', async () => {
    const response = await getSsoConnectorFactories();

    expect(response).toHaveProperty('standardConnectors');
    expect(response).toHaveProperty('providerConnectors');

    expect(response.standardConnectors.length).toBeGreaterThan(0);
  });
});

describe('post sso-connectos', () => {
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
        providerName: 'SAML',
        connectorName: 'test',
      })
    ).rejects.toThrow(HTTPError);
  });

  it('should create a new sso connector', async () => {
    const response = await createSsoConnector({
      providerName: 'OIDC',
      connectorName: 'test',
    });

    expect(response).toHaveProperty('id');
    expect(response).toHaveProperty('providerName', 'OIDC');
    expect(response).toHaveProperty('connectorName', 'test');
    expect(response).toHaveProperty('config', {});
    expect(response).toHaveProperty('domains', []);
    expect(response).toHaveProperty('ssoOnly', false);
    expect(response).toHaveProperty('syncProfile', false);
  });

  it('should throw if invalid config is provided', async () => {
    await expect(
      createSsoConnector({
        providerName: 'OIDC',
        connectorName: 'test',
        config: {
          issuer: 23,
        },
      })
    ).rejects.toThrow(HTTPError);
  });

  it('should create a new sso connector with partial configs', async () => {
    const data = {
      providerName: 'OIDC',
      connectorName: 'test',
      config: {
        clientId: 'foo',
        issuer: 'https://test.com',
      },
      domains: ['test.com'],
      ssoOnly: true,
    };

    const response = await createSsoConnector(data);

    expect(response).toHaveProperty('id');
    expect(response).toHaveProperty('providerName', 'OIDC');
    expect(response).toHaveProperty('connectorName', 'test');
    expect(response).toHaveProperty('config', data.config);
    expect(response).toHaveProperty('domains', data.domains);
    expect(response).toHaveProperty('ssoOnly', data.ssoOnly);
    expect(response).toHaveProperty('syncProfile', false);
  });
});

describe('get sso-connectors', () => {
  it('should return sso connectors', async () => {
    const { id } = await createSsoConnector({
      providerName: 'OIDC',
      connectorName: 'test',
    });

    const connectors = await getSsoConnectors();
    expect(connectors.length).toBeGreaterThan(0);

    const connector = connectors.find((connector) => connector.id === id);

    expect(connector).toBeDefined();
    expect(connector?.providerLogo).toBeDefined();

    // Invalid config
    expect(connector?.providerConfig).toBeUndefined();
  });
});
