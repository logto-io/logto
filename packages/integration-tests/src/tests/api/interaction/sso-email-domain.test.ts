import { InteractionEvent } from '@logto/schemas';

import api from '#src/api/api.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { SsoConnectorApi } from '#src/api/sso-connector.js';
import { initClient } from '#src/helpers/client.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateEmail, generatePassword } from '#src/utils.js';

describe('legacy interaction SSO email domain matching', () => {
  const ssoConnectorApi = new SsoConnectorApi();
  const domain = 'Foo.com';

  beforeAll(async () => {
    await ssoConnectorApi.createMockOidcConnector([domain]);
    await enableAllPasswordSignInMethods();
    await updateSignInExperience({ singleSignOnEnabled: true });
  });

  afterAll(async () => {
    await ssoConnectorApi.cleanUp();
  });

  it('should find SSO connectors with an uppercase email domain', async () => {
    const client = await initClient();

    const connectorIds = await api
      .get('interaction/single-sign-on/connectors', {
        headers: { cookie: client.interactionCookie },
        searchParams: { email: generateEmail(domain.toUpperCase()) },
      })
      .json<string[]>();

    expect(connectorIds).toContain(ssoConnectorApi.firstConnectorId);
  });

  it('should not expose SSO connector configuration in the sso-only error response', async () => {
    const client = await initClient();

    const response = await api.put('interaction', {
      headers: { cookie: client.interactionCookie },
      json: {
        event: InteractionEvent.SignIn,
        identifier: {
          email: generateEmail(domain.toUpperCase()),
          password: generatePassword(),
        },
      },
      throwHttpErrors: false,
    });

    expect(response.status).toBe(422);

    const body: unknown = await response.json();
    expect(body).toMatchObject({ code: 'session.sso_enabled' });
    expect(body).not.toHaveProperty('data');
  });
});
