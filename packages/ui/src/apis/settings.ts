/**
 * Used to get and general sign-in experience settings.
 * The API will be deprecated in the future once SSR is implemented.
 */

import { conditionalString } from '@silverhand/essentials';
import ky from 'ky';

import type { SignInExperienceResponse } from '@/types';

export const getSignInExperience = async <T extends SignInExperienceResponse>(): Promise<T> => {
  return ky.get('/api/.well-known/sign-in-exp').json<T>();
};

export const getPhrases = async ({
  localLanguage,
  language,
}: {
  localLanguage?: string;
  language?: string;
}) =>
  ky
    .extend({
      hooks: {
        beforeRequest: [
          (request) => {
            if (localLanguage) {
              request.headers.set('Accept-Language', localLanguage);
            }
          },
        ],
      },
    })
    .get(`/api/.well-known/phrases${conditionalString(language && `?lng=${language}`)}`);
