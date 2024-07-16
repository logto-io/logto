import { type ExperienceClient } from '#src/client/experience/index.js';

export const successFullyCreateSocialVerification = async (
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

export const successFullyVerifySocialAuthorization = async (
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
