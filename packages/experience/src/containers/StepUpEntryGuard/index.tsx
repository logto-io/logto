import { AuthenticationContextMode } from '@logto/schemas';
import { useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';

import { getStepUpContext } from '@/apis/experience';
import ErrorPage from '@/pages/ErrorPage';

type State = 'loading' | 'allowed' | 'blocked';

/**
 * Blocks the normal entry routes while a pure step-up interaction is active.
 *
 * A pure step-up pins its subject from the OIDC session and rejects every route that could
 * identify, create, or switch to another account. Core enforces that allow-list; this guard keeps
 * the client from rendering a form that can only fail on submission, so opening `/sign-in`,
 * `/register`, or another entry route in the same tab shows the invalid-session page instead.
 *
 * The mode is server state, so it is read from `GET /experience/interaction`. A 404 is the
 * ordinary case for a fresh sign-in: there is no interaction to inspect, and the entry route
 * renders unchanged. Any other read failure also leaves the route alone; Core remains the
 * security boundary.
 */
const StepUpEntryGuard = () => {
  const [state, setState] = useState<State>('loading');
  const isMountedRef = useRef(true);

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

  // The form must never render while the mode is unknown: in a pure step-up its submission is
  // rejected, so rendering it first would offer a flow that cannot complete.
  if (state === 'loading') {
    return null;
  }

  if (state === 'blocked') {
    return <ErrorPage message="error.invalid_session" />;
  }

  return <Outlet />;
};

export default StepUpEntryGuard;
