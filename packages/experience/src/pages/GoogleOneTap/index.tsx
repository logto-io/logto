import { ExtraParamsKey, AgreeToTermsPolicy, type RequestErrorBody } from '@logto/schemas';
import { condString } from '@silverhand/essentials';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { verifyGoogleOneTapCredential } from '@/apis/experience/google-one-tap';
import { identifyAndSubmitInteraction } from '@/apis/experience/interaction';
import LoadingLayer from '@/components/LoadingLayer';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
import useTerms from '@/hooks/use-terms';
import ErrorPage from '@/pages/ErrorPage';

const GoogleOneTap = () => {
  const [searchParams] = useSearchParams();
  const [googleOneTapError, setGoogleOneTapError] = useState<string | boolean>();

  const asyncVerifyGoogleOneTapCredential = useApi(verifyGoogleOneTapCredential);
  const asyncIdentifyAndSubmitInteraction = useApi(identifyAndSubmitInteraction);
  const { termsValidation, agreeToTermsPolicy } = useTerms();
  const handleError = useErrorHandler();
  const redirectTo = useGlobalRedirectTo();

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

      const [verifyError, verifyResult] = await asyncVerifyGoogleOneTapCredential({
        credential,
      });

      if (verifyError) {
        await handleError(verifyError, {
          global: (error: RequestErrorBody) => {
            setGoogleOneTapError(error.message);
          },
        });
        return;
      }

      if (!verifyResult?.verificationId) {
        return;
      }

      const [submitError, submitResult] = await asyncIdentifyAndSubmitInteraction({
        verificationId: verifyResult.verificationId,
      });

      if (submitError) {
        await handleError(submitError, {
          global: (error: RequestErrorBody) => {
            setGoogleOneTapError(error.message);
          },
        });
        return;
      }

      if (submitResult?.redirectTo) {
        await redirectTo(submitResult.redirectTo);
      }
    })();
  }, [
    agreeToTermsPolicy,
    searchParams,
    asyncVerifyGoogleOneTapCredential,
    asyncIdentifyAndSubmitInteraction,
    handleError,
    termsValidation,
    redirectTo,
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
