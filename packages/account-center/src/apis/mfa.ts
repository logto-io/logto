import {
  type UserMfaVerificationResponse,
  MfaFactor,
  type WebAuthnRegistrationOptions,
  type BindWebAuthnPayload,
} from '@logto/schemas';

import { verificationRecordIdHeader } from './account';
import { createAuthenticatedKy } from './base-ky';

export type TotpSecretResponse = {
  secret: string;
};

export type BackupCodesResponse = {
  codes: string[];
};

export type BackupCodeItem = {
  code: string;
  usedAt?: string;
};

export type BackupCodesListResponse = {
  codes: BackupCodeItem[];
};

export const getMfaVerifications = async (
  accessToken: string
): Promise<UserMfaVerificationResponse> => {
  return createAuthenticatedKy(accessToken)
    .get('/api/my-account/mfa-verifications')
    .json<UserMfaVerificationResponse>();
};

export const generateTotpSecret = async (accessToken: string): Promise<TotpSecretResponse> => {
  return createAuthenticatedKy(accessToken)
    .post('/api/my-account/mfa-verifications/totp-secret/generate')
    .json<TotpSecretResponse>();
};

export const generateBackupCodes = async (accessToken: string): Promise<BackupCodesResponse> => {
  return createAuthenticatedKy(accessToken)
    .post('/api/my-account/mfa-verifications/backup-codes/generate')
    .json<BackupCodesResponse>();
};

export const getBackupCodesList = async (
  accessToken: string,
  verificationRecordId: string
): Promise<BackupCodesListResponse> => {
  return createAuthenticatedKy(accessToken)
    .get('/api/my-account/mfa-verifications/backup-codes', {
      headers: { [verificationRecordIdHeader]: verificationRecordId },
    })
    .json<BackupCodesListResponse>();
};

export const addTotpMfa = async (
  accessToken: string,
  verificationRecordId: string,
  payload: { secret: string; code?: string }
) => {
  await createAuthenticatedKy(accessToken).post('/api/my-account/mfa-verifications', {
    json: { type: MfaFactor.TOTP, ...payload },
    headers: { [verificationRecordIdHeader]: verificationRecordId },
  });
};

export const addBackupCodeMfa = async (
  accessToken: string,
  verificationRecordId: string,
  payload: { codes: string[] }
) => {
  await createAuthenticatedKy(accessToken).post('/api/my-account/mfa-verifications', {
    json: { type: MfaFactor.BackupCode, ...payload },
    headers: { [verificationRecordIdHeader]: verificationRecordId },
  });
};

export const deleteMfaVerification = async (
  accessToken: string,
  verificationRecordId: string,
  mfaVerificationId: string
): Promise<void> => {
  await createAuthenticatedKy(accessToken).delete(
    `/api/my-account/mfa-verifications/${mfaVerificationId}`,
    {
      headers: { [verificationRecordIdHeader]: verificationRecordId },
    }
  );
};

export type WebAuthnRegistrationResponse = {
  verificationRecordId: string;
  registrationOptions: WebAuthnRegistrationOptions;
  expiresAt: string;
};

export const createWebAuthnRegistration = async (
  accessToken: string
): Promise<WebAuthnRegistrationResponse> => {
  return createAuthenticatedKy(accessToken)
    .post('/api/verifications/web-authn/registration')
    .json<WebAuthnRegistrationResponse>();
};

export const verifyWebAuthnRegistration = async (
  accessToken: string,
  verificationRecordId: string,
  payload: BindWebAuthnPayload
): Promise<{ verificationRecordId: string }> => {
  return createAuthenticatedKy(accessToken)
    .post('/api/verifications/web-authn/registration/verify', {
      json: { verificationRecordId, payload },
    })
    .json<{ verificationRecordId: string }>();
};

export const addWebAuthnMfa = async (
  accessToken: string,
  verificationRecordId: string,
  payload: { newIdentifierVerificationRecordId: string; name?: string }
) => {
  await createAuthenticatedKy(accessToken).post('/api/my-account/mfa-verifications', {
    json: { type: MfaFactor.WebAuthn, ...payload },
    headers: { [verificationRecordIdHeader]: verificationRecordId },
  });
};

export const updateWebAuthnName = async (
  accessToken: string,
  verificationRecordId: string,
  mfaVerificationId: string,
  name: string
) => {
  await createAuthenticatedKy(accessToken).patch(
    `/api/my-account/mfa-verifications/${mfaVerificationId}/name`,
    {
      json: { name },
      headers: { [verificationRecordIdHeader]: verificationRecordId },
    }
  );
};
