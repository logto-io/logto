import {
  type UserMfaVerificationResponse,
  type UserMfaSettingsResponse,
  MfaFactor,
  type WebAuthnRegistrationOptions,
  type BindWebAuthnPayload,
} from '@logto/schemas';

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

export const getBackupCodesList = async (accessToken: string): Promise<BackupCodesListResponse> => {
  return createAuthenticatedKy(accessToken)
    .get('/api/my-account/mfa-verifications/backup-codes')
    .json<BackupCodesListResponse>();
};

export const addTotpMfa = async (
  accessToken: string,
  payload: { secret: string; code?: string }
) => {
  await createAuthenticatedKy(accessToken).post('/api/my-account/mfa-verifications', {
    json: { type: MfaFactor.TOTP, ...payload },
  });
};

export const createOrReplaceTotpMfa = async (
  accessToken: string,
  payload: { secret: string; code: string }
) => {
  await createAuthenticatedKy(accessToken).put('/api/my-account/mfa-verifications/totp', {
    json: payload,
  });
};

export const addBackupCodeMfa = async (accessToken: string, payload: { codes: string[] }) => {
  await createAuthenticatedKy(accessToken).post('/api/my-account/mfa-verifications', {
    json: { type: MfaFactor.BackupCode, ...payload },
  });
};

export const deleteMfaVerification = async (
  accessToken: string,
  mfaVerificationId: string
): Promise<void> => {
  await createAuthenticatedKy(accessToken).delete(
    `/api/my-account/mfa-verifications/${mfaVerificationId}`
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
  payload: { newIdentifierVerificationRecordId: string; name?: string }
) => {
  await createAuthenticatedKy(accessToken).post('/api/my-account/mfa-verifications', {
    json: { type: MfaFactor.WebAuthn, ...payload },
  });
};

export const updateWebAuthnName = async (
  accessToken: string,
  mfaVerificationId: string,
  name: string
) => {
  await createAuthenticatedKy(accessToken).patch(
    `/api/my-account/mfa-verifications/${mfaVerificationId}/name`,
    {
      json: { name },
    }
  );
};

export const getMfaSettings = async (accessToken: string): Promise<UserMfaSettingsResponse> => {
  return createAuthenticatedKy(accessToken)
    .get('/api/my-account/mfa-settings')
    .json<UserMfaSettingsResponse>();
};

export const updateMfaSettings = async (
  accessToken: string,
  payload: { skipMfaOnSignIn: boolean }
): Promise<UserMfaSettingsResponse> => {
  return createAuthenticatedKy(accessToken)
    .patch('/api/my-account/mfa-settings', {
      json: payload,
    })
    .json<UserMfaSettingsResponse>();
};
