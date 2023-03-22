import type { Role } from '@logto/schemas';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import { useNavigate } from 'react-router-dom';

import AssignUsersModal from '@/pages/RoleDetails/RoleUsers/components/AssignUsersModal';
import * as modalStyles from '@/scss/modal.module.scss';

import type { Props as CreateRoleFormProps } from '../CreateRoleForm';
import CreateRoleForm from '../CreateRoleForm';

type Props = {
  onClose: () => void;
};

function CreateRoleModal({ onClose }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const navigate = useNavigate();

  const [createdRole, setCreatedRole] = useState<Role>();

  const onCreateFormClose: CreateRoleFormProps['onClose'] = (createdRole?: Role) => {
    if (createdRole) {
      setCreatedRole(createdRole);
      toast.success(t('roles.role_created', { name: createdRole.name }));

      return;
    }

    onClose();
  };

  return (
    <ReactModal
      isOpen
      shouldCloseOnEsc
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={onClose}
    >
      {createdRole ? (
        <AssignUsersModal
          isRemindSkip
          roleId={createdRole.id}
          onClose={() => {
            navigate(`/roles/${createdRole.id}`, { replace: true });
          }}
        />
      ) : (
        <CreateRoleForm onClose={onCreateFormClose} />
      )}
    </ReactModal>
  );
}

export default CreateRoleModal;
