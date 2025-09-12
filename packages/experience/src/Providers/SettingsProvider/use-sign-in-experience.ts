import { useContext, useEffect } from 'react';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import initI18n from '@/i18n/init';
import { getSignInExperienceSettings } from '@/utils/sign-in-experience';

import useTheme, { getThemeBySystemConfiguration } from './use-theme';

const useSignInExperience = () => {
  const { isPreview, setExperienceSettings, setTheme } = useContext(PageContext);

  useTheme();

  useEffect(() => {
    (async () => {
      const [settings] = await Promise.all([getSignInExperienceSettings(), initI18n()]);

      // Ensure theme is set before page rendering with new settings to avoid page flashing
      if (settings.color.isDarkModeEnabled) {
        setTheme(getThemeBySystemConfiguration());
      }

      // Init the page settings and render the page content
      setExperienceSettings(settings);
    })();
  }, [isPreview, setExperienceSettings, setTheme]);
};

export default useSignInExperience;
