import { useCallback } from 'react';

import { identifyUser } from '@/apis/experience';
import { stepUpRoutes, unknownSessionRoute } from '@/constants/step-up';

import useErrorHandler from './use-error-handler';
import useNavigateWithPreservedSearchParams from './use-navigate-with-preserved-search-params';
import useStepUpErrorHandler from './use-step-up-error-handler';

/** Upstream authentication only proves the pinned subject; it never signs in or registers. */
const useCompleteStepUpSubjectProof = () => {
  const navigate = useNavigateWithPreservedSearchParams();
  const handleError = useErrorHandler();
  const stepUpErrorHandlers = useStepUpErrorHandler();

  return useCallback(
    async (verificationId: string) => {
      try {
        await identifyUser({ verificationId });
        navigate(stepUpRoutes.landing, { replace: true });
      } catch (error) {
        await handleError(error, {
          ...stepUpErrorHandlers,
          // No account creation or linking fallback is valid for a pinned subject.
          global: () => {
            navigate(unknownSessionRoute, { replace: true });
          },
        });
      }
    },
    [handleError, navigate, stepUpErrorHandlers]
  );
};

export default useCompleteStepUpSubjectProof;
