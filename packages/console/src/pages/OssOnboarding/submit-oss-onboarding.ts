import type { OssSurveyReportPayload, OssUserOnboardingData } from '@logto/schemas';

import { getOssOnboardingSubmitPayload, type OssOnboardingFormData } from './utils';

type SubmitOssOnboardingOptions = {
  formData: OssOnboardingFormData;
  isDevFeaturesEnabled: boolean;
  navigate: (to: string, options: { replace: boolean }) => void;
  report?: (payload: OssSurveyReportPayload) => void;
  update: (data: Partial<OssUserOnboardingData>) => Promise<void>;
};

export const submitOssOnboarding = async ({
  formData,
  isDevFeaturesEnabled,
  navigate,
  report,
  update,
}: SubmitOssOnboardingOptions) => {
  const questionnaire = getOssOnboardingSubmitPayload(formData);

  if (isDevFeaturesEnabled) {
    report?.(questionnaire);
  }

  await update({
    questionnaire,
    isOnboardingDone: true,
  });

  navigate('/get-started', { replace: true });
};
