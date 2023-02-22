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

type GetBrandingLogoUrl = Omit<GetLogoUrl, 'logoUrl'> & {
  logoUrl?: Nullable<string>;
};

export const getBrandingLogoUrl = ({
  theme,
  logoUrl,
  darkLogoUrl,
  isApple,
}: GetBrandingLogoUrl) => {
  if (!logoUrl && !darkLogoUrl) {
    return null;
  }

  if (logoUrl && darkLogoUrl) {
    return getLogoUrl({ theme, logoUrl, darkLogoUrl, isApple });
  }

  return logoUrl ?? darkLogoUrl;
};
