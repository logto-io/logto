import { noop } from '@silverhand/essentials';
import { useState, useMemo, createContext } from 'react';
import { isMobile } from 'react-device-detect';

import type { SignInExperienceResponse, Platform, Theme } from '@/types';
import { parseQueryParameters } from '@/utils';

export type Context = {
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

export const PageContext = createContext<Context>({
  toast: '',
  theme: 'light',
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

const usePageContext = () => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [theme, setTheme] = useState<Theme>('light');
  const [platform, setPlatform] = useState<Platform>(isMobile ? 'mobile' : 'web');
  const [experienceSettings, setExperienceSettings] = useState<SignInExperienceResponse>();
  const [termsAgreement, setTermsAgreement] = useState(false);

  const { preview } = parseQueryParameters(window.location.search);
  const isPreview = preview === 'true';

  const context = useMemo(
    () => ({
      theme,
      toast,
      loading,
      platform,
      termsAgreement,
      experienceSettings,
      isPreview,
      setTheme,
      setLoading,
      setToast,
      setPlatform,
      setTermsAgreement,
      setExperienceSettings,
    }),
    [experienceSettings, isPreview, loading, platform, termsAgreement, theme, toast]
  );

  return {
    context,
    Provider: PageContext.Provider,
  };
};

export default usePageContext;
