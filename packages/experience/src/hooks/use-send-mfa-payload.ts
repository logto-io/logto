import { type BindMfaPayload, type VerifyMfaPayload } from '@logto/schemas';
import { useCallback } from 'react';

import { bindMfa, verifyMfa } from '@/apis/experience';
import { UserMfaFlow } from '@/types';

import useApi from './use-api';
import useErrorHandler, { type ErrorHandlers } from './use-error-handler';
import useGlobalRedirectTo from './use-global-redirect-to';
import useMfaSubmitErrorHandler from './use-mfa-submit-error-handler';

export type SendMfaPayloadApiOptions =
  | {
      flow: UserMfaFlow.MfaBinding;
      payload: BindMfaPayload;
      verificationId: string;
    }
  | {
      flow: UserMfaFlow.MfaVerification;
      payload: VerifyMfaPayload;
      verificationId?: string;
    };

const sendMfaPayloadApi = async ({ flow, payload, verificationId }: SendMfaPayloadApiOptions) => {
  if (flow === UserMfaFlow.MfaBinding) {
    return bindMfa(payload.type, verificationId, payload);
  }
  return verifyMfa(payload, verificationId);
};

const useSendMfaPayload = () => {
  const asyncSendMfaPayload = useApi(sendMfaPayloadApi);
  const submitErrorHandler = useMfaSubmitErrorHandler();
  const handleError = useErrorHandler();
  const redirectTo = useGlobalRedirectTo();

  return useCallback(
    async (
      apiOptions: SendMfaPayloadApiOptions,
      errorHandlers?: ErrorHandlers,
      errorCallback?: () => void
    ) => {
      const [error, result] = await asyncSendMfaPayload(apiOptions);

      if (error) {
        await handleError(error, {
          ...errorHandlers,
          ...submitErrorHandler,
        });
        errorCallback?.();
        return;
      }

      if (result) {
        await redirectTo(result.redirectTo);
      }
    },
    [asyncSendMfaPayload, handleError, submitErrorHandler, redirectTo]
  );
};

export default useSendMfaPayload;
