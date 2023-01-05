import type { Role } from '@logto/schemas';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import { useNavigate } from 'react-router-dom';

import * as modalStyles from '@/scss/modal.module.scss';

import type { Props as CreateRoleFormProps } from '../CreateRoleForm';
import CreateRoleForm from '../CreateRoleForm';

type Props = {
  onClose: () => void;
};

const CreateRoleModal = ({ onClose }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const navigate = useNavigate();

  const onCreateFormClose: CreateRoleFormProps['onClose'] = (createdRole?: Role) => {
    if (createdRole) {
      // TODO @xiaoyijun open assigning role to users modal
      navigate(`/roles/${createdRole.id}`, { replace: true });
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
      <CreateRoleForm onClose={onCreateFormClose} />
    </ReactModal>
  );
};

export default CreateRoleModal;
