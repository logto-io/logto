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

      if (type === ConnectorType.Email) {
        return (
          data.signIn.methods.some(
            ({ identifier, verificationCode }) =>
              verificationCode && identifier === SignInIdentifier.Email
          ) ||
          (data.signUp.identifiers.includes(SignInIdentifier.Email) && data.signUp.verify)
        );
      }

      if (type === ConnectorType.Sms) {
        return (
          data.signIn.methods.some(
            ({ identifier, verificationCode }) =>
              verificationCode && identifier === SignInIdentifier.Sms
          ) ||
          (data.signUp.identifiers.includes(SignInIdentifier.Sms) && data.signUp.verify)
        );
      }

      return data.socialSignInConnectorTargets.includes(target);
    },
    [data]
  );

  return {
    isConnectorInUse,
  };
};

export default useConnectorInUse;
