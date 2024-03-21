import type { RoleResponse, UserProfileResponse, Application } from '@logto/schemas';
import { RoleType } from '@logto/schemas';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import RolesTransfer from '@/components/RolesTransfer';
import Button from '@/ds-components/Button';
import DangerousRaw from '@/ds-components/DangerousRaw';
import ModalLayout from '@/ds-components/ModalLayout';
import useApi from '@/hooks/use-api';
import * as modalStyles from '@/scss/modal.module.scss';
import { getUserTitle } from '@/utils/user';

type Props =
  | {
      entity: UserProfileResponse;
      onClose: (success?: boolean) => void;
      type: RoleType.User;
    }
  | {
      entity: Application;
      onClose: (success?: boolean) => void;
      type: RoleType.MachineToMachine;
    };

function AssignToRoleModal({ entity, onClose, type }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState<RoleResponse[]>([]);

  const api = useApi();

  const handleAssign = async () => {
    if (isSubmitting || roles.length === 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post(
        `api/${type === RoleType.User ? 'users' : 'applications'}/${entity.id}/roles`,
        {
          json: { roleIds: roles.map(({ id }) => id) },
        }
      );
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
          <DangerousRaw>
            {t(
              type === RoleType.User
                ? 'user_details.roles.assign_title'
                : 'application_details.roles.assign_title',
              { name: type === RoleType.User ? getUserTitle(entity) : entity.name }
            )}
          </DangerousRaw>
        }
        subtitle={
          <DangerousRaw>
            {t(
              type === RoleType.User
                ? 'user_details.roles.assign_subtitle'
                : 'application_details.roles.assign_subtitle',
              { name: type === RoleType.User ? getUserTitle(entity) : entity.name }
            )}
          </DangerousRaw>
        }
        size="large"
        footer={
          <Button
            isLoading={isSubmitting}
            disabled={roles.length === 0}
            htmlType="submit"
            title={
              type === RoleType.User
                ? 'user_details.roles.confirm_assign'
                : 'application_details.roles.confirm_assign'
            }
            size="large"
            type="primary"
            onClick={handleAssign}
          />
        }
        onClose={onClose}
      >
        <RolesTransfer
          entityId={entity.id}
          type={type}
          value={roles}
          onChange={(value) => {
            setRoles(value);
          }}
        />
      </ModalLayout>
    </ReactModal>
  );
}

export default AssignToRoleModal;
