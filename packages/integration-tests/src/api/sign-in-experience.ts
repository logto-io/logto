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
