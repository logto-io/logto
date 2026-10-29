import type { JsonObject, UserProfile } from '@logto/schemas';
import type { Nullable } from '@silverhand/essentials';

import { createAuthenticatedKy } from './base-ky';

export const updatePrimaryEmail = async (
  accessToken: string,
  payload: { email: string; newIdentifierVerificationRecordId: string }
) => {
  await createAuthenticatedKy(accessToken).post('/api/my-account/primary-email', {
    json: payload,
  });
};

export const updatePrimaryPhone = async (
  accessToken: string,
  payload: { phone: string; newIdentifierVerificationRecordId: string }
) => {
  await createAuthenticatedKy(accessToken).post('/api/my-account/primary-phone', {
    json: payload,
  });
};

export const updateUsername = async (accessToken: string, payload: { username: string }) => {
  await createAuthenticatedKy(accessToken).patch('/api/my-account', {
    json: payload,
  });
};

export const deleteUsername = async (accessToken: string) => {
  await createAuthenticatedKy(accessToken).patch('/api/my-account', {
    json: { username: null },
  });
};

export const updateName = async (accessToken: string, payload: { name: Nullable<string> }) => {
  await createAuthenticatedKy(accessToken).patch('/api/my-account', {
    json: payload,
  });
};

export const updateAvatar = async (accessToken: string, payload: { avatar: Nullable<string> }) => {
  await createAuthenticatedKy(accessToken).patch('/api/my-account', {
    json: payload,
  });
};

export const updateProfile = async (accessToken: string, payload: UserProfile) => {
  await createAuthenticatedKy(accessToken).patch('/api/my-account/profile', {
    json: payload,
  });
};

export const updateCustomData = async (accessToken: string, payload: JsonObject) => {
  await createAuthenticatedKy(accessToken).patch('/api/my-account', {
    json: { customData: payload },
  });
};

export const deletePrimaryEmail = async (accessToken: string) => {
  await createAuthenticatedKy(accessToken).delete('/api/my-account/primary-email');
};

export const deletePrimaryPhone = async (accessToken: string) => {
  await createAuthenticatedKy(accessToken).delete('/api/my-account/primary-phone');
};

export const updatePassword = async (accessToken: string, payload: { password: string }) => {
  await createAuthenticatedKy(accessToken).post('/api/my-account/password', {
    json: payload,
  });
};
