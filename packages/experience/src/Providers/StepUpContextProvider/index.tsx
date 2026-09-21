import { type LogtoErrorCode } from '@logto/phrases';
import { type InteractionAuthenticationContext, type RequestErrorBody } from '@logto/schemas';
import { HTTPError } from 'ky';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getStepUpContext, initStepUp } from '@/apis/experience';
import { stepUpSessionGoneErrorCodes } from '@/constants/step-up';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';

import StepUpContext, { type StepUpContextType } from './StepUpContext';

type Props = {
  readonly children: ReactNode;
};

/** The interaction storage holds nothing for this interaction yet, so it has to be created. */
const interactionNotFoundCode: LogtoErrorCode = 'session.interaction_not_found';

const sessionGoneErrorCodes: ReadonlySet<string> = new Set(stepUpSessionGoneErrorCodes);

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
  const [isFetching, setIsFetching] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<unknown>();
  /** The id of the latest load; an older load that settles later must not overwrite it. */
  const loadIdRef = useRef(0);

  const asyncGetStepUpContext = useApi(getStepUpContext);
  const asyncInitStepUp = useApi(initStepUp);
  const handleError = useErrorHandler();
  const redirectTo = useGlobalRedirectTo();

  /**
   * Load the context, creating the interaction first when asked and storage holds nothing for
   * it. Resolves with whether this load was still the latest one when it settled: a load that a
   * newer one superseded writes nothing, so the state always reflects the latest arrival.
   */
  const load = useCallback(
    async (shouldInitialize = false): Promise<boolean> => {
      // eslint-disable-next-line @silverhand/fp/no-mutation -- bump the latest load id to invalidate stale arrivals
      loadIdRef.current += 1;
      const loadId = loadIdRef.current;
      const isCurrent = () => loadIdRef.current === loadId;
      const settle = (context?: InteractionAuthenticationContext) => {
        if (isCurrent()) {
          setAuthenticationContext(context);
          setLoadError(undefined);
          setIsFetching(false);
          setIsLoaded(true);
        }

        return isCurrent();
      };
      const fail = async (error: unknown) => {
        const code = await getErrorCode(error);
        const isSessionGone =
          code === interactionNotFoundCode ||
          (code !== undefined && sessionGoneErrorCodes.has(code));

        // A superseded load reports nothing: the newer load owns the screen and its errors.
        // A session that is gone lands on the invalid-session page silently; anything else also toasts.
        if (isCurrent() && !isSessionGone) {
          await handleError(error);
        }

        // Only clear the context if the session is gone. For transient failures (5xx, network error),
        // preserve the previous context so child pages don't swap to the invalid session error page.
        if (isSessionGone) {
          return settle(undefined);
        }

        if (isCurrent()) {
          setLoadError(error);
          setIsFetching(false);
          setIsLoaded(true);
        }

        return isCurrent();
      };

      setIsFetching(true);

      const [error, context] = await asyncGetStepUpContext();

      if (!error) {
        return settle(context);
      }

      if (!shouldInitialize || (await getErrorCode(error)) !== interactionNotFoundCode) {
        return fail(error);
      }

      // A newer load started while this one was reading: initializing now would overwrite the
      // interaction storage the newer flow is building.
      if (!isCurrent()) {
        return false;
      }

      const [initError, result] = await asyncInitStepUp();

      if (initError) {
        return fail(initError);
      }

      if (result?.redirectTo) {
        // The interaction was finished with `unmet_authentication_requirements`; the application
        // explains it. The redirect unloads the page, so this never resolves.
        if (isCurrent()) {
          await redirectTo(result.redirectTo);
        }

        return false;
      }

      const [contextError, initializedContext] = await asyncGetStepUpContext();

      if (contextError) {
        return fail(contextError);
      }

      return settle(initializedContext);
    },
    [asyncGetStepUpContext, asyncInitStepUp, handleError, redirectTo]
  );

  const refetch = useCallback(async () => {
    await load(false);
  }, [load]);

  useEffect(
    () => () => {
      // Invalidate any in-flight load, so one that settles after unmount cannot toast or redirect.
      // eslint-disable-next-line @silverhand/fp/no-mutation -- invalidate in-flight loads on unmount
      loadIdRef.current += 1;
    },
    []
  );

  const stepUpContext = useMemo<StepUpContextType>(
    () => ({
      authenticationContext,
      isLoading: isFetching,
      isLoaded,
      loadError,
      load,
      refetch,
    }),
    [authenticationContext, isFetching, isLoaded, loadError, load, refetch]
  );

  return <StepUpContext.Provider value={stepUpContext}>{children}</StepUpContext.Provider>;
};

export default StepUpContextProvider;
