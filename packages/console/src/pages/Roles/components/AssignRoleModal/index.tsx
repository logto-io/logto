import { type Application, RoleType, type User } from '@logto/schemas';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import RoleEntitiesTransfer from '@/components/RoleEntitiesTransfer';
import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import useApi from '@/hooks/use-api';
import * as modalStyles from '@/scss/modal.module.scss';

type Props = {
  roleId: string;
  roleType: RoleType;
  isRemindSkip?: boolean;
  onClose: (success?: boolean) => void;
};

function AssignRoleModal<T extends Application | User>({
  roleId,
  roleType,
  isRemindSkip = false,
  onClose,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [isLoading, setIsLoading] = useState(false);
  const [entities, setEntities] = useState<T[]>([]);

  const api = useApi();

  const handleAssign = async () => {
    if (isLoading || entities.length === 0) {
      return;
    }

    setIsLoading(true);

    try {
      await (roleType === RoleType.User
        ? api.post(`api/roles/${roleId}/users`, {
            json: { userIds: entities.map(({ id }) => id) },
          })
        : api.post(`api/roles/${roleId}/applications`, {
            json: { applicationIds: entities.map(({ id }) => id) },
          }));
      toast.success(
        t(
          roleType === RoleType.User
            ? 'role_details.users.users_assigned'
            : 'role_details.applications.applications_assigned'
        )
      );
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
        title={
          roleType === RoleType.User
            ? 'role_details.users.assign_title'
            : 'role_details.applications.assign_title'
        }
        subtitle={
          roleType === RoleType.User
            ? 'role_details.users.assign_subtitle'
            : 'role_details.applications.assign_subtitle'
        }
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
              disabled={entities.length === 0}
              htmlType="submit"
              title={
                roleType === RoleType.User
                  ? 'role_details.users.confirm_assign'
                  : 'role_details.applications.confirm_assign'
              }
              size="large"
              type="primary"
              onClick={handleAssign}
            />
          </>
        }
        onClose={onClose}
      >
        <FormField
          title={
            roleType === RoleType.User
              ? 'role_details.users.assign_users_field'
              : 'role_details.applications.assign_applications_field'
          }
        >
          <RoleEntitiesTransfer
            roleId={roleId}
            roleType={roleType}
            value={entities}
            onChange={(value) => {
              setEntities(value);
            }}
          />
        </FormField>
      </ModalLayout>
    </ReactModal>
  );
}

export default AssignRoleModal;
