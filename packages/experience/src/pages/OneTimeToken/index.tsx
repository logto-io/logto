import { AgreeToTermsPolicy, SignInIdentifier } from '@logto/schemas';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import {
  identifyAndSubmitInteraction,
  signInWithVerifiedIdentifier,
  verifyOneTimeToken,
} from '@/apis/experience';
import LoadingLayer from '@/components/LoadingLayer';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import useFallbackRoute from '@/hooks/use-fallback-route';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
import useLoginHint from '@/hooks/use-login-hint';
import usePreSignInErrorHandler from '@/hooks/use-pre-sign-in-error-handler';
import useTerms from '@/hooks/use-terms';

import ErrorPage from '../ErrorPage';
import SwitchAccount from '../SwitchAccount';

const OneTimeToken = () => {
  const { token } = useParams();
  const fallback = useFallbackRoute();
  const email = useLoginHint();
  const [mismatchedAccount, setMismatchedAccount] = useState<string>();
  const [oneTimeTokenError, setOneTimeTokenError] = useState<unknown>();

  const asyncRegisterWithOneTimeToken = useApi(identifyAndSubmitInteraction);
  const asyncSignInWithVerifiedIdentifier = useApi(signInWithVerifiedIdentifier);
  const asyncVerifyOneTimeToken = useApi(verifyOneTimeToken);

  const { termsValidation, agreeToTermsPolicy } = useTerms();
  const handleError = useErrorHandler();
  const redirectTo = useGlobalRedirectTo();
  const preSignInErrorHandler = usePreSignInErrorHandler();

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

  const registerWithOneTimeToken = useCallback(
    async (verificationId: string) => {
      const [error, result] = await asyncRegisterWithOneTimeToken({ verificationId });

      if (error) {
        await handleError(error, {
          'user.email_already_in_use': async () => {
            await signInWithOneTimeToken(verificationId);
          },
        });
        return;
      }

      if (result?.redirectTo) {
        await redirectTo(result.redirectTo);
      }
    },
    [asyncRegisterWithOneTimeToken, handleError, redirectTo, signInWithOneTimeToken]
  );

  useEffect(() => {
    (async () => {
      if (token && email) {
        /**
         * Check if the user has agreed to the terms and privacy policy before navigating to the 3rd-party social sign-in page
         * when the policy is set to `Manual`
         */
        if (agreeToTermsPolicy === AgreeToTermsPolicy.Manual && !(await termsValidation())) {
          return;
        }
        const [error, result] = await asyncVerifyOneTimeToken({
          token,
          identifier: { type: SignInIdentifier.Email, value: email },
        });

        if (error) {
          await handleError(error, {
            'one_time_token.email_mismatch': () => {
              setMismatchedAccount(email);
            },
            'one_time_token.token_expired': () => {
              setOneTimeTokenError(error);
            },
            'one_time_token.token_consumed': () => {
              setOneTimeTokenError(error);
            },
            'one_time_token.token_revoked': () => {
              setOneTimeTokenError(error);
            },
            'one_time_token.token_not_found': () => {
              setOneTimeTokenError(error);
            },
          });
          return;
        }

        if (!result?.verificationId) {
          return;
        }
        await registerWithOneTimeToken(result.verificationId);
      }

      window.location.replace('/' + fallback);
    })();
  }, [
    agreeToTermsPolicy,
    email,
    fallback,
    token,
    asyncVerifyOneTimeToken,
    handleError,
    registerWithOneTimeToken,
    termsValidation,
  ]);

  if (mismatchedAccount) {
    return <SwitchAccount account={mismatchedAccount} />;
  }

  if (oneTimeTokenError) {
    return <ErrorPage title="error.invalid_link" message="error.invalid_link_description" />;
  }

  return <LoadingLayer />;
};
export default OneTimeToken;
