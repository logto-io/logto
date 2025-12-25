import AppBoundaryPageContext, {
  type PageContextType as ExperiencePageContextType,
} from '@experience/Providers/PageContextProvider/PageContext';
import type { Platform } from '@experience/types';
import { type ReactNode, useContext, useMemo, useState } from 'react';

import AccountPageContext from './PageContextProvider/PageContext';

type Props = {
  readonly children: ReactNode;
};

/**
 * Bridges account center's lightweight PageContext to the richer structure expected by the experience
 * package so shared components (AppBoundary) can consume consistent values.
 */
const ExperiencePageContextBridge = ({ children }: Props) => {
  const { theme, toast, setTheme, setToast, experienceSettings, setExperienceSettings } =
    useContext(AccountPageContext);
  const [loading, setLoading] = useState(false);
  const [platform, setPlatform] = useState<Platform>('web');
  const [termsAgreement, setTermsAgreement] = useState(false);

  const contextValue = useMemo<ExperiencePageContextType>(
    () => ({
      theme,
      toast,
      loading,
      platform,
      termsAgreement,
      experienceSettings,
      isPreview: false,
      setTheme,
      setToast,
      setLoading,
      setPlatform,
      setTermsAgreement,
      setExperienceSettings,
    }),
    [
      experienceSettings,
      loading,
      platform,
      setExperienceSettings,
      setLoading,
      setPlatform,
      setTheme,
      setTermsAgreement,
      setToast,
      termsAgreement,
      theme,
      toast,
    ]
  );

  return (
    <AppBoundaryPageContext.Provider value={contextValue}>
      {children}
    </AppBoundaryPageContext.Provider>
  );
};

export default ExperiencePageContextBridge;
