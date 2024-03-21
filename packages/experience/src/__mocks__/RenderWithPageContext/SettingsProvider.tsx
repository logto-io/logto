import type { ReactElement } from 'react';
import { useContext, useEffect } from 'react';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import type { SignInExperienceResponse } from '@/types';

import { mockSignInExperienceSettings } from '../logto';

type Props = {
  settings?: SignInExperienceResponse;
  children: ReactElement;
};

const SettingsProvider = ({ settings = mockSignInExperienceSettings, children }: Props) => {
  const { setExperienceSettings, experienceSettings } = useContext(PageContext);

  useEffect(() => {
    setExperienceSettings(settings);
  }, [setExperienceSettings, settings]);

  // Don't render children until the settings are set to avoid false positives
  if (!experienceSettings) {
    return null;
  }

  return children;
};

export default SettingsProvider;
