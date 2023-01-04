import type { ConnectorResponse, SignInExperience } from '@logto/schemas';
import { SignInIdentifier, ConnectorType } from '@logto/schemas';
import { useCallback } from 'react';
import useSWR from 'swr';

import type { RequestError } from './use-api';

const useConnectorInUse = () => {
  const { data } = useSWR<SignInExperience, RequestError>('/api/sign-in-exp');

  const isConnectorInUse = useCallback(
    (connector?: ConnectorResponse) => {
      if (!connector || !data) {
        return false;
      }

      const { type, target } = connector;

      if (type === ConnectorType.Social) {
        return data.socialSignInConnectorTargets.includes(target);
      }

      const relatedIdentifier =
        type === ConnectorType.Email ? SignInIdentifier.Email : SignInIdentifier.Sms;

      const usedInSignUp =
        data.signUp.identifiers.includes(relatedIdentifier) && data.signUp.verify;

      const usedInSignIn = data.signIn.methods.some(
        ({ identifier, verificationCode }) => verificationCode && identifier === relatedIdentifier
      );

      return usedInSignUp || usedInSignIn;
    },
    [data]
  );

  return {
    isConnectorInUse,
  };
};

export default useConnectorInUse;
