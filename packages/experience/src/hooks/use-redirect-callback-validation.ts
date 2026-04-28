import { type VerificationType } from '@logto/schemas';
import { useCallback, useContext, useRef } from 'react';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import { searchKeys } from '@/shared/utils/search-parameters';
import { validateState } from '@/utils/social-connectors';
import {
  consumeRedirectContext,
  removeRedirectContext,
} from '@/utils/social-redirect-fallback-context';

type ValidationSuccess = { valid: true; verificationId: string };
type ValidationFailure = {
  valid: false;
  error: 'invalid_connector_auth' | 'invalid_session';
};

export type ValidationResult = ValidationSuccess | ValidationFailure;

/**
 * Hook that encapsulates state validation + localStorage fallback restore + verificationId
 * management for social/SSO redirect callbacks.
 *
 * Shared by both the social and SSO callback listeners so all fallback logic stays in one place.
 */
const useRedirectCallbackValidation = ({
  connectorId,
  flow,
  verificationType,
}: {
  connectorId: string;
  flow: 'social' | 'sso';
  verificationType: VerificationType;
}) => {
  const { verificationIdsMap, setVerificationId } = useContext(UserInteractionContext);
  const verificationId = verificationIdsMap[verificationType];
  const verificationIdRef = useRef(verificationId);

  const validateAndRestore = useCallback(
    (state: string | undefined): ValidationResult => {
      // No state in URL — nothing to validate or look up
      if (!state) {
        return { valid: false, error: 'invalid_connector_auth' };
      }

      const stateResult = validateState(state, connectorId);

      if (stateResult === 'match') {
        // Normal path — session intact, clean up fallback bundle (best effort)
        removeRedirectContext(state);

        if (!verificationIdRef.current) {
          return { valid: false, error: 'invalid_session' };
        }

        return { valid: true, verificationId: verificationIdRef.current };
      }

      if (stateResult === 'mismatch') {
        // Hard fail — state exists in session but doesn't match URL (potential CSRF)
        // Do NOT consult fallback
        return { valid: false, error: 'invalid_connector_auth' };
      }

      // 'missing' — session lost, attempt localStorage fallback
      const fallback = consumeRedirectContext(state);

      if (!fallback) {
        return { valid: false, error: 'invalid_connector_auth' };
      }

      // Ownership validation — flow and connector must match
      if (fallback.flow !== flow || fallback.connectorId !== connectorId) {
        return { valid: false, error: 'invalid_connector_auth' };
      }

      // Critical: global API interceptor reads app_id for Logto-App-Id header
      if (fallback.appId) {
        sessionStorage.setItem(searchKeys.appId, fallback.appId);
      }
      if (fallback.organizationId) {
        sessionStorage.setItem(searchKeys.organizationId, fallback.organizationId);
      }
      if (fallback.uiLocales) {
        sessionStorage.setItem(searchKeys.uiLocales, fallback.uiLocales);
      }

      // eslint-disable-next-line @silverhand/fp/no-mutation
      verificationIdRef.current = fallback.verificationId;
      setVerificationId(verificationType, fallback.verificationId);

      return { valid: true, verificationId: fallback.verificationId };
    },
    [connectorId, flow, setVerificationId, verificationType]
  );

  return { verificationIdRef, validateAndRestore };
};

export default useRedirectCallbackValidation;
