import type { OssSurveyReportPayload, OssUserOnboardingData } from '@logto/schemas';
import { type Optional, trySafe } from '@silverhand/essentials';

import { isDevFeaturesEnabled, ossSurveyEndpoint } from '@/consts/env';

import { getOssOnboardingSubmitPayload, type OssOnboardingFormData } from './utils';

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

const reportOssSurvey = (payload: OssSurveyReportPayload): void => {
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

type SubmitOssOnboardingOptions = {
  formData: OssOnboardingFormData;
  navigate: (to: string, options: { replace: boolean }) => void;
  update: (data: Partial<OssUserOnboardingData>) => Promise<void>;
};

export const submitOssOnboarding = async ({
  formData,
  navigate,
  update,
}: SubmitOssOnboardingOptions) => {
  const questionnaire = getOssOnboardingSubmitPayload(formData);
  void trySafe(async () =>
    update({
      questionnaire,
      isOnboardingDone: true,
    })
  );

  // Intentionally decoupled: survey reporting and onboarding customData persistence
  // are both best-effort side effects for one-time data collection.
  reportOssSurvey(questionnaire);

  navigate('/get-started', { replace: true });
};
