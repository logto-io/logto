import { SignInIdentifier } from '@logto/schemas';
import { useContext, useCallback } from 'react';

import { PageContext } from './use-page-context';

export const useSieMethods = () => {
  const { experienceSettings } = useContext(PageContext);
  const { identifiers, password, verify } = experienceSettings?.signUp ?? {};

  return {
    signUpMethods: identifiers ?? [],
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

  const getEnabledRetrievePasswordIdentifier = useCallback(
    (identifier: SignInIdentifier) => {
      if (identifier === SignInIdentifier.Username || identifier === SignInIdentifier.Email) {
        return forgotPassword?.email
          ? SignInIdentifier.Email
          : forgotPassword?.phone
          ? SignInIdentifier.Phone
          : undefined;
      }

      return forgotPassword?.phone
        ? SignInIdentifier.Phone
        : forgotPassword?.email
        ? SignInIdentifier.Email
        : undefined;
    },
    [forgotPassword]
  );

  return {
    getEnabledRetrievePasswordIdentifier,
    isForgotPasswordEnabled: Boolean(
      forgotPassword && (forgotPassword.email || forgotPassword.phone)
    ),
    ...forgotPassword,
  };
};
