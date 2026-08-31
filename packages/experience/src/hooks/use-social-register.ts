import { AgreeToTermsPolicy, InteractionEvent } from '@logto/schemas';
import { useCallback } from 'react';

import { registerWithVerifiedIdentifier } from '@/apis/experience';

import useApi from './use-api';
import useErrorHandler from './use-error-handler';
import useGlobalRedirectTo from './use-global-redirect-to';
import useNavigateToSignIn from './use-navigate-to-sign-in';
import useSubmitInteractionErrorHandler from './use-submit-interaction-error-handler';
import useTerms from './use-terms';

type Options = {
  readonly replace?: boolean;
  readonly onEmailBlocked?: (errorCode: string) => void;
};

const useSocialRegister = (connectorId: string, { replace, onEmailBlocked }: Options = {}) => {
  const handleError = useErrorHandler();
  const asyncRegisterWithSocial = useApi(registerWithVerifiedIdentifier);
  const redirectTo = useGlobalRedirectTo();
  const { termsValidation, agreeToTermsPolicy } = useTerms();
  const navigateToSignIn = useNavigateToSignIn();

  const preRegisterErrorHandler = useSubmitInteractionErrorHandler(InteractionEvent.Register, {
    linkSocial: connectorId,
    replace,
    onEmailBlocked,
  });

  return useCallback(
    async (verificationId: string) => {
      /**
       * Agree to terms and conditions first before proceeding
       * If the agreement policy is `Manual`, the user must agree to the terms to reach this step.
       * Therefore, skip the check for `Manual` policy.
       */
      if (agreeToTermsPolicy !== AgreeToTermsPolicy.Manual && !(await termsValidation())) {
        navigateToSignIn();
        return;
      }

      const [error, result] = await asyncRegisterWithSocial(verificationId);

      if (error) {
        await handleError(error, preRegisterErrorHandler);

        return;
      }

      if (result?.redirectTo) {
        await redirectTo(result.redirectTo);
      }
    },
    [
      agreeToTermsPolicy,
      asyncRegisterWithSocial,
      handleError,
      navigateToSignIn,
      preRegisterErrorHandler,
      redirectTo,
      termsValidation,
    ]
  );
};

export default useSocialRegister;
