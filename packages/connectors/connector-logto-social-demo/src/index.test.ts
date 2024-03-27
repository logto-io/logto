import createConnector from './index.js';
import type { SocialDemoConfig } from './types.js';
import { SocialProvider } from './types.js';

const mockedConfig: SocialDemoConfig = {
  provider: SocialProvider.GitHub,
  clientId: 'client-id',
  redirectUri: 'http://localhost:3000/callback',
};
const getConfig = vi.fn().mockResolvedValue(mockedConfig);

describe('getAuthorizationUri', () => {
  it('should get a valid uri by redirectUri and state', async () => {
    const connector = await createConnector({ getConfig });
    const authorizationUri = await connector.getAuthorizationUri(
      {
        state: 'some_state',
        redirectUri: 'http://tenant.localhost:3000/callback',
        connectorId: 'some_connector_id',
        connectorFactoryId: 'some_connector_factory_id',
        jti: 'some_jti',
        headers: {},
      },
      vi.fn()
    );
    expect(authorizationUri).toContain(encodeURIComponent(mockedConfig.redirectUri));
    expect(authorizationUri).toContain(
      `client_id=client-id&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&state=some_state`
    );
  });
});
