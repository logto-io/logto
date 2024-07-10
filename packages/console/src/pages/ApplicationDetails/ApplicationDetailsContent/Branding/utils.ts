import { type ApplicationSignInExperience } from '@logto/schemas';

import { removeFalsyValues } from '@/utils/object';

/**
 * Format the form data to match the API request body
 * - Omit `applicationId` and `tenantId` from the request body
 * - Remove the empty `logoUrl` and `darkLogoUrl` fields in the `branding` object
 **/
export const formatFormToSubmitData = (
  data: ApplicationSignInExperience
): Omit<ApplicationSignInExperience, 'applicationId' | 'tenantId'> => {
  const { branding, applicationId, tenantId, ...rest } = data;

  return {
    ...rest,
    branding: removeFalsyValues(branding),
  };
};
