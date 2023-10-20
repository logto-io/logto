import { getSsoConnectorFactories } from '#src/api/sso-connector.js';

describe('sso-connector', () => {
  it('should return sso-connector-factories', async () => {
    const response = await getSsoConnectorFactories();

    expect(response).toHaveProperty('standardConnectors');
    expect(response).toHaveProperty('providerConnectors');

    // Should have OIDC connector
    expect(
      response.standardConnectors.find((connector) => connector.providerName === 'OIDC')
    ).toBeTruthy();
  });
});
