import {
  AgreeToTermsPolicy,
  ExtraParamsKey,
  InteractionEvent,
  SignInIdentifier,
  type RequestErrorBody,
} from '@logto/schemas';
import { condString } from '@silverhand/essentials';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import {
  identifyAndSubmitInteraction,
  signInWithVerifiedIdentifier,
  registerWithOneTimeToken,
} from '@/apis/experience';
import LoadingLayer from '@/components/LoadingLayer';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
import useSubmitInteractionErrorHandler from '@/hooks/use-submit-interaction-error-handler';
import useTerms from '@/hooks/use-terms';

import ErrorPage from '../ErrorPage';

const OneTimeToken = () => {
  const [params] = useSearchParams();
  const [oneTimeTokenError, setOneTimeTokenError] = useState<string | boolean>();

  const asyncIdentifyUserAndSubmit = useApi(identifyAndSubmitInteraction);
  const asyncSignInWithVerifiedIdentifier = useApi(signInWithVerifiedIdentifier);
  const asyncRegisterWithOneTimeToken = useApi(registerWithOneTimeToken);

  const { setIdentifierInputValue } = useContext(UserInteractionContext);
  const { termsValidation, agreeToTermsPolicy } = useTerms();
  const handleError = useErrorHandler();
  const redirectTo = useGlobalRedirectTo();
  const preSignInErrorHandler = useSubmitInteractionErrorHandler(InteractionEvent.SignIn);
  const preRegisterErrorHandler = useSubmitInteractionErrorHandler(InteractionEvent.Register);

  /**
   * Update interaction event to `SignIn`, and then identify user and submit.
   */
  const signInWithOneTimeToken = useCallback(
    async (verificationId: string) => {
      const [error, result] = await asyncSignInWithVerifiedIdentifier(verificationId);

      if (error) {
        await handleError(error, preSignInErrorHandler);
        return;
      }

      if (result?.redirectTo) {
        await redirectTo(result.redirectTo);
      }
    },
    [preSignInErrorHandler, asyncSignInWithVerifiedIdentifier, handleError, redirectTo]
  );

  /**
   * Always try to submit the one-time token interaction with `Register` event first.
   * If the email already exists, call the `signInWithOneTimeToken` function instead.
   */
  const submit = useCallback(
    async (verificationId: string) => {
      const [error, result] = await asyncIdentifyUserAndSubmit({ verificationId });

      if (error) {
        await handleError(error, {
          'user.email_already_in_use': async () => {
            await signInWithOneTimeToken(verificationId);
          },
          ...preRegisterErrorHandler,
        });
        return;
      }

      if (result?.redirectTo) {
        await redirectTo(result.redirectTo);
      }
    },
    [
      preRegisterErrorHandler,
      asyncIdentifyUserAndSubmit,
      handleError,
      redirectTo,
      signInWithOneTimeToken,
    ]
  );

  useEffect(() => {
    (async () => {
      const token = params.get(ExtraParamsKey.OneTimeToken);
      const email = params.get(ExtraParamsKey.LoginHint);
      const errorMessage = params.get('errorMessage');

      if (errorMessage) {
        setOneTimeTokenError(errorMessage);
        return;
      }

      if (!token || !email) {
        setOneTimeTokenError(true);
        return;
      }

      /**
       * Check if the user has agreed to the terms and privacy policy before navigating to the 3rd-party social sign-in page
       * when the policy is set to `Manual`
       */
      if (agreeToTermsPolicy === AgreeToTermsPolicy.Manual && !(await termsValidation())) {
        return;
      }

      const [error, result] = await asyncRegisterWithOneTimeToken({
        token,
        identifier: { type: SignInIdentifier.Email, value: email },
      });

      if (error) {
        await handleError(error, {
          global: (error: RequestErrorBody) => {
            setOneTimeTokenError(error.message);
          },
        });
        return;
      }

      if (!result?.verificationId) {
        return;
      }

      // Set email identifier to the <HiddenIdentifierInput />, so that when being asked for fulfilling
      // the password later, the browser password manager can pick up both the email and the password.
      setIdentifierInputValue({ type: SignInIdentifier.Email, value: email });

      await submit(result.verificationId);
    })();
  }, [
    agreeToTermsPolicy,
    params,
    asyncRegisterWithOneTimeToken,
    handleError,
    setIdentifierInputValue,
    submit,
    termsValidation,
  ]);

  if (oneTimeTokenError) {
    return (
      <ErrorPage
        isNavbarHidden
        title="error.invalid_link"
        message="error.invalid_link_description"
        rawMessage={condString(typeof oneTimeTokenError !== 'boolean' && oneTimeTokenError)}
      />
    );
  }

  return <LoadingLayer />;
};
export default OneTimeToken;
