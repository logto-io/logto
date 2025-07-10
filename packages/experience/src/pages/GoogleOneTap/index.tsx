import {
  ExtraParamsKey,
  AgreeToTermsPolicy,
  type RequestErrorBody,
  experience,
  InteractionEvent,
} from '@logto/schemas';
import { condString } from '@silverhand/essentials';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

import { getConsentInfo } from '@/apis/consent';
import { verifyGoogleOneTapCredential } from '@/apis/experience/google-one-tap';
import {
  identifyAndSubmitInteraction,
  updateInteractionEvent,
} from '@/apis/experience/interaction';
import LoadingLayer from '@/components/LoadingLayer';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
import useSubmitInteractionErrorHandler from '@/hooks/use-submit-interaction-error-handler';
import useTerms from '@/hooks/use-terms';
import ErrorPage from '@/pages/ErrorPage';

const GoogleOneTap = () => {
  const [searchParams] = useSearchParams();
  const [googleOneTapError, setGoogleOneTapError] = useState<string | boolean>();
  const navigate = useNavigate();

  const asyncVerifyGoogleOneTapCredential = useApi(verifyGoogleOneTapCredential);
  const asyncIdentifyAndSubmitInteraction = useApi(identifyAndSubmitInteraction);
  const asyncUpdateInteractionEvent = useApi(updateInteractionEvent);
  const asyncGetConsentInfo = useApi(getConsentInfo);
  const { termsValidation, agreeToTermsPolicy } = useTerms();
  const handleError = useErrorHandler();
  const redirectTo = useGlobalRedirectTo();
  const preRegisterErrorHandler = useSubmitInteractionErrorHandler(InteractionEvent.Register);

  // Reusable error handler for setting Google One Tap errors
  const setGoogleOneTapErrorHandler = useCallback((error: RequestErrorBody) => {
    setGoogleOneTapError(error.message);
  }, []);

  /**
   * Register with Google One Tap credential when account doesn't exist
   */
  const registerWithGoogleOneTap = useCallback(
    async (verificationId: string) => {
      await asyncUpdateInteractionEvent(InteractionEvent.Register);
      const [error, result] = await asyncIdentifyAndSubmitInteraction({ verificationId });

      if (error) {
        await handleError(error, preRegisterErrorHandler);
        return;
      }

      if (result?.redirectTo) {
        await redirectTo(result.redirectTo);
      }
    },
    [
      asyncUpdateInteractionEvent,
      asyncIdentifyAndSubmitInteraction,
      handleError,
      preRegisterErrorHandler,
      redirectTo,
    ]
  );

  /**
   * Submit Google One Tap interaction. Try to sign in first, if account doesn't exist, register.
   * Similar to OneTimeToken pattern.
   */
  const submitGoogleOneTap = useCallback(
    async (verificationId: string) => {
      const [error, result] = await asyncIdentifyAndSubmitInteraction({ verificationId });

      if (error) {
        await handleError(error, {
          'user.identity_not_exist': async () => {
            await registerWithGoogleOneTap(verificationId);
          },
          global: setGoogleOneTapErrorHandler,
        });
        return;
      }

      if (result?.redirectTo) {
        await redirectTo(result.redirectTo);
      }
    },
    [
      asyncIdentifyAndSubmitInteraction,
      handleError,
      registerWithGoogleOneTap,
      redirectTo,
      setGoogleOneTapErrorHandler,
    ]
  );

  /**
   * Check for existing session and submit GoogleOneTap with proper account switching
   */
  const checkSessionAndSubmit = useCallback(
    async (credential: string, verificationId: string, verifiedEmail: string) => {
      // Check for existing session
      const [consentError, consentResult] = await asyncGetConsentInfo();

      if (!consentError && consentResult && consentResult.user.primaryEmail !== verifiedEmail) {
        // There's an existing session that doesn't match the Google credential
        // Redirect to switch account page for user to choose
        const switchAccountParams = new URLSearchParams({
          [ExtraParamsKey.LoginHint]: verifiedEmail,
          [ExtraParamsKey.GoogleOneTapCredential]: credential,
        });
        navigate(`/${experience.routes.switchAccount}?${switchAccountParams.toString()}`, {
          replace: true,
        });
        return;
      }

      await submitGoogleOneTap(verificationId);
    },
    [asyncGetConsentInfo, submitGoogleOneTap, navigate]
  );

  useEffect(() => {
    (async () => {
      const credential = searchParams.get(ExtraParamsKey.GoogleOneTapCredential);
      const errorMessage = searchParams.get('errorMessage');

      if (errorMessage) {
        setGoogleOneTapError(errorMessage);
        return;
      }

      if (!credential) {
        setGoogleOneTapError(true);
        return;
      }

      /**
       * Check if the user has agreed to the terms and privacy policy before proceeding
       * when the policy is set to `Manual`
       */
      if (agreeToTermsPolicy === AgreeToTermsPolicy.Manual && !(await termsValidation())) {
        return;
      }

      // First, verify the Google One Tap credential to get accurate user information
      const [verifyError, verifyResult] = await asyncVerifyGoogleOneTapCredential({
        credential,
      });

      if (verifyError) {
        await handleError(verifyError, {
          global: setGoogleOneTapErrorHandler,
        });
        return;
      }

      if (!verifyResult?.verificationId) {
        return;
      }

      // Now check for existing session using the verified credential
      // This ensures we use the accurate email from the verified Google ID token
      await checkSessionAndSubmit(
        credential,
        verifyResult.verificationId,
        verifyResult.verifiedEmail
      );
    })();
  }, [
    agreeToTermsPolicy,
    searchParams,
    asyncVerifyGoogleOneTapCredential,
    handleError,
    termsValidation,
    setGoogleOneTapErrorHandler,
    checkSessionAndSubmit,
  ]);

  if (googleOneTapError) {
    return (
      <ErrorPage
        isNavbarHidden
        title="error.invalid_link"
        message="error.invalid_link_description"
        rawMessage={condString(typeof googleOneTapError !== 'boolean' && googleOneTapError)}
      />
    );
  }

  return <LoadingLayer />;
};

export default GoogleOneTap;
