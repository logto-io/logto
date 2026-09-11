import { Outlet } from 'react-router-dom';

import StepUpContextProvider from '@/Providers/StepUpContextProvider';
import useStepUpContext from '@/hooks/use-step-up-context';
import ErrorPage from '@/pages/ErrorPage';

const StepUpOutlet = () => {
  const { authenticationContext, isLoading } = useStepUpContext();

  if (!authenticationContext) {
    // The interaction is gone (404 `session.interaction_not_found`), or it carries no
    // authentication context: neither can enter the route tree. This is the page the
    // `unknown-session` route renders, where the step-up error handlers also land.
    return isLoading ? null : <ErrorPage message="error.invalid_session" />;
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
