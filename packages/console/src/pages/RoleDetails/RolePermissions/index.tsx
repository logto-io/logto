import type { ScopeResponse } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import useSWR from 'swr';

import PermissionsTable from '@/components/PermissionsTable';
import { defaultPageSize } from '@/consts';
import type { RequestError } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import useSearchParametersWatcher from '@/hooks/use-search-parameters-watcher';
import { buildUrl, formatSearchKeyword } from '@/utils/url';

import type { RoleDetailsOutletContext } from '../types';

import AssignPermissionsModal from './components/AssignPermissionsModal';

const pageSize = defaultPageSize;

function RolePermissions() {
  const {
    role: { id: roleId, type: roleType },
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

  const api = useApi();

  const handleDelete = async (scope: ScopeResponse) => {
    await api.delete(`api/roles/${roleId}/scopes/${scope.id}`);
    toast.success(t('role_details.permission.permission_deleted', { name: scope.name }));
    await mutate();
  };

  return (
    <>
      <PermissionsTable
        isApiColumnVisible
        scopes={scopes}
        isLoading={isLoading}
        createButtonTitle="role_details.permission.assign_button"
        deletionText={{
          actionButton: 'permissions.remove',
          confirmation: 'role_details.permission.deletion_description',
          confirmButton: 'general.remove',
        }}
        createHandler={() => {
          setIsAssignPermissionsModalOpen(true);
        }}
        deleteHandler={handleDelete}
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
        onPermissionUpdated={mutate}
      />
      {isAssignPermissionsModalOpen && totalCount !== undefined && (
        <AssignPermissionsModal
          roleId={roleId}
          roleType={roleType}
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
