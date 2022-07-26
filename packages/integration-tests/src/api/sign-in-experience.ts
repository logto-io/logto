import { SignInExperience } from '@logto/schemas';

import { authedAdminApi } from '@/api/api';

export const getSignInExperience = () => authedAdminApi.get('sign-in-exp').json<SignInExperience>();

export const updateSignInExperience = (signInExperience: Partial<SignInExperience>) =>
  authedAdminApi
    .patch('sign-in-exp', {
      json: signInExperience,
    })
    .json<SignInExperience>();
