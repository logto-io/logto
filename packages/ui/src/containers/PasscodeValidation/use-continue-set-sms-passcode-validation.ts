import { SignInIdentifier } from '@logto/schemas';
import { useMemo, useCallback } from 'react';

import { verifyContinueSetSmsPasscode, continueApi } from '@/apis/continue';
import type { ErrorHandlers } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import useRequiredProfileErrorHandler from '@/hooks/use-required-profile-error-handler';
import { UserFlow, SearchParameters } from '@/types';
import { getSearchParameters } from '@/utils';

import useIdentifierErrorAlert from './use-identifier-error-alert';
import useSharedErrorHandler from './use-shared-error-handler';

const useContinueSetSmsPasscodeValidation = (phone: string, errorCallback?: () => void) => {
  const { sharedErrorHandlers, errorMessage, clearErrorMessage } = useSharedErrorHandler();

  const requiredProfileErrorHandler = useRequiredProfileErrorHandler(true);

  const identifierNotExistErrorHandler = useIdentifierErrorAlert(
    UserFlow.continue,
    SignInIdentifier.Sms,
    phone
  );

  const verifyPasscodeErrorHandlers: ErrorHandlers = useMemo(
    () => ({
      ...sharedErrorHandlers,
      callback: errorCallback,
    }),
    [errorCallback, sharedErrorHandlers]
  );

  const { run: verifyPasscode } = useApi(verifyContinueSetSmsPasscode, verifyPasscodeErrorHandlers);

  const setPhoneErrorHandlers: ErrorHandlers = useMemo(
    () => ({
      'user.phone_not_exists': identifierNotExistErrorHandler,
      ...requiredProfileErrorHandler,
      callback: errorCallback,
    }),
    [errorCallback, identifierNotExistErrorHandler, requiredProfileErrorHandler]
  );

  const { run: setPhone } = useApi(continueApi, setPhoneErrorHandlers);

  const onSubmit = useCallback(
    async (code: string) => {
      const verified = await verifyPasscode(phone, code);

      if (!verified) {
        return;
      }

      const socialToBind = getSearchParameters(location.search, SearchParameters.bindWithSocial);

      const result = await setPhone('phone', phone, socialToBind);

      if (result?.redirectTo) {
        window.location.replace(result.redirectTo);
      }
    },
    [phone, setPhone, verifyPasscode]
  );

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useContinueSetSmsPasscodeValidation;
