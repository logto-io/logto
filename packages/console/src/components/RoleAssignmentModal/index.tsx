import { type AdminConsoleKey } from '@logto/phrases';
import type { RoleResponse, UserProfileResponse, Application } from '@logto/schemas';
import { RoleType } from '@logto/schemas';
import { cond } from '@silverhand/essentials';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import RolesTransfer from '@/components/RolesTransfer';
import Button from '@/ds-components/Button';
import DangerousRaw from '@/ds-components/DangerousRaw';
import ModalLayout from '@/ds-components/ModalLayout';
import TextLink from '@/ds-components/TextLink';
import useApi from '@/hooks/use-api';
import * as modalStyles from '@/scss/modal.module.scss';
import { getUserTitle } from '@/utils/user';

import * as styles from './index.module.scss';

type Props = (
  | {
      entity: UserProfileResponse;
      type: RoleType.User;
    }
  | {
      entity: Application;
      type: RoleType.MachineToMachine;
    }
) & {
  readonly onClose: (success?: boolean) => void;
  /**
   * The overrides for the modal text.
   * If specified, the title will be overridden.
   * If not specified, the default title will vary based on the type.
   */
  readonly modalTextOverrides?: {
    title?: AdminConsoleKey;
    subtitle?: AdminConsoleKey;
  };
  readonly isSkippable?: boolean;
  readonly isMachineToMachineRoleCreationHintVisible?: boolean;
};

function RoleAssignmentModal({
  entity,
  onClose,
  type,
  modalTextOverrides,
  isSkippable,
  isMachineToMachineRoleCreationHintVisible,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const isForUser = type === RoleType.User;

  const api = useApi();

  const handleAssign = async () => {
    if (isSubmitting || roles.length === 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post(`api/${isForUser ? 'users' : 'applications'}/${entity.id}/roles`, {
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
          cond(modalTextOverrides?.title) ?? (
            <DangerousRaw>
              {t(
                isForUser
                  ? 'user_details.roles.assign_title'
                  : 'application_details.roles.assign_title',
                { name: isForUser ? getUserTitle(entity) : entity.name }
              )}
            </DangerousRaw>
          )
        }
        subtitle={
          cond(modalTextOverrides?.subtitle) ?? (
            <DangerousRaw>
              {t(
                isForUser
                  ? 'user_details.roles.assign_subtitle'
                  : 'application_details.roles.assign_subtitle',
                { name: isForUser ? getUserTitle(entity) : entity.name }
              )}
            </DangerousRaw>
          )
        }
        size="large"
        footer={
          <>
            {isSkippable && (
              <Button
                isLoading={isSubmitting}
                title="general.skip"
                size="large"
                onClick={() => {
                  onClose();
                }}
              />
            )}
            <Button
              isLoading={isSubmitting}
              disabled={roles.length === 0}
              htmlType="submit"
              title={
                isForUser
                  ? 'user_details.roles.confirm_assign'
                  : 'application_details.roles.confirm_assign'
              }
              size="large"
              type="primary"
              onClick={handleAssign}
            />
          </>
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
        {!isForUser && isMachineToMachineRoleCreationHintVisible && (
          <div className={styles.hint}>
            <Trans
              components={{
                a: <TextLink to="/roles" />,
              }}
            >
              {t('applications.m2m_role_assignment.role_creation_hint')}
            </Trans>
          </div>
        )}
      </ModalLayout>
    </ReactModal>
  );
}

export default RoleAssignmentModal;
