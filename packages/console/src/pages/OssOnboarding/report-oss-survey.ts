import { type OssSurveyReportPayload } from '@logto/schemas';
import { type Optional, trySafe } from '@silverhand/essentials';

import { isDevFeaturesEnabled, ossSurveyEndpoint } from '@/consts/env';

const getOssSurveyUrl = (): Optional<URL> => {
  if (!isDevFeaturesEnabled) {
    return;
  }

  const endpointUrl = trySafe(() => (ossSurveyEndpoint ? new URL(ossSurveyEndpoint) : undefined));

  if (!endpointUrl) {
    return;
  }

  const basePathname = endpointUrl.pathname.endsWith('/')
    ? endpointUrl.pathname
    : `${endpointUrl.pathname}/`;
  const baseUrl = `${endpointUrl.origin}${basePathname}`;

  return new URL('api/surveys', baseUrl);
};

/**
 * Fire-and-forget: POST the onboarding questionnaire directly to the external
 * OSS survey service.  Gated on `isDevFeaturesEnabled` **and** a configured
 * `LOGTO_OSS_SURVEY_ENDPOINT`.
 */
export const reportOssSurvey = (payload: OssSurveyReportPayload): void => {
  const url = getOssSurveyUrl();

  if (!url) {
    return;
  }

  void trySafe(
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    })
  );
};
