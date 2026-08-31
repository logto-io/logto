import { InteractionEvent, type BindMfaPayload, type VerifyMfaPayload } from '@logto/schemas';
import { useCallback } from 'react';

import { bindMfa, verifyMfa } from '@/apis/experience';
import { UserMfaFlow } from '@/types';

import useApi from './use-api';
import useErrorHandler, { type ErrorHandlers } from './use-error-handler';
import useGlobalRedirectTo from './use-global-redirect-to';
import useSubmitInteractionErrorHandler from './use-submit-interaction-error-handler';

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
  /**
   * TODO: @simeng-li
   * Need to find a better implementation.
   * In the registration event, MFA binding flow is triggered after user creation,
   * so the error handle logic is same as the pre-sign-in event.
   * This is confusing and should be refactored.
   */
  const preSignInErrorHandler = useSubmitInteractionErrorHandler(InteractionEvent.SignIn, {
    replace: true,
  });
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
