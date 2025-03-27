import { useContext, useState } from 'react';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import { isDevFeaturesEnabled } from '@/constants/env';

const useCaptcha = () => {
  const { experienceSettings } = useContext(PageContext);
  const [token, setToken] = useState<string>();

  const captchaPolicy = experienceSettings?.captchaPolicy;
  const captchaConfig = experienceSettings?.captchaConfig;

  return {
    isCaptchaRequired: isDevFeaturesEnabled && captchaPolicy?.enabled,
    captchaConfig,
    captchaToken: token,
    setCaptchaToken: setToken,
  };
};

export default useCaptcha;
