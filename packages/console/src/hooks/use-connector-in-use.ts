import { SignInIdentifier, ConnectorType } from '@logto/schemas';
import type { SignInExperience, ConnectorResponse } from '@logto/schemas';
import { useCallback } from 'react';
import useSWR from 'swr';

import type { RequestError } from './use-api';

const useConnectorInUse = () => {
  const { data } = useSWR<SignInExperience, RequestError>('api/sign-in-exp');

  const isConnectorInUse = useCallback(
    (connector?: ConnectorResponse) => {
      if (!connector || !data) {
        return false;
      }

      const { type, target } = connector;

      const isSocial = type === ConnectorType.Social;
      const isBlockchain = type === ConnectorType.Blockchain;
      const isEmail = type === ConnectorType.Email;

      if (isSocial) {
        return data.socialSignInConnectorTargets.includes(target);
      }

      if (isBlockchain) {
        return data.blockchainSignInConnectorTargets.includes(target);
      }

      const relatedIdentifier =
        isEmail ? SignInIdentifier.Email : SignInIdentifier.Phone;

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
