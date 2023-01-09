import { SignInIdentifier } from '@logto/schemas';
import { useMemo, useCallback } from 'react';

import { addProfileWithVerificationCodeIdentifier } from '@/apis/interaction';
import type { ErrorHandlers } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import useRequiredProfileErrorHandler from '@/hooks/use-required-profile-error-handler';
import { UserFlow, SearchParameters } from '@/types';
import { getSearchParameters } from '@/utils';

import useIdentifierErrorAlert from './use-identifier-error-alert';
import useSharedErrorHandler from './use-shared-error-handler';

const useContinueSetPhoneVerificationCode = (phone: string, errorCallback?: () => void) => {
  const { sharedErrorHandlers, errorMessage, clearErrorMessage } = useSharedErrorHandler();

  const requiredProfileErrorHandler = useRequiredProfileErrorHandler(true);

  const identifierExistErrorHandler = useIdentifierErrorAlert(
    UserFlow.continue,
    SignInIdentifier.Phone,
    phone
  );

  const verifyVerificationCodeErrorHandlers: ErrorHandlers = useMemo(
    () => ({
      'user.phone_already_in_use': identifierExistErrorHandler,
      ...requiredProfileErrorHandler,
      ...sharedErrorHandlers,
      callback: errorCallback,
    }),
    [errorCallback, identifierExistErrorHandler, requiredProfileErrorHandler, sharedErrorHandlers]
  );

  const { run: verifyVerificationCode } = useApi(
    addProfileWithVerificationCodeIdentifier,
    verifyVerificationCodeErrorHandlers
  );

  const onSubmit = useCallback(
    async (verificationCode: string) => {
      const socialToBind = getSearchParameters(location.search, SearchParameters.bindWithSocial);
      const result = await verifyVerificationCode({ phone, verificationCode }, socialToBind);

      if (result?.redirectTo) {
        window.location.replace(result.redirectTo);
      }
    },
    [phone, verifyVerificationCode]
  );

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useContinueSetPhoneVerificationCode;
