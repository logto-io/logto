import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import StepUpContextProvider from '@/Providers/StepUpContextProvider';
import useStepUpContext from '@/hooks/use-step-up-context';
import ErrorPage from '@/pages/ErrorPage';

const RecoveryOutlet = () => {
  const { isLoaded, loadError, load } = useStepUpContext();

  useEffect(() => {
    // Shared continuation pages must never initialize or reset the interaction.
    void load(false);
  }, [load]);

  if (!isLoaded) {
    return null;
  }

  if (loadError) {
    return (
      <ErrorPage
        isNavbarHidden
        title="error.something_went_wrong"
        primaryAction={{
          title: 'action.continue',
          onClick: () => {
            void load(false);
          },
        }}
      />
    );
  }

  return <Outlet />;
};

/** Recover the server's mode before a shared page can run sign-in-only continuations. */
const StepUpRecoveryGuard = () => {
  const { pathname } = useLocation();

  return (
    <StepUpContextProvider key={pathname}>
      <RecoveryOutlet />
    </StepUpContextProvider>
  );
};

export default StepUpRecoveryGuard;
