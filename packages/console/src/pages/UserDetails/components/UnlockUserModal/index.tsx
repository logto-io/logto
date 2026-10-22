import { SentinelActivityTargetType, type UserProfileResponse } from '@logto/schemas';
import { conditionalArray } from '@silverhand/essentials';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import ConfirmModal from '@/ds-components/ConfirmModal';
import useApi from '@/hooks/use-api';

type Props = {
  readonly user: Pick<UserProfileResponse, 'id' | 'primaryEmail' | 'primaryPhone' | 'username'>;
  readonly isOpen: boolean;
  readonly onClose: () => void;
};

function UnlockUserModal({ user, isOpen, onClose }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const api = useApi();
  const [isUnlocking, setIsUnlocking] = useState(false);

  const onUnlock = async () => {
    if (isUnlocking) {
      return;
    }

    setIsUnlocking(true);

    try {
      // Sign-in lockouts are keyed on identifiers, while security verification lockouts are keyed
      // on the user ID. Send all of them so the admin does not need to know which one was locked.
      await api.post('api/sentinel-activities/delete', {
        json: {
          targetType: SentinelActivityTargetType.User,
          targets: conditionalArray(user.id, user.primaryEmail, user.primaryPhone, user.username),
        },
      });

      toast.success(t('user_details.user_unlocked'));
      onClose();
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <ConfirmModal
      isOpen={isOpen}
      isLoading={isUnlocking}
      title="user_details.unlock_user"
      confirmButtonType="primary"
      confirmButtonText="user_details.unlock_action"
      onCancel={onClose}
      onConfirm={onUnlock}
    >
      {t('user_details.unlock_user_reminder')}
    </ConfirmModal>
  );
}

export default UnlockUserModal;
