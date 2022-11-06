import { SignInIdentifier } from '@logto/schemas';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useConfirmModal } from '@/hooks/use-confirm-modal';
import { UserFlow } from '@/types';

const useIdentifierErrorAlert = (
  flow: UserFlow,
  method: SignInIdentifier.Email | SignInIdentifier.Sms,
  value: string
) => {
  const { show } = useConfirmModal();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return async () => {
    await show({
      type: 'alert',
      ModalContent: t(
        flow === UserFlow.register
          ? 'description.create_account_id_exists_alert'
          : 'description.sign_in_id_does_not_exists_alert',
        {
          type: t(`description.${method === SignInIdentifier.Email ? 'email' : 'phone_number'}`),
          value,
        }
      ),
      cancelText: 'action.got_it',
    });
    navigate(-1);
  };
};

export default useIdentifierErrorAlert;
