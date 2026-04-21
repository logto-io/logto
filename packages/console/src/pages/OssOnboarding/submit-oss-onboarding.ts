import type { OssSurveyReportPayload, OssUserOnboardingData } from '@logto/schemas';
import { type Optional, trySafe } from '@silverhand/essentials';
import ky from 'ky';

import { isDevFeaturesEnabled, ossSurveyEndpoint } from '@/consts/env';

import { getOssOnboardingSubmitPayload, type OssOnboardingFormData } from './utils';

const ossSurveyApi = ky.create({
  throwHttpErrors: false,
  retry: {
    limit: 1,
    methods: ['post'],
    statusCodes: [],
    afterStatusCodes: [],
    // `ky@1.x` treats `0` as "do not retry", so use the smallest practical delay
    // to retry immediately on transient network failures.
    delay: () => 1,
  },
});

const postOssSurvey = async (url: URL, payload: OssSurveyReportPayload) =>
  ossSurveyApi.post(url, {
    json: payload,
    // Keep the request eligible to continue while the page is unloading so the
    // best-effort survey report still has a chance to be delivered after submit.
    keepalive: true,
  });

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

  void trySafe(async () => postOssSurvey(url, payload));
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
