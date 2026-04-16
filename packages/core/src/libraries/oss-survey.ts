import { CompanySize, Project } from '@logto/schemas';
import ky from 'ky';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';

export const ossSurveyPayloadGuard = z.object({
  emailAddress: z.string().email().max(320),
  newsletter: z.boolean().optional(),
  project: z.nativeEnum(Project),
  companyName: z.string().max(200).optional(),
  companySize: z.nativeEnum(CompanySize).optional(),
});

export type OssSurveyPayload = z.infer<typeof ossSurveyPayloadGuard>;

const requestTimeout = 3000;
const userAgent = 'Logto (https://logto.io/)';

export const reportOssSurvey = (payload: OssSurveyPayload): void => {
  const { ossSurveyEndpoint } = EnvSet.values;

  if (!ossSurveyEndpoint) {
    return;
  }

  void (async () => {
    try {
      await ky.post(ossSurveyEndpoint, {
        headers: {
          'content-type': 'application/json',
          'user-agent': userAgent,
        },
        json: payload,
        retry: { limit: 0 },
        timeout: requestTimeout,
      });
    } catch {}
  })();
};
