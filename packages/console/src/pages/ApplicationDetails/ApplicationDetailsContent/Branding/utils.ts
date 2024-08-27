import { type ApplicationSignInExperience } from '@logto/schemas';

import { removeFalsyValues } from '@/utils/object';

export type ApplicationSignInExperienceForm = ApplicationSignInExperience & {
  /**
   * Used to determine if the application enables branding for the app-level sign-in experience.
   * Only effective for non-third-party applications.
   */
  isBrandingEnabled: boolean;
};

/**
 * Format the form data to match the API request body
 * - Omit `applicationId` and `tenantId` from the request body
 * - Remove the empty `logoUrl` and `darkLogoUrl` fields in the `branding` object
 **/
export const formatFormToSubmitData = (
  data: ApplicationSignInExperienceForm
): Omit<ApplicationSignInExperience, 'applicationId' | 'tenantId'> => {
  const { branding, color, applicationId, tenantId, isBrandingEnabled, ...rest } = data;

  return {
    ...rest,
    ...(isBrandingEnabled
      ? { color, branding: removeFalsyValues(branding) }
      : { color: {}, branding: {} }),
  };
};
