import {
  type GetThirdPartyAccessTokenResponse,
  type UserMfaVerificationResponse,
  type UserProfileResponse,
} from '@logto/schemas';
import { type KyInstance } from 'ky';

const verificationRecordIdHeader = 'logto-verification-id';

export const updatePassword = async (
  api: KyInstance,
  verificationRecordId: string,
  password: string
) =>
  api.post('api/my-account/password', {
    json: { password },
    headers: { [verificationRecordIdHeader]: verificationRecordId },
  });

export const updatePrimaryEmail = async (
  api: KyInstance,
  email: string,
  verificationRecordId: string,
  newIdentifierVerificationRecordId: string
) =>
  api.post('api/my-account/primary-email', {
    json: { email, newIdentifierVerificationRecordId },
    headers: { [verificationRecordIdHeader]: verificationRecordId },
  });

export const deletePrimaryEmail = async (api: KyInstance, verificationRecordId: string) =>
  api.delete('api/my-account/primary-email', {
    headers: { [verificationRecordIdHeader]: verificationRecordId },
  });

export const updatePrimaryPhone = async (
  api: KyInstance,
  phone: string,
  verificationRecordId: string,
  newIdentifierVerificationRecordId: string
) =>
  api.post('api/my-account/primary-phone', {
    json: { phone, newIdentifierVerificationRecordId },
    headers: { [verificationRecordIdHeader]: verificationRecordId },
  });

export const deletePrimaryPhone = async (api: KyInstance, verificationRecordId: string) =>
  api.delete('api/my-account/primary-phone', {
    headers: { [verificationRecordIdHeader]: verificationRecordId },
  });

export const updateIdentities = async (
  api: KyInstance,
  verificationRecordId: string,
  newIdentifierVerificationRecordId: string
) =>
  api.post('api/my-account/identities', {
    json: { newIdentifierVerificationRecordId },
    headers: { [verificationRecordIdHeader]: verificationRecordId },
  });

export const deleteIdentity = async (
  api: KyInstance,
  target: string,
  verificationRecordId: string
) =>
  api.delete(`api/my-account/identities/${target}`, {
    headers: { [verificationRecordIdHeader]: verificationRecordId },
  });

export const updateUser = async (api: KyInstance, body: Record<string, unknown>) =>
  api.patch('api/my-account', { json: body }).json<Partial<UserProfileResponse>>();

export const updateOtherProfile = async (api: KyInstance, body: Record<string, unknown>) =>
  api
    .patch('api/my-account/profile', { json: body })
    .json<Partial<UserProfileResponse['profile']>>();

export const getUserInfo = async (api: KyInstance) =>
  api.get('api/my-account').json<Partial<UserProfileResponse>>();

export const generateTotpSecret = async (api: KyInstance) =>
  api.post('api/my-account/mfa-verifications/totp-secret/generate').json<{ secret: string }>();

export const generateBackupCodes = async (api: KyInstance) =>
  api.post('api/my-account/mfa-verifications/backup-codes/generate').json<{ codes: string[] }>();

export const getBackupCodes = async (api: KyInstance, verificationRecordId: string) =>
  api
    .get('api/my-account/mfa-verifications/backup-codes', {
      headers: { [verificationRecordIdHeader]: verificationRecordId },
    })
    .json<{ codes: Array<{ code: string; usedAt?: string }> }>();

export const getMfaVerifications = async (api: KyInstance) =>
  api.get('api/my-account/mfa-verifications').json<UserMfaVerificationResponse>();

export const addMfaVerification = async (
  api: KyInstance,
  verificationRecordId: string,
  body: Record<string, unknown>
) =>
  api.post('api/my-account/mfa-verifications', {
    json: body,
    headers: { [verificationRecordIdHeader]: verificationRecordId },
  });

export const deleteMfaVerification = async (
  api: KyInstance,
  verificationId: string,
  verificationRecordId: string
) =>
  api.delete(`api/my-account/mfa-verifications/${verificationId}`, {
    headers: { [verificationRecordIdHeader]: verificationRecordId },
  });

export const getMfaSettings = async (api: KyInstance) =>
  api.get('api/my-account/mfa-settings').json<{ skipMfaOnSignIn: boolean }>();

export const updateMfaSettings = async (
  api: KyInstance,
  verificationRecordId: string,
  skipMfaOnSignIn: boolean
) =>
  api
    .patch('api/my-account/mfa-settings', {
      json: { skipMfaOnSignIn },
      headers: { [verificationRecordIdHeader]: verificationRecordId },
    })
    .json<{ skipMfaOnSignIn: boolean }>();

export const getMyLogtoConfig = async (api: KyInstance) =>
  api.get('api/my-account/logto-configs').json<{ mfa: { skipped: boolean } }>();

export const updateMyLogtoConfig = async (
  api: KyInstance,
  logtoConfig: { mfa: { skipped: boolean } }
) =>
  api
    .patch('api/my-account/logto-configs', {
      json: logtoConfig,
    })
    .json<{ mfa: { skipped: boolean } }>();

export const getSocialAccessToken = async (api: KyInstance, target: string) => {
  return api
    .get(`api/my-account/identities/${target}/access-token`)
    .json<GetThirdPartyAccessTokenResponse>();
};

export const updateSocialAccessToken = async (
  api: KyInstance,
  target: string,
  verificationRecordId: string
) =>
  api
    .put(`api/my-account/identities/${target}/access-token`, {
      json: { verificationRecordId },
    })
    .json<GetThirdPartyAccessTokenResponse>();
