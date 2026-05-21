import { verificationRecordIdHeader } from './account';
import { createAuthenticatedKy } from './base-ky';

export const createSocialVerification = async (
  accessToken: string,
  payload: {
    connectorId: string;
    state: string;
    redirectUri: string;
    scope?: string;
  }
) => {
  return createAuthenticatedKy(accessToken)
    .post('/api/verifications/social', {
      json: payload,
    })
    .json<{
      verificationRecordId: string;
      authorizationUri: string;
      expiresAt: string;
    }>();
};

export const verifySocialVerification = async (
  accessToken: string,
  payload: {
    verificationRecordId: string;
    connectorData: Record<string, string>;
  }
) => {
  return createAuthenticatedKy(accessToken)
    .post('/api/verifications/social/verify', {
      json: payload,
    })
    .json<{
      verificationRecordId: string;
    }>();
};

export const linkSocialIdentity = async (
  accessToken: string,
  verificationRecordId: string,
  socialVerificationRecordId: string
) => {
  await createAuthenticatedKy(accessToken).post('/api/my-account/identities', {
    json: {
      newIdentifierVerificationRecordId: socialVerificationRecordId,
    },
    headers: {
      [verificationRecordIdHeader]: verificationRecordId,
    },
  });
};

export const deleteSocialIdentity = async (
  accessToken: string,
  verificationRecordId: string,
  target: string
) => {
  await createAuthenticatedKy(accessToken).delete(`/api/my-account/identities/${target}`, {
    headers: {
      [verificationRecordIdHeader]: verificationRecordId,
    },
  });
};

export const replaceSocialIdentity = async (
  accessToken: string,
  verificationRecordId: string,
  socialVerificationRecordId: string
): Promise<void> => {
  await createAuthenticatedKy(accessToken).put('/api/my-account/identities', {
    json: {
      newIdentifierVerificationRecordId: socialVerificationRecordId,
    },
    headers: {
      [verificationRecordIdHeader]: verificationRecordId,
    },
  });
};
