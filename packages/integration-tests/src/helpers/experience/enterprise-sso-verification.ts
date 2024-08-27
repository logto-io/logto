import { type ExperienceClient } from '#src/client/experience/index.js';

export const successFullyCreateEnterpriseSsoVerification = async (
  client: ExperienceClient,
  connectorId: string,
  payload: {
    redirectUri: string;
    state: string;
  }
) => {
  const { authorizationUri, verificationId } = await client.getEnterpriseSsoAuthorizationUri(
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

export const successFullyVerifyEnterpriseSsoAuthorization = async (
  client: ExperienceClient,
  connectorId: string,
  payload: {
    verificationId: string;
    connectorData: Record<string, unknown>;
  }
) => {
  const { verificationId: verifiedVerificationId } = await client.verifyEnterpriseSsoAuthorization(
    connectorId,
    payload
  );

  expect(verifiedVerificationId).toBeTruthy();

  return verifiedVerificationId;
};
