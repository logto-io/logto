import { SignInExperience } from '@logto/schemas';

import api from './api';

export const getWellKnownSignInExperience = (interactionCookie: string) =>
  api
    .get('.well-known/sign-in-exp', {
      headers: {
        cookie: interactionCookie,
      },
    })
    .json<SignInExperience>();
