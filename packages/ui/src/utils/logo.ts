import type { Branding } from '@logto/schemas';
import type { Nullable } from '@silverhand/essentials';

import type { Theme } from '@/types';

export type GetLogoUrl = {
  theme: Theme;
  logoUrl: string;
  darkLogoUrl?: Nullable<string>;
  isApple?: boolean;
};

export const getLogoUrl = ({ theme, logoUrl, darkLogoUrl, isApple }: GetLogoUrl) => {
  if (theme === (isApple ? 'light' : 'dark')) {
    return darkLogoUrl ?? logoUrl;
  }

  return logoUrl;
};

export type GetBrandingLogoUrl = {
  theme: Theme;
  branding: Branding;
  isDarkModeEnabled: boolean;
};

export const getBrandingLogoUrl = ({ theme, branding, isDarkModeEnabled }: GetBrandingLogoUrl) => {
  const { logoUrl, darkLogoUrl } = branding;

  if (!isDarkModeEnabled) {
    return logoUrl;
  }

  if (!logoUrl && !darkLogoUrl) {
    return null;
  }

  if (logoUrl && darkLogoUrl) {
    return getLogoUrl({ theme, logoUrl, darkLogoUrl });
  }

  return logoUrl ?? darkLogoUrl;
};
