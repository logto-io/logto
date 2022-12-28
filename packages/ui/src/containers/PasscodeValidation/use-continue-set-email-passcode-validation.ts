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

const useContinueSetEmailPasscodeValidation = (email: string, errorCallback?: () => void) => {
  const { sharedErrorHandlers, errorMessage, clearErrorMessage } = useSharedErrorHandler();

  const requiredProfileErrorHandler = useRequiredProfileErrorHandler(true);

  const identifierNotExistErrorHandler = useIdentifierErrorAlert(
    UserFlow.continue,
    SignInIdentifier.Email,
    email
  );

  const verifyPasscodeErrorHandlers: ErrorHandlers = useMemo(
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

  const { run: verifyPasscode } = useApi(
    addProfileWithPasscodeIdentifier,
    verifyPasscodeErrorHandlers
  );

  const onSubmit = useCallback(
    async (passcode: string) => {
      const socialToBind = getSearchParameters(location.search, SearchParameters.bindWithSocial);
      const result = await verifyPasscode({ email, passcode }, socialToBind);

      if (result?.redirectTo) {
        window.location.replace(result.redirectTo);
      }
    },
    [email, verifyPasscode]
  );

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useContinueSetEmailPasscodeValidation;
