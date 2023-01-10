import type { EmailVerificationCodePayload, PhoneVerificationCodePayload } from '@logto/schemas';
import { SignInIdentifier } from '@logto/schemas';
import { useMemo, useCallback } from 'react';

import { addProfileWithVerificationCodeIdentifier } from '@/apis/interaction';
import type { ErrorHandlers } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import useRequiredProfileErrorHandler from '@/hooks/use-required-profile-error-handler';
import type { VerificationCodeIdentifier } from '@/types';
import { SearchParameters } from '@/types';
import { getSearchParameters } from '@/utils';

import useGeneralVerificationCodeErrorHandler from './use-general-verification-code-error-handler';
import useIdentifierErrorAlert, { IdentifierErrorType } from './use-identifier-error-alert';

const useContinueFlowCodeVerification = (
  _method: VerificationCodeIdentifier,
  target: string,
  errorCallback?: () => void
) => {
  const { generalVerificationCodeErrorHandlers, errorMessage, clearErrorMessage } =
    useGeneralVerificationCodeErrorHandler();

  const requiredProfileErrorHandler = useRequiredProfileErrorHandler(true);

  const identifierErrorHandler = useIdentifierErrorAlert();

  const verifyVerificationCodeErrorHandlers: ErrorHandlers = useMemo(
    () => ({
      'user.phone_already_in_use': () => {
        void identifierErrorHandler(
          IdentifierErrorType.IdentifierAlreadyExists,
          SignInIdentifier.Phone,
          target
        );
      },
      'user.email_already_in_use': () => {
        void identifierErrorHandler(
          IdentifierErrorType.IdentifierAlreadyExists,
          SignInIdentifier.Email,
          target
        );
      },
      ...requiredProfileErrorHandler,
      ...generalVerificationCodeErrorHandlers,
      callback: errorCallback,
    }),
    [
      errorCallback,
      target,
      identifierErrorHandler,
      requiredProfileErrorHandler,
      generalVerificationCodeErrorHandlers,
    ]
  );

  const { run: verifyVerificationCode } = useApi(
    addProfileWithVerificationCodeIdentifier,
    verifyVerificationCodeErrorHandlers
  );

  const onSubmit = useCallback(
    async (payload: EmailVerificationCodePayload | PhoneVerificationCodePayload) => {
      const socialToBind = getSearchParameters(location.search, SearchParameters.bindWithSocial);
      const result = await verifyVerificationCode(payload, socialToBind);

      if (result?.redirectTo) {
        window.location.replace(result.redirectTo);
      }
    },
    [verifyVerificationCode]
  );

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useContinueFlowCodeVerification;
