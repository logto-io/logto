import type { Scope, ScopeResponse } from '@logto/schemas';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import useSWR from 'swr';

import Plus from '@/assets/images/plus.svg';
import Button from '@/components/Button';
import ConfirmModal from '@/components/ConfirmModal';
import PermissionsTable from '@/components/PermissionsTable';
import type { RequestError } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';

import type { ApiResourceDetailsOutletContext } from '../types';
import CreatePermissionModal from './components/CreatePermissionModal';

const ApiResourcePermissions = () => {
  const {
    resource: { id: resourceId },
  } = useOutletContext<ApiResourceDetailsOutletContext>();

  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const {
    data: scopes,
    error,
    mutate,
  } = useSWR<ScopeResponse[], RequestError>(resourceId && `/api/resources/${resourceId}/scopes`);

  const isLoading = !scopes && !error;

  const api = useApi();

  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [scopeToBeDeleted, setScopeToBeDeleted] = useState<Scope>();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!scopeToBeDeleted || isDeleting) {
      return;
    }
    setIsDeleting(true);

    try {
      await api.delete(`/api/resources/${resourceId}/scopes/${scopeToBeDeleted.id}`);
      toast.success(t('api_resource_details.permission.deleted', { name: scopeToBeDeleted.name }));
      await mutate();
      setScopeToBeDeleted(undefined);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <PermissionsTable
        scopes={scopes}
        isLoading={isLoading}
        createButton={
          <Button
            title="api_resource_details.permission.create_button"
            type="primary"
            size="large"
            icon={<Plus />}
            onClick={() => {
              setIsCreateFormOpen(true);
            }}
          />
        }
        placeholderContent={
          <Button
            title="api_resource_details.permission.create_button"
            type="outline"
            onClick={() => {
              setIsCreateFormOpen(true);
            }}
          />
        }
        deleteHandler={setScopeToBeDeleted}
        errorMessage={error?.body?.message ?? error?.message}
        retryHandler={async () => mutate(undefined, true)}
      />
      {isCreateFormOpen && (
        <CreatePermissionModal
          resourceId={resourceId}
          onClose={(scope) => {
            if (scope) {
              toast.success(
                t('api_resource_details.permission.permission_created', { name: scope.name })
              );
              void mutate();
            }
            setIsCreateFormOpen(false);
          }}
        />
      )}
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
          {t('api_resource_details.permission.delete_description')}
        </ConfirmModal>
      )}
    </>
  );
};

export default ApiResourcePermissions;
