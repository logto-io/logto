import { useEffect } from 'react';
import { Outlet, useMatch } from 'react-router-dom';

import StepUpContextProvider from '@/Providers/StepUpContextProvider';
import { stepUpRoutes } from '@/constants/step-up';
import useStepUpContext from '@/hooks/use-step-up-context';
import ErrorPage from '@/pages/ErrorPage';

const StepUpOutlet = () => {
  const { authenticationContext, isLoaded, isLoading, load } = useStepUpContext();
  /** Only the landing initializes the interaction; every other route refreshes it. */
  const isLanding = Boolean(useMatch({ path: stepUpRoutes.landing, end: true }));

  useEffect(() => {
    // A child route can be the first mount after a refresh, so it loads the context itself. The
    // landing already does this in its own arrival effect, with `load(true)`.
    if (!isLanding && !isLoaded && !isLoading) {
      void load(false);
    }
  }, [isLanding, isLoaded, isLoading, load]);

  // Wait for the arrival load before deciding anything, so the invalid-session page never flashes.
  if (!isLanding && !isLoaded) {
    return null;
  }

  if (isLoaded && !isLoading && !authenticationContext) {
    // The interaction is gone (404 `session.interaction_not_found`), or it carries no
    // authentication context: neither can enter the route tree. This is the page the
    // `unknown-session` route renders, where the step-up error handlers also land.
    return <ErrorPage message="error.invalid_session" />;
  }

  // A later refetch keeps the current page mounted; the pages read the fresh context themselves.
  return <Outlet />;
};

/**
 * The route wrapper of the `/step-up` tree: loads the server-driven context and renders the
 * invalid-session page when the interaction is gone or carries no `authenticationContext`. This
 * is the server-driven analogue of the `useMfaFlowState` guard on the MFA pages.
 */
const StepUpGuard = () => (
  <StepUpContextProvider>
    <StepUpOutlet />
  </StepUpContextProvider>
);

export default StepUpGuard;
