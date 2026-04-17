import type { OssSurveyReportPayload } from '@logto/schemas';
import ky from 'ky';

import { EnvSet } from '#src/env-set/index.js';

const requestTimeout = 3000;
const userAgent = 'Logto OSS (https://logto.io/)';

export const reportOssSurvey = (payload: OssSurveyReportPayload): void => {
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
