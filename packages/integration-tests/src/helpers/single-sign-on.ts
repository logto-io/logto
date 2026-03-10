import { InteractionEvent } from '@logto/schemas';

import { initExperienceClient, logoutClient, processSession } from './client.js';
import {
  successfullyCreateEnterpriseSsoVerification,
  successfullyVerifyEnterpriseSsoAuthorization,
} from './experience/enterprise-sso-verification.js';
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
  const client = await initExperienceClient();

  const { verificationId } = await successfullyCreateEnterpriseSsoVerification(
    client,
    connectorId,
    {
      redirectUri,
      state,
    }
  );

  await successfullyVerifyEnterpriseSsoAuthorization(client, connectorId, {
    verificationId,
    connectorData: authData,
  });

  await expectRejects(client.identifyUser({ verificationId }), {
    code: 'user.sso_identity_not_exist',
    status: 404,
  });

  await client.updateInteractionEvent({ interactionEvent: InteractionEvent.Register });
  await client.identifyUser({ verificationId });

  const { redirectTo } = await client.submitInteraction();

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
  const client = await initExperienceClient();

  const { verificationId } = await successfullyCreateEnterpriseSsoVerification(
    client,
    connectorId,
    {
      redirectUri,
      state,
    }
  );

  await successfullyVerifyEnterpriseSsoAuthorization(client, connectorId, {
    verificationId,
    connectorData: authData,
  });

  await client.identifyUser({ verificationId });

  const { redirectTo } = await client.submitInteraction();

  const userId = await processSession(client, redirectTo);
  await logoutClient(client);

  return userId;
};
