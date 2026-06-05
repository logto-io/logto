import type { SignInExperience } from '@logto/schemas';
import { type KyInstance } from 'ky';

import { authedAdminApi } from './api.js';

export const getSignInExperience = async (api: KyInstance = authedAdminApi) =>
  api.get('sign-in-exp').json<SignInExperience>();

export const updateSignInExperience = async (
  signInExperience: Partial<SignInExperience>,
  api: KyInstance = authedAdminApi
) =>
  api
    .patch('sign-in-exp', {
      json: signInExperience,
    })
    .json<SignInExperience>();

export type UsernameCaseSensitivityConflicts = {
  totalConflicts: number;
  samples: Array<{ usernameLower: string; userIds: string[] }>;
};

export const getUsernameCaseSensitivityConflicts = async (
  limit = 20,
  api: KyInstance = authedAdminApi
) =>
  api
    .get('sign-in-exp/username-policy/case-sensitivity-conflicts', {
      searchParams: { limit },
    })
    .json<UsernameCaseSensitivityConflicts>();
