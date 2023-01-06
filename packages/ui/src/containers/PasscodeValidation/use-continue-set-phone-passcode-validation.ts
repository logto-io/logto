import { SignInIdentifier } from '@logto/schemas';
import { useMemo, useCallback } from 'react';

import { addProfileWithPasscodeIdentifier } from '@/apis/interaction';
import type { ErrorHandlers } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import useRequiredProfileErrorHandler from '@/hooks/use-required-profile-error-handler';
import { UserFlow, SearchParameters } from '@/types';
import { getSearchParameters } from '@/utils';

import useIdentifierErrorAlert from './use-identifier-error-alert';
import useSharedErrorHandler from './use-shared-error-handler';

const useContinueSetPhonePasscodeValidation = (phone: string, errorCallback?: () => void) => {
  const { sharedErrorHandlers, errorMessage, clearErrorMessage } = useSharedErrorHandler();

  const requiredProfileErrorHandler = useRequiredProfileErrorHandler(true);

  const identifierExistErrorHandler = useIdentifierErrorAlert(
    UserFlow.continue,
    SignInIdentifier.Phone,
    phone
  );

  const verifyPasscodeErrorHandlers: ErrorHandlers = useMemo(
    () => ({
      'user.phone_already_in_use': identifierExistErrorHandler,
      ...requiredProfileErrorHandler,
      ...sharedErrorHandlers,
      callback: errorCallback,
    }),
    [errorCallback, identifierExistErrorHandler, requiredProfileErrorHandler, sharedErrorHandlers]
  );

  const { run: verifyPasscode } = useApi(
    addProfileWithPasscodeIdentifier,
    verifyPasscodeErrorHandlers
  );

  const onSubmit = useCallback(
    async (passcode: string) => {
      const socialToBind = getSearchParameters(location.search, SearchParameters.bindWithSocial);
      const result = await verifyPasscode({ phone, passcode }, socialToBind);

      if (result?.redirectTo) {
        window.location.replace(result.redirectTo);
      }
    },
    [phone, verifyPasscode]
  );

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useContinueSetPhonePasscodeValidation;
