import type { Scope, ScopeResponse } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import useSWR from 'swr';

import ConfirmModal from '@/components/ConfirmModal';
import PermissionsTable from '@/components/PermissionsTable';
import { defaultPageSize } from '@/consts';
import type { RequestError } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import useSearchParametersWatcher from '@/hooks/use-search-parameters-watcher';
import { buildUrl, formatSearchKeyword } from '@/utils/url';

import AssignPermissionsModal from './components/AssignPermissionsModal';
import type { RoleDetailsOutletContext } from '../types';

const pageSize = defaultPageSize;

function RolePermissions() {
  const {
    role: { id: roleId },
  } = useOutletContext<RoleDetailsOutletContext>();

  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const [{ page, keyword }, updateSearchParameters] = useSearchParametersWatcher({
    page: 1,
    keyword: '',
  });

  const { data, error, mutate } = useSWR<[ScopeResponse[], number], RequestError>(
    roleId &&
      buildUrl(`api/roles/${roleId}/scopes`, {
        page: String(page),
        page_size: String(pageSize),
        ...conditional(keyword && { search: formatSearchKeyword(keyword) }),
      })
  );

  const isLoading = !data && !error;

  const [scopes, totalCount] = data ?? [];

  const [isAssignPermissionsModalOpen, setIsAssignPermissionsModalOpen] = useState(false);
  const [scopeToBeDeleted, setScopeToBeDeleted] = useState<Scope>();
  const [isDeleting, setIsDeleting] = useState(false);

  const api = useApi();

  const handleDelete = async () => {
    if (!scopeToBeDeleted || isDeleting) {
      return;
    }
    setIsDeleting(true);

    try {
      await api.delete(`api/roles/${roleId}/scopes/${scopeToBeDeleted.id}`);
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
        deleteButtonTitle="general.remove"
        createHandler={() => {
          setIsAssignPermissionsModalOpen(true);
        }}
        deleteHandler={setScopeToBeDeleted}
        errorMessage={error?.body?.message ?? error?.message}
        retryHandler={async () => mutate(undefined, true)}
        pagination={{
          page,
          pageSize,
          totalCount,
          onChange: (page) => {
            updateSearchParameters({ page });
          },
        }}
        search={{
          keyword,
          searchHandler: (keyword) => {
            updateSearchParameters({ keyword, page: 1 });
          },
          clearSearchHandler: () => {
            updateSearchParameters({ keyword: '', page: 1 });
          },
        }}
      />
      {scopeToBeDeleted && (
        <ConfirmModal
          isOpen
          isLoading={isDeleting}
          confirmButtonText="general.remove"
          onCancel={() => {
            setScopeToBeDeleted(undefined);
          }}
          onConfirm={handleDelete}
        >
          {t('role_details.permission.deletion_description')}
        </ConfirmModal>
      )}
      {isAssignPermissionsModalOpen && (
        <AssignPermissionsModal
          roleId={roleId}
          onClose={(success) => {
            if (success) {
              void mutate();
            }
            setIsAssignPermissionsModalOpen(false);
          }}
        />
      )}
    </>
  );
}

export default RolePermissions;
