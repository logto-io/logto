import { TenantRole } from '@logto/schemas';
import { getUserDisplayName } from '@logto/shared/universal';
import { useContext, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import { useAuthedCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type TenantMemberResponse } from '@/cloud/types/router';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import Select, { type Option } from '@/ds-components/Select';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import useCurrentTenantScopes from '@/hooks/use-current-tenant-scopes';
import modalStyles from '@/scss/modal.module.scss';

import styles from '../index.module.scss';

type Props = {
  readonly user: TenantMemberResponse;
  readonly isOpen: boolean;
  readonly onClose: () => void;
};

function EditMemberModal({ user, isOpen, onClose }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.tenant_members' });
  const { currentTenantId } = useContext(TenantsContext);
  const { mutate: mutateUserTenantScopes } = useCurrentTenantScopes();

  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState(TenantRole.Collaborator);
  const { show } = useConfirmModal();
  const cloudApi = useAuthedCloudApi();

  const roleOptions: Array<Option<TenantRole>> = useMemo(
    () => [
      { value: TenantRole.Admin, title: t('admin') },
      { value: TenantRole.Collaborator, title: t('collaborator') },
    ],
    [t]
  );

  const onSubmit = async () => {
    if (role === TenantRole.Admin) {
      const [result] = await show({
        ModalContent: () => (
          <Trans components={{ ul: <ul className={styles.list} />, li: <li /> }}>
            {t('assign_admin_confirm')}
          </Trans>
        ),
        confirmButtonText: 'general.confirm',
      });

      if (!result) {
        return;
      }
    }

    setIsLoading(true);
    try {
      await cloudApi.put(`/api/tenants/:tenantId/members/:userId/roles`, {
        params: { tenantId: currentTenantId, userId: user.id },
        body: { roleName: role },
      });
      void mutateUserTenantScopes();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ReactModal
      isOpen={isOpen}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={onClose}
    >
      <ModalLayout
        title={<>{t('edit_modal.title', { name: getUserDisplayName(user) })}</>}
        footer={
          <Button
            size="large"
            type="primary"
            title="general.save"
            isLoading={isLoading}
            onClick={onSubmit}
          />
        }
        onClose={onClose}
      >
        <FormField title="tenant_members.roles">
          <Select
            options={roleOptions}
            value={role}
            onChange={(value) => {
              if (value) {
                setRole(value);
              }
            }}
          />
        </FormField>
      </ModalLayout>
    </ReactModal>
  );
}

export default EditMemberModal;
