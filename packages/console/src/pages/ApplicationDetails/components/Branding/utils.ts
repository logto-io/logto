import { type ApplicationSignInExperience } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

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
    branding: {
      ...conditional(branding.logoUrl && { logoUrl: branding.logoUrl }),
      ...conditional(branding.darkLogoUrl && { darkLogoUrl: branding.darkLogoUrl }),
    },
  };
};

/**
 * Format the response data to match the form data
 *
 * Fulfill the branding object with empty string if the `logoUrl` or `darkLogoUrl` is not set.
 * Otherwise, the RHF won't update the branding fields properly with the undefined value.
 */
export const formatResponseDataToForm = (
  data: ApplicationSignInExperience
): ApplicationSignInExperience => {
  const { branding, ...rest } = data;

  return {
    ...rest,
    branding: {
      logoUrl: branding.logoUrl ?? '',
      darkLogoUrl: branding.darkLogoUrl ?? '',
    },
  };
};
