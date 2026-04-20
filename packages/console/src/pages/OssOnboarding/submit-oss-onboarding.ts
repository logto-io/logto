import type { OssSurveyReportPayload, OssUserOnboardingData } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';

import { getOssOnboardingSubmitPayload, type OssOnboardingFormData } from './utils';

type SubmitOssOnboardingOptions = {
  formData: OssOnboardingFormData;
  navigate: (to: string, options: { replace: boolean }) => void;
  report?: (payload: OssSurveyReportPayload) => void;
  update: (data: Partial<OssUserOnboardingData>) => Promise<void>;
};

export const submitOssOnboarding = async ({
  formData,
  navigate,
  report,
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
  trySafe(() => report?.(questionnaire));

  navigate('/get-started', { replace: true });
};
