import { InteractionEvent } from '@logto/schemas';
import { useEffect, useMemo, useRef, useState } from 'react';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import StepUpMethodList from '@/containers/StepUpMethodList';
import useSelectStepUpMethod from '@/containers/StepUpMethodList/use-select-step-up-method';
import StepUpSubjectProofList from '@/containers/StepUpSubjectProofList';
import useNavigateWithPreservedSearchParams from '@/hooks/use-navigate-with-preserved-search-params';
import useStepUpContext from '@/hooks/use-step-up-context';
import ErrorPage from '@/pages/ErrorPage';
import { UserFlow } from '@/types';
import { getDisplayedStepUpMethods } from '@/utils/step-up';

const emptyMethods: never[] = [];
/** A stable placeholder while the context loads, so the selection hook keeps its identity. */
const emptyAuthenticationContext = Object.freeze({ maskedIdentifiers: {} });

/**
 * The `/step-up` landing: dispatches on the authentication context the guard loaded from Core.
 *
 * - Exactly one method: forward to it, replacing this entry so "back" does not return here.
 * - Several methods: render the chooser.
 * - No method: render the subject-proof connectors when Core lists any, or forward to the
 *   `/continue/:type` page when a first factor can be established. Core fast-fails at creation
 *   when nothing is possible, so the final fallback only covers a method removed mid-flow.
 *
 * Every decision reads the server-provided lists; nothing here computes eligibility.
 */
const StepUp = () => {
  const { authenticationContext, isLoading } = useStepUpContext();
  const navigate = useNavigateWithPreservedSearchParams();
  const hasForwardedRef = useRef(false);
  const [isForwarding, setIsForwarding] = useState(true);

  const methods = useMemo(
    () =>
      authenticationContext
        ? getDisplayedStepUpMethods(authenticationContext.availableMethods)
        : emptyMethods,
    [authenticationContext]
  );
  const selectMethod = useSelectStepUpMethod({
    methods,
    authenticationContext: authenticationContext ?? emptyAuthenticationContext,
    replace: true,
  });

  useEffect(() => {
    if (isLoading || !authenticationContext || hasForwardedRef.current) {
      return;
    }

    const [onlyMethod] = methods;
    const { establishableMethods, subjectProofConnectors } = authenticationContext;
    const [establishableMethod] = establishableMethods;

    if (methods.length === 1 && onlyMethod) {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      hasForwardedRef.current = true;
      // A method that starts with a request (sending a code, WebAuthn options) can fail; the
      // chooser then renders the single method so the user can retry.
      const forward = async () => {
        try {
          await selectMethod(onlyMethod);
        } finally {
          setIsForwarding(false);
        }
      };

      void forward();
      return;
    }

    if (methods.length === 0 && subjectProofConnectors.length === 0 && establishableMethod) {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      hasForwardedRef.current = true;
      navigate(`/${UserFlow.Continue}/${establishableMethod}`, {
        replace: true,
        state: { interactionEvent: InteractionEvent.SignIn },
      });
      return;
    }

    setIsForwarding(false);
  }, [authenticationContext, isLoading, methods, navigate, selectMethod]);

  // The guard renders the invalid-session page when there is no context.
  if (isLoading || !authenticationContext || isForwarding) {
    return null;
  }

  if (methods.length > 0) {
    return (
      <SecondaryPageLayout
        isNavBarHidden
        title="step_up.verify_your_identity"
        description="step_up.choose_method_description"
      >
        <StepUpMethodList methods={methods} authenticationContext={authenticationContext} />
      </SecondaryPageLayout>
    );
  }

  if (authenticationContext.subjectProofConnectors.length > 0) {
    return (
      <SecondaryPageLayout
        isNavBarHidden
        title="step_up.verify_your_identity"
        description="step_up.subject_proof_description"
      >
        <StepUpSubjectProofList connectors={authenticationContext.subjectProofConnectors} />
      </SecondaryPageLayout>
    );
  }

  return (
    <ErrorPage
      isNavbarHidden
      title="step_up.no_method_available"
      message="step_up.no_method_available_description"
    />
  );
};

export default StepUp;
