import { InteractionEvent } from '@logto/schemas';

import { deleteUser } from '#src/api/admin-user.js';
import { getSsoAuthorizationUrl, getSsoConnectorsByEmail } from '#src/api/interaction-sso.js';
import { putInteraction } from '#src/api/interaction.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { SsoConnectorApi } from '#src/api/sso-connector.js';
import { logtoUrl } from '#src/constants.js';
import { initClient } from '#src/helpers/client.js';
import { registerNewUserWithSso, signInWithSso } from '#src/helpers/single-sign-on.js';
import { generateEmail, generateUserId, randomString } from '#src/utils.js';

describe('Single Sign On Happy Path', () => {
  const ssoConnectorApi = new SsoConnectorApi();
  const domain = `foo${randomString()}.com`;

  beforeAll(async () => {
    await ssoConnectorApi.createMockOidcConnector([domain]);

    // Make sure single sign on is enabled
    await updateSignInExperience({
      singleSignOnEnabled: true,
    });
  });

  afterAll(async () => {
    await ssoConnectorApi.cleanUp();
  });

  it('should get sso authorization url properly', async () => {
    const state = 'foo_state';
    const redirectUri = 'http://foo.dev/callback';

    const client = await initClient();

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
    });

    const response = await client.send(getSsoAuthorizationUrl, {
      connectorId: ssoConnectorApi.firstConnectorId!,
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
      expect(ssoConnectorApi.connectorInstances.has(connectorId)).toBe(true);
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

  describe('single sign-on interaction', () => {
    const ssoUserId = generateUserId();
    const ssoEmail = generateEmail();

    it('should register new user with sso identity', async () => {
      await registerNewUserWithSso(ssoConnectorApi.firstConnectorId!, {
        authData: {
          sub: ssoUserId,
          email: ssoEmail,
        },
      });
    });

    it('should sign-in with sso identity', async () => {
      const userId = await signInWithSso(ssoConnectorApi.firstConnectorId!, {
        authData: {
          sub: ssoUserId,
          email: ssoEmail,
        },
      });

      await deleteUser(userId);
    });
  });
});
