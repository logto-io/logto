import { AuthenticationContextMode } from '@logto/schemas';
import { useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';

import { getStepUpContext } from '@/apis/experience';
import { stepUpRoutes } from '@/constants/step-up';
import useNavigateWithPreservedSearchParams from '@/hooks/use-navigate-with-preserved-search-params';

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
 * The mode is server state, so it is read from `GET /experience/interaction`. A 404 is the
 * ordinary case for a fresh sign-in: there is no interaction to inspect, and the entry route
 * renders unchanged. Any other read failure also leaves the route alone; Core remains the
 * security boundary.
 */
const StepUpEntryGuard = () => {
  const [state, setState] = useState<State>('loading');
  const isMountedRef = useRef(true);
  const navigate = useNavigateWithPreservedSearchParams();

  useEffect(() => {
    const check = async () => {
      try {
        const authenticationContext = await getStepUpContext();

        if (isMountedRef.current) {
          setState(
            authenticationContext?.mode === AuthenticationContextMode.StepUp ? 'blocked' : 'allowed'
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

    return () => {
      // eslint-disable-next-line @silverhand/fp/no-mutation -- mark unmounted so the in-flight check cannot settle state
      isMountedRef.current = false;
    };
  }, []);

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
