import { useState, useMemo, createContext } from 'react';
import { isMobile } from 'react-device-detect';

import { SignInExperienceSettings, Platform } from '@/types';

type Context = {
  toast: string;
  loading: boolean;
  platform: Platform;
  termsAgreement: boolean;
  showTermsModal: boolean;
  experienceSettings: SignInExperienceSettings | undefined;
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
  loading: false,
  platform: isMobile ? 'mobile' : 'web',
  termsAgreement: false,
  showTermsModal: false,
  experienceSettings: undefined,
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
  const [platform, setPlatform] = useState<Platform>(isMobile ? 'mobile' : 'web');
  const [experienceSettings, setExperienceSettings] = useState<SignInExperienceSettings>();
  const [termsAgreement, setTermsAgreement] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const context = useMemo(
    () => ({
      toast,
      loading,
      platform,
      termsAgreement,
      showTermsModal,
      experienceSettings,
      setLoading,
      setToast,
      setPlatform,
      setTermsAgreement,
      setShowTermsModal,
      setExperienceSettings,
    }),
    [experienceSettings, loading, platform, showTermsModal, termsAgreement, toast]
  );

  return {
    context,
    Provider: PageContext.Provider,
  };
};

export default usePageContext;
