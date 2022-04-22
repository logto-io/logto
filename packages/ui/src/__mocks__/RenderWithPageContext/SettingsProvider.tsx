import { useContext, useEffect, ReactElement } from 'react';

import { PageContext } from '@/hooks/use-page-context';
import { SignInExperienceSettings } from '@/types';

import { mockSignInExperienceSettings } from '../logto';

type Props = {
  settings?: SignInExperienceSettings;
  children: ReactElement;
};

const SettingsProvider = ({ settings = mockSignInExperienceSettings, children }: Props) => {
  const { setExperienceSettings } = useContext(PageContext);

  useEffect(() => {
    setExperienceSettings(settings);
  }, [setExperienceSettings, settings]);

  return children;
};

export default SettingsProvider;
