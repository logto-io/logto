import { experience } from '@logto/schemas';
import { useMemo } from 'react';

import { isDevFeaturesEnabled } from '@/constants/env';
import { type ContinueFlowInteractionEvent } from '@/types';
import { parseGuard, trustedDeviceOptInErrorDataGuard } from '@/types/guard';

import { type ErrorHandlers } from './use-error-handler';
import useNavigateWithPreservedSearchParams from './use-navigate-with-preserved-search-params';
import useToast from './use-toast';

const useTrustedDeviceOptInErrorHandler = (interactionEvent: ContinueFlowInteractionEvent) => {
  const navigate = useNavigateWithPreservedSearchParams();
  const { setToast } = useToast();

  return useMemo<ErrorHandlers>(
    () => ({
      'session.trusted_device_suggest_opt_in': async (error) => {
        const data = parseGuard(error.data, trustedDeviceOptInErrorDataGuard);

        if (!isDevFeaturesEnabled || !data) {
          setToast(error.message);
          return;
        }

        navigate(
          { pathname: `/${experience.routes.trustedDevice}` },
          { replace: true, state: { ...data, interactionEvent } }
        );
      },
    }),
    [interactionEvent, navigate, setToast]
  );
};

export default useTrustedDeviceOptInErrorHandler;
