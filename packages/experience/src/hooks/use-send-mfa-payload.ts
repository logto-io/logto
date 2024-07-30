import { type BindMfaPayload, type VerifyMfaPayload } from '@logto/schemas';
import { useCallback } from 'react';

import { bindMfa, verifyMfa } from '@/apis/interaction';
import { UserMfaFlow } from '@/types';

import useApi from './use-api';
import useErrorHandler, { type ErrorHandlers } from './use-error-handler';
import useGlobalRedirectTo from './use-global-redirect-to';
import usePreSignInErrorHandler from './use-pre-sign-in-error-handler';

export type SendMfaPayloadApiOptions =
  | {
      flow: UserMfaFlow.MfaBinding;
      payload: BindMfaPayload;
    }
  | {
      flow: UserMfaFlow.MfaVerification;
      payload: VerifyMfaPayload;
    };

const sendMfaPayloadApi = async ({ flow, payload }: SendMfaPayloadApiOptions) => {
  if (flow === UserMfaFlow.MfaBinding) {
    return bindMfa(payload);
  }
  return verifyMfa(payload);
};

const useSendMfaPayload = () => {
  const asyncSendMfaPayload = useApi(sendMfaPayloadApi);
  const preSignInErrorHandler = usePreSignInErrorHandler({ replace: true });
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
          ...preSignInErrorHandler,
        });
        errorCallback?.();
        return;
      }

      if (result) {
        await redirectTo(result.redirectTo);
      }
    },
    [asyncSendMfaPayload, handleError, preSignInErrorHandler, redirectTo]
  );
};

export default useSendMfaPayload;
