import {
  getSocialAuthorizationUri,
  verifySocialAuthorization,
} from '#src/api/experience-api/social-verification.js';
import type MockClient from '#src/client/index.js';

export const successFullyCreateSocialVerification = async (
  client: MockClient,
  connectorId: string,
  payload: {
    redirectUri: string;
    state: string;
  }
) => {
  const { authorizationUri, verificationId } = await client.send(
    getSocialAuthorizationUri,
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

export const successFullyVerifySocialAuthorization = async (
  client: MockClient,
  connectorId: string,
  payload: {
    verificationId: string;
    connectorData: Record<string, unknown>;
  }
) => {
  const { verificationId: verifiedVerificationId } = await client.send(
    verifySocialAuthorization,
    connectorId,
    payload
  );

  expect(verifiedVerificationId).toBeTruthy();

  return verifiedVerificationId;
};
