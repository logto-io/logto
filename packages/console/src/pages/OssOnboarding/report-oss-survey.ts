import { type OssSurveyReportPayload } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';

import { isDevFeaturesEnabled, ossSurveyEndpoint } from '@/consts/env';

/**
 * Fire-and-forget: POST the onboarding questionnaire directly to the external
 * OSS survey service.  Gated on `isDevFeaturesEnabled` **and** a configured
 * `LOGTO_OSS_SURVEY_ENDPOINT`.
 */
export const reportOssSurvey = (payload: OssSurveyReportPayload): void => {
  if (!isDevFeaturesEnabled || !ossSurveyEndpoint) {
    return;
  }

  const url = new URL('api/surveys', ossSurveyEndpoint.replace(/\/?$/, '/'));

  void trySafe(
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    })
  );
};
