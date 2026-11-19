import { MfaFactor, SignInIdentifier, type RequestErrorBody } from '@logto/schemas';
import { useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import useNavigateWithPreservedSearchParams from '@/hooks/use-navigate-with-preserved-search-params';
import { UserMfaFlow } from '@/types';
import { type MfaFlowState, mfaErrorDataGuard, parseGuard } from '@/types/guard';
import { isFactorBoundInSuggestion } from '@/utils/mfa';
import { isNativeWebview } from '@/utils/native-sdk';

import type { ErrorHandlers } from './use-error-handler';
import useSendMfaVerificationCode from './use-send-mfa-verification-code';
import useStartBackupCodeBinding from './use-start-backup-code-binding';
import useStartIdentifierMfaBinding from './use-start-identifier-mfa-binding';
import useStartTotpBinding from './use-start-totp-binding';
import useStartWebAuthnProcessing from './use-start-webauthn-processing';
import useToast from './use-toast';

export type Options = {
  /** Whether to replace the current page in the history stack on navigation. */
  replace?: boolean;
};

const useMfaErrorHandler = ({ replace }: Options = {}) => {
  const navigate = useNavigateWithPreservedSearchParams();
  const { t } = useTranslation();
  const { setToast } = useToast();
  const startTotpBinding = useStartTotpBinding();
  const startWebAuthnProcessing = useStartWebAuthnProcessing();
  const startBackupCodeBinding = useStartBackupCodeBinding();
  const { onSubmit: startMfaVerificationCodeProcessing } = useSendMfaVerificationCode({ replace });

  const mfaErrorHandlerRef = useRef<ErrorHandlers>({});
  const recursiveMfaErrorHandlers = useMemo<ErrorHandlers>(
    () => ({
      'user.suggest_mfa': async (error) => mfaErrorHandlerRef.current['user.suggest_mfa']?.(error),
      'user.missing_mfa': async (error) => mfaErrorHandlerRef.current['user.missing_mfa']?.(error),
      'session.mfa.require_mfa_verification': async (error) =>
        mfaErrorHandlerRef.current['session.mfa.require_mfa_verification']?.(error),
      'session.mfa.suggest_additional_mfa': async (error) =>
        mfaErrorHandlerRef.current['session.mfa.suggest_additional_mfa']?.(error),
      'session.mfa.backup_code_required': async (error) =>
        mfaErrorHandlerRef.current['session.mfa.backup_code_required']?.(error),
    }),
    []
  );
  const startIdentifierMfaBinding = useStartIdentifierMfaBinding({
    replace,
    submitErrorHandlers: recursiveMfaErrorHandlers,
  });

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

      if (flow === UserMfaFlow.MfaBinding && isFactorBoundInSuggestion(factor, state)) {
        /**
         * Keep suggestions whose only remaining factor is already bound (e.g. after filtering out
         * WebAuthn in a native WebView) on the factor list / skip screen instead of re-enrolling it.
         */
        navigate({ pathname: `/${flow}` }, { replace, state });
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

      if (
        (factor === MfaFactor.EmailVerificationCode ||
          factor === MfaFactor.PhoneVerificationCode) &&
        flow === UserMfaFlow.MfaBinding
      ) {
        return startIdentifierMfaBinding(factor, state);
      }

      if (factor === MfaFactor.EmailVerificationCode && flow === UserMfaFlow.MfaVerification) {
        return startMfaVerificationCodeProcessing(SignInIdentifier.Email, state);
      }

      if (factor === MfaFactor.PhoneVerificationCode && flow === UserMfaFlow.MfaVerification) {
        return startMfaVerificationCodeProcessing(SignInIdentifier.Phone, state);
      }

      /**
       * Redirect to the specific MFA factor page.
       */
      navigate({ pathname: `/${flow}/${factor}` }, { replace, state });
    },
    [
      navigate,
      replace,
      setToast,
      startIdentifierMfaBinding,
      startMfaVerificationCodeProcessing,
      startTotpBinding,
      startWebAuthnProcessing,
      t,
    ]
  );

  const handleMfaError = useCallback(
    (flow: UserMfaFlow) => {
      return async (error: RequestErrorBody) => {
        if (error.code === 'user.suggest_mfa') {
          navigate({ pathname: `/mfa-onboarding` }, { replace });
          return;
        }

        const data = parseGuard(error.data, mfaErrorDataGuard);
        const factors = data?.availableFactors ?? [];
        const skippable = data?.skippable;
        const maskedIdentifiers = data?.maskedIdentifiers;
        const boundFactors = data?.boundFactors;
        const suggestion = data?.suggestion;
        const isWebAuthnUsedAsSignInPasskey = data?.isWebAuthnUsedAsSignInPasskey;

        if (factors.length === 0) {
          setToast(error.message);
          return;
        }

        const availableFactors =
          // Hide the webauthn factor on native webview if the user has other options, since it's not supported.
          isNativeWebview() && factors.length > 1
            ? factors.filter((factor) => factor !== MfaFactor.WebAuthn)
            : factors;

        await handleMfaRedirect(flow, {
          availableFactors,
          skippable,
          maskedIdentifiers,
          boundFactors,
          suggestion,
          isWebAuthnUsedAsSignInPasskey,
        });
      };
    },
    [handleMfaRedirect, navigate, replace, setToast]
  );

  const mfaVerificationErrorHandler = useMemo<ErrorHandlers>(
    () => ({
      'user.suggest_mfa': handleMfaError(UserMfaFlow.MfaBinding),
      'user.missing_mfa': handleMfaError(UserMfaFlow.MfaBinding),
      'session.mfa.require_mfa_verification': handleMfaError(UserMfaFlow.MfaVerification),
      // Optional suggestion to add another MFA during registration
      'session.mfa.suggest_additional_mfa': handleMfaError(UserMfaFlow.MfaBinding),
      'session.mfa.backup_code_required': async () => startBackupCodeBinding(replace),
    }),
    [handleMfaError, replace, startBackupCodeBinding]
  );

  // eslint-disable-next-line @silverhand/fp/no-mutation -- break circular dependency between MFA redirect and direct submission error handling
  mfaErrorHandlerRef.current = mfaVerificationErrorHandler;

  return mfaVerificationErrorHandler;
};

export default useMfaErrorHandler;
