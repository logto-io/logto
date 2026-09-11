import { type LogtoErrorCode } from '@logto/phrases';
import { type InteractionAuthenticationContext, type RequestErrorBody } from '@logto/schemas';
import { HTTPError } from 'ky';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useMatch } from 'react-router-dom';

import { getStepUpContext, initStepUp } from '@/apis/experience';
import { stepUpRoutes } from '@/constants/step-up';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';

import StepUpContext, { type StepUpContextType } from './StepUpContext';

type Props = {
  readonly children: ReactNode;
};

/** The interaction storage holds nothing for this interaction yet, so it has to be created. */
const interactionNotFoundCode: LogtoErrorCode = 'session.interaction_not_found';

/**
 * Errors that mean the interaction, or the subject it pins, is gone. Nothing on the client can
 * recover from them, so they land on the invalid-session page without a toast.
 */
const sessionGoneErrorCodes: ReadonlySet<string> = new Set<LogtoErrorCode>([
  'session.not_found',
  interactionNotFoundCode,
  'session.step_up.subject_not_found',
  'session.step_up.invalid_interaction_event',
]);

/** Read the Logto error code from a failed request without consuming the response body. */
const getErrorCode = async (error: unknown): Promise<string | undefined> => {
  if (!(error instanceof HTTPError)) {
    return;
  }

  try {
    const { code } = await error.response.clone().json<RequestErrorBody>();

    return code;
  } catch {
    // A response without a JSON body carries no Logto error code.
  }
};

/**
 * Loads the server-driven step-up state for the `/step-up` route tree and exposes it through
 * {@link StepUpContext}.
 *
 * Interaction storage is the single source of state, so the provider never reads flow state from
 * `location.state`:
 *
 * - Every arrival at the landing page re-reads the context, and creates the interaction with
 *   `PUT /experience { interactionEvent: SignIn }` only when storage holds nothing for it yet. A
 *   refresh, or a return to the method list after a rejected submission, therefore keeps the
 *   proofs the interaction already recorded instead of starting over.
 * - A child route reads the context once when it mounts, so a refresh recovers the same state.
 * - When the interaction cannot proceed, `PUT /experience` answers `200 { redirectTo }` and the
 *   client is sent back to the application with `window.location.replace()`.
 */
const StepUpContextProvider = ({ children }: Props) => {
  const [authenticationContext, setAuthenticationContext] =
    useState<InteractionAuthenticationContext>();
  const [isFetching, setIsFetching] = useState(true);
  const [loadedLandingKey, setLoadedLandingKey] = useState<string>();
  const handledLandingKeyRef = useRef<string>();
  const hasLoadedRef = useRef(false);

  const asyncGetStepUpContext = useApi(getStepUpContext);
  const asyncInitStepUp = useApi(initStepUp);
  const handleError = useErrorHandler();
  const redirectTo = useGlobalRedirectTo();
  const { key } = useLocation();
  const isLanding = Boolean(useMatch(stepUpRoutes.landing));
  // The location key identifies one arrival at the landing page, so each arrival loads once.
  const landingKey = isLanding ? key : undefined;

  const settleWithError = useCallback(
    async (error: unknown) => {
      const code = await getErrorCode(error);

      if (!code || !sessionGoneErrorCodes.has(code)) {
        await handleError(error);
      }

      setAuthenticationContext(undefined);
      setIsFetching(false);
    },
    [handleError]
  );

  const load = useCallback(
    async (shouldInitialize: boolean) => {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      hasLoadedRef.current = true;
      setIsFetching(true);

      const [error, context] = await asyncGetStepUpContext();

      if (!error) {
        setAuthenticationContext(context);
        setIsFetching(false);
        return;
      }

      if (!shouldInitialize || (await getErrorCode(error)) !== interactionNotFoundCode) {
        await settleWithError(error);
        return;
      }

      const [initError, result] = await asyncInitStepUp();

      if (initError) {
        await settleWithError(initError);
        return;
      }

      if (result?.redirectTo) {
        // The interaction was finished with `unmet_authentication_requirements`; the application
        // explains it. The redirect unloads the page, so this never resolves.
        await redirectTo(result.redirectTo);
        return;
      }

      const [contextError, initializedContext] = await asyncGetStepUpContext();

      if (contextError) {
        await settleWithError(contextError);
        return;
      }

      setAuthenticationContext(initializedContext);
      setIsFetching(false);
    },
    [asyncGetStepUpContext, asyncInitStepUp, redirectTo, settleWithError]
  );

  const refetch = useCallback(async () => load(false), [load]);

  useEffect(() => {
    if (landingKey === undefined) {
      if (!hasLoadedRef.current) {
        void load(false);
      }

      return;
    }

    if (handledLandingKeyRef.current === landingKey) {
      return;
    }

    // eslint-disable-next-line @silverhand/fp/no-mutation
    handledLandingKeyRef.current = landingKey;

    const loadLanding = async () => {
      await load(true);
      setLoadedLandingKey(landingKey);
    };

    void loadLanding();
  }, [landingKey, load]);

  const stepUpContext = useMemo<StepUpContextType>(
    () => ({
      authenticationContext,
      // A new arrival at the landing page is loading from its first render, before the effect
      // runs, so the landing page never dispatches on the context of a previous visit.
      isLoading: isFetching || (landingKey !== undefined && loadedLandingKey !== landingKey),
      refetch,
    }),
    [authenticationContext, isFetching, landingKey, loadedLandingKey, refetch]
  );

  return <StepUpContext.Provider value={stepUpContext}>{children}</StepUpContext.Provider>;
};

export default StepUpContextProvider;
