import { useMemo } from 'react';

import { type ContinueFlowInteractionEvent } from '@/types';

import { type ErrorHandlers } from './use-error-handler';
import useNavigateWithPreservedSearchParams from './use-navigate-with-preserved-search-params';

const useMissingPasskeyErrorHandler = (interactionEvent: ContinueFlowInteractionEvent) => {
  const navigate = useNavigateWithPreservedSearchParams();

  return useMemo<ErrorHandlers>(
    () => ({
      'user.passkey_preferred': async () => {
        navigate({ pathname: '/create-passkey' }, { replace: true, state: { interactionEvent } });
      },
    }),
    [interactionEvent, navigate]
  );
};

export default useMissingPasskeyErrorHandler;
