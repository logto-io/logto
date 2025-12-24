import {
  AgreeToTermsPolicy,
  experience,
  ExtraParamsKey,
  InteractionEvent,
  SignInIdentifier,
  type RequestErrorBody,
} from '@logto/schemas';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import {
  identifyAndSubmitInteraction,
  registerWithVerifiedIdentifier,
  signInWithOneTimeToken,
} from '@/apis/experience';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
import useNavigateWithPreservedSearchParams from '@/hooks/use-navigate-with-preserved-search-params';
import useSubmitInteractionErrorHandler from '@/hooks/use-submit-interaction-error-handler';
import useTerms from '@/hooks/use-terms';
import LoadingLayer from '@/shared/components/LoadingLayer';

const OneTimeToken = () => {
  const [params] = useSearchParams();
  const navigate = useNavigateWithPreservedSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const hasTermsAgreed = useRef(false);
  const isSubmitted = useRef(false);

  const asyncIdentifyUserAndSubmit = useApi(identifyAndSubmitInteraction);
  const asyncSignInWithOneTimeToken = useApi(signInWithOneTimeToken);
  const asyncRegisterWithVerifiedIdentifier = useApi(registerWithVerifiedIdentifier);

  const { setIdentifierInputValue } = useContext(UserInteractionContext);
  const { termsValidation, agreeToTermsPolicy } = useTerms();
  const handleError = useErrorHandler();
  const redirectTo = useGlobalRedirectTo();
  const preSignInErrorHandler = useSubmitInteractionErrorHandler(InteractionEvent.SignIn);
  const preRegisterErrorHandler = useSubmitInteractionErrorHandler(InteractionEvent.Register);

  /**
   * Update interaction event to `Register`, and then identify user and submit.
   */
  const registerWithOneTimeToken = useCallback(
    async (verificationId: string) => {
      if (
        !hasTermsAgreed.current &&
        agreeToTermsPolicy !== AgreeToTermsPolicy.Automatic &&
        !(await termsValidation())
      ) {
        navigate(
          { pathname: `/${experience.routes.oneTimeToken}/error` },
          { replace: true, state: { errorMessage: 'terms_acceptance_required_description' } }
        );
        return;
      }

      setIsLoading(true);
      const [error, result] = await asyncRegisterWithVerifiedIdentifier(verificationId);

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
      preRegisterErrorHandler,
      asyncRegisterWithVerifiedIdentifier,
      navigate,
      handleError,
      redirectTo,
      termsValidation,
    ]
  );

  /**
   * Always try to submit the one-time token interaction with `SignIn` event first.
   * If the user does not exist, call the `registerWithOneTimeToken` function instead.
   */
  const submit = useCallback(
    async (verificationId: string) => {
      const [error, result] = await asyncIdentifyUserAndSubmit({ verificationId });

      if (error) {
        setIsLoading(false);
        await handleError(error, {
          'user.user_not_exist': async () => {
            await registerWithOneTimeToken(verificationId);
          },
          ...preSignInErrorHandler,
        });
        return;
      }

      if (result?.redirectTo) {
        await redirectTo(result.redirectTo);
      }
    },
    [
      preSignInErrorHandler,
      asyncIdentifyUserAndSubmit,
      handleError,
      redirectTo,
      registerWithOneTimeToken,
    ]
  );

  // Single effect: validate params, run terms gating once, then proceed to submission with idempotency
  useEffect(() => {
    (async () => {
      const token = params.get(ExtraParamsKey.OneTimeToken);
      const email = params.get(ExtraParamsKey.LoginHint);
      const errorMessage = params.get('errorMessage');

      if (errorMessage) {
        navigate(
          { pathname: `/${experience.routes.oneTimeToken}/error` },
          { replace: true, state: { errorMessage } }
        );
        return;
      }

      if (!token || !email) {
        navigate(`/${experience.routes.oneTimeToken}/error`, { replace: true });
        return;
      }

      if (agreeToTermsPolicy === AgreeToTermsPolicy.Manual) {
        const isAgreed = await termsValidation();

        // eslint-disable-next-line @silverhand/fp/no-mutation
        hasTermsAgreed.current = isAgreed;

        if (!isAgreed) {
          navigate(
            { pathname: `/${experience.routes.oneTimeToken}/error` },
            {
              replace: true,
              state: {
                title: 'error.terms_acceptance_required',
                message: 'error.terms_acceptance_required_description',
              },
            }
          );
          return;
        }
      }

      if (isSubmitted.current) {
        return;
      }
      // eslint-disable-next-line @silverhand/fp/no-mutation
      isSubmitted.current = true;

      setIsLoading(true);
      const [error, result] = await asyncSignInWithOneTimeToken({
        token,
        identifier: { type: SignInIdentifier.Email, value: email },
      });

      if (error) {
        setIsLoading(false);
        await handleError(error, {
          global: (error: RequestErrorBody) => {
            navigate(
              { pathname: `/${experience.routes.oneTimeToken}/error` },
              { replace: true, state: { errorMessage: error.message } }
            );
          },
        });
        return;
      }

      if (!result?.verificationId) {
        setIsLoading(false);
        return;
      }

      // Set email identifier to the <HiddenIdentifierInput />, so that when being asked for fulfilling
      // the password later, the browser password manager can pick up both the email and the password.
      setIdentifierInputValue({ type: SignInIdentifier.Email, value: email });

      await submit(result.verificationId);
      setIsLoading(false);
    })();
  }, [
    agreeToTermsPolicy,
    params,
    asyncSignInWithOneTimeToken,
    handleError,
    navigate,
    setIdentifierInputValue,
    submit,
    termsValidation,
  ]);

  return isLoading ? <LoadingLayer /> : null;
};
export default OneTimeToken;
