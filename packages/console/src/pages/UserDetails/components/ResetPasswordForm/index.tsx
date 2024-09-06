import type { User } from '@logto/schemas';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import ConfirmModal from '@/ds-components/ConfirmModal';
import useApi from '@/hooks/use-api';
import { generateRandomPassword } from '@/utils/password';

type Props = {
  readonly userId: string;
  readonly hasPassword: boolean;
  readonly onClose?: (password?: string) => void;
};

function ResetPasswordForm({ onClose, userId, hasPassword }: Props) {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console',
  });
  const api = useApi();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async () => {
    const password = generateRandomPassword();
    setIsLoading(true);
    await api.patch(`api/users/${userId}/password`, { json: { password } }).json<User>();
    setIsLoading(false);
    onClose?.(password);
  };

  return (
    <ConfirmModal
      isOpen
      title={`user_details.reset_password.${hasPassword ? 'reset_title' : 'generate_title'}`}
      isLoading={isLoading}
      onCancel={() => {
        onClose?.();
      }}
      onConfirm={onSubmit}
    >
      {t('user_details.reset_password.content')}
    </ConfirmModal>
  );
}

export default ResetPasswordForm;
