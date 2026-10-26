import { AuthenticationContextMode } from '@logto/schemas';
import { useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';

import { getStepUpContext } from '@/apis/experience';
import { stepUpRoutes } from '@/constants/step-up';
import useNavigateWithPreservedSearchParams from '@/hooks/use-navigate-with-preserved-search-params';
import { logtoCookies } from '@/utils/cookies';

type State = 'loading' | 'allowed' | 'blocked';

/**
 * Blocks the normal entry routes while a pure step-up interaction is active.
 *
 * A pure step-up pins its subject from the OIDC session and rejects every route that could
 * identify, create, or switch to another account. Core enforces that allow-list; this guard keeps
 * the client from rendering a form that can only fail on submission, so opening `/sign-in`,
 * `/register`, or another entry route in the same tab sends the user back to the step-up landing.
 * The landing reads the existing interaction without re-initializing it, so the proofs already
 * recorded are kept.
 *
 * The login prompt writes the mode into the flow cookie before the SPA loads, so a normal entry
 * page can decide before its first render. When the hint is absent (a page not preceded by a
 * login prompt, or a cookie written by an older version), the guard falls back to
 * `GET /experience/interaction`. A 404 is the ordinary case for a fresh sign-in: there is no
 * interaction to inspect, and the entry route renders unchanged. Any other read failure also
 * leaves the route alone.
 *
 * The cookie is a UX hint, not the security boundary: Core enforces the step-up allow-list, so a
 * stale or edited hint can only change which page the client renders.
 */
const StepUpEntryGuard = () => {
  const isStepUpHint = logtoCookies.isStepUp;
  const [state, setState] = useState<State>(() =>
    isStepUpHint === undefined ? 'loading' : isStepUpHint ? 'blocked' : 'allowed'
  );
  const isMountedRef = useRef(true);
  const navigate = useNavigateWithPreservedSearchParams();

  useEffect(() => {
    if (isStepUpHint === undefined) {
      const check = async () => {
        try {
          const authenticationContext = await getStepUpContext();

          if (isMountedRef.current) {
            setState(
              authenticationContext?.mode === AuthenticationContextMode.StepUp
                ? 'blocked'
                : 'allowed'
            );
          }
        } catch {
          // No interaction yet, or a transient read failure: the entry route decides what to show.
          if (isMountedRef.current) {
            setState('allowed');
          }
        }
      };

      void check();
    }

    return () => {
      // eslint-disable-next-line @silverhand/fp/no-mutation -- mark unmounted so the in-flight check cannot settle state
      isMountedRef.current = false;
    };
  }, [isStepUpHint]);

  useEffect(() => {
    if (state === 'blocked') {
      navigate(stepUpRoutes.landing, { replace: true });
    }
  }, [navigate, state]);

  // The form must never render while the mode is unknown or blocked: in a pure step-up its
  // submission is rejected, so rendering it would offer a flow that cannot complete.
  if (state !== 'allowed') {
    return null;
  }

  return <Outlet />;
};

export default StepUpEntryGuard;
