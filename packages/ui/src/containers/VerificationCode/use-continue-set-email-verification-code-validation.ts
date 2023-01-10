import { SignInIdentifier } from '@logto/schemas';
import { useMemo, useCallback } from 'react';

import { addProfileWithVerificationCodeIdentifier } from '@/apis/interaction';
import type { ErrorHandlers } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import useRequiredProfileErrorHandler from '@/hooks/use-required-profile-error-handler';
import { SearchParameters } from '@/types';
import { getSearchParameters } from '@/utils';

import useIdentifierErrorAlert, { IdentifierErrorType } from './use-identifier-error-alert';
import useSharedErrorHandler from './use-shared-error-handler';

const useContinueSetEmailVerificationCode = (email: string, errorCallback?: () => void) => {
  const { sharedErrorHandlers, errorMessage, clearErrorMessage } = useSharedErrorHandler();

  const requiredProfileErrorHandler = useRequiredProfileErrorHandler(true);

  const identifierNotExistErrorHandler = useIdentifierErrorAlert(
    IdentifierErrorType.IdentifierAlreadyExists,
    SignInIdentifier.Email,
    email
  );

  const verifyVerificationCodeErrorHandlers: ErrorHandlers = useMemo(
    () => ({
      'user.email_already_in_use': identifierNotExistErrorHandler,
      ...requiredProfileErrorHandler,
      ...sharedErrorHandlers,
      callback: errorCallback,
    }),
    [
      errorCallback,
      identifierNotExistErrorHandler,
      requiredProfileErrorHandler,
      sharedErrorHandlers,
    ]
  );

  const { run: verifyVerificationCode } = useApi(
    addProfileWithVerificationCodeIdentifier,
    verifyVerificationCodeErrorHandlers
  );

  const onSubmit = useCallback(
    async (verificationCode: string) => {
      const socialToBind = getSearchParameters(location.search, SearchParameters.bindWithSocial);
      const result = await verifyVerificationCode({ email, verificationCode }, socialToBind);

      if (result?.redirectTo) {
        window.location.replace(result.redirectTo);
      }
    },
    [email, verifyVerificationCode]
  );

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useContinueSetEmailVerificationCode;
