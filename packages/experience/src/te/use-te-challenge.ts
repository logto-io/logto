/* TE:BEGIN qr-push-factor */
/**
 * Drives a TripleEnable signing challenge from the browser: opens it, waits for the
 * wallet to sign, and turns the resulting one-time token into a Logto session.
 *
 * Redeeming the token goes through Logto's own Experience API, so every native factor,
 * the MFA policy and the profile rules keep applying untouched.
 */

import { SignInIdentifier } from '@logto/schemas';
import { useCallback, useEffect, useRef, useState } from 'react';

import { identifyAndSubmitInteraction, signInWithOneTimeToken } from '@/apis/experience';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';

import { getTeChallenge, startTeChallenge, type TeChallenge } from './api';
import { teChallengeTimeoutMs, tePollIntervalMs, type TeWalletMode } from './config';

const messages = Object.freeze({
  unreachable: 'No pudimos contactar con el IdP de TripleEnable. Inténtalo de nuevo.',
  denied: 'La solicitud fue rechazada desde tu dispositivo.',
  expired: 'La solicitud caducó. Vuelve a intentarlo.',
  mismatch: 'Se tocó un número incorrecto en el teléfono. Vuelve a intentarlo.',
});

const useTeChallenge = (mode: TeWalletMode) => {
  const [challenge, setChallenge] = useState<TeChallenge>();
  const [error, setError] = useState<string>();
  const [isVerifying, setIsVerifying] = useState(false);

  const isMounted = useRef(true);
  useEffect(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    isMounted.current = true;
    return () => {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      isMounted.current = false;
    };
  }, []);

  const handleError = useErrorHandler();
  const redirectTo = useGlobalRedirectTo();
  const asyncSignInWithOneTimeToken = useApi(signInWithOneTimeToken);
  const asyncIdentifyAndSubmit = useApi(identifyAndSubmitInteraction);

  /** Redeems the token minted by the IdP, which is what creates the Logto session. */
  const completeSignIn = useCallback(
    async (token: string, identity: string) => {
      setIsVerifying(true);

      const [tokenError, verification] = await asyncSignInWithOneTimeToken({
        token,
        identifier: { type: SignInIdentifier.Email, value: identity },
      });

      if (tokenError) {
        await handleError(tokenError);
        setIsVerifying(false);
        return;
      }

      if (!verification) {
        setIsVerifying(false);
        return;
      }

      const [submitError, result] = await asyncIdentifyAndSubmit({
        verificationId: verification.verificationId,
      });

      if (submitError) {
        await handleError(submitError);
        setIsVerifying(false);
        return;
      }

      if (result?.redirectTo) {
        await redirectTo(result.redirectTo);
      }
    },
    [asyncIdentifyAndSubmit, asyncSignInWithOneTimeToken, handleError, redirectTo]
  );

  /** Opens a challenge: a scannable QR, or a push aimed at one specific device. */
  const begin = useCallback(
    async (payload?: { email?: string; deviceId?: string }) => {
      setError(undefined);
      setChallenge(undefined);

      try {
        const opened = await startTeChallenge({ mode, ...payload });

        if (isMounted.current) {
          setChallenge(opened);
        }
      } catch {
        if (isMounted.current) {
          setError(messages.unreachable);
        }
      }
    },
    [mode]
  );

  const reset = useCallback(() => {
    setError(undefined);
    setChallenge(undefined);
    setIsVerifying(false);
  }, []);

  // Wait for the wallet to sign.
  useEffect(() => {
    const challengeId = challenge?.challengeId;

    if (!challengeId) {
      return;
    }

    const deadline = Date.now() + teChallengeTimeoutMs;

    const timer = setInterval(async () => {
      if (Date.now() > deadline) {
        clearInterval(timer);
        setError(messages.expired);
        return;
      }

      try {
        const status = await getTeChallenge(challengeId);

        if (!isMounted.current) {
          clearInterval(timer);
          return;
        }

        if (status.status === 'approved') {
          clearInterval(timer);
          await completeSignIn(status.oneTimeToken, status.email);
          return;
        }

        if (status.status !== 'pending') {
          clearInterval(timer);
          setError(messages[status.status]);
        }
      } catch {
        // A transient network blip shouldn't kill the wait; the deadline covers the rest.
      }
    }, tePollIntervalMs);

    return () => {
      clearInterval(timer);
    };
  }, [challenge?.challengeId, completeSignIn]);

  return { challenge, error, isVerifying, begin, reset };
};

export default useTeChallenge;
/* TE:END qr-push-factor */
