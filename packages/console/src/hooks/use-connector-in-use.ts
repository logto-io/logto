import type { SignInExperience } from '@logto/schemas';
import { SignInIdentifier, ConnectorType } from '@logto/schemas';
import useSWR from 'swr';

import type { RequestError } from './use-api';

const useConnectorInUse = (type?: ConnectorType, target?: string): boolean | undefined => {
  const { data } = useSWR<SignInExperience, RequestError>(target && type && '/api/sign-in-exp');

  if (!data) {
    return;
  }

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

  if (!target) {
    return;
  }

  return data.socialSignInConnectorTargets.includes(target);
};

export default useConnectorInUse;
