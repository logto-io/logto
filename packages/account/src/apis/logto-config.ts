import { type UserMfaData, type UserPasskeySignInData } from '@logto/schemas';

import { createAuthenticatedKy } from './base-ky';

export type UserLogtoConfigResponse = {
  mfa: {
    enabled?: boolean;
    skipped: boolean;
    skipMfaOnSignIn: boolean;
  };
  passkeySignIn: {
    skipped: boolean;
  };
};

export const getLogtoConfig = async (accessToken: string): Promise<UserLogtoConfigResponse> => {
  return createAuthenticatedKy(accessToken)
    .get('/api/my-account/logto-configs')
    .json<UserLogtoConfigResponse>();
};

export const updateLogtoConfig = async (
  accessToken: string,
  payload: { mfa?: UserMfaData; passkeySignIn?: UserPasskeySignInData }
): Promise<UserLogtoConfigResponse> => {
  return createAuthenticatedKy(accessToken)
    .patch('/api/my-account/logto-configs', {
      json: payload,
    })
    .json<UserLogtoConfigResponse>();
};
