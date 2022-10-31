import { useContext } from 'react';

import { PageContext } from './use-page-context';

export const useSieMethods = () => {
  const { experienceSettings } = useContext(PageContext);

  return {
    signUpMethods: experienceSettings?.signUp.methods ?? [],
    signInMethods: experienceSettings?.signIn.methods ?? [],
    socialConnectors: experienceSettings?.socialConnectors ?? [],
  };
};
