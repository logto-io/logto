import { InteractionEvent, SsoProviderName } from '@logto/schemas';

import {
  partialConfigAndProviderNames,
  samlAssertion,
} from '#src/__mocks__/sso-connectors-mock.js';
import { getSsoAuthorizationUrl, postSamlAssertion } from '#src/api/interaction-sso.js';
import { putInteraction } from '#src/api/interaction.js';
import { createSsoConnector, deleteSsoConnectorById } from '#src/api/sso-connector.js';
import { initClient } from '#src/helpers/client.js';
import { expectRejects } from '#src/helpers/index.js';
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

  describe('postSamlAssertion', () => {
    // eslint-disable-next-line @silverhand/fp/no-let
    let connectorId: string;

    beforeAll(async () => {
      const mockSamlConnector = partialConfigAndProviderNames[1]!;

      const { id } = await createSsoConnector({
        connectorName: 'test-saml',
        ...mockSamlConnector,
      });

      // eslint-disable-next-line @silverhand/fp/no-mutation
      connectorId = id;
    });

    afterAll(async () => {
      await deleteSsoConnectorById(connectorId);
    });

    it('should throw if the session dose not exist', async () => {
      await initClient();

      await expectRejects(
        postSamlAssertion({ connectorId, RelayState: 'foo', SAMLResponse: samlAssertion }),
        {
          code: 'session.not_found',
          status: 400,
        }
      );
    });

    it('should throw if the response is invalid', async () => {
      const client = await initClient();

      const { redirectTo } = await client.send(getSsoAuthorizationUrl, {
        connectorId,
        state,
        redirectUri: 'http://foo.dev/callback',
      });

      const url = new URL(redirectTo);
      const RelayState = url.searchParams.get('RelayState')!;

      await expectRejects(
        postSamlAssertion({ connectorId, RelayState, SAMLResponse: samlAssertion }),
        {
          code: 'connector.authorization_failed',
          status: 401,
        }
      );
    });
  });
});
