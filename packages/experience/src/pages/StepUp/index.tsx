import { InteractionEvent } from '@logto/schemas';
import { useEffect, useMemo, useRef, useState } from 'react';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import { submitInteraction } from '@/apis/experience';
import StepUpMethodList from '@/containers/StepUpMethodList';
import useSelectStepUpMethod from '@/containers/StepUpMethodList/use-select-step-up-method';
import StepUpSubjectProofList from '@/containers/StepUpSubjectProofList';
import useApi from '@/hooks/use-api';
import useConnectors from '@/hooks/use-connectors';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
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
 * - No method: render the subject-proof connectors when Core lists any and they are enabled in SIE,
 *   forward to the `/continue/:type` page when a first factor can be established, or attempt
 *   submission if the interaction was already satisfied before falling back to the terminal page.
 *
 * Every decision reads the server-provided lists; nothing here computes eligibility.
 */
const StepUp = () => {
  const { authenticationContext, isLoading, load } = useStepUpContext();
  const navigate = useNavigateWithPreservedSearchParams();
  const redirectTo = useGlobalRedirectTo();
  const asyncSubmitInteraction = useApi(submitInteraction);
  const { findConnectorById } = useConnectors();
  const hasForwardedRef = useRef(false);
  const [isForwarding, setIsForwarding] = useState(true);

  useEffect(() => {
    void load(true);
  }, [load]);

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

  const resolvedConnectors = useMemo(
    () =>
      (authenticationContext?.subjectProofConnectors ?? [])
        .map(({ connectorId }) => findConnectorById(connectorId))
        .filter((resolved): resolved is NonNullable<typeof resolved> => resolved !== undefined),
    [authenticationContext?.subjectProofConnectors, findConnectorById]
  );

  useEffect(() => {
    if (isLoading || !authenticationContext || hasForwardedRef.current) {
      return;
    }

    const [onlyMethod] = methods;
    const { establishableMethods } = authenticationContext;
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

    if (methods.length === 0 && resolvedConnectors.length === 0) {
      if (establishableMethod) {
        // eslint-disable-next-line @silverhand/fp/no-mutation
        hasForwardedRef.current = true;
        navigate(`/${UserFlow.Continue}/${establishableMethod}`, {
          replace: true,
          state: { interactionEvent: InteractionEvent.SignIn },
        });
        return;
      }

      // A satisfied interaction returns empty availableMethods. If submit failed transiently or the
      // user re-entered /step-up, attempt submitting before rendering the terminal no-method error.
      // eslint-disable-next-line @silverhand/fp/no-mutation
      hasForwardedRef.current = true;
      const attemptSubmit = async () => {
        try {
          const [error, result] = await asyncSubmitInteraction();
          if (!error && result?.redirectTo) {
            await redirectTo(result.redirectTo);
            return;
          }
        } catch {
          // If submit fails, fall through to display the no-method error page.
        }
        setIsForwarding(false);
      };

      void attemptSubmit();
      return;
    }

    setIsForwarding(false);
  }, [
    asyncSubmitInteraction,
    authenticationContext,
    isLoading,
    methods,
    navigate,
    redirectTo,
    resolvedConnectors.length,
    selectMethod,
  ]);

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

  if (resolvedConnectors.length > 0) {
    return (
      <SecondaryPageLayout
        isNavBarHidden
        title="step_up.verify_your_identity"
        description="step_up.subject_proof_description"
      >
        <StepUpSubjectProofList connectors={resolvedConnectors} />
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
