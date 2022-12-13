import { useContext } from 'react';

import { PageContext } from './use-page-context';

export const useSieMethods = () => {
  const { experienceSettings } = useContext(PageContext);
  const { methods, password, verify } = experienceSettings?.signUp ?? {};

  return {
    signUpMethods: methods ?? [],
    signUpSettings: { password, verify },
    signInMethods:
      experienceSettings?.signIn.methods.filter(
        // Filter out empty settings
        ({ password, verificationCode }) => password || verificationCode
      ) ?? [],
    socialConnectors: experienceSettings?.socialConnectors ?? [],
    signInMode: experienceSettings?.signInMode,
    forgotPassword: experienceSettings?.forgotPassword,
  };
};

export const useForgotPasswordSettings = () => {
  const { experienceSettings } = useContext(PageContext);
  const { forgotPassword } = experienceSettings ?? {};

  return {
    isForgotPasswordEnabled: Boolean(
      forgotPassword && (forgotPassword.email || forgotPassword.sms)
    ),
    ...forgotPassword,
  };
};
