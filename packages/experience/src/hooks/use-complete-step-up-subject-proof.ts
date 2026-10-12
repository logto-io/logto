import { AuthenticationContextMode, InteractionEvent } from '@logto/schemas';
import { useCallback } from 'react';

import { getStepUpContext, identifyUser } from '@/apis/experience';
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
        const context = await getStepUpContext();

        if (context?.mode !== AuthenticationContextMode.StepUp) {
          navigate(unknownSessionRoute, { replace: true });
          return;
        }

        const [method] = context.establishableMethods;
        navigate(method ? `/continue/${method}` : stepUpRoutes.landing, {
          replace: true,
          state: { interactionEvent: InteractionEvent.SignIn },
        });
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
