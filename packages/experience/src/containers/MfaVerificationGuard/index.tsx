import {
  AuthenticationContextMode,
  VerificationType,
  webAuthnAuthenticationOptionsGuard,
} from '@logto/schemas';
import { useContext, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import StepUpContextProvider from '@/Providers/StepUpContextProvider';
import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import { stepUpRoutes } from '@/constants/step-up';
import useNavigateWithPreservedSearchParams from '@/hooks/use-navigate-with-preserved-search-params';
import useStepUpContext from '@/hooks/use-step-up-context';
import ErrorPage from '@/pages/ErrorPage';
import { mfaFlowStateGuard, parseGuard, webAuthnStateGuard } from '@/types/guard';
import { getDisplayedStepUpMethods, stepUpMethodToMfaFactor } from '@/utils/step-up';

import StepUpMethodList from '../StepUpMethodList';
import useSelectStepUpMethod from '../StepUpMethodList/use-select-step-up-method';

const MfaVerificationOutlet = () => {
  const { authenticationContext, isLoaded, load } = useStepUpContext();
  const { pathname, state } = useLocation();
  const flowState = parseGuard(state, mfaFlowStateGuard);
  const shouldLoad = !flowState || Boolean(flowState.isStepUp);
  const navigate = useNavigateWithPreservedSearchParams();
  const { verificationIdsMap } = useContext(UserInteractionContext);
  const [recoveryAttempted, setRecoveryAttempted] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const isStepUp = authenticationContext?.mode === AuthenticationContextMode.StepUp;
  const methods = getDisplayedStepUpMethods(authenticationContext?.availableMethods ?? []);
  const method = methods.find(
    (candidate) => pathname === `/mfa-verification/${stepUpMethodToMfaFactor[candidate]}`
  );
  const webAuthnState = parseGuard(state, webAuthnStateGuard);
  const needsChallenge =
    (method === VerificationType.WebAuthn &&
      (!verificationIdsMap[VerificationType.WebAuthn] ||
        !webAuthnAuthenticationOptionsGuard.safeParse(webAuthnState?.options).success)) ||
    (method === VerificationType.MfaEmailVerificationCode &&
      !verificationIdsMap[VerificationType.EmailVerificationCode]) ||
    (method === VerificationType.MfaPhoneVerificationCode &&
      !verificationIdsMap[VerificationType.PhoneVerificationCode]);
  const selectMethod = useSelectStepUpMethod({
    methods,
    authenticationContext: authenticationContext ?? { maskedIdentifiers: {} },
    replace: true,
  });

  useEffect(() => {
    // Read only: revisiting a factor must never reset the interaction's existing proofs.
    if (shouldLoad) {
      void load(false);
    }
  }, [load, shouldLoad]);

  useEffect(() => {
    if (isStepUp && !method) {
      navigate(stepUpRoutes.landing, { replace: true });
    }
  }, [isStepUp, method, navigate]);

  useEffect(() => {
    if (!isStepUp || !method || !needsChallenge || recoveryAttempted) {
      return;
    }

    setRecoveryAttempted(true);
    setIsRecovering(true);
    // Reuse the normal authentication/code start paths, never WebAuthn registration.
    const recover = async () => {
      try {
        await selectMethod(method);
      } finally {
        setIsRecovering(false);
      }
    };
    void recover();
  }, [isStepUp, method, needsChallenge, recoveryAttempted, selectMethod]);

  if ((shouldLoad && !isLoaded) || (isStepUp && (!method || isRecovering))) {
    return null;
  }

  // The step-up chooser is also used by SignIn-with-ACR, whose context has no mode.
  if (flowState?.isStepUp && !authenticationContext) {
    return <ErrorPage message="error.invalid_session" />;
  }

  if (isStepUp && needsChallenge) {
    // A transient send/options failure leaves the methods available for a deliberate retry.
    return recoveryAttempted ? (
      <SecondaryPageLayout title="step_up.verify_your_identity">
        <StepUpMethodList methods={methods} authenticationContext={authenticationContext} />
      </SecondaryPageLayout>
    ) : null;
  }

  return <Outlet />;
};

/** Shared MFA pages keep their normal flow; only Core can select pure step-up behavior. */
const MfaVerificationGuard = () => (
  <StepUpContextProvider>
    <MfaVerificationOutlet />
  </StepUpContextProvider>
);

export default MfaVerificationGuard;
