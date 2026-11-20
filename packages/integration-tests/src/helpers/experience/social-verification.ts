import { type ExperienceClient } from '#src/client/experience/index.js';

export const successfullyCreateSocialVerification = async (
  client: ExperienceClient,
  connectorId: string,
  payload: {
    redirectUri: string;
    state: string;
  }
) => {
  const { authorizationUri, verificationId } = await client.getSocialAuthorizationUri(
    connectorId,
    payload
  );

  expect(verificationId).toBeTruthy();
  expect(authorizationUri).toBeTruthy();

  return {
    verificationId,
    authorizationUri,
  };
};

export const successfullyVerifySocialAuthorization = async (
  client: ExperienceClient,
  connectorId: string,
  payload: {
    verificationId: string;
    connectorData: Record<string, unknown>;
  }
) => {
  const { verificationId: verifiedVerificationId } = await client.verifySocialAuthorization(
    connectorId,
    payload
  );

  expect(verifiedVerificationId).toBeTruthy();

  return verifiedVerificationId;
};

export const successfullyVerifySocialAccount = async (
  client: ExperienceClient,
  connectorId: string,
  connectorData: Record<string, unknown>
) => {
  const state = 'state';
  const redirectUri = 'http://localhost:3000';
  const { verificationId } = await successfullyCreateSocialVerification(client, connectorId, {
    redirectUri,
    state,
  });

  return successfullyVerifySocialAuthorization(client, connectorId, {
    verificationId,
    connectorData: { state, redirectUri, code: 'fake_code', ...connectorData },
  });
};
