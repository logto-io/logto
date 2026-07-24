/* TE:BEGIN qr-push-factor */
/**
 * Drives a TripleEnable signing challenge from the browser: opens it, waits for the
 * wallet to sign, and turns the resulting one-time token into a Logto session.
 *
 * Redeeming the token goes through Logto's own Experience API, so every native factor,
 * the MFA policy and the profile rules keep applying untouched.
 */

import { InteractionEvent, SignInIdentifier } from '@logto/schemas';
import { useCallback, useEffect, useRef, useState } from 'react';

import { identifyAndSubmitInteraction, signInWithOneTimeToken } from '@/apis/experience';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
import useSubmitInteractionErrorHandler from '@/hooks/use-submit-interaction-error-handler';

import { createTeVerifier, getTeChallenge, startTeChallenge, type TeChallenge } from './api';
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
  /** Channel binding secret. Stays in this tab and is never sent anywhere but the redeem call. */
  const verifier = useRef<string>();

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

  /**
   * Everything Logto may still want after a successful identification — set up a
   * passkey, satisfy MFA, complete a missing profile — comes back as an error from
   * `submit`. This is the same handler its own pages use, so those flows continue
   * here exactly as they would after a password or a code.
   */
  const submitErrorHandler = useSubmitInteractionErrorHandler(InteractionEvent.SignIn, {
    replace: true,
  });

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
        await handleError(submitError, submitErrorHandler);
        setIsVerifying(false);
        return;
      }

      if (result?.redirectTo) {
        await redirectTo(result.redirectTo);
      }
    },
    [
      asyncIdentifyAndSubmit,
      asyncSignInWithOneTimeToken,
      handleError,
      redirectTo,
      submitErrorHandler,
    ]
  );

  /** Opens a challenge: a scannable QR, or a push aimed at one specific device. */
  const begin = useCallback(
    async (payload?: { email?: string; deviceId?: string }) => {
      setError(undefined);
      setChallenge(undefined);

      try {
        const binding = await createTeVerifier();
        // eslint-disable-next-line @silverhand/fp/no-mutation
        verifier.current = binding.verifier;

        const opened = await startTeChallenge({
          mode,
          ...payload,
          verifierHash: binding.verifierHash,
          client: sessionStorage.getItem('app_id') ?? undefined,
        });

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
        const status = await getTeChallenge(challengeId, verifier.current ?? '');

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
