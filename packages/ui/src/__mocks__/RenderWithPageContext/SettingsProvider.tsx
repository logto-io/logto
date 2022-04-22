import { useContext, useEffect, ReactElement } from 'react';

import { PageContext } from '@/hooks/use-page-context';
import { SignInExperienceSettings } from '@/types';

type Props = {
  settings: SignInExperienceSettings;
  children: ReactElement;
};

const SettingsProvider = ({ settings, children }: Props) => {
  const { setExperienceSettings } = useContext(PageContext);

  useEffect(() => {
    setExperienceSettings(settings);
  }, [setExperienceSettings, settings]);

  return children;
};

export default SettingsProvider;
