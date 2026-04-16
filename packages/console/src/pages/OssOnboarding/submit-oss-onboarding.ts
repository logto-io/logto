import type { OssQuestionnaire, OssUserOnboardingData } from '@logto/schemas';

import { reportOssSurvey } from './report-oss-survey';
import { getOssOnboardingSubmitPayload, type OssOnboardingFormData } from './utils';

type SubmitOssOnboardingOptions = {
  formData: OssOnboardingFormData;
  navigate: (to: string, options: { replace: boolean }) => void;
  report?: (payload: OssQuestionnaire) => void;
  update: (data: Partial<OssUserOnboardingData>) => Promise<void>;
};

export const submitOssOnboarding = async ({
  formData,
  navigate,
  report = reportOssSurvey,
  update,
}: SubmitOssOnboardingOptions) => {
  const questionnaire = getOssOnboardingSubmitPayload(formData);

  report(questionnaire);

  await update({
    questionnaire,
    isOnboardingDone: true,
  });

  navigate('/get-started', { replace: true });
};
