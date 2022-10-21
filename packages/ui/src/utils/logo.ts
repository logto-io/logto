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
