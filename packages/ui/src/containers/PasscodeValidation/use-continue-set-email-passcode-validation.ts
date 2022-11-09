import { SignInIdentifier } from '@logto/schemas';
import { useMemo, useCallback } from 'react';

import { verifyContinueSetEmailPasscode, continueWithEmail } from '@/apis/continue';
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
      ...sharedErrorHandlers,
      callback: errorCallback,
    }),
    [errorCallback, sharedErrorHandlers]
  );

  const { run: verifyPasscode } = useApi(
    verifyContinueSetEmailPasscode,
    verifyPasscodeErrorHandlers
  );

  const setEmailErrorHandlers: ErrorHandlers = useMemo(
    () => ({
      'user.email_not_exists': identifierNotExistErrorHandler,
      ...requiredProfileErrorHandler,
      callback: errorCallback,
    }),
    [errorCallback, identifierNotExistErrorHandler, requiredProfileErrorHandler]
  );

  const { run: setEmail } = useApi(continueWithEmail, setEmailErrorHandlers);

  const onSubmit = useCallback(
    async (code: string) => {
      const verified = await verifyPasscode(email, code);

      if (!verified) {
        return;
      }

      const socialToBind = getSearchParameters(location.search, SearchParameters.bindWithSocial);

      const result = await setEmail(email, socialToBind);

      if (result?.redirectTo) {
        window.location.replace(result.redirectTo);
      }
    },
    [email, setEmail, verifyPasscode]
  );

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useContinueSetEmailPasscodeValidation;
