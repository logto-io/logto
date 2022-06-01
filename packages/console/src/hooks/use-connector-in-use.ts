import { SignInExperience } from '@logto/schemas';
import useSWR from 'swr';

import { RequestError } from './use-api';

const useConnectorInUse = (connectorTarget?: string): boolean | undefined => {
  const { data } = useSWR<SignInExperience, RequestError>(connectorTarget && '/api/sign-in-exp');

  if (!data || !connectorTarget) {
    return;
  }

  return data.socialSignInConnectorTargets.includes(connectorTarget);
};

export default useConnectorInUse;
