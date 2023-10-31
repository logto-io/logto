import { InteractionEvent, type SsoConnectorMetadata } from '@logto/schemas';

import { getSsoAuthorizationUrl } from '#src/api/interaction-sso.js';
import { putInteraction } from '#src/api/interaction.js';
import { createSsoConnector, deleteSsoConnectorById } from '#src/api/sso-connector.js';
import { ProviderName, logtoUrl } from '#src/constants.js';
import { initClient } from '#src/helpers/client.js';

describe('Single Sign On Happy Path', () => {
  const connectorIdMap = new Map<string, SsoConnectorMetadata>();

  const state = 'foo_state';
  const redirectUri = 'http://foo.dev/callback';

  beforeAll(async () => {
    const { id, connectorName } = await createSsoConnector({
      providerName: ProviderName.OIDC,
      connectorName: 'test-oidc',
      config: {
        clientId: 'foo',
        clientSecret: 'bar',
        issuer: `${logtoUrl}/oidc`,
      },
    });

    connectorIdMap.set(id, { id, connectorName, logo: '' });
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
});
