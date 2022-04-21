import { useState, useMemo, createContext } from 'react';

import { SignInExperienceSettings } from '@/types';

type Context = {
  toast: string;
  loading: boolean;
  termsAgreement: boolean;
  showTermsModal: boolean;
  experienceSettings: SignInExperienceSettings | undefined;
  setToast: (message: string) => void;
  setLoading: (loading: boolean) => void;
  setTermsAgreement: (termsAgreement: boolean) => void;
  setShowTermsModal: (showTermsModal: boolean) => void;
  setExperienceSettings: (settings: SignInExperienceSettings) => void;
};

const NOOP = () => {
  throw new Error('Context provider not found');
};

export const PageContext = createContext<Context>({
  toast: '',
  loading: false,
  termsAgreement: false,
  showTermsModal: false,
  experienceSettings: undefined,
  setToast: NOOP,
  setLoading: NOOP,
  setTermsAgreement: NOOP,
  setShowTermsModal: NOOP,
  setExperienceSettings: NOOP,
});

const usePageContext = () => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [experienceSettings, setExperienceSettings] = useState<SignInExperienceSettings>();
  const [termsAgreement, setTermsAgreement] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const context = useMemo(
    () => ({
      toast,
      loading,
      termsAgreement,
      showTermsModal,
      experienceSettings,
      setLoading,
      setToast,
      setTermsAgreement,
      setShowTermsModal,
      setExperienceSettings,
    }),
    [experienceSettings, loading, showTermsModal, termsAgreement, toast]
  );

  return {
    context,
    Provider: PageContext.Provider,
  };
};

export default usePageContext;
