/**
 * API utilities for zero-knowledge secret management.
 * These functions handle communication with the backend for storing and retrieving encrypted secrets.
 */

import api from '@/apis/api';
import { experienceApiRoutes } from '@/apis/experience/const';

/**
 * Store the user's encrypted secret on the server.
 * This is called after the first successful login when no secret exists.
 */
export const storeUserEncryptedSecret = async (encryptedSecret: string): Promise<void> => {
  await api.put(`${experienceApiRoutes.prefix}/secret/user`, {
    json: { encryptedSecret },
  });
};

/**
 * Store the session's encrypted client secret.
 * This is called after encrypting the secret with the client app's public key.
 */
export const storeSessionEncryptedSecret = async (encryptedClientSecret: string): Promise<void> => {
  await api.put(`${experienceApiRoutes.prefix}/secret/session`, {
    json: { encryptedClientSecret },
  });
};

/**
 * Retrieve the session's encrypted client secret.
 * This is called by the client app after authentication to get its encrypted secret.
 */
export const getSessionEncryptedSecret = async (): Promise<{ encryptedClientSecret: string }> => {
  return api
    .get(`${experienceApiRoutes.prefix}/secret/session`)
    .json<{ encryptedClientSecret: string }>();
};
