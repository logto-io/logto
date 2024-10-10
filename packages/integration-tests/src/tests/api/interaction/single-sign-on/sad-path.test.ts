import { InteractionEvent, SsoProviderName } from '@logto/schemas';

import { getSsoAuthorizationUrl } from '#src/api/interaction-sso.js';
import { putInteraction } from '#src/api/interaction.js';
import { createSsoConnector, deleteSsoConnectorById } from '#src/api/sso-connector.js';
import { initClient } from '#src/helpers/client.js';
import { randomString } from '#src/utils.js';

describe('Single Sign On Sad Path', () => {
  const state = 'foo_state';
  const redirectUri = 'http://foo.dev/callback';

  describe('getAuthorizationUrl', () => {
    it('should throw if connector not found', async () => {
      const client = await initClient();

      await client.successSend(putInteraction, {
        event: InteractionEvent.SignIn,
      });

      await expect(
        client.send(getSsoAuthorizationUrl, {
          connectorId: 'foo',
          state,
          redirectUri,
        })
      ).rejects.toThrow();
    });

    it('should throw if connector config is invalid', async () => {
      const { id } = await createSsoConnector({
        providerName: SsoProviderName.OIDC,
        connectorName: `test-oidc-${randomString()}`,
      });

      const client = await initClient();

      await client.successSend(putInteraction, {
        event: InteractionEvent.SignIn,
      });

      await expect(
        client.send(getSsoAuthorizationUrl, {
          connectorId: id,
          state,
          redirectUri,
        })
      ).rejects.toThrow();

      await deleteSsoConnectorById(id);
    });
  });
});
