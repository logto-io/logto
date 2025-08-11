import { MfaFactor, type RequestErrorBody } from '@logto/schemas';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { validate } from 'superstruct';

import { UserMfaFlow } from '@/types';
import { type MfaFlowState, mfaErrorDataGuard } from '@/types/guard';
import { isNativeWebview } from '@/utils/native-sdk';

import type { ErrorHandlers } from './use-error-handler';
import useStartBackupCodeBinding from './use-start-backup-code-binding';
import useStartTotpBinding from './use-start-totp-binding';
import useStartWebAuthnProcessing from './use-start-webauthn-processing';
import useToast from './use-toast';

export type Options = {
  /** Whether to replace the current page in the history stack on navigation. */
  replace?: boolean;
};

const useMfaErrorHandler = ({ replace }: Options = {}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setToast } = useToast();
  const startTotpBinding = useStartTotpBinding();
  const startWebAuthnProcessing = useStartWebAuthnProcessing();
  const startBackupCodeBinding = useStartBackupCodeBinding();

  /**
   * Redirect the user to the corresponding MFA page.
   *
   * Binding pages are hosted on following routes:
   * - /{@link UserMfaFlow.MfaBinding} List of available MFA factors for binding.
   * - /{@link UserMfaFlow.MfaBinding}/{@link MfaFactor} Binding page for the specific factor.
   *
   * Verification pages are hosted on following routes:
   * - /{@link UserMfaFlow.MfaVerification} List of available MFA factors for verification.
   * - /{@link UserMfaFlow.MfaVerification}/{@link MfaFactor} Verification page for the specific factor.
   *
   * Redirection rules:
   * - If there is only one available factor, redirect to the specific MFA factor page.
   * - If there are multiple available factors:
   *    - Binding: redirect to the available factors list page.
   *    - Verification: redirect to the last used specific factor page.
   */
  const handleMfaRedirect = useCallback(
    async (flow: UserMfaFlow, state: MfaFlowState) => {
      const { availableFactors } = state;

      if (availableFactors.length > 1 && flow === UserMfaFlow.MfaBinding) {
        /**
         * Redirect to the MFA binding page if there are multiple available factors.
         */
        navigate({ pathname: `/${flow}` }, { replace, state });
        return;
      }

      /**
       * For verification: the first available factor is the last used factor which is guaranteed by the backend.
       * For binding: the first available factor is the only available factor since we handle the multiple factors case above.
       */
      const factor = availableFactors[0];

      if (!factor) {
        /**
         * This should never happen since we check the available factors' length before handling the redirection.
         */
        setToast(t('error.unknown'));
        return;
      }

      if (factor === MfaFactor.TOTP && flow === UserMfaFlow.MfaBinding) {
        /**
         * Start TOTP binding process if only TOTP is available.
         */
        return startTotpBinding(state, replace);
      }

      if (factor === MfaFactor.WebAuthn) {
        /**
         * Start WebAuthn processing if only TOTP is available.
         */
        return startWebAuthnProcessing(flow, state, replace);
      }

      if (factor === MfaFactor.EmailVerificationCode && flow === UserMfaFlow.MfaBinding) {
        /**
         * Start email verification code binding if only email verification code is available.
         */
        navigate({ pathname: `/${flow}/${factor}` }, { replace, state });
        return;
      }

      /**
       * Redirect to the specific MFA factor page.
       */
      navigate({ pathname: `/${flow}/${factor}` }, { replace, state });
    },
    [navigate, replace, setToast, startTotpBinding, startWebAuthnProcessing, t]
  );

  const handleMfaError = useCallback(
    (flow: UserMfaFlow) => {
      return async (error: RequestErrorBody) => {
        const [_, data] = validate(error.data, mfaErrorDataGuard);
        const factors = data?.availableFactors ?? [];
        const skippable = data?.skippable;

        if (factors.length === 0) {
          setToast(error.message);
          return;
        }

        const availableFactors =
          // Hide the webauthn factor on native webview if the user has other options, since it's not supported.
          isNativeWebview() && factors.length > 1
            ? factors.filter((factor) => factor !== MfaFactor.WebAuthn)
            : factors;

        await handleMfaRedirect(flow, { availableFactors, skippable });
      };
    },
    [handleMfaRedirect, setToast]
  );

  const mfaVerificationErrorHandler = useMemo<ErrorHandlers>(
    () => ({
      'user.missing_mfa': handleMfaError(UserMfaFlow.MfaBinding),
      'session.mfa.require_mfa_verification': handleMfaError(UserMfaFlow.MfaVerification),
      'session.mfa.backup_code_required': async () => startBackupCodeBinding(replace),
    }),
    [handleMfaError, replace, startBackupCodeBinding]
  );

  return mfaVerificationErrorHandler;
};

export default useMfaErrorHandler;
