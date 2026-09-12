import { useMemo } from 'react';

import {
  stepUpRoutes,
  stepUpSessionGoneErrorCodes,
  unknownSessionRoute,
} from '@/constants/step-up';

import type { ErrorHandlers } from './use-error-handler';
import useNavigateWithPreservedSearchParams from './use-navigate-with-preserved-search-params';

/**
 * The errors that land on the invalid-session page: a session that is gone, and a session that
 * the request cannot belong to (the verified identity is not the pinned subject, or the route is
 * not allowed in step-up).
 */
const invalidSessionErrorCodes = Object.freeze([
  ...stepUpSessionGoneErrorCodes,
  'session.identity_conflict',
  'session.step_up.forbidden_route',
] as const);

/**
 * The error handlers shared by the step-up screens. Compose them into the handlers of every call
 * a step-up screen makes; the sentinel lockout errors and the MFA / profile errors keep their
 * existing handling.
 *
 * - The interaction is gone, the verified identity is not the pinned subject, or the route is not
 *   allowed in step-up: the invalid-session page. Nothing on the screen can recover from these.
 * - The completed verification does not satisfy the selected class: back to the method list,
 *   which refetches the authoritative context, so the user can add the missing verification.
 */
const useStepUpErrorHandler = (): ErrorHandlers => {
  const navigate = useNavigateWithPreservedSearchParams();

  return useMemo(() => {
    const showInvalidSession = () => {
      navigate(unknownSessionRoute, { replace: true });
    };

    return {
      ...Object.fromEntries(invalidSessionErrorCodes.map((code) => [code, showInvalidSession])),
      'session.step_up.acr_not_satisfied': () => {
        navigate(stepUpRoutes.landing, { replace: true });
      },
    };
  }, [navigate]);
};

export default useStepUpErrorHandler;
