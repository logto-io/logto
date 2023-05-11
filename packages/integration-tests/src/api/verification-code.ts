import type { VerifyVerificationCodePayload } from '@logto/schemas';

import { authedAdminApi } from './api.js';

export const requestVerificationCode = async (payload: unknown) =>
  authedAdminApi.post('verification-codes', { json: payload });

export const verifyVerificationCode = async (payload: VerifyVerificationCodePayload) =>
  authedAdminApi.post('verification-codes/verify', { json: payload });
