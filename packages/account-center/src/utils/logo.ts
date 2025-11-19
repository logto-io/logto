import type { SignInExperienceResponse } from '@experience/shared/types';
import { Theme } from '@logto/schemas';

export const getBrandingLogoUrl = ({
  theme,
  branding,
  isDarkModeEnabled,
}: {
  theme: Theme;
  branding: SignInExperienceResponse['branding'];
  isDarkModeEnabled: boolean;
}) => {
  const { logoUrl, darkLogoUrl } = branding;

  if (!isDarkModeEnabled) {
    return logoUrl;
  }

  if (!logoUrl && !darkLogoUrl) {
    return null;
  }

  if (logoUrl && darkLogoUrl) {
    return theme === Theme.Dark ? darkLogoUrl : logoUrl;
  }

  return logoUrl ?? darkLogoUrl;
};
