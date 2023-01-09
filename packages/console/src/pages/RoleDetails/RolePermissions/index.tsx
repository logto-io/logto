import type { Scope, ScopeResponse } from '@logto/schemas';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import useSWR from 'swr';

import ConfirmModal from '@/components/ConfirmModal';
import PermissionsTable from '@/components/PermissionsTable';
import type { RequestError } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';

import type { RoleDetailsOutletContext } from '../types';

const RolePermissions = () => {
  const {
    role: { id: roleId },
  } = useOutletContext<RoleDetailsOutletContext>();

  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const {
    data: scopes,
    error,
    mutate,
  } = useSWR<ScopeResponse[], RequestError>(roleId && `/api/roles/${roleId}/scopes`);

  const isLoading = !scopes && !error;

  const [scopeToBeDeleted, setScopeToBeDeleted] = useState<Scope>();
  const [isDeleting, setIsDeleting] = useState(false);

  const api = useApi();

  const handleDelete = async () => {
    if (!scopeToBeDeleted || isDeleting) {
      return;
    }
    setIsDeleting(true);

    try {
      await api.delete(`/api/roles/${roleId}/scopes/${scopeToBeDeleted.id}`);
      toast.success(
        t('role_details.permission.permission_deleted', { name: scopeToBeDeleted.name })
      );
      await mutate();
      setScopeToBeDeleted(undefined);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <PermissionsTable
        isApiColumnVisible
        scopes={scopes}
        isLoading={isLoading}
        createButtonTitle="role_details.permission.assign_button"
        createHandler={() => {
          // TODO @xiaoyijun Assign Permissions to Role
        }}
        deleteHandler={setScopeToBeDeleted}
        errorMessage={error?.body?.message ?? error?.message}
        retryHandler={async () => mutate(undefined, true)}
      />
      {scopeToBeDeleted && (
        <ConfirmModal
          isOpen
          isLoading={isDeleting}
          confirmButtonText="general.delete"
          onCancel={() => {
            setScopeToBeDeleted(undefined);
          }}
          onConfirm={handleDelete}
        >
          {t('role_details.permission.deletion_description')}
        </ConfirmModal>
      )}
    </>
  );
};

export default RolePermissions;
