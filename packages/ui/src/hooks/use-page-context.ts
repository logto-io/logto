import { useState, useMemo, createContext } from 'react';
import { isMobile } from 'react-device-detect';

import { SignInExperienceSettings, Platform, Theme } from '@/types';

type Context = {
  theme: Theme;
  toast: string;
  loading: boolean;
  platform: Platform;
  termsAgreement: boolean;
  showTermsModal: boolean;
  experienceSettings: SignInExperienceSettings | undefined;
  setTheme: (theme: Theme) => void;
  setToast: (message: string) => void;
  setLoading: (loading: boolean) => void;
  setPlatform: (platform: Platform) => void;
  setTermsAgreement: (termsAgreement: boolean) => void;
  setShowTermsModal: (showTermsModal: boolean) => void;
  setExperienceSettings: (settings: SignInExperienceSettings) => void;
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
  showTermsModal: false,
  experienceSettings: undefined,
  setTheme: noop,
  setToast: noop,
  setLoading: noop,
  setPlatform: noop,
  setTermsAgreement: noop,
  setShowTermsModal: noop,
  setExperienceSettings: noop,
});

const usePageContext = () => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [theme, setTheme] = useState<Theme>('light');
  const [platform, setPlatform] = useState<Platform>(isMobile ? 'mobile' : 'web');
  const [experienceSettings, setExperienceSettings] = useState<SignInExperienceSettings>();
  const [termsAgreement, setTermsAgreement] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const context = useMemo(
    () => ({
      theme,
      toast,
      loading,
      platform,
      termsAgreement,
      showTermsModal,
      experienceSettings,
      setTheme,
      setLoading,
      setToast,
      setPlatform,
      setTermsAgreement,
      setShowTermsModal,
      setExperienceSettings,
    }),
    [experienceSettings, loading, platform, showTermsModal, termsAgreement, theme, toast]
  );

  return {
    context,
    Provider: PageContext.Provider,
  };
};

export default usePageContext;
