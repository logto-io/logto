import type { User } from '@logto/schemas';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import Button from '@/components/Button';
import FormField from '@/components/FormField';
import ModalLayout from '@/components/ModalLayout';
import RoleUsersTransfer from '@/components/RoleUsersTransfer';
import useApi from '@/hooks/use-api';
import * as modalStyles from '@/scss/modal.module.scss';

type Props = {
  roleId: string;
  isRemindSkip?: boolean;
  onClose: (success?: boolean) => void;
};

function AssignUsersModal({ roleId, isRemindSkip = false, onClose }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  const api = useApi();

  const handleAssign = async () => {
    if (isLoading || users.length === 0) {
      return;
    }

    setIsLoading(true);

    try {
      await api.post(`api/roles/${roleId}/users`, {
        json: { userIds: users.map(({ id }) => id) },
      });
      toast.success(t('role_details.users.users_assigned'));
      onClose(true);
    } finally {
      setIsLoading(false);
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
        title="role_details.users.assign_title"
        subtitle="role_details.users.assign_subtitle"
        size="large"
        footer={
          <>
            <Button
              isLoading={isLoading}
              htmlType="submit"
              title={isRemindSkip ? 'general.skip_for_now' : 'general.cancel'}
              size="large"
              type="default"
              onClick={() => {
                onClose();
              }}
            />
            <Button
              isLoading={isLoading}
              disabled={users.length === 0}
              htmlType="submit"
              title="role_details.users.confirm_assign"
              size="large"
              type="primary"
              onClick={handleAssign}
            />
          </>
        }
        onClose={onClose}
      >
        <FormField title="role_details.users.assign_users_field">
          <RoleUsersTransfer
            roleId={roleId}
            value={users}
            onChange={(value) => {
              setUsers(value);
            }}
          />
        </FormField>
      </ModalLayout>
    </ReactModal>
  );
}

export default AssignUsersModal;
