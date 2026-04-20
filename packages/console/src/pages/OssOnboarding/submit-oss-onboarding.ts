import type { OssSurveyReportPayload, OssUserOnboardingData } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';

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

  try {
    await update({
      questionnaire,
      isOnboardingDone: true,
    });
  } finally {
    // Intentionally decoupled: survey reporting is best-effort telemetry and should not
    // depend on whether onboarding customData persistence succeeds.
    if (isDevFeaturesEnabled) {
      trySafe(() => report?.(questionnaire));
    }
  }

  navigate('/get-started', { replace: true });
};
