import { useContext } from 'react';

import { PageContext } from './use-page-context';

export const useSieMethods = () => {
  const { experienceSettings } = useContext(PageContext);
  const { methods, password, verify } = experienceSettings?.signUp ?? {};

  return {
    signUpMethods: methods ?? [],
    signUpSettings: { password, verify },
    signInMethods: experienceSettings?.signIn.methods ?? [],
    socialConnectors: experienceSettings?.socialConnectors ?? [],
    forgotPassword: experienceSettings?.forgotPassword,
  };
};
