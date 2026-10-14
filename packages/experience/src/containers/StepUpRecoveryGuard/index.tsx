import { useEffect } from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';

import StepUpContextProvider from '@/Providers/StepUpContextProvider';
import useStepUpContext from '@/hooks/use-step-up-context';
import { UserFlow, UserMfaFlow } from '@/types';
import {
  continueFlowStateGuard,
  mfaBindingVerificationCodeStateGuard,
  mfaFlowStateGuard,
  parseGuard,
} from '@/types/guard';

import LoadErrorPage from './LoadErrorPage';

const RecoveryOutlet = () => {
  const { isLoaded, loadError, load } = useStepUpContext();
  const { pathname, state } = useLocation();
  const { flow } = useParams<{ flow: string }>();
  const flowState = pathname.startsWith(`/${UserFlow.Continue}`)
    ? (parseGuard(state, mfaBindingVerificationCodeStateGuard)?.mfaFlowState ??
      parseGuard(state, continueFlowStateGuard))
    : pathname.startsWith(`/${UserMfaFlow.MfaBinding}`) || pathname === '/mfa-onboarding'
      ? parseGuard(state, mfaFlowStateGuard)
      : undefined;
  const shouldLoad =
    (!flow || flow === UserFlow.Continue) && (!flowState || Boolean(flowState.isStepUp));

  useEffect(() => {
    // Shared continuation pages must never initialize or reset the interaction.
    if (shouldLoad) {
      void load(false);
    }
  }, [load, shouldLoad]);

  if (shouldLoad && !isLoaded) {
    return null;
  }

  if (shouldLoad && loadError) {
    return <LoadErrorPage />;
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
