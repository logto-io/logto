import { User } from '@logto/schemas';
import { nanoid } from 'nanoid';
import { useTranslation } from 'react-i18next';

import ConfirmModal from '@/components/ConfirmModal';
import useApi from '@/hooks/use-api';

type Props = {
  userId: string;
  onClose?: (password?: string) => void;
};

const ResetPasswordForm = ({ onClose, userId }: Props) => {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console',
  });
  const api = useApi();

  const onSubmit = async () => {
    const password = nanoid(8);
    await api.patch(`/api/users/${userId}/password`, { json: { password } }).json<User>();
    onClose?.(btoa(password));
  };

  return (
    <ConfirmModal
      isOpen
      title="user_details.reset_password.title"
      onCancel={() => {
        onClose?.();
      }}
      onConfirm={onSubmit}
    >
      {t('user_details.reset_password.content')}
    </ConfirmModal>
  );
};

export default ResetPasswordForm;
