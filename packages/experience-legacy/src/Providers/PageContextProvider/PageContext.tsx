import { Theme } from '@logto/schemas';
import { noop } from '@silverhand/essentials';
import { createContext } from 'react';
import { isMobile } from 'react-device-detect';

import type { SignInExperienceResponse, Platform } from '@/types';

export type PageContextType = {
  theme: Theme;
  toast: string;
  loading: boolean;
  platform: Platform;
  termsAgreement: boolean;
  experienceSettings: SignInExperienceResponse | undefined;
  isPreview: boolean;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  setToast: React.Dispatch<React.SetStateAction<string>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setPlatform: React.Dispatch<React.SetStateAction<Platform>>;
  setTermsAgreement: React.Dispatch<React.SetStateAction<boolean>>;
  setExperienceSettings: React.Dispatch<React.SetStateAction<SignInExperienceResponse | undefined>>;
};

export default createContext<PageContextType>({
  toast: '',
  theme: Theme.Light,
  loading: false,
  platform: isMobile ? 'mobile' : 'web',
  termsAgreement: false,
  experienceSettings: undefined,
  isPreview: false,
  setTheme: noop,
  setToast: noop,
  setLoading: noop,
  setPlatform: noop,
  setTermsAgreement: noop,
  setExperienceSettings: noop,
});
