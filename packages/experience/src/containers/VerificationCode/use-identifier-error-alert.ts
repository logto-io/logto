import { SignInIdentifier } from '@logto/schemas';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useConfirmModal } from '@/hooks/use-confirm-modal';
import type { VerificationCodeIdentifier } from '@/types';
import { formatPhoneNumberWithCountryCallingCode } from '@/utils/country-code';

export enum IdentifierErrorType {
  IdentifierNotExist = 'IdentifierNotExist',
  IdentifierAlreadyExists = 'IdentifierAlreadyExists',
}

const useIdentifierErrorAlert = () => {
  const { show } = useConfirmModal();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Have to wrap up in a useCallback hook otherwise the handler updates on every cycle
  return useCallback(
    async (errorType: IdentifierErrorType, method: VerificationCodeIdentifier, value: string) => {
      await show({
        type: 'alert',
        ModalContent: t(
          errorType === IdentifierErrorType.IdentifierAlreadyExists
            ? 'description.create_account_id_exists_alert'
            : 'description.sign_in_id_does_not_exist_alert',
          {
            type: t(`description.${method === SignInIdentifier.Email ? 'email' : 'phone_number'}`),
            value:
              method === SignInIdentifier.Phone
                ? formatPhoneNumberWithCountryCallingCode(value)
                : value,
          }
        ),
        cancelText: 'action.change',
        cancelTextI18nProps: {
          method: t(`description.${method === SignInIdentifier.Email ? 'email' : 'phone_number'}`),
        },
      });
      navigate(-1);
    },
    [navigate, show, t]
  );
};

export default useIdentifierErrorAlert;
