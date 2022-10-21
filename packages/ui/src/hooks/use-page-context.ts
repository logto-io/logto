import { useState, useMemo, createContext } from 'react';
import { isMobile } from 'react-device-detect';

import type { SignInExperienceSettings, Platform, Theme } from '@/types';

export type Context = {
  theme: Theme;
  toast: string;
  loading: boolean;
  platform: Platform;
  termsAgreement: boolean;
  experienceSettings: SignInExperienceSettings | undefined;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  setToast: React.Dispatch<React.SetStateAction<string>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setPlatform: React.Dispatch<React.SetStateAction<Platform>>;
  setTermsAgreement: React.Dispatch<React.SetStateAction<boolean>>;
  setExperienceSettings: React.Dispatch<React.SetStateAction<SignInExperienceSettings | undefined>>;
};

const noop = () => {
  throw new Error('Context provider not found');
};

export const PageContext = createContext<Context>({
  toast: '',
  theme: 'light',
  loading: false,
  platform: isMobile ? 'mobile' : 'web',
  termsAgreement: false,
  experienceSettings: undefined,
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
  const [experienceSettings, setExperienceSettings] = useState<SignInExperienceSettings>();
  const [termsAgreement, setTermsAgreement] = useState(false);

  const context = useMemo(
    () => ({
      theme,
      toast,
      loading,
      platform,
      termsAgreement,
      experienceSettings,
      setTheme,
      setLoading,
      setToast,
      setPlatform,
      setTermsAgreement,
      setExperienceSettings,
    }),
    [experienceSettings, loading, platform, termsAgreement, theme, toast]
  );

  return {
    context,
    Provider: PageContext.Provider,
  };
};

export default usePageContext;
