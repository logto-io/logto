import type { ReactElement } from 'react';
import { useContext, useEffect } from 'react';

import { PageContext } from '@/hooks/use-page-context';
import type { SignInExperienceSettings } from '@/types';

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
