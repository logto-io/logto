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
  const updateError = await update({
    questionnaire,
    isOnboardingDone: true,
  }).catch((error: unknown) => error);

  // Intentionally decoupled: survey reporting is best-effort telemetry and should not
  // depend on whether onboarding customData persistence succeeds.
  // The report function itself gates on isDevFeaturesEnabled and endpoint availability.
  trySafe(() => report?.(questionnaire));

  if (updateError !== undefined) {
    throw updateError instanceof Error ? updateError : new Error(String(updateError));
  }

  navigate('/get-started', { replace: true });
};
