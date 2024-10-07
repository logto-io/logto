import { Theme } from '@logto/schemas';
import { useState, useMemo } from 'react';
import { isMobile } from 'react-device-detect';
import { useSearchParams } from 'react-router-dom';

import type { SignInExperienceResponse, Platform } from '@/types';

import type { PageContextType } from './PageContext';
import MainContext from './PageContext';

type Props = {
  readonly children: React.ReactNode;
  readonly preset?: Partial<
    Pick<
      PageContextType,
      | 'theme'
      | 'toast'
      | 'loading'
      | 'platform'
      | 'termsAgreement'
      | 'experienceSettings'
      | 'isPreview'
    >
  >;
};

const PageContextProvider = ({ children, preset }: Props) => {
  const [searchParameters] = useSearchParams();

  const [loading, setLoading] = useState(preset?.loading ?? false);
  const [toast, setToast] = useState(preset?.toast ?? '');
  const [theme, setTheme] = useState<Theme>(preset?.theme ?? Theme.Light);

  const [platform, setPlatform] = useState<Platform>(
    preset?.platform ?? (isMobile ? 'mobile' : 'web')
  );
  const [termsAgreement, setTermsAgreement] = useState(preset?.termsAgreement ?? false);
  const [experienceSettings, setExperienceSettings] = useState<
    SignInExperienceResponse | undefined
  >(preset?.experienceSettings ?? undefined);

  const isPreview = searchParameters.get('preview') === 'true';

  const pageContext = useMemo<PageContextType>(
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

  return <MainContext.Provider value={pageContext}>{children}</MainContext.Provider>;
};

export default PageContextProvider;
