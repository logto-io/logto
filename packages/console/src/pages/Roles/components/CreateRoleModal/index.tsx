import { type Role } from '@logto/schemas';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import useTenantPathname from '@/hooks/use-tenant-pathname';
import * as modalStyles from '@/scss/modal.module.scss';

import AssignRoleModal from '../AssignRoleModal';
import type { Props as CreateRoleFormProps } from '../CreateRoleForm';
import CreateRoleForm from '../CreateRoleForm';

type Props = {
  readonly onClose: () => void;
};

function CreateRoleModal({ onClose }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { navigate } = useTenantPathname();

  const [createdRole, setCreatedRole] = useState<Role>();

  const onCreateFormClose: CreateRoleFormProps['onClose'] = (createdRole?: Role) => {
    if (createdRole) {
      setCreatedRole(createdRole);
      toast.success(t('roles.role_created', { name: createdRole.name }));

      return;
    }

    onClose();
  };

  // Show assign role modal after role is created
  if (createdRole) {
    return (
      <AssignRoleModal
        isRemindSkip
        role={createdRole}
        onClose={() => {
          navigate(`/roles/${createdRole.id}`, { replace: true });
        }}
      />
    );
  }

  return (
    <ReactModal
      isOpen
      shouldCloseOnEsc
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={onClose}
    >
      <CreateRoleForm onClose={onCreateFormClose} />
    </ReactModal>
  );
}

export default CreateRoleModal;
