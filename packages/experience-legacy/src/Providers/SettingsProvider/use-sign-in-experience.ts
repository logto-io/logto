import { useContext, useEffect } from 'react';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import initI18n from '@/i18n/init';
import { getSignInExperienceSettings } from '@/utils/sign-in-experience';

import useTheme from './use-theme';

const useSignInExperience = () => {
  const { isPreview, setExperienceSettings } = useContext(PageContext);

  useTheme();

  useEffect(() => {
    (async () => {
      const [settings] = await Promise.all([getSignInExperienceSettings(), initI18n()]);

      // Init the page settings and render
      setExperienceSettings(settings);
    })();
  }, [isPreview, setExperienceSettings]);
};

export default useSignInExperience;
