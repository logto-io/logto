import { AgreeToTermsPolicy, experience, InteractionEvent } from '@logto/schemas';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { registerWithVerifiedIdentifier } from '@/apis/experience';

import useApi from './use-api';
import useErrorHandler from './use-error-handler';
import useGlobalRedirectTo from './use-global-redirect-to';
import usePreSignInErrorHandler from './use-pre-sign-in-error-handler';
import useTerms from './use-terms';

const useSocialRegister = (connectorId: string, replace?: boolean) => {
  const handleError = useErrorHandler();
  const asyncRegisterWithSocial = useApi(registerWithVerifiedIdentifier);
  const redirectTo = useGlobalRedirectTo();
  const { termsValidation, agreeToTermsPolicy } = useTerms();
  const navigate = useNavigate();

  const preRegisterErrorHandler = usePreSignInErrorHandler({
    linkSocial: connectorId,
    replace,
    interactionEvent: InteractionEvent.Register,
  });

  return useCallback(
    async (verificationId: string) => {
      /**
       * Agree to terms and conditions first before proceeding
       * If the agreement policy is `Manual`, the user must agree to the terms to reach this step.
       * Therefore, skip the check for `Manual` policy.
       */
      if (agreeToTermsPolicy !== AgreeToTermsPolicy.Manual && !(await termsValidation())) {
        navigate('/' + experience.routes.signIn);
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
      navigate,
      preRegisterErrorHandler,
      redirectTo,
      termsValidation,
    ]
  );
};

export default useSocialRegister;
