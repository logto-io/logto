import { SignInIdentifier } from '@logto/schemas';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useConfirmModal } from '@/hooks/use-confirm-modal';

export enum IdentifierErrorType {
  IdentifierNotExist = 'IdentifierNotExist',
  IdentifierAlreadyExists = 'IdentifierAlreadyExists',
}

const useIdentifierErrorAlert = (
  type: IdentifierErrorType,
  identifierType: SignInIdentifier.Email | SignInIdentifier.Phone,
  value: string
) => {
  const { show } = useConfirmModal();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Have to wrap up in a useCallback hook otherwise the handler updates on every cycle
  return useCallback(async () => {
    await show({
      type: 'alert',
      ModalContent: t(
        type === IdentifierErrorType.IdentifierAlreadyExists
          ? 'description.create_account_id_exists_alert'
          : 'description.sign_in_id_does_not_exist_alert',
        {
          type: t(
            `description.${identifierType === SignInIdentifier.Email ? 'email' : 'phone_number'}`
          ),
          value,
        }
      ),
      cancelText: 'action.got_it',
    });
    navigate(-1);
  }, [identifierType, navigate, show, t, type, value]);
};

export default useIdentifierErrorAlert;
