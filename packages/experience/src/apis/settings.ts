/**
 * Used to get and general sign-in experience settings.
 * The API will be deprecated in the future once SSR is implemented.
 */

import type { Nullable, Optional } from '@silverhand/essentials';
import { conditional } from '@silverhand/essentials';
import ky from 'ky';

import type { SignInExperienceResponse } from '@/types';
import { searchKeys } from '@/utils/search-parameters';

const buildSearchParameters = (record: Record<string, Nullable<Optional<string>>>) => {
  const entries = Object.entries(record).filter((entry): entry is [string, string] =>
    Boolean(entry[0] && entry[1])
  );

  return conditional(entries.length > 0 && entries);
};

// A simple camelCase utility to prevent the need to add a dependency.
const camelCase = (string: string): string =>
  string.replaceAll(
    /_([^_])([^_]*)/g,
    (_, letter: string, rest: string) => letter.toUpperCase() + rest.toLowerCase()
  );

export const getSignInExperience = async <T extends SignInExperienceResponse>(): Promise<T> => {
  return ky
    .get('/api/.well-known/sign-in-exp', {
      searchParams: buildSearchParameters(
        Object.fromEntries(
          Object.values(searchKeys).map((key) => [camelCase(key), sessionStorage.getItem(key)])
        )
      ),
    })
    .json<T>();
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
    .get('/api/.well-known/phrases', {
      searchParams: buildSearchParameters({
        lng: language,
      }),
    });
