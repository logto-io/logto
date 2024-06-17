import { InteractionEvent } from '@logto/schemas';

import {
  getSsoAuthorizationUrl,
  postSsoAuthentication,
  postSsoRegistration,
} from '#src/api/interaction-sso.js';
import { putInteractionEvent } from '#src/api/interaction.js';

import { putInteraction } from './admin-tenant.js';
import { initClient, logoutClient, processSession } from './client.js';
import { expectRejects } from './index.js';

export type MockOidcSsoConnectorIdTokenProfileStandardClaims = {
  sub: string;
  name?: string;
  picture?: string;
  email?: string;
  email_verified?: boolean;
  phone?: string;
  phone_verified?: boolean;
};

export const registerNewUserWithSso = async (
  connectorId: string,
  params: {
    authData: MockOidcSsoConnectorIdTokenProfileStandardClaims;
  }
) => {
  const state = 'foo_state';
  const redirectUri = 'http://foo.dev/callback';

  const { authData } = params;
  const client = await initClient();

  await client.successSend(putInteraction, {
    event: InteractionEvent.SignIn,
  });

  const response = await client.send(getSsoAuthorizationUrl, {
    connectorId,
    state,
    redirectUri,
  });

  expect(response.redirectTo).not.toBeUndefined();
  expect(response.redirectTo.indexOf(state)).not.toBe(-1);

  await expectRejects(
    client.send(postSsoAuthentication, {
      connectorId,
      data: authData,
    }),
    {
      code: 'user.identity_not_exist',
      status: 422,
    }
  );

  await client.successSend(putInteractionEvent, { event: InteractionEvent.Register });

  const { redirectTo } = await client.send(postSsoRegistration, connectorId);

  const userId = await processSession(client, redirectTo);
  await logoutClient(client);

  return userId;
};

export const signInWithSso = async (
  connectorId: string,
  params: {
    authData: MockOidcSsoConnectorIdTokenProfileStandardClaims;
  }
) => {
  const state = 'foo_state';
  const redirectUri = 'http://foo.dev/callback';

  const { authData } = params;
  const client = await initClient();

  await client.successSend(putInteraction, {
    event: InteractionEvent.SignIn,
  });

  const response = await client.send(getSsoAuthorizationUrl, {
    connectorId,
    state,
    redirectUri,
  });

  expect(response.redirectTo).not.toBeUndefined();
  expect(response.redirectTo.indexOf(state)).not.toBe(-1);

  const { redirectTo } = await client.send(postSsoAuthentication, {
    connectorId,
    data: authData,
  });

  const userId = await processSession(client, redirectTo);
  await logoutClient(client);

  return userId;
};
