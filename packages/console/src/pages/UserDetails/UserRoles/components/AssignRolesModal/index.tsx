import type { RoleResponse, User } from '@logto/schemas';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import Button from '@/components/Button';
import DangerousRaw from '@/components/DangerousRaw';
import ModalLayout from '@/components/ModalLayout';
import UserRolesTransfer from '@/components/UserRolesTransfer';
import useApi from '@/hooks/use-api';
import * as modalStyles from '@/scss/modal.module.scss';

type Props = {
  user: User;
  onClose: (success?: boolean) => void;
};

function AssignRolesModal({ user, onClose }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const userName = user.name ?? t('users.unnamed');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState<RoleResponse[]>([]);

  const api = useApi();

  const handleAssign = async () => {
    if (isSubmitting || roles.length === 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post(`api/users/${user.id}/roles`, {
        json: { roleIds: roles.map(({ id }) => id) },
      });
      toast.success(t('user_details.roles.role_assigned'));
      onClose(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ReactModal
      isOpen
      shouldCloseOnEsc
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={() => {
        onClose();
      }}
    >
      <ModalLayout
        title={
          <DangerousRaw>{t('user_details.roles.assign_title', { name: userName })}</DangerousRaw>
        }
        subtitle={
          <DangerousRaw>{t('user_details.roles.assign_subtitle', { name: userName })}</DangerousRaw>
        }
        size="large"
        footer={
          <Button
            isLoading={isSubmitting}
            disabled={roles.length === 0}
            htmlType="submit"
            title="user_details.roles.confirm_assign"
            size="large"
            type="primary"
            onClick={handleAssign}
          />
        }
        onClose={onClose}
      >
        <UserRolesTransfer
          userId={user.id}
          value={roles}
          onChange={(value) => {
            setRoles(value);
          }}
        />
      </ModalLayout>
    </ReactModal>
  );
}

export default AssignRolesModal;
