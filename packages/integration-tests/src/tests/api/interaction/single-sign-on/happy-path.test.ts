import { InteractionEvent, SsoProviderName, type SsoConnectorMetadata } from '@logto/schemas';

import { getSsoAuthorizationUrl, getSsoConnectorsByEmail } from '#src/api/interaction-sso.js';
import { putInteraction } from '#src/api/interaction.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { createSsoConnector, deleteSsoConnectorById } from '#src/api/sso-connector.js';
import { logtoUrl } from '#src/constants.js';
import { initClient } from '#src/helpers/client.js';
import { randomString } from '#src/utils.js';

describe('Single Sign On Happy Path', () => {
  const connectorIdMap = new Map<string, SsoConnectorMetadata>();

  const state = 'foo_state';
  const redirectUri = 'http://foo.dev/callback';
  const domain = `foo${randomString()}.com`;

  beforeAll(async () => {
    const { id, connectorName } = await createSsoConnector({
      providerName: SsoProviderName.OIDC,
      connectorName: `test-oidc-${randomString()}`,
      domains: [domain],
      config: {
        clientId: 'foo',
        clientSecret: 'bar',
        issuer: `${logtoUrl}/oidc`,
      },
    });

    // Make sure single sign on is enabled
    await updateSignInExperience({
      singleSignOnEnabled: true,
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

  it('should get sso connectors with given email properly', async () => {
    const client = await initClient();

    const response = await client.send(getSsoConnectorsByEmail, {
      email: 'bar@' + domain,
    });

    expect(response.length).toBeGreaterThan(0);

    for (const connectorId of response) {
      expect(connectorIdMap.has(connectorId)).toBe(true);
    }
  });

  it('should return empty array if no sso connectors found', async () => {
    const client = await initClient();

    const response = await client.send(getSsoConnectorsByEmail, {
      email: 'foo@logto-invalid.com',
    });

    expect(response.length).toBe(0);
  });

  it('should return empty array if sso is not enabled', async () => {
    const client = await initClient();

    await updateSignInExperience({
      singleSignOnEnabled: false,
    });

    const response = await client.send(getSsoConnectorsByEmail, {
      email: 'bar@' + domain,
    });

    expect(response.length).toBe(0);
  });
});
