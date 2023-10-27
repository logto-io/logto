import { MfaFactor, type RequestErrorBody } from '@logto/schemas';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { validate } from 'superstruct';

import { UserMfaFlow } from '@/types';
import {
  type MfaFlowState,
  mfaErrorDataGuard,
  backupCodeErrorDataGuard,
  type BackupCodeBindingState,
} from '@/types/guard';
import { isNativeWebview } from '@/utils/native-sdk';

import type { ErrorHandlers } from './use-error-handler';
import useStartTotpBinding from './use-start-totp-binding';
import useToast from './use-toast';

export type Options = {
  replace?: boolean;
};

const useMfaErrorHandler = ({ replace }: Options = {}) => {
  const navigate = useNavigate();
  const { setToast } = useToast();
  const startTotpBinding = useStartTotpBinding({ replace });

  const handleMfaRedirect = useCallback(
    (flow: UserMfaFlow, state: MfaFlowState) => {
      const { availableFactors } = state;

      if (flow === UserMfaFlow.MfaVerification) {
        // In MFA verification flow, the user will be redirected to the last used factor which is the first one in the array.
        const factor = availableFactors[0];

        if (!factor) {
          return;
        }

        navigate({ pathname: `/${flow}/${factor}` }, { replace, state });
        return;
      }

      // Binding flow
      if (availableFactors.length > 1) {
        navigate({ pathname: `/${flow}` }, { replace, state });
        return;
      }

      const factor = availableFactors[0];

      if (!factor) {
        return;
      }

      if (factor === MfaFactor.TOTP) {
        void startTotpBinding(state);
        return;
      }

      navigate({ pathname: `/${flow}/${factor}` }, { replace, state });
    },
    [navigate, replace, startTotpBinding]
  );

  const handleMfaError = useCallback(
    (flow: UserMfaFlow) => {
      return (error: RequestErrorBody) => {
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

        handleMfaRedirect(flow, { availableFactors, skippable });
      };
    },
    [handleMfaRedirect, setToast]
  );

  const handleBackupCodeError = useCallback(
    (error: RequestErrorBody) => {
      const [_, data] = validate(error.data, backupCodeErrorDataGuard);

      if (!data) {
        setToast(error.message);
        return;
      }

      navigate(
        { pathname: `/${UserMfaFlow.MfaBinding}/${MfaFactor.BackupCode}` },
        { replace, state: data satisfies BackupCodeBindingState }
      );
    },
    [navigate, replace, setToast]
  );

  const mfaVerificationErrorHandler = useMemo<ErrorHandlers>(
    () => ({
      'user.missing_mfa': handleMfaError(UserMfaFlow.MfaBinding),
      'session.mfa.require_mfa_verification': handleMfaError(UserMfaFlow.MfaVerification),
      'session.mfa.backup_code_required': handleBackupCodeError,
    }),
    [handleBackupCodeError, handleMfaError]
  );

  return mfaVerificationErrorHandler;
};

export default useMfaErrorHandler;
