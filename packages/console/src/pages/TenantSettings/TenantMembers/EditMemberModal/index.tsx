import { TenantRole } from '@logto/schemas';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import { useAuthedCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type TenantMemberResponse } from '@/cloud/types/router';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import Select from '@/ds-components/Select';
import * as modalStyles from '@/scss/modal.module.scss';

type Props = {
  user: TenantMemberResponse;
  isOpen: boolean;
  onClose: () => void;
};

const roles = Object.freeze([TenantRole.Admin, TenantRole.Member]);

function EditMemberModal({ user, isOpen, onClose }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { currentTenantId } = useContext(TenantsContext);

  const name = user.name ?? '';
  const [isLoading, setIsLoading] = useState(false);
  const cloudApi = useAuthedCloudApi();

  const onSubmit = async () => {
    setIsLoading(true);
    try {
      await cloudApi.put(`/api/tenants/:tenantId/members/:userId/roles`, {
        params: { tenantId: currentTenantId, userId: user.id },
        body: { roleName: TenantRole.Admin },
      });
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
        title={
          <>
            {t('organization_details.edit_organization_roles_of_user', {
              name,
            })}
          </>
        }
        subtitle={<>{t('organization_details.authorize_to_roles', { name })}</>}
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
        <FormField title="organizations.organization_role_other">
          <Select options={roles} />
        </FormField>
      </ModalLayout>
    </ReactModal>
  );
}

export default EditMemberModal;
