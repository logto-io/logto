import { MfaFactor } from '@logto/schemas';
import { useCallback, useMemo, useState } from 'react';

import { bindMfa, verifyMfa } from '@/apis/interaction';
import useApi from '@/hooks/use-api';
import useErrorHandler, { type ErrorHandlers } from '@/hooks/use-error-handler';
import useMfaVerificationErrorHandler from '@/hooks/use-mfa-verification-error-handler';
import useRequiredProfileErrorHandler from '@/hooks/use-required-profile-error-handler';
import { UserMfaFlow } from '@/types';

type Options = {
  flow: UserMfaFlow;
};
const useTotpCodeVerification = ({ flow }: Options) => {
  const [errorMessage, setErrorMessage] = useState<string>();
  const asyncBindMfa = useApi(bindMfa);
  const asyncVerifyMfa = useApi(verifyMfa);

  const requiredProfileErrorHandlers = useRequiredProfileErrorHandler({ replace: true });
  const mfaVerificationErrorHandler = useMfaVerificationErrorHandler({ replace: true });
  const handleError = useErrorHandler();

  const errorHandlers: ErrorHandlers = useMemo(
    () => ({
      'session.mfa.invalid_totp_code': (error) => {
        setErrorMessage(error.message);
      },
      ...requiredProfileErrorHandlers,
      ...mfaVerificationErrorHandler,
    }),
    [mfaVerificationErrorHandler, requiredProfileErrorHandlers]
  );

  const onSubmit = useCallback(
    async (code: string) => {
      // Todo @xiaoyijun refactor this logic
      if (flow === UserMfaFlow.MfaBinding) {
        const [error, result] = await asyncBindMfa({ type: MfaFactor.TOTP, code });
        if (error) {
          await handleError(error, errorHandlers);
          return;
        }

        if (result) {
          window.location.replace(result.redirectTo);
        }

        return;
      }

      // Verify TOTP
      const [error, result] = await asyncVerifyMfa({ type: MfaFactor.TOTP, code });
      if (error) {
        await handleError(error, errorHandlers);
        return;
      }

      if (result) {
        window.location.replace(result.redirectTo);
      }
    },
    [asyncBindMfa, asyncVerifyMfa, errorHandlers, flow, handleError]
  );

  return {
    errorMessage,
    onSubmit,
  };
};

export default useTotpCodeVerification;
