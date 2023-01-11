import type { ScopeResponse } from '@logto/schemas';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import Button from '@/components/Button';
import FormField from '@/components/FormField';
import ModalLayout from '@/components/ModalLayout';
import RolePermissionsTransfer from '@/components/RolePermissionsTransfer';
import useApi from '@/hooks/use-api';
import * as modalStyles from '@/scss/modal.module.scss';

type Props = {
  roleId: string;
  onClose: (success?: boolean) => void;
};

const AssignPermissionsModal = ({ roleId, onClose }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scopes, setScopes] = useState<ScopeResponse[]>([]);

  const api = useApi();

  const handleAssign = async () => {
    if (isSubmitting || scopes.length === 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post(`/api/roles/${roleId}/scopes`, {
        json: { scopeIds: scopes.map(({ id }) => id) },
      });
      toast.success(t('role_details.permission.permission_assigned'));
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
        title="role_details.permission.assign_title"
        subtitle="role_details.permission.assign_subtitle"
        size="large"
        footer={
          <Button
            isLoading={isSubmitting}
            disabled={scopes.length === 0}
            htmlType="submit"
            title="role_details.permission.confirm_assign"
            size="large"
            type="primary"
            onClick={handleAssign}
          />
        }
        onClose={onClose}
      >
        <FormField title="role_details.permission.assign_form_filed">
          <RolePermissionsTransfer
            roleId={roleId}
            value={scopes}
            onChange={(scopes) => {
              setScopes(scopes);
            }}
          />
        </FormField>
      </ModalLayout>
    </ReactModal>
  );
};

export default AssignPermissionsModal;
