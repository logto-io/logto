import type { SignInExperience } from '@logto/schemas';

import { authedAdminApi } from './api.js';

export const getSignInExperience = async () =>
  authedAdminApi.get('sign-in-exp').json<SignInExperience>();

export const updateSignInExperience = async (signInExperience: Partial<SignInExperience>) =>
  authedAdminApi
    .patch('sign-in-exp', {
      json: signInExperience,
    })
    .json<SignInExperience>();
