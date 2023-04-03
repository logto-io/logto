import { useContext, useEffect } from 'react';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import initI18n from '@/i18n/init';
import { getSignInExperienceSettings } from '@/utils/sign-in-experience';

const SignInExperienceProvider = () => {
  const { isPreview, setExperienceSettings } = useContext(PageContext);

  useEffect(() => {
    (async () => {
      const [settings] = await Promise.all([getSignInExperienceSettings(), initI18n()]);

      // Init the page settings and render
      setExperienceSettings(settings);
    })();
  }, [isPreview, setExperienceSettings]);

  return null;
};

export default SignInExperienceProvider;
