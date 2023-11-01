import { InteractionEvent, type SsoConnectorMetadata } from '@logto/schemas';

import { getSsoAuthorizationUrl, getSsoConnectorsByEmail } from '#src/api/interaction-sso.js';
import { putInteraction } from '#src/api/interaction.js';
import { createSsoConnector, deleteSsoConnectorById } from '#src/api/sso-connector.js';
import { ProviderName, logtoUrl } from '#src/constants.js';
import { initClient } from '#src/helpers/client.js';

describe('Single Sign On Happy Path', () => {
  const connectorIdMap = new Map<string, SsoConnectorMetadata & { ssoOnly: boolean }>();

  const state = 'foo_state';
  const redirectUri = 'http://foo.dev/callback';

  beforeAll(async () => {
    const { id, connectorName, ssoOnly } = await createSsoConnector({
      providerName: ProviderName.OIDC,
      connectorName: 'test-oidc',
      domains: ['foo.com'],
      config: {
        clientId: 'foo',
        clientSecret: 'bar',
        issuer: `${logtoUrl}/oidc`,
      },
    });

    connectorIdMap.set(id, { id, connectorName, ssoOnly, logo: '' });
  });

  afterAll(async () => {
    const connectorIds = Array.from(connectorIdMap.keys());
    await Promise.all(connectorIds.map(async (id) => deleteSsoConnectorById(id)));
  });

  it('should get sso authorization url properly', async () => {
    const client = await initClient();

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
    });

    const response = await client.send(getSsoAuthorizationUrl, {
      connectorId: Array.from(connectorIdMap.keys())[0]!,
      state,
      redirectUri,
    });

    expect(response.redirectTo).not.toBeUndefined();
    expect(response.redirectTo.indexOf(logtoUrl)).not.toBe(-1);
    expect(response.redirectTo.indexOf(state)).not.toBe(-1);
  });

  it('should get sso connectors with given email properly', async () => {
    const client = await initClient();

    const response = await client.send(getSsoConnectorsByEmail, {
      email: 'bar@foo.com',
    });

    expect(response.length).toBeGreaterThan(0);

    for (const connector of response) {
      expect(connectorIdMap.has(connector.id)).toBe(true);
      expect(connector.ssoOnly).toEqual(connectorIdMap.get(connector.id)!.ssoOnly);
    }
  });

  it('should return empty array if no sso connectors found', async () => {
    const client = await initClient();

    const response = await client.send(getSsoConnectorsByEmail, {
      email: 'foo@logto-invalid.com',
    });

    expect(response.length).toBe(0);
  });
});
