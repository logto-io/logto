import { conditional } from '@silverhand/essentials';
import ky from 'ky';

const buildSearchParameters = (record: Record<string, string | undefined>) => {
  const entries = Object.entries(record).filter((entry): entry is [string, string] =>
    Boolean(entry[0] && entry[1])
  );

  return conditional(entries.length > 0 && entries);
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
