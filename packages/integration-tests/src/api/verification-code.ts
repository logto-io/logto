import type { RequestVerificationCodePayload, VerifyVerificationCodePayload } from '@logto/schemas';

import { authedAdminApi } from './api.js';

export const requestVerificationCode = (payload: RequestVerificationCodePayload) =>
  authedAdminApi.post('verification-codes', { json: payload });

export const verifyVerificationCode = (payload: VerifyVerificationCodePayload) =>
  authedAdminApi.post('verification-codes/verify', { json: payload });
